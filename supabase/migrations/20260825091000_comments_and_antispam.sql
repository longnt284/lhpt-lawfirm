-- =============================================================================
-- Bình luận dưới bài viết + lớp chống thông tin rác
--
-- Chống spam đặt ở tầng cơ sở dữ liệu, không ở tầng giao diện. Kiểm tra viết
-- trong React chỉ chặn được người dùng thật; kẻ gửi rác gọi thẳng REST API và
-- không bao giờ chạy qua đoạn mã đó. Bốn lớp, theo thứ tự rẻ tới đắt:
--
--   1. Bắt buộc đăng nhập và email đã xác thực (chi phí tạo tài khoản).
--   2. Giới hạn tần suất theo cửa sổ thời gian, tính trên khoá người dùng hoặc
--      băm địa chỉ IP với biểu mẫu công khai.
--   3. Chấm điểm nội dung: liên kết, từ khoá chặn, viết hoa toàn bộ, lặp ký tự.
--   4. Hàng đợi kiểm duyệt: bình luận mới nằm chờ cho tới khi tác giả đủ tin cậy.
-- =============================================================================

-- ------------------------------------------------------------ vai trò người gọi
/*
 * Ai là người của hãng.
 *
 * SECURITY DEFINER có chủ đích: hàm này được gọi từ chính các chính sách RLS
 * trên bảng profiles, nên nếu nó đọc profiles bằng quyền người gọi thì chính
 * sách sẽ gọi lại chính nó và đệ quy vô hạn.
 */
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid()
       and role in ('staff', 'lawyer', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and role = 'admin'
  );
$$;

-- ------------------------------------------------------- giới hạn tần suất
create table public.rate_limit_hits (
  bucket_key text not null,
  bucket_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket_key, bucket_start)
);

comment on table public.rate_limit_hits is
  'Bộ đếm cửa sổ cố định cho lớp chống spam. Dọn định kỳ bằng prune_rate_limits().';

/*
 * Cộng một lượt vào cửa sổ hiện tại và trả về việc lượt đó còn nằm trong hạn
 * mức hay không.
 *
 * Cửa sổ cố định (chia lấy nguyên theo epoch) chứ không trượt: kém chính xác
 * hơn một chút ở ranh giới cửa sổ, đổi lại chỉ tốn một lệnh ghi thay vì phải
 * quét lịch sử. Với ngưỡng cỡ vài lượt mỗi phút, sai số đó không đáng kể.
 */
