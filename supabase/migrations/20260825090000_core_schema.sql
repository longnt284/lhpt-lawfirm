-- =============================================================================
-- LHPT Law Firm — lược đồ nền
--
-- Ba khối dữ liệu, tách theo vòng đời chứ không theo màn hình:
--   1. Danh tính: profiles, lawyers
--   2. Công việc: cases, case_events, case_participants, appointments
--   3. Thương mại: service_plans, subscriptions, contact_requests
--
-- Mã hồ sơ (case_number) sinh trong cơ sở dữ liệu chứ không ở tầng ứng dụng:
-- đây là định danh khách hàng đọc qua điện thoại cho luật sư, nên nó phải duy
-- nhất kể cả khi hai yêu cầu mở hồ sơ chạy song song.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- kiểu liệt kê
create type public.app_role as enum ('client', 'staff', 'lawyer', 'admin');

create type public.practice_area as enum (
  'construction_realestate',  -- Xây dựng · Bất động sản
  'litigation',               -- Tố tụng · Giải quyết tranh chấp
  'energy',                   -- Điện mặt trời · Năng lượng
  'corporate',                -- Doanh nghiệp · Tuân thủ
  'data_protection',          -- Bảo mật dữ liệu · Công nghệ
  'retainer',                 -- Gói pháp chế thường niên
  'other'
);

create type public.case_status as enum (
  'new',              -- Mới tiếp nhận
  'intake',           -- Đang đánh giá sơ bộ
  'quoted',           -- Đã báo phí, chờ khách xác nhận
  'active',           -- Đang xử lý
  'awaiting_client',  -- Chờ khách bổ sung hồ sơ
  'in_litigation',    -- Đang tố tụng / trọng tài
  'on_hold',          -- Tạm dừng
  'closed',           -- Đã đóng
  'cancelled'         -- Huỷ
);

create type public.case_priority as enum ('low', 'normal', 'high', 'urgent');

create type public.case_event_type as enum (
  'status_change', 'note', 'document', 'hearing', 'deadline', 'meeting', 'payment'
);

create type public.appointment_status as enum (
  'requested', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show'
);

create type public.appointment_mode as enum ('office', 'online', 'phone');

create type public.plan_tier as enum ('basic', 'standard', 'premium');

create type public.subscription_status as enum (
  'pending', 'active', 'expiring', 'expired', 'cancelled'
);

create type public.contact_status as enum (
  'new', 'triaged', 'responded', 'converted', 'closed', 'spam'
);

create type public.moderation_status as enum ('pending', 'approved', 'rejected', 'spam');

-- ------------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  company_name text,
  tax_code text,
  job_title text,
  preferred_locale text not null default 'vi' check (preferred_locale in ('vi', 'en')),
  role public.app_role not null default 'client',
  -- Khoá tài khoản spam mà không xoá dữ liệu: hồ sơ pháp lý phải giữ được vết.
  is_blocked boolean not null default false,
  blocked_reason text,
  -- Đếm bình luận đã duyệt, dùng cho ngưỡng tin cậy ở lớp chống spam.
  approved_comment_count integer not null default 0,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Hồ sơ người dùng, ánh xạ 1-1 với auth.users.';

create index profiles_role_idx on public.profiles (role) where role <> 'client';
create index profiles_email_idx on public.profiles (lower(email));

