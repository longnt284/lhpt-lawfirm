# Thư viện tham khảo LHPT

Khảo sát ngày 18/09/2026. Manifest khoá commit ở `repositories.json`; mã nguồn
upstream **không** commit vào repo này và không nằm trong bundle. Muốn đọc bản
gốc thì clone theo đúng commit đã khoá:

```bash
jq -r '.[] | "git clone --depth 1 \(.url) repos/\(.name) && git -C repos/\(.name) fetch --depth 1 origin \(.commit)"' \
  references/repositories.json
```

Giấy phép của từng dự án giữ nguyên. Không chạy script từ repo tham khảo.

## Vai trò trong LHPT

Cột "Vai trò" là trạng thái thật, không phải nguyện vọng. `runtime` là có mặt
trong `package.json`; `reference` là đã đọc và lấy ý, nhưng không nằm trong
bundle; `guidance` là tài liệu định hướng cách viết; `future` là lưu cho một
hướng đã cân nhắc nhưng chưa tới lúc.

| Repository | Vai trò | Dùng vào việc gì |
| --- | --- | --- |
| [three.js](https://github.com/mrdoob/three.js) | runtime | Toàn bộ năm cảnh 3D. Trang dùng `three` trực tiếp, không qua lớp bọc nào |
| [GSAP](https://github.com/greensock/GSAP) | reference | Đọc để đối chiếu cách dựng timeline và scrub theo cuộn. **Không** đưa vào bundle — xem "Vì sao không thêm GSAP" bên dưới |
| [gsap-skills](https://github.com/greensock/gsap-skills) | guidance | Tài liệu hiệu năng animation chính thức. Bản này soát lại toàn bộ keyframe CSS theo `gsap-performance` |
| [drei](https://github.com/pmndrs/drei) | reference | Tham khảo cách dựng helper cho cảnh. Không dùng runtime: trang không chạy React Three Fiber, các cảnh là three.js thuần trong `src/lib/threeStage.ts` |
| [Vanta](https://github.com/tengbao/vanta) | reference | Tham khảo nền WebGL tương tác. Không khởi tạo thêm renderer: mỗi cảnh của LHPT đã có renderer riêng do `useThreeStage` quản lý vòng đời |
| [3D developer portfolio](https://github.com/adrianhajdin/project_3D_developer_portfolio) | reference | Tham khảo cách tổ chức component quanh một canvas 3D trong React |
| [img2threejs](https://github.com/img2threejs/img2threejs) | reference | Tham khảo hướng dựng hình procedural. Hình học của LHPT do dự án tự dựng từ logo và từ bản vẽ kết cấu |
| [Animate.css](https://github.com/animate-css/animate.css) | reference | Đối chiếu thư viện keyframe. Không thêm vào dependencies: chuyển động của trang do framer-motion và keyframe tự viết trong `src/index.css` đảm nhiệm |
| [A-Frame](https://github.com/aframevr/aframe) | future | Lưu cho hướng WebXR — xem mô hình kết cấu bằng kính thực tế ảo tại buổi làm việc với khách |
| [diagram-design](https://github.com/cathrynlavery/diagram-design) | future | Lưu cho sơ đồ biên tập trong bài phân tích pháp lý |
| [Hyperframes](https://github.com/heygen-com/hyperframes) | future | Lưu cho khả năng xuất video từ HTML |
| [Trois](https://github.com/troisjs/trois) | future | Lưu cho nghiên cứu bản Vue. Không trộn Vue vào một trang React |

## Nghiên cứu thiết kế

[Awwwards Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/)
là điểm xuất phát của đợt cập nhật này. Điều rút ra được từ nhóm trang 3D thắng
giải, và áp dụng được cho một hãng luật:

- **Một vật thể lớn, ít điều hướng, bố cục chữ bất đối xứng.** LHPT đã đi hướng
  này từ trước: màn mở đầu là một khối hiên cột chiếm gần trọn khung hình, và
  tiêu đề đặt lệch trái.
- **Chuyển cảnh là biến hình, không phải mờ đi hiện lại.** Cảnh mở đầu của LHPT
  đã là một chuyển động liền — máy quay hạ xuống dưới nền móng — chứ không phải
  hai cảnh chồng mờ.
- **Cảnh phải phản ứng lại người xem, không chỉ chạy theo vị trí cuộn.** Đây là
  chỗ bản này bổ sung: `StageFrame.velocity`. Xem `src/lib/threeStage.ts`.

Nguồn tham chiếu trực tiếp và đọc được chi tiết nhất là
[LIMEN](https://github.com/longnt284/limen-interactive-exhibition) — dự án triển
lãm 3D của cùng tác giả, dựng trên đúng mười hai repo này. Ba điều mượn thẳng
từ đó, có ghi rõ trong mã nguồn:

1. **Màn mở đầu phải là HTML tĩnh với CSS nội tuyến**, không phải một component.
   Một component chỉ vẽ được sau khi chunk JS về — tức sau đúng khoảng trắng mà
   nó sinh ra để che. Xem `index.html`.
2. **Bẫy tập con chữ của @fontsource**: `latin-ext` khai báo sau `vietnamese` và
   đè lên dải U+1EF2–1EF9, nên chữ "ỹ" trong "kỹ" kéo về một file mà bộ
   `vietnamese` đã chứa sẵn. Xem `src/fonts.css`.
3. **Preload chữ phải đọc tên file đã hash từ bundle**, vì tên có hash nội dung
   và preload hỏng thì không báo lỗi, nó chỉ lặng lẽ thôi tác dụng. Xem
   `vite.config.js`.

## Vì sao không thêm GSAP

GSAP là thư viện tốt hơn hẳn cho timeline phức tạp và cho scrub theo cuộn, và
`gsap-skills` là bộ tài liệu hiệu năng đáng đọc. Nhưng LHPT đã dựng trọn trên
framer-motion và Lenis:

- framer-motion đang lo toàn bộ chuyển động giao diện, và `MotionConfig
  reducedMotion="user"` trong `App.tsx` là công tắc tổng cho "giảm chuyển động"
  của cả trang — thêm một thư viện animation thứ hai là thêm một đường chuyển
  động nằm ngoài công tắc đó;
- Lenis đang lo cuộn mượt, đúng phần ScrollTrigger sẽ làm;
- phần scrub theo cuộn của các cảnh 3D không đi qua DOM mà đi thẳng vào
  `useThreeStage`, nên ScrollTrigger cũng không có việc.

Thêm GSAP vào lúc này là cộng thêm một gói cho những việc đã có người làm, và
tạo ra hai hệ thống chuyển động phải giữ cho đồng bộ với nhau. Điều đáng lấy từ
`gsap-skills` là các nguyên tắc, và chúng đã được áp dụng: keyframe CSS của trang
chỉ animate `transform` và `opacity` (hai ngoại lệ là `pulse-dot` dùng
`box-shadow` và `gild` dùng `background-position`, cả hai đều trên phần tử nhỏ và
chỉ gây vẽ lại, không gây tính lại bố cục), và mọi cảnh 3D đều dừng hẳn vòng lặp
vẽ khi khuất tầm nhìn hoặc khi tab bị ẩn.

Quyết định này nên xem lại nếu sau này trang cần một chuỗi timeline nhiều bước
ràng buộc lẫn nhau — đó là chỗ framer-motion đuối và GSAP mạnh.
