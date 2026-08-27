# LHPT Law Firm — 3D, UX và nội dung: đặc tả bản preview

Ngày chốt thiết kế: 2026-08-27
Nhánh cục bộ: `codex/3d-ux-preview`
Trạng thái xuất bản: preview trước; chưa push và chưa tạo PR cho đến khi chủ repo duyệt.

## 1. Mục tiêu

Nâng chất lượng cảm nhận của website theo hướng “premium legal blueprint”: kiến trúc pháp lý có chiều sâu, chắc chắn, tiết chế và đáng tin cậy. Bản nâng cấp phải:

- làm các cảnh 3D dễ đọc hơn mà không biến website hãng luật thành trải nghiệm game;
- giữ nguyên ngôn ngữ thương hiệu hiện tại: nền mực, vàng đồng, xanh ngọc và nét bản vẽ kỹ thuật;
- sửa các lỗi UX, routing, cảnh báo runtime và nội dung pháp lý sai/không đồng nhất đã tìm thấy;
- giữ nguyên toàn bộ mô hình “Bản đồ năng lực”, gồm `PracticeMapScene` và biến thể preview `practice`;
- hoạt động tốt trên desktop, mobile, bàn phím và chế độ `prefers-reduced-motion`;
- không thêm hậu kỳ nặng, texture ngoài, model GLTF hay dependency runtime mới.

## 2. Phạm vi đã kiểm tra

Các route chính:

- `/`
- `/nen-mong-phap-ly`
- `/ban-do-nang-luc`
- route không tồn tại

Các luồng chính:

- điều hướng từ trang con về section trên trang chủ;
- mở hộp thoại tài khoản/đăng nhập;
- responsive desktop và mobile;
- chế độ giảm chuyển động;
- dựng production và kiểm tra lỗi console/runtime.

Baseline kỹ thuật trước khi sửa:

- TypeScript pass;
- production build pass nhưng chunk Three.js lớn hơn ngưỡng cảnh báo 500 kB;
- không có lỗi JavaScript làm hỏng trang;
- không tràn ngang ở viewport 1440 px và 390 px.

## 3. Các vấn đề sẽ xử lý

### P1 — route không tồn tại đang giả làm trang chủ

Wildcard route hiện render toàn bộ homepage và trả title homepage. Người dùng không biết URL sai; công cụ tìm kiếm cũng có thể xem đây là soft 404.

Thiết kế sửa:

- tạo trang “Không tìm thấy nội dung” cùng hệ hình ảnh thương hiệu;
- cung cấp hai đường thoát rõ: về trang chủ và xem lĩnh vực hành nghề;
- đặt title/description riêng và `robots=noindex,follow` khi ở route này;
- không cố hứa HTTP 404 ở tầng React SPA vì status thật thuộc cấu hình hosting; mục tiêu của PR là sửa UX và metadata. Nếu cần HTTP 404 thật, đó là thay đổi hạ tầng riêng.

### P2 — chuyển từ trang con đến section trang chủ bị cuộn qua quãng đường rất dài

`ScrollManager` yêu cầu `behavior: "auto"`, nhưng CSS toàn cục đặt `scroll-behavior: smooth`; kết quả là người dùng nhìn website tự chạy qua hơn 11.000 px trong khoảng hai giây.

Thiết kế sửa:

- dùng một helper điều hướng section có hành vi xác định;
- tạm vô hiệu smooth scrolling trong lần định vị xuyên route, sau đó khôi phục;
- căn theo `scroll-margin-top`/header hiện hữu;
- chế độ reduced motion luôn nhảy tức thời;
- giữ smooth scroll cho các tương tác ngắn trong cùng trang nếu phù hợp.

### P2 — cảnh báo Framer Motion ở opening scene

`useScroll` nhận target ref được hydrate ở component khác và container chưa có position hợp lệ cho phép đo offset.

Thiết kế sửa:

- đặt phần tử đo scroll và hook `useScroll` trong cùng component sở hữu ref;
- bảo đảm container đo có `position: relative`;
- không thay đổi trình tự nội dung hoặc chiều cao kể chuyện hai màn.

### P2 — ticker tiếng Anh dùng văn bản DPPA cũ

Ticker tiếng Anh còn ghi `Decree 80/2024`, trong khi nội dung tiếng Việt đã dùng `Nghị định 57/2025` và cập nhật sửa đổi năm 2026.

Thiết kế sửa:

- đổi ticker tiếng Anh thành thông tin ngắn, trung tính về `Decree 57/2025` và văn bản sửa đổi `Decree 243/2026`;
- không mở rộng hoặc tự thêm nhận định pháp lý chưa được nguồn chính thức xác minh;
- ngày xác minh nội dung pháp lý cho lần sửa này: 2026-08-27.

