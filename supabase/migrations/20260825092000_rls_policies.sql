-- =============================================================================
-- Row Level Security
--
-- Mặc định của mọi bảng ở đây là chặn. Cổng khách hàng chạy bằng khoá công khai
-- nên bất kỳ ai cũng gọi được REST API bằng token của chính họ; ranh giới dữ
-- liệu duy nhất đáng tin là ranh giới do cơ sở dữ liệu tự áp.
--
-- Ba bảng hạ tầng (rate_limit_hits, blocked_terms, case_number_counters) bật
-- RLS mà không khai báo chính sách nào: chúng chỉ được đọc và ghi từ các hàm
-- SECURITY DEFINER, không client nào chạm tới trực tiếp.
-- =============================================================================

alter table public.profiles              enable row level security;
alter table public.lawyers               enable row level security;
alter table public.service_plans         enable row level security;
alter table public.cases                 enable row level security;
alter table public.case_events           enable row level security;
alter table public.case_participants     enable row level security;
alter table public.subscriptions         enable row level security;
alter table public.appointments          enable row level security;
alter table public.contact_requests      enable row level security;
alter table public.article_comments      enable row level security;
alter table public.comment_reports       enable row level security;
alter table public.rate_limit_hits       enable row level security;
alter table public.blocked_terms         enable row level security;
alter table public.case_number_counters  enable row level security;

-- --------------------------------------------------------------- hàm hỗ trợ
/*
 * Một hồ sơ hiện ra với người đứng tên và với những người được mời vào hồ sơ đó.
 *
 * SECURITY DEFINER vì chính sách trên bảng cases gọi hàm này, mà hàm lại đọc
 * cases và case_participants; đọc bằng quyền người gọi sẽ kích hoạt lại chính
 * sách và đệ quy.
 */
create or replace function public.can_view_case(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_staff()
      or exists (select 1 from public.cases c
                  where c.id = p_case_id and c.client_id = auth.uid())
      or exists (select 1 from public.case_participants p
                  where p.case_id = p_case_id and p.profile_id = auth.uid());
$$;

-- ------------------------------------------------------------------- profiles
create policy profiles_select_self_or_staff on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff());

create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update_self_or_staff on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_staff())
  with check (id = auth.uid() or public.is_staff());

/*
 * Người dùng sửa được thông tin liên hệ của mình, không sửa được vai trò.
 *
 * Chính sách RLS chỉ nói được "dòng nào", không nói được "cột nào", nên phần
 * chặn leo thang đặc quyền phải nằm ở trigger.
 *
 * Nhánh `auth.uid() is null` là lối thoát để dựng quản trị viên đầu tiên. Nếu
 * chỉ cho admin đổi vai trò thì điều kiện đó không bao giờ thoả khi hệ thống
 * còn trống, và không ai lên được admin kể cả từ SQL Editor hay service_role
 * key. Vai anon không lợi dụng được: chính sách RLS trên profiles chỉ cấp cho
 * vai authenticated, nên anon không bao giờ chạm tới trigger này.
 */
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if public.is_staff() then
    new.role := old.role;  -- chỉ quản trị viên đổi được vai trò
    return new;
  end if;

  new.role := old.role;
  new.is_blocked := old.is_blocked;
  new.blocked_reason := old.blocked_reason;
  new.approved_comment_count := old.approved_comment_count;
  return new;
end;
$$;

create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- -------------------------------------------------------------------- lawyers
create policy lawyers_select_public on public.lawyers
  for select to anon, authenticated
  using (is_active or public.is_staff());

create policy lawyers_write_admin on public.lawyers
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -------------------------------------------------------------- service_plans
create policy service_plans_select_public on public.service_plans
  for select to anon, authenticated
  using (is_active or public.is_staff());

create policy service_plans_write_admin on public.service_plans
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------- cases
create policy cases_select_own_or_staff on public.cases
  for select to authenticated
  using (public.can_view_case(id));

-- Hồ sơ do hãng mở sau bước tiếp nhận, không mở thẳng từ cổng khách hàng.
create policy cases_insert_staff on public.cases
  for insert to authenticated
  with check (public.is_staff());

create policy cases_update_staff on public.cases
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy cases_delete_admin on public.cases
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------- case_events
create policy case_events_select_visible on public.case_events
  for select to authenticated
  using (public.can_view_case(case_id) and (is_client_visible or public.is_staff()));