-- -------------------------------------------------------------------- lawyers
create table public.lawyers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  full_name_en text,
  role_title text not null,
  role_title_en text,
  email text,
  years_of_practice integer,
  focus_areas public.practice_area[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.lawyers is 'Danh bạ luật sư; nguồn cho ô chọn luật sư khi đặt lịch.';

-- --------------------------------------------------------------- service_plans
create table public.service_plans (
  id text primary key,
  tier public.plan_tier not null,
  name text not null,
  name_en text not null,
  price_vnd numeric(14, 0),
  price_max_vnd numeric(14, 0),
  unit text not null default '₫ / năm',
  unit_en text not null default 'VND / year',
  advisory_hours_per_month integer,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

comment on column public.service_plans.price_max_vnd is
  'Chỉ dùng cho gói báo giá theo khoảng (650–750 triệu); null nghĩa là giá cố định.';

-- ------------------------------------------------------------- mã số hồ sơ
create table public.case_number_counters (
  year integer not null,
  area_code text not null,
  last_seq integer not null default 0,
  primary key (year, area_code)
);

create or replace function public.area_code(p_area public.practice_area)
returns text
language sql
immutable
as $$
  select case p_area
    when 'construction_realestate' then 'XD'
    when 'litigation'              then 'TT'
    when 'energy'                  then 'NL'
    when 'corporate'               then 'DN'
    when 'data_protection'         then 'DL'
    when 'retainer'                then 'PC'
    else 'KH'
  end;
$$;

/*
 * Sinh mã hồ sơ dạng LHPT-2026-XD-0007.
 *
 * Dùng INSERT ... ON CONFLICT DO UPDATE thay vì SELECT rồi UPDATE: hai yêu cầu
 * mở hồ sơ cùng lĩnh vực đến cùng lúc sẽ nối tiếp nhau ở khoá chính thay vì
 * cùng đọc ra một số rồi ghi đè nhau.
 */
create or replace function public.next_case_number(p_area public.practice_area)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year integer := extract(year from now() at time zone 'Asia/Ho_Chi_Minh')::int;
  v_code text := public.area_code(p_area);
  v_seq integer;
begin
  insert into public.case_number_counters (year, area_code, last_seq)
  values (v_year, v_code, 1)
  on conflict (year, area_code)
    do update set last_seq = public.case_number_counters.last_seq + 1
  returning last_seq into v_seq;

  return format('LHPT-%s-%s-%s', v_year, v_code, lpad(v_seq::text, 4, '0'));
end;
$$;

-- ---------------------------------------------------------------------- cases
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  case_number text not null unique,
  client_id uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  description text,
  practice_area public.practice_area not null default 'other',
  status public.case_status not null default 'new',
  priority public.case_priority not null default 'normal',
  lead_lawyer_id uuid references public.lawyers (id) on delete set null,
  subscription_id uuid,
  -- Tiến độ hiển thị cho khách; do đội ngũ cập nhật, không tự suy ra từ status.
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  tags text[] not null default '{}',
  opened_at timestamptz not null default now(),
  next_action_at timestamptz,
  next_action_note text,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cases is 'Hồ sơ vụ việc; case_number là mã khách hàng dùng để tra cứu.';

create index cases_client_idx on public.cases (client_id, created_at desc);
create index cases_status_idx on public.cases (status);
create index cases_area_idx on public.cases (practice_area);
create index cases_lawyer_idx on public.cases (lead_lawyer_id);
create index cases_number_trgm_idx on public.cases (case_number text_pattern_ops);
create index cases_tags_idx on public.cases using gin (tags);

-- Gán mã hồ sơ khi chưa có, để tầng ứng dụng không phải tự nghĩ ra mã.
create or replace function public.assign_case_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.case_number is null or new.case_number = '' then
    new.case_number := public.next_case_number(new.practice_area);
  end if;
  return new;
end;
$$;

create trigger cases_assign_number
  before insert on public.cases
  for each row execute function public.assign_case_number();

-- ---------------------------------------------------------------- case_events
create table public.case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  event_type public.case_event_type not null default 'note',
  title text not null,
  body text,
  status_from public.case_status,
  status_to public.case_status,
  occurred_at timestamptz not null default now(),
  -- Ghi chú nội bộ của đội ngũ không lộ ra cổng khách hàng.
  is_client_visible boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index case_events_case_idx on public.case_events (case_id, occurred_at desc);

-- Mỗi lần đổi trạng thái hồ sơ tự ghi một mốc vào dòng thời gian.
create or replace function public.log_case_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.case_events (case_id, event_type, title, status_from, status_to, created_by)
    values (new.id, 'status_change', 'Cập nhật trạng thái hồ sơ', old.status, new.status, auth.uid());

    if new.status in ('closed', 'cancelled') and new.closed_at is null then
      new.closed_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger cases_log_status
  before update on public.cases
  for each row execute function public.log_case_status_change();

-- ---------------------------------------------------- case_participants
-- Một doanh nghiệp thường có kế toán trưởng và trưởng pháp chế cùng theo hồ sơ.
create table public.case_participants (
  case_id uuid not null references public.cases (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  access text not null default 'viewer' check (access in ('viewer', 'editor')),
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (case_id, profile_id)
);

create index case_participants_profile_idx on public.case_participants (profile_id);

-- -------------------------------------------------------------- subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  contract_number text not null unique,
  client_id uuid not null references public.profiles (id) on delete restrict,
  plan_id text not null references public.service_plans (id),
  status public.subscription_status not null default 'pending',
  started_on date,
  ends_on date,
  -- Ưu đãi 50% cho lần đầu ký hợp đồng dịch vụ, xem POLICIES_SERVICE.
  discount_percent integer not null default 0 check (discount_percent between 0 and 100),
  amount_vnd numeric(14, 0),
  hours_included integer,
  hours_used numeric(8, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_period_valid check (ends_on is null or started_on is null or ends_on > started_on)
);

create index subscriptions_client_idx on public.subscriptions (client_id, created_at desc);
create index subscriptions_status_idx on public.subscriptions (status);

alter table public.cases
  add constraint cases_subscription_fk
  foreign key (subscription_id) references public.subscriptions (id) on delete set null;

/*
 * `status` của gói suy ra từ ngày kết thúc chứ không gõ tay: một gói hết hạn
 * hôm qua mà cổng khách hàng vẫn hiện "đang hiệu lực" là lỗi khó phát hiện
 * nhưng gây hiểu nhầm nặng về quyền lợi.
 */
create or replace function public.refresh_subscription_status()
returns trigger
language plpgsql
as $$
begin
  if new.status not in ('cancelled', 'pending') and new.ends_on is not null then
    if new.ends_on < current_date then
      new.status := 'expired';
    elsif new.ends_on <= current_date + interval '30 days' then
      new.status := 'expiring';
    else
      new.status := 'active';
    end if;
  end if;
  return new;
end;
$$;

create trigger subscriptions_refresh_status
  before insert or update on public.subscriptions
  for each row execute function public.refresh_subscription_status();

-- --------------------------------------------------------------- appointments
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default 'LH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  client_id uuid not null references public.profiles (id) on delete cascade,
  case_id uuid references public.cases (id) on delete set null,
  lawyer_id uuid references public.lawyers (id) on delete set null,
  practice_area public.practice_area not null default 'other',
  subject text not null,
  notes text,
  mode public.appointment_mode not null default 'office',
  requested_at timestamptz not null,
  duration_minutes integer not null default 45 check (duration_minutes between 15 and 240),
  status public.appointment_status not null default 'requested',
  location text,
  meeting_link text,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  locale text not null default 'vi' check (locale in ('vi', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Không nhận lịch trong quá khứ; ràng buộc ở đây để mọi kênh ghi đều chịu chung.
  constraint appointments_future check (requested_at > created_at - interval '1 hour')
);

create index appointments_client_idx on public.appointments (client_id, requested_at desc);
create index appointments_lawyer_idx on public.appointments (lawyer_id, requested_at);
create index appointments_status_idx on public.appointments (status);

-- ----------------------------------------------------------- contact_requests
-- Form liên hệ công khai: khách chưa có tài khoản vẫn gửi được.
create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default 'YC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  profile_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  contact text not null,
  email text,
  phone text,
  company_name text,
  practice_area public.practice_area not null default 'other',
  message text,
  locale text not null default 'vi' check (locale in ('vi', 'en')),
  source text not null default 'website_contact',
  status public.contact_status not null default 'new',
  spam_score integer not null default 0,
  assigned_to uuid references public.lawyers (id) on delete set null,
  converted_case_id uuid references public.cases (id) on delete set null,
  -- Băm địa chỉ IP thay vì lưu thẳng: đủ để chặn lũ gửi, không lưu dữ liệu
  -- định danh ngoài phạm vi cần thiết theo chính sách bảo mật của hãng.
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index contact_requests_status_idx on public.contact_requests (status, created_at desc);
create index contact_requests_area_idx on public.contact_requests (practice_area);
create index contact_requests_profile_idx on public.contact_requests (profile_id);

-- ------------------------------------------------------------ updated_at dùng chung
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger cases_touch before update on public.cases
  for each row execute function public.touch_updated_at();
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();
create trigger appointments_touch before update on public.appointments
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------- tạo profile khi có tài khoản mới
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, company_name, preferred_locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'company_name',
    coalesce(new.raw_user_meta_data ->> 'preferred_locale', 'vi')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