Nguồn chính thức dùng để xác minh:

- [Nghị định 243/2026/NĐ-CP](https://vanban.chinhphu.vn/?classid=1&docid=218605&pageid=27160), ban hành và có hiệu lực 26-06-2026, sửa đổi Nghị định 57/2025/NĐ-CP và 58/2025/NĐ-CP;
- nội dung hiện hữu về Nghị định 57/2025/NĐ-CP được giữ ở mức tên cơ chế, không suy diễn điều kiện áp dụng cho một vụ việc cụ thể.

### P3 — cảnh báo React Router future flags

Ứng dụng đang chạy đúng nhưng console có hai cảnh báo về hành vi v7. Sẽ bật các future flags tương thích sau khi có test routing xác nhận không đổi luồng hiện tại.

### P3 — chunk 3D lớn

Three.js đã được lazy-load theo scene, nhưng chunk dùng chung vượt 500 kB thô. PR này không thêm thư viện đồ họa mới. Mục tiêu là không làm tăng đáng kể gzip/brotli và không phá lazy-loading; tách sâu hơn Three.js sẽ là tối ưu riêng nếu số đo sau cùng cho thấy cần thiết.

## 4. Hướng hình ảnh 3D được chọn

Ba hướng đã cân nhắc:

1. **Wireframe tinh chỉnh:** ít rủi ro và nhẹ nhất, nhưng chưa giải quyết được cảm giác phẳng/mờ ở các giai đoạn móng–cột–sàn.
2. **Premium legal blueprint — được chọn:** giữ nét line-art, thêm mặt bán trong suốt có chọn lọc, dải sáng và chuyển động lắp ghép có nghĩa. Cân bằng tốt nhất giữa nhận diện, chiều sâu và hiệu năng.
3. **Kiến trúc cinematic:** vật liệu PBR, đèn/đổ bóng/hậu kỳ. Hình ảnh mạnh nhưng quá nặng và dễ lệch phong cách hãng luật.

Nguyên tắc của hướng được chọn:

- nét kỹ thuật vẫn là lớp thông tin chính;
- mặt khối chỉ đóng vai trò “mực loãng” để mắt đọc được thể tích;
- vàng đồng biểu thị cấu trúc/trật tự, xanh ngọc biểu thị bảo vệ/định tuyến rủi ro, xanh xám biểu thị nền kỹ thuật;
- không có vòng quay liên tục kiểu showroom; chiều sâu đến từ parallax nhỏ, easing và lắp ghép theo ngữ nghĩa;
- không animation giật/flash nhanh; cú sét vẫn là cao trào nhưng giảm chớp và có phiên bản tĩnh cho reduced motion.

## 5. Thiết kế từng cảnh

### 5.1. `FoundationScene` — nâng cấp chính

Hiện trạng: hình học tốt nhưng chỉ có line segments; ở stage 1–3 công trình mỏng, nhạt và có nhiều khoảng trống thị giác.

Thiết kế mới:

- thêm nhóm mesh bán trong suốt cho đài móng, cột, sàn/dầm, mái và lõi kỹ thuật;
- dùng `MeshBasicMaterial`/`MeshLambertMaterial` nhẹ, `depthWrite: false`, opacity thấp; không dùng shadow map và post-processing;
- mỗi mesh đi cùng phần line tương ứng và dùng chung timing xuất hiện;
- móng mọc lên từ đất với “scan band” chạy một lần;
- cột nâng dần từ chân, có vệt sáng rất ngắn ở đầu cột;
- sàn hạ vào đúng cao độ theo nhịp lệch pha, tạo cảm giác lắp ghép thay vì fade;
- mái khóa cấu trúc bằng viền đồng sáng hơn trong một nhịp;
- hệ chống sét có pulse dẫn từ đỉnh xuống móng; giảm cường độ chớp nền và không chạy ở reduced motion;
- điều chỉnh camera/fit để mô hình lớn hơn ở stage đầu nhưng vẫn không va vào thẻ nội dung desktop/mobile;
- cache hoặc tái sử dụng geometry/material khi phù hợp; dọn toàn bộ GPU resource khi unmount.

### 5.2. `OpeningScene` — tăng chiều sâu có kiểm soát

Hiện trạng: bố cục và câu chuyện đã tốt; linework rõ nhưng các cột/móng vẫn thiếu khối ở một số màn hình.

Thiết kế mới:

- thêm các mặt fill rất mờ cho diềm mái, bậc thềm, đài cọc và bè móng;
- thêm lớp “subsurface wash” xanh xám ở phần dưới mặt đất để tách hai màn kể chuyện;
- giữ camera descent hiện tại, giảm phản hồi con trỏ trên thiết bị coarse pointer;
- không thêm vòng quay, bloom, shadow hoặc texture;
- bảo đảm H1/CTA luôn có độ tương phản cao hơn scene.

### 5.3. `ExplorePreviewScene` — chỉ biến thể `foundation`

- đồng bộ ngôn ngữ fill bán trong suốt và timing lắp ghép với `FoundationScene`;
- giữ số draw calls và mật độ geometry thấp vì khung preview nhỏ;
- hover chỉ tăng độ sáng nhẹ, không làm mô hình quay nhanh hơn;
- tuyệt đối không sửa code/hình học/timing của biến thể `practice`.

### 5.4. `ChainScene` và background motion

- chỉ chỉnh nếu test cho thấy opacity/motion gây nhiễu chữ hoặc giật khung;
- không thay đổi nội dung hay cấu trúc section chỉ để tạo thêm hiệu ứng;
- mọi chuyển động nền phải dừng hoặc trở thành static frame khi reduced motion.

### 5.5. Phần bị loại trừ tuyệt đối

- `PracticeMapScene.tsx`;
- `PRACTICE_NODES`, `PRACTICE_LINKS` và mọi logic bố trí bản đồ năng lực;
- biến thể `practice` trong `ExplorePreviewScene`.

Kiểm tra diff cuối cùng phải xác nhận ba vùng trên không bị thay đổi chức năng/hình ảnh.

## 6. Nội dung và logic

Nội dung được sửa trong PR:

- lỗi/sự không đồng nhất có thể xác minh khách quan;
- title, description, canonical/noindex cho route bị lỗi;
- microcopy của trang 404 và nhãn accessibility nếu test phát hiện thiếu.

Nội dung không tự ý sửa khi chưa có xác nhận của chủ repo:

- số năm kinh nghiệm, số dự án/khách hàng;
- giá dịch vụ;
- hồ sơ luật sư và thành viên;
- số hotline, email, địa chỉ;
- tuyên bố marketing không chứa lỗi pháp lý khách quan.

## 7. Accessibility và motion

- Canvas tiếp tục là hình trang trí, không chiếm focus và không chặn click của link/card;
- nội dung/CTA phải sử dụng được khi WebGL không khởi tạo;
- reduced motion render thẳng trạng thái hoàn chỉnh, không chạy sequence hoặc lightning;
- kiểm tra focus visibility, dialog tài khoản, keyboard navigation và contrast ở vùng có canvas;
- không dùng chuyển động làm cách duy nhất để truyền tải trạng thái.

## 8. Chiến lược kiểm thử

Triển khai theo TDD cho logic có thể tách khỏi renderer:

1. viết test fail cho điều hướng section xuyên route;
2. viết test fail cho wildcard route/meta noindex;
3. viết test fail cho ticker tiếng Anh và ranh giới “không sửa capability map” nếu có thể biểu diễn bằng snapshot/module test;
4. thêm helper thuần cho easing/timing/motion state nếu cần, rồi test reduced-motion và biên progress;
5. mới sửa implementation để test pass.

Kiểm thử tích hợp bằng browser:

- route matrix ở 1440×900 và 390×844;
- không có page error/console warning mới;
- CTA từ trang con tới section trang chủ định vị đúng mà không có hành trình smooth dài;
- opening và foundation scene ở các mốc scroll chính;
- screenshot trước/sau cho desktop và mobile;
- reduced motion vẫn thấy mô hình hoàn chỉnh;
- kiểm tra dialog account bằng bàn phím;
- kiểm tra không có horizontal overflow.

Kiểm thử build:

- typecheck;
- test suite;
- production build;
- so sánh kích thước chunk Three.js trước/sau;
- xem diff để bảo đảm không chạm capability map ngoài phần import/types bắt buộc (dự kiến không có).

## 9. Tiêu chí chấp nhận preview

Preview chỉ được coi là sẵn sàng để chủ repo xem khi:

- các scene nâng cấp render ổn định trên desktop/mobile;
- stage 1–3 của Foundation đọc rõ hình khối hơn baseline;
- chữ và CTA không bị scene lấn át;
- route sai hiển thị trang 404 có đường thoát và noindex;
- điều hướng section xuyên route hoàn tất gần như tức thời;
- không còn các cảnh báo Framer Motion và React Router đã nêu;
- typecheck, test và production build pass;
- mô hình bản đồ năng lực không đổi;
- có browser preview chạy trên `127.0.0.1` và bộ screenshot đối chiếu.

## 10. Quy trình bàn giao

1. Hoàn thiện code và kiểm thử trên nhánh cục bộ.
2. Mở preview loopback trong Codex để chủ repo xem.
3. Nhận phản hồi và sửa cho đến khi được duyệt.
4. Chỉ sau câu xác nhận đồng ý của chủ repo mới push nhánh lên GitHub và tạo PR.
