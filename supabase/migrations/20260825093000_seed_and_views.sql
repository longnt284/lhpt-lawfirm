-- =============================================================================
-- Dữ liệu tham chiếu và view cho cổng khách hàng
--
-- Đội ngũ luật sư và bảng phí đang nằm cứng trong src/firm.ts để trang chủ dựng
-- được mà không cần gọi mạng. Bản trong cơ sở dữ liệu ở đây phục vụ phần động:
-- ô chọn luật sư khi đặt lịch, và gói dịch vụ gắn với hợp đồng của khách. Hai
-- nơi phải khớp nhau ở `slug` và `id`.
-- =============================================================================

insert into public.lawyers
  (slug, full_name, full_name_en, role_title, role_title_en, email, years_of_practice, focus_areas, sort_order)
values
  ('l1', 'LS. Trung Phạm', 'Lawyer Trung Pham', 'Luật sư Điều hành', 'Managing Partner',
   'trung.pham@lhpt.law', 18,
   '{construction_realestate,litigation,energy}'::public.practice_area[], 1),
  ('l2', 'LS. Long Nguyễn', 'Lawyer Long Nguyen', 'Luật sư Thành viên', 'Partner',
   'long.nguyen@lhpt.law', 15,
   '{construction_realestate,litigation,energy}'::public.practice_area[], 2),
  ('l3', 'LS. Huy Đặng', 'Lawyer Huy Dang', 'Luật sư Thành viên', 'Partner',
   'huy.dang@lhpt.law', 14,
   '{data_protection,litigation,corporate}'::public.practice_area[], 3),
  ('l4', 'LS. Phú Hoàng', 'Lawyer Phu Hoang', 'Luật sư Thành viên', 'Partner',
   'phu.hoang@lhpt.law', 12,
   '{data_protection,litigation,corporate}'::public.practice_area[], 4)
on conflict (slug) do nothing;

insert into public.service_plans
  (id, tier, name, name_en, price_vnd, price_max_vnd, unit, unit_en, advisory_hours_per_month, sort_order)
values
  ('basic', 'basic', 'Pháp chế Thường', 'Regular Counsel',
   180000000, null, '₫ / năm', 'VND / year', 10, 1),
  ('standard', 'standard', 'Pháp chế Thuê ngoài', 'Outsourced Legal Counsel',
   420000000, null, '₫ / năm', 'VND / year', 40, 2),
  -- Gói cao nhất báo giá theo khoảng 650–750 triệu, nên có cả cận trên.
  ('premium', 'premium', 'Tổng cố vấn Pháp chế', 'General Counsel Office',
   650000000, 750000000, '₫ / năm', 'VND / year', null, 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------- từ khoá chặn spam
/*
 * Mẫu khởi tạo cho lớp chấm điểm nội dung, nhắm vào các loại rác hay bám vào
 * trang tư vấn pháp lý: cho vay nặng lãi, cờ bạc, đáo hạn thẻ, mua bán giấy tờ.
 * Mẫu viết dạng regex, so khớp không phân biệt hoa thường và dấu câu chèn giữa.
 */
insert into public.blocked_terms (pattern, severity, note) values
  ('(cho ?vay|vay ?tien|vay ?nong|ho ?tro ?vay).{0,20}(nhanh|nong|gap|lai ?suat)', 6, 'Tin dung den'),
  ('dao ?han ?the|rut ?tien ?the ?tin ?dung', 6, 'Dao han the tin dung'),
  ('(ca ?do|ca ?cuoc|no ?hu|game ?bai|nha ?cai|casino|xoc ?dia)', 7, 'Co bac'),
  ('(lam ?bang|bang ?gia|bang ?that|mua ?bang).{0,15}(dai ?hoc|cao ?dang|thpt)', 8, 'Mua ban bang cap'),
  ('(mua|ban).{0,12}(data|danh ?sach).{0,12}(khach ?hang|so ?dien ?thoai)', 8, 'Mua ban du lieu ca nhan'),
  ('(sim ?so|sim ?dep|dinh ?cu|visa ?bao ?dau|bao ?do ?visa)', 5, 'Rao vat pho bien'),
  ('(viagra|cialis|casino|crypto ?pump|forex ?signal|binary ?option)', 7, 'Rac tieng Anh'),
  ('(zalo|telegram|whatsapp).{0,10}0[0-9]{8,10}', 5, 'Rai so lien he')
on conflict (pattern) do nothing;

-- =============================================================================
-- View cho cổng khách hàng
--
-- security_invoker = true có chủ đích: view chạy bằng quyền của người gọi nên
-- RLS của bảng gốc vẫn áp. View security definer sẽ vô hiệu hoá toàn bộ lớp
-- phân quyền vừa dựng ở migration trước.
-- =============================================================================

create or replace view public.my_cases
with (security_invoker = true) as
select
  c.id,
  c.case_number,
  c.title,
  c.description,
  c.practice_area,
  c.status,
  c.priority,
  c.progress_percent,
  c.tags,
  c.opened_at,
  c.next_action_at,
  c.next_action_note,
  c.closed_at,
  c.updated_at,
  l.full_name    as lead_lawyer_name,
  l.full_name_en as lead_lawyer_name_en,
  l.role_title   as lead_lawyer_role,
  l.role_title_en as lead_lawyer_role_en,
  l.email        as lead_lawyer_email,
  s.contract_number,
  s.plan_id,
  s.status       as subscription_status,
  (select count(*) from public.case_events e
    where e.case_id = c.id and e.is_client_visible) as event_count
from public.cases c
left join public.lawyers l on l.id = c.lead_lawyer_id
left join public.subscriptions s on s.id = c.subscription_id;

comment on view public.my_cases is
  'Hồ sơ kèm luật sư phụ trách và gói dịch vụ; RLS của bảng cases vẫn áp dụng.';

create or replace view public.my_subscriptions
with (security_invoker = true) as
select
  s.id,
  s.contract_number,
  s.plan_id,
  p.name        as plan_name,
  p.name_en     as plan_name_en,
  p.tier,
  p.unit,
  p.unit_en,
  s.status,
  s.started_on,
  s.ends_on,
  s.discount_percent,
  s.amount_vnd,
  s.hours_included,
  s.hours_used,
  case
    when s.hours_included is null or s.hours_included = 0 then null
    else greatest(s.hours_included - s.hours_used, 0)
  end as hours_remaining,
  case
    when s.ends_on is null then null
    else greatest((s.ends_on - current_date), 0)
  end as days_remaining,
  s.notes,
  s.created_at
from public.subscriptions s
join public.service_plans p on p.id = s.plan_id;

comment on view public.my_subscriptions is
  'Gói dịch vụ của khách kèm số giờ và số ngày còn lại, tính sẵn để giao diện không phải tự suy.';

-- Bình luận công khai: chỉ những trường mà bất kỳ độc giả nào cũng được thấy.
create or replace view public.public_comments
with (security_invoker = true) as
select
  id, article_id, article_kind, parent_id,
  author_id, author_name, body, locale,
  is_edited, edited_at, created_at
from public.article_comments
where status = 'approved' and is_deleted = false;

comment on view public.public_comments is
  'Bình luận đã duyệt. Không lộ email hay điểm spam; tên tác giả lấy từ bản chụp trên chính bình luận.';

grant select on public.my_cases, public.my_subscriptions to authenticated;
grant select on public.public_comments to anon, authenticated;