create or replace function public.consume_rate_limit(
  p_key text,
  p_max integer,
  p_window interval
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_seconds double precision := extract(epoch from p_window);
  v_start timestamptz;
  v_hits integer;
begin
  v_start := to_timestamp(floor(extract(epoch from now()) / v_window_seconds) * v_window_seconds);

  insert into public.rate_limit_hits (bucket_key, bucket_start, hits)
  values (p_key, v_start, 1)
  on conflict (bucket_key, bucket_start)
    do update set hits = public.rate_limit_hits.hits + 1
  returning hits into v_hits;

  return v_hits <= p_max;
end;
$$;

create or replace function public.prune_rate_limits(p_older_than interval default interval '2 days')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.rate_limit_hits where bucket_start < now() - p_older_than;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

/*
 * Băm địa chỉ IP của yêu cầu.
 *
 * Biểu mẫu liên hệ mở cho khách chưa đăng nhập, nên khoá giới hạn tần suất duy
 * nhất còn lại là địa chỉ mạng. Lưu bản băm chứ không lưu địa chỉ gốc: đủ để
 * nhận ra cùng một nguồn gửi lặp, mà không giữ thêm dữ liệu định danh.
 */
create or replace function public.request_ip_hash()
returns text
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_headers json;
  v_ip text;
begin
  begin
    v_headers := current_setting('request.headers', true)::json;
  exception when others then
    v_headers := null;
  end;

  v_ip := coalesce(
    nullif(split_part(v_headers ->> 'x-forwarded-for', ',', 1), ''),
    v_headers ->> 'cf-connecting-ip',
    'unknown'
  );

  /*
   * sha256() dựng sẵn trong pg_catalog, không dùng digest() của pgcrypto.
   *
   * Supabase cài pgcrypto vào schema `extensions`, mà hàm này cố định
   * search_path để chặn leo thang đặc quyền — nên digest() không phân giải được
   * và mọi lượt ghi contact_requests đổ lỗi 42883. Hàm dựng sẵn bỏ hẳn ràng
   * buộc vào vị trí cài extension.
   */
  return encode(
    sha256(convert_to(coalesce(nullif(btrim(v_ip), ''), 'unknown') || ':lhpt', 'UTF8')),
    'hex'
  );
end;
$$;

-- ------------------------------------------------------------ từ khoá chặn
create table public.blocked_terms (
  id uuid primary key default gen_random_uuid(),
  pattern text not null unique,
  severity integer not null default 3 check (severity between 1 and 10),
  note text,
  created_at timestamptz not null default now()
);

comment on table public.blocked_terms is
  'Mẫu regex nhận diện nội dung rác. severity cộng vào điểm spam của nội dung.';

-- --------------------------------------------------------- chấm điểm nội dung
/*
 * Trả về điểm nghi ngờ của một đoạn văn bản. Điểm càng cao càng giống rác.
 * Ngưỡng do phía gọi quyết định, xem SPAM_* trong guard_comment().
 */
create or replace function public.content_spam_score(p_text text)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_score integer := 0;
  v_body text := coalesce(p_text, '');
  v_len integer := length(v_body);
  v_links integer;
  v_letters integer;
  v_uppercase integer;
  v_term record;
begin
  if v_len = 0 then
    return 100;
  end if;

  -- Liên kết: một cái còn bình thường, từ cái thứ hai trở đi là dấu hiệu mạnh.
  v_links := coalesce(
    array_length(regexp_split_to_array(v_body, '(https?://|www\.)', 'i'), 1) - 1,
    0
  );
  if v_links = 1 then
    v_score := v_score + 2;
  elsif v_links >= 2 then
    v_score := v_score + 3 * v_links;
  end if;

  -- Quá ngắn thì không phải bình luận có nội dung.
  if v_len < 15 then
    v_score := v_score + 4;
  end if;

  -- Viết hoa toàn bộ trên đoạn đủ dài.
  v_letters := length(regexp_replace(v_body, '[^[:alpha:]]', '', 'g'));
  v_uppercase := length(regexp_replace(v_body, '[^[:upper:]]', '', 'g'));
  if v_letters > 20 and v_uppercase::numeric / v_letters > 0.6 then
    v_score := v_score + 3;
  end if;

  -- Lặp một ký tự bảy lần trở lên: "mua ngayyyyyyy".
  if v_body ~ '(.)\1{6,}' then
    v_score := v_score + 3;
  end if;

  -- Dày đặc số điện thoại hoặc chuỗi số dài kèm liên kết.
  if v_links > 0 and v_body ~ '[0-9]{9,}' then
    v_score := v_score + 3;
  end if;

  for v_term in select pattern, severity from public.blocked_terms loop
    if v_body ~* v_term.pattern then
      v_score := v_score + v_term.severity;
    end if;
  end loop;

  return v_score;
end;
$$;

-- ------------------------------------------------------------ article_comments
create table public.article_comments (
  id uuid primary key default gen_random_uuid(),
  -- Bài viết nằm trong mã nguồn (a1..a100, n1..n7), không nằm trong cơ sở dữ
  -- liệu, nên tham chiếu bằng khoá văn bản chứ không bằng khoá ngoại.
  article_id text not null,
  article_kind text not null default 'article' check (article_kind in ('article', 'news')),
  author_id uuid not null references public.profiles (id) on delete cascade,
  -- Chụp lại tên tại thời điểm đăng: cổng công khai không được đọc bảng
  -- profiles, và tên hiển thị cũ vẫn đúng với ngữ cảnh bình luận cũ.
  author_name text not null default '',
  parent_id uuid references public.article_comments (id) on delete cascade,
  body text not null check (length(btrim(body)) between 2 and 4000),
  locale text not null default 'vi' check (locale in ('vi', 'en')),
  status public.moderation_status not null default 'pending',
  spam_score integer not null default 0,
  report_count integer not null default 0,
  is_edited boolean not null default false,
  edited_at timestamptz,
  -- Xoá mềm: xoá cứng làm đứt nhánh trả lời bên dưới.
  is_deleted boolean not null default false,
  moderated_by uuid references public.profiles (id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index article_comments_article_idx
  on public.article_comments (article_id, created_at desc)
  where status = 'approved' and is_deleted = false;
create index article_comments_author_idx on public.article_comments (author_id, created_at desc);
create index article_comments_status_idx on public.article_comments (status, created_at desc);
create index article_comments_parent_idx on public.article_comments (parent_id);

create trigger article_comments_touch before update on public.article_comments
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------ báo cáo vi phạm
create table public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.article_comments (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (reason in ('spam', 'abuse', 'off_topic', 'legal_advice', 'other')),
  detail text,
  created_at timestamptz not null default now(),
  unique (comment_id, reporter_id)
);

create index comment_reports_comment_idx on public.comment_reports (comment_id);

-- ------------------------------------------------------- cổng chặn khi ghi
/*
 * Bộ lọc chạy trước mỗi bình luận mới.
 *
 * Ba ngưỡng, đặt tên để lần sau chỉnh không phải đoán con số nghĩa là gì:
 *   TRUSTED_COMMENTS  số bình luận đã duyệt để được đăng thẳng
 *   SPAM_REJECT       điểm mà nội dung bị xếp thẳng vào rác
 *   SPAM_REVIEW       điểm mà nội dung phải qua kiểm duyệt dù tác giả tin cậy
 */
create or replace function public.guard_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  TRUSTED_COMMENTS constant integer := 3;
  SPAM_REJECT      constant integer := 8;
  SPAM_REVIEW      constant integer := 3;

  v_profile public.profiles%rowtype;
  v_score integer;
  v_duplicate integer;
  v_confirmed timestamptz;
begin
  select * into v_profile from public.profiles where id = new.author_id;

  if v_profile.id is null then
    raise exception 'Khong tim thay ho so nguoi dung.' using errcode = '42501';
  end if;

  if v_profile.is_blocked then
    raise exception 'Tai khoan dang bi han che binh luan.' using errcode = '42501';
  end if;

  -- Email chưa xác thực thì chưa được bình luận: đây là rào chắn rẻ nhất
  -- chống tài khoản dùng một lần.
  select email_confirmed_at into v_confirmed from auth.users where id = new.author_id;
  if v_confirmed is null then
    raise exception 'Can xac thuc email truoc khi binh luan.' using errcode = '42501';
  end if;

  if not public.consume_rate_limit('comment:' || new.author_id::text, 5, interval '10 minutes') then
    raise exception 'Ban dang gui qua nhanh. Vui long thu lai sau vai phut.' using errcode = '53400';
  end if;

  if not public.consume_rate_limit('comment-day:' || new.author_id::text, 30, interval '1 day') then
    raise exception 'Da dat gioi han binh luan trong ngay.' using errcode = '53400';
  end if;

  -- Cùng một nội dung rải sang nhiều bài là dấu hiệu rác kinh điển.
  select count(*) into v_duplicate
  from public.article_comments
  where author_id = new.author_id
    and lower(btrim(body)) = lower(btrim(new.body))
    and created_at > now() - interval '24 hours';

  if v_duplicate > 0 then
    raise exception 'Noi dung nay vua duoc gui truoc do.' using errcode = '23505';
  end if;

  -- Trả lời phải nằm cùng bài với bình luận gốc.
  if new.parent_id is not null then
    perform 1 from public.article_comments
     where id = new.parent_id and article_id = new.article_id;
    if not found then
      raise exception 'Binh luan goc khong thuoc bai viet nay.' using errcode = '23503';
    end if;
  end if;

  v_score := public.content_spam_score(new.body);
  new.spam_score := v_score;
  new.author_name := coalesce(nullif(btrim(v_profile.full_name), ''), 'Nguoi dung LHPT');
  new.report_count := 0;
  new.is_deleted := false;
  new.moderated_by := null;
  new.moderated_at := null;

  if v_score >= SPAM_REJECT then
    new.status := 'spam';
  elsif v_score >= SPAM_REVIEW then
    new.status := 'pending';
  elsif v_profile.approved_comment_count >= TRUSTED_COMMENTS then
    new.status := 'approved';
  else
    new.status := 'pending';
  end if;

  return new;
end;
$$;

create trigger article_comments_guard
  before insert on public.article_comments
  for each row execute function public.guard_comment();

-- Người dùng chỉ được sửa nội dung; mọi trường điều phối do hệ thống giữ.
create or replace function public.guard_comment_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_staff() then
    if new.status = 'approved' and old.status <> 'approved' then
      new.moderated_by := auth.uid();
      new.moderated_at := now();
    end if;
    return new;
  end if;

  -- Nhánh của chính tác giả: chỉ body, và chỉ trong 15 phút đầu.
  if old.created_at < now() - interval '15 minutes' and new.body is distinct from old.body then
    raise exception 'Chi sua duoc binh luan trong 15 phut dau.' using errcode = '42501';
  end if;

  new.status := old.status;
  new.spam_score := old.spam_score;
  new.report_count := old.report_count;
  new.author_id := old.author_id;
  new.author_name := old.author_name;
  new.article_id := old.article_id;
  new.article_kind := old.article_kind;
  new.parent_id := old.parent_id;
  new.moderated_by := old.moderated_by;
  new.moderated_at := old.moderated_at;

  if new.body is distinct from old.body then
    if public.content_spam_score(new.body) >= 8 then
      raise exception 'Noi dung khong hop le.' using errcode = '42501';
    end if;
    new.is_edited := true;
    new.edited_at := now();
  end if;

  return new;
end;
$$;

create trigger article_comments_guard_update
  before update on public.article_comments
  for each row execute function public.guard_comment_update();

-- Đếm bình luận đã duyệt để nâng mức tin cậy của tác giả.
create or replace function public.sync_comment_trust()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status = 'approved' then
    update public.profiles
       set approved_comment_count = approved_comment_count + 1
     where id = new.author_id;
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'approved' then
      update public.profiles
         set approved_comment_count = approved_comment_count + 1
       where id = new.author_id;
    elsif old.status = 'approved' then
      update public.profiles
         set approved_comment_count = greatest(approved_comment_count - 1, 0)
       where id = new.author_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger article_comments_sync_trust
  after insert or update on public.article_comments
  for each row execute function public.sync_comment_trust();

/*
 * Ba lượt báo cáo thì ẩn bình luận và đẩy vào hàng đợi kiểm duyệt.
 *
 * Ẩn tạm chứ không xoá: người báo cáo có thể sai, và kiểm duyệt viên cần đọc
 * lại nguyên văn để quyết định.
 */
create or replace function public.apply_comment_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  REPORT_THRESHOLD constant integer := 3;
  v_count integer;
begin
  if not public.consume_rate_limit('report:' || new.reporter_id::text, 20, interval '1 day') then
    raise exception 'Da dat gioi han bao cao trong ngay.' using errcode = '53400';
  end if;

  select count(*) into v_count from public.comment_reports where comment_id = new.comment_id;

  update public.article_comments
     set report_count = v_count,
         status = case when v_count >= REPORT_THRESHOLD and status = 'approved'
                       then 'pending'::public.moderation_status
                       else status end
   where id = new.comment_id;

  return new;
end;
$$;

create trigger comment_reports_apply
  after insert on public.comment_reports
  for each row execute function public.apply_comment_report();

-- ------------------------------------------- chống spam cho lịch hẹn và liên hệ
create or replace function public.guard_appointment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_blocked boolean;
  v_clash integer;
begin
  select is_blocked into v_blocked from public.profiles where id = new.client_id;
  if coalesce(v_blocked, true) then
    raise exception 'Tai khoan dang bi han che dat lich.' using errcode = '42501';
  end if;

  if new.requested_at < now() then
    raise exception 'Khong dat duoc lich trong qua khu.' using errcode = '22007';
  end if;

  if not public.consume_rate_limit('appt:' || new.client_id::text, 3, interval '1 day') then
    raise exception 'Da dat gioi han so lan dat lich trong ngay.' using errcode = '53400';
  end if;

  -- Một khách không giữ hai khung giờ chồng nhau.
  select count(*) into v_clash
  from public.appointments
  where client_id = new.client_id
    and status in ('requested', 'confirmed', 'rescheduled')
    and tstzrange(requested_at, requested_at + (duration_minutes || ' minutes')::interval)
        && tstzrange(new.requested_at, new.requested_at + (new.duration_minutes || ' minutes')::interval);

  if v_clash > 0 then
    raise exception 'Ban da co lich trung khung gio nay.' using errcode = '23505';
  end if;

  new.status := 'requested';
  new.confirmed_at := null;
  new.cancelled_at := null;
  return new;
end;
$$;

create trigger appointments_guard
  before insert on public.appointments
  for each row execute function public.guard_appointment();

create or replace function public.guard_contact_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  SPAM_THRESHOLD constant integer := 6;
  v_ip text := public.request_ip_hash();
  v_score integer;
begin
  if not public.consume_rate_limit('contact-ip:' || v_ip, 3, interval '1 hour') then
    raise exception 'Da gui qua nhieu yeu cau. Vui long lien he hotline.' using errcode = '53400';
  end if;

  if not public.consume_rate_limit('contact-ip-day:' || v_ip, 10, interval '1 day') then
    raise exception 'Da dat gioi han gui yeu cau trong ngay.' using errcode = '53400';
  end if;

  if auth.uid() is not null then
    new.profile_id := auth.uid();
    if not public.consume_rate_limit('contact-user:' || auth.uid()::text, 5, interval '1 day') then
      raise exception 'Da dat gioi han gui yeu cau trong ngay.' using errcode = '53400';
    end if;
  else
    new.profile_id := null;
  end if;

  v_score := public.content_spam_score(coalesce(new.message, '') || ' ' || new.full_name);
  new.ip_hash := v_ip;
  new.spam_score := v_score;
  -- Không báo lỗi khi nghi ngờ: cứ nhận rồi xếp vào nhánh spam, vì thà lọc
  -- nhầm một yêu cầu thật còn hơn nói cho kẻ gửi rác biết bộ lọc hoạt động ra sao.
  new.status := case when v_score >= SPAM_THRESHOLD then 'spam'::public.contact_status
                     else 'new'::public.contact_status end;
  new.converted_case_id := null;
  new.assigned_to := null;
  return new;
end;
$$;

create trigger contact_requests_guard
  before insert on public.contact_requests
  for each row execute function public.guard_contact_request();
