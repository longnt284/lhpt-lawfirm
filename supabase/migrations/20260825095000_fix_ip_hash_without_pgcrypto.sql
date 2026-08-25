-- =============================================================================
-- Sửa: request_ip_hash() không phân giải được digest()
--
-- Lỗi phát hiện khi chạy thử: mọi lượt ghi contact_requests đều đổ 42883
-- undefined_function. Nguyên nhân là Supabase cài pgcrypto vào schema
-- `extensions`, còn hàm này cố định `search_path = public` để chặn leo thang
-- đặc quyền — nên digest() nằm ngoài tầm nhìn.
--
-- Chuyển sang sha256() dựng sẵn trong pg_catalog: bỏ hẳn ràng buộc vào vị trí
-- cài extension, không phải nới search_path.
--
-- Nội dung dưới đây đã được gộp ngược vào
-- 20260825091000_comments_and_antispam.sql nên khi dựng mới sẽ chạy hai lần;
-- cả hai lệnh đều bất biến (create or replace + revoke) nên lặp lại vô hại.
-- =============================================================================

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

  return encode(
    sha256(convert_to(coalesce(nullif(btrim(v_ip), ''), 'unknown') || ':lhpt', 'UTF8')),
    'hex'
  );
end;
$$;

revoke all on function public.request_ip_hash() from public, anon, authenticated;
