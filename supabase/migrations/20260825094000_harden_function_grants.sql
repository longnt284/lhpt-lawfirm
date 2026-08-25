-- =============================================================================
-- Siết quyền thực thi hàm
--
-- PostgreSQL mặc định cấp EXECUTE cho PUBLIC trên mọi hàm mới, và PostgREST
-- phơi mọi hàm trong schema public ra thành /rest/v1/rpc/<tên>. Hệ quả: bất kỳ
-- ai cầm khoá công khai đều gọi được các hàm nội bộ của lớp chống spam.
--
-- Hai hàm nguy hiểm nhất nếu để mở:
--
--   consume_rate_limit(key, ...) — kẻ tấn công gọi thẳng với khoá của người
--   khác để đốt sạch hạn mức của họ, khiến nạn nhân không bình luận hay đặt
--   lịch được nữa.
--
--   prune_rate_limits() — xoá toàn bộ bộ đếm, vô hiệu hoá chính lớp giới hạn
--   tần suất vừa dựng.
--
-- Ba hàm is_staff, is_admin, can_view_case thì phải giữ EXECUTE cho
-- authenticated: biểu thức của chính sách RLS chạy bằng quyền của người gọi,
-- thu hồi ở đây sẽ làm mọi truy vấn có RLS lỗi quyền.
-- =============================================================================

do $$
declare
  v_fn text;
  -- Hàm trigger và hàm nội bộ: không kênh nào cần gọi trực tiếp.
  v_internal text[] := array[
    'consume_rate_limit(text, integer, interval)',
    'prune_rate_limits(interval)',
    'request_ip_hash()',
    'content_spam_score(text)',
    'next_case_number(public.practice_area)',
    'area_code(public.practice_area)',
    'assign_case_number()',
    'log_case_status_change()',
    'refresh_subscription_status()',
    'touch_updated_at()',
    'handle_new_user()',
    'guard_comment()',
    'guard_comment_update()',
    'sync_comment_trust()',
    'apply_comment_report()',
    'guard_appointment()',
    'guard_appointment_update()',
    'guard_contact_request()',
    'guard_profile_update()'
  ];
begin
  foreach v_fn in array v_internal loop
    execute format('revoke all on function public.%s from public, anon, authenticated', v_fn);
  end loop;
end;
$$;

-- Hàm kiểm tra quyền do chính chính sách RLS gọi, phải để authenticated chạy được.
revoke all on function public.is_staff() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.can_view_case(uuid) from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_view_case(uuid) to authenticated;

-- ---------------------------------------------------- search_path cố định
/*
 * Ba hàm còn thiếu `set search_path`. Với hàm SECURITY DEFINER thì đây là lỗ
 * leo thang đặc quyền kinh điển: người gọi đặt search_path trỏ sang schema của
 * họ và hàm sẽ gọi nhầm phiên bản giả của một hàm hệ thống.
 */
create or replace function public.area_code(p_area public.practice_area)
returns text
language sql
immutable
set search_path = public, pg_temp
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

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.refresh_subscription_status()
returns trigger
language plpgsql
set search_path = public, pg_temp
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

revoke all on function public.area_code(public.practice_area) from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.refresh_subscription_status() from public, anon, authenticated;

/*
 * Ba cảnh báo còn lại của database linter là cố ý, ghi ở đây để lần sau không
 * phải tranh luận lại:
 *
 * rls_enabled_no_policy trên rate_limit_hits, blocked_terms và
 * case_number_counters — bật RLS mà không khai chính sách nào chính là chặn
 * sạch. Ba bảng này chỉ được đọc và ghi từ hàm SECURITY DEFINER, không client
 * nào cần chạm tới.
 *
 * authenticated_security_definer_function_executable trên is_staff, is_admin và
 * can_view_case — biểu thức của chính sách RLS chạy bằng quyền của người gọi,
 * nên thu hồi EXECUTE sẽ làm mọi truy vấn có RLS lỗi quyền. Cả ba chỉ đọc và
 * chỉ tiết lộ điều mà chính người gọi đã biết về mình.
 */