create policy case_events_write_staff on public.case_events
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------------------------------------------------- case_participants
create policy case_participants_select on public.case_participants
  for select to authenticated
  using (profile_id = auth.uid() or public.can_view_case(case_id));

create policy case_participants_write on public.case_participants
  for all to authenticated
  using (
    public.is_staff()
    or exists (select 1 from public.cases c where c.id = case_id and c.client_id = auth.uid())
  )
  with check (
    public.is_staff()
    or exists (select 1 from public.cases c where c.id = case_id and c.client_id = auth.uid())
  );

-- -------------------------------------------------------------- subscriptions
create policy subscriptions_select_own_or_staff on public.subscriptions
  for select to authenticated
  using (client_id = auth.uid() or public.is_staff());

create policy subscriptions_write_staff on public.subscriptions
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- --------------------------------------------------------------- appointments
create policy appointments_select_own_or_staff on public.appointments
  for select to authenticated
  using (client_id = auth.uid() or public.is_staff());

create policy appointments_insert_own on public.appointments
  for insert to authenticated
  with check (client_id = auth.uid());

create policy appointments_update_own_or_staff on public.appointments
  for update to authenticated
  using (client_id = auth.uid() or public.is_staff())
  with check (client_id = auth.uid() or public.is_staff());

create policy appointments_delete_staff on public.appointments
  for delete to authenticated
  using (public.is_staff());

/*
 * Khách sửa được ghi chú và huỷ lịch của mình; xác nhận lịch là việc của hãng.
 * Nếu để khách tự đặt status = 'confirmed' thì lịch xuất hiện trên bảng công
 * việc của luật sư mà chưa ai kiểm tra khung giờ đó có trống hay không.
 */
create or replace function public.guard_appointment_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_staff() then
    if new.status = 'confirmed' and old.status <> 'confirmed' then
      new.confirmed_at := now();
    end if;
    if new.status = 'cancelled' and old.status <> 'cancelled' then
      new.cancelled_at := now();
    end if;
    return new;
  end if;

  if new.status is distinct from old.status and new.status <> 'cancelled' then
    raise exception 'Chi huy duoc lich hen da dat.' using errcode = '42501';
  end if;

  if new.status = 'cancelled' and old.status <> 'cancelled' then
    new.cancelled_at := now();
  end if;

  new.client_id := old.client_id;
  new.case_id := old.case_id;
  new.reference := old.reference;
  new.confirmed_at := old.confirmed_at;
  new.meeting_link := old.meeting_link;
  return new;
end;
$$;

create trigger appointments_guard_update
  before update on public.appointments
  for each row execute function public.guard_appointment_update();

-- ----------------------------------------------------------- contact_requests
-- Biểu mẫu liên hệ mở cho khách chưa có tài khoản; guard_contact_request()
-- lo phần giới hạn tần suất và chấm điểm rác.
create policy contact_requests_insert_public on public.contact_requests
  for insert to anon, authenticated
  with check (true);

create policy contact_requests_select_own_or_staff on public.contact_requests
  for select to authenticated
  using (public.is_staff() or (profile_id is not null and profile_id = auth.uid()));

create policy contact_requests_update_staff on public.contact_requests
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ----------------------------------------------------------- article_comments
-- Bình luận đã duyệt là nội dung công khai, đọc được cả khi chưa đăng nhập.
create policy article_comments_select_approved on public.article_comments
  for select to anon, authenticated
  using (status = 'approved' and is_deleted = false);

create policy article_comments_select_own on public.article_comments
  for select to authenticated
  using (author_id = auth.uid() or public.is_staff());

create policy article_comments_insert_own on public.article_comments
  for insert to authenticated
  with check (author_id = auth.uid());

create policy article_comments_update_own_or_staff on public.article_comments
  for update to authenticated
  using ((author_id = auth.uid() and is_deleted = false) or public.is_staff())
  with check (author_id = auth.uid() or public.is_staff());

create policy article_comments_delete_own_or_staff on public.article_comments
  for delete to authenticated
  using (author_id = auth.uid() or public.is_staff());

-- ------------------------------------------------------------ comment_reports
create policy comment_reports_insert_own on public.comment_reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

create policy comment_reports_select_own_or_staff on public.comment_reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_staff());

create policy comment_reports_delete_staff on public.comment_reports
  for delete to authenticated
  using (public.is_staff());
