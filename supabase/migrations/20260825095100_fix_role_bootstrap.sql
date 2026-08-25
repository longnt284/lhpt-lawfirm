-- =============================================================================
-- Sửa: không dựng được quản trị viên đầu tiên
--
-- Lỗi phát hiện khi chạy thử: guard_profile_update() chặn mọi thay đổi vai trò
-- trừ khi người gọi đã là admin. Vì hệ thống khởi đầu không có admin nào, điều
-- kiện đó không bao giờ thoả — kể cả lệnh chạy từ SQL Editor hay bằng
-- service_role key cũng bị âm thầm hoàn lại về vai trò cũ.
--
-- Mở đúng một lối thoát: khi không có ngữ cảnh đăng nhập (auth.uid() is null),
-- lệnh đến từ service_role hoặc kết nối Postgres trực tiếp, hai kênh vốn đã
-- được bảo vệ ở lớp khác. Vai anon không lợi dụng được vì chính sách RLS trên
-- profiles chỉ cấp cho vai authenticated, nên anon không chạm tới trigger này.
--
-- Cách dựng quản trị viên đầu tiên, chạy trong SQL Editor của Supabase:
--   update public.profiles set role = 'admin' where email = 'ten@lhpt.law';
--
-- Đã gộp ngược vào 20260825092000_rls_policies.sql; lặp lại vô hại.
-- =============================================================================

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

revoke all on function public.guard_profile_update() from public, anon, authenticated;
