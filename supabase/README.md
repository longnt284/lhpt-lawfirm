# Backend LHPT Law Firm

Cơ sở dữ liệu Supabase cho cổng khách hàng: tài khoản, hồ sơ vụ việc, gói dịch
vụ, đặt lịch, biểu mẫu liên hệ và bình luận dưới bài viết.

## Chạy migration

Các file trong `migrations/` chạy theo thứ tự tên. Với dự án đã tồn tại:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

Hai file `*_fix_*` là bản vá cho lỗi phát hiện lúc chạy thử. Nội dung của chúng
đã được gộp ngược vào file gốc, nên khi dựng mới sẽ chạy hai lần; cả hai chỉ gồm
`create or replace` và `revoke` nên lặp lại vô hại. Giữ lại để lịch sử migration
trên máy khớp với lịch sử đã ghi trên dự án.

## Dựng quản trị viên đầu tiên

Đăng ký tài khoản qua giao diện website trước, rồi chạy trong SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'ten@lhpt.law';
```

Chỉ lệnh chạy ngoài ngữ cảnh đăng nhập (SQL Editor, service_role key) mới đổi
được vai trò. Người dùng đã đăng nhập không tự nâng vai trò của mình, kể cả khi
gọi thẳng REST API — xem `guard_profile_update()`.

Bốn vai trò: `client` (mặc định), `staff`, `lawyer`, `admin`. `staff` và
`lawyer` thấy toàn bộ hồ sơ và kiểm duyệt được bình luận; chỉ `admin` đổi được
vai trò, sửa danh bạ luật sư và bảng gói dịch vụ.

## Mã số hồ sơ

`cases.case_number` do cơ sở dữ liệu sinh, không do ứng dụng đặt. Định dạng
`LHPT-<năm>-<mã lĩnh vực>-<số thứ tự>`, ví dụ `LHPT-2026-XD-0007`:

| Lĩnh vực                  | Mã |
|---------------------------|----|
| Xây dựng · Bất động sản   | XD |
| Tố tụng                   | TT |
| Năng lượng                | NL |
| Doanh nghiệp              | DN |
| Dữ liệu                   | DL |
| Gói pháp chế              | PC |
| Khác                      | KH |

Chèn hồ sơ mới với `case_number` để chuỗi rỗng, trigger `cases_assign_number`
sẽ điền. Bộ đếm nằm ở `case_number_counters` và tăng bằng `INSERT ... ON
CONFLICT DO UPDATE`, nên hai yêu cầu song song không nhận trùng số.

## Bốn lớp chống thông tin rác

Đặt ở tầng cơ sở dữ liệu, không ở giao diện: kẻ gửi rác gọi thẳng REST API và
không bao giờ chạy qua mã React.

1. **Danh tính.** Bình luận và đặt lịch bắt buộc đăng nhập; bình luận còn đòi
   email đã xác thực.
2. **Tần suất.** `consume_rate_limit()` đếm theo cửa sổ cố định. Bình luận 5
   lượt/10 phút và 30 lượt/ngày mỗi tài khoản; đặt lịch 3 lượt/ngày; biểu mẫu
   liên hệ 3 lượt/giờ và 10 lượt/ngày theo băm địa chỉ IP.
3. **Nội dung.** `content_spam_score()` chấm điểm theo số liên kết, độ dài, tỷ
   lệ viết hoa, ký tự lặp và các mẫu trong `blocked_terms`. Ngưỡng: từ 3 điểm
   vào hàng chờ duyệt, từ 8 điểm xếp thẳng vào nhánh rác.
4. **Kiểm duyệt.** Bình luận mới nằm chờ cho tới khi tác giả có 3 bình luận đã
   duyệt. Ba lượt báo cáo đưa một bình luận đang hiển thị trở lại hàng chờ.

Biểu mẫu liên hệ không báo lỗi khi nghi ngờ mà vẫn nhận rồi gắn nhãn `spam`:
thà lọc nhầm một yêu cầu thật còn hơn cho kẻ gửi rác biết bộ lọc hoạt động ra sao.

Giao diện thêm một lớp nữa là bẫy mật ong — trường ẩn ngoài khung nhìn mà chỉ
trình gửi rác tự động mới điền.

Bảng đếm `rate_limit_hits` cần dọn định kỳ:

```sql
select public.prune_rate_limits(interval '2 days');
```

## Ranh giới dữ liệu

Mọi bảng bật RLS. Khách chỉ đọc được hồ sơ mình đứng tên hoặc được mời vào qua
`case_participants`; gói dịch vụ, lịch hẹn và yêu cầu liên hệ cũng theo nguyên
tắc đó. Ghi chú nội bộ của đội ngũ (`case_events.is_client_visible = false`)
không lọt ra cổng khách hàng.

Ba bảng hạ tầng — `rate_limit_hits`, `blocked_terms`, `case_number_counters` —
bật RLS mà không khai chính sách nào: chặn sạch, chỉ hàm `SECURITY DEFINER`
chạm tới.

## Cấu hình xác thực cần bật trên Supabase

- **Confirm email**: bật. `guard_comment()` từ chối bình luận của tài khoản
  chưa xác thực email, nên tắt tuỳ chọn này sẽ làm mất một lớp chống spam.
- **Site URL** và **Redirect URLs**: trỏ về tên miền thật, vì luồng đăng ký và
  đặt lại mật khẩu dùng `window.location.origin`.
