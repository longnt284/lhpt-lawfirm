---
name: threejs-3d-effects
description: Hướng dẫn thêm hiệu ứng 3D/WebGL bằng three.js (https://github.com/mrdoob/three.js) vào website hãng luật LHPT (React 18 + Vite + TypeScript, đã có Tailwind v4 và framer-motion). PHẢI dùng skill này bất cứ khi nào người dùng muốn một hiệu ứng có chiều sâu/không gian ba chiều: hero background 3D, particle/network 3D động phía sau tiêu đề, mô hình 3D trang trí, canvas WebGL — kể cả khi họ chỉ mô tả ý tưởng ("thêm particle vàng bay phía sau chữ", "mô hình xoay chậm ở hero") mà không nêu tên three.js. KHÔNG dùng cho hiệu ứng chuyển động 2D thuần (fade, slide, hover, scroll-parallax CSS) — những việc đó dùng framer-motion sẵn có trong `src/motion.ts`, không cần three.js. Bao gồm: chọn vanilla three.js hay @react-three/fiber, mẫu component khởi tạo/dọn dẹp scene an toàn với vòng đời React, tối ưu hiệu năng và bundle với Vite, tôn trọng prefers-reduced-motion, và gu thẩm mỹ tối giản/sang trọng phù hợp một hãng luật (không đèn màu, không hiệu ứng game).
---

# Hiệu ứng 3D bằng three.js cho website LHPT Law Firm

Dự án này là một trang marketing một hãng luật (`index.html` → `src/main.tsx` → `App.tsx`), không phải một ứng dụng 3D. Mọi hiệu ứng three.js ở đây đóng vai trò **trang trí phụ trợ** phía sau nội dung — nó không được làm chậm trang, không được gây rối mắt, và không được thay thế các mẫu code hiện có (`framer-motion` trong `src/motion.ts`, các component trong `src/components/Motion.tsx`, `Chrome.tsx`). Đọc kỹ trước khi viết code: mục tiêu là một hiệu ứng *tinh giản, chậm rãi, sang trọng* — nghĩ tới "đường nét kiến trúc, mạng lưới tri thức" chứ không phải particle bùng nổ kiểu game.

## 1. Chọn vanilla three.js hay @react-three/fiber

Dự án chưa có React Three Fiber (R3F) và style code hiện tại là các component tự viết (xem `Motion.tsx`, `Chrome.tsx`) chứ không theo lối khai báo scene-graph. Vì vậy:

- **Mặc định: dùng vanilla `three`** bọc trong một component/hook React mỏng (xem mẫu ở Mục 3). Ít dependency hơn, kiểm soát trực tiếp render loop và dispose, phù hợp với một hiệu ứng nền đơn giản (particle, wireframe, đường nối).
- **Chỉ dùng `@react-three/fiber` + `@react-three/drei`** khi cảnh 3D thực sự phức tạp: nhiều object tương tác, cần load model GLTF có animation, hoặc muốn compose scene khai báo như JSX. Đừng thêm hai package này chỉ để vẽ vài trăm điểm sáng — đó là việc vanilla three.js làm tốt hơn với ít code hơn.

Nếu người dùng không có yêu cầu đặc biệt, hãy đi thẳng vào lựa chọn vanilla — đừng hỏi lại trừ khi họ mô tả một cảnh rõ ràng phức tạp (nhiều model, tương tác chuột phức tạp, animation timeline).

## 2. Cài đặt

```bash
npm install three
npm install -D @types/three
```

Chỉ thêm khi thực sự cần dùng R3F:

```bash
npm install @react-three/fiber @react-three/drei
```

Import core three.js theo ESM bình thường (`import * as THREE from "three"`) — Vite tree-shake tốt, không cần cấu hình gì thêm trong `vite.config.js`. Nếu cần các tiện ích phụ trợ (`OrbitControls`, `GLTFLoader`, `EffectComposer`...), import trực tiếp từ `three/examples/jsm/...`, Vite resolve được ngay:

```ts
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
```

Cân nhắc thêm `three` vào `manualChunks` trong `vite.config.js` (đã có sẵn pattern cho `react`, `motion`, `supabase`) để nó nằm ở chunk riêng, cache độc lập với code trang:

```js
manualChunks: {
  react: ["react", "react-dom"],
  motion: ["framer-motion"],
  three: ["three"], // thêm dòng này nếu bundle three.js
  supabase: ["@supabase/supabase-js"],
},
```

## 3. Mẫu component an toàn với vòng đời React

Đây là phần dễ làm sai nhất: quên dọn dẹp scene khi unmount sẽ rò rỉ bộ nhớ GPU và làm trang càng dùng càng chậm (đặc biệt nghiêm trọng với Fast Refresh lúc dev). Dùng file mẫu đầy đủ tại `assets/HeroScene.template.tsx` làm điểm xuất phát — copy vào `src/components/`, đổi tên, rồi tuỳ biến hình học/màu sắc. Các nguyên tắc bắt buộc trong mẫu đó:

- Khởi tạo `THREE.Scene`, `PerspectiveCamera`, `WebGLRenderer` **bên trong `useEffect`**, gắn vào một `<div ref>` chứ không render trực tiếp `<canvas>` JSX — three.js tự quản lý canvas của nó.
- Dọn dẹp trong cleanup function của `useEffect`: hủy `requestAnimationFrame`, gọi `.dispose()` trên mọi geometry/material/texture đã tạo, gọi `renderer.dispose()` và `renderer.forceContextLoss()`, remove canvas khỏi DOM. Không dọn dẹp = leak GPU context, và trình duyệt chỉ cho phép khoảng 8-16 WebGL context sống cùng lúc.
- Theo dõi resize bằng `ResizeObserver` trên container (không dùng `window.resize` nếu container không chiếm toàn màn hình), cập nhật `camera.aspect` + `camera.updateProjectionMatrix()` + `renderer.setSize()`.
- Cap `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — set đúng `devicePixelRatio` trên máy Retina/4K có thể làm renderer vẽ gấp 4-9 lần số pixel cần thiết mà mắt không thấy khác biệt.
- Dùng `useRef` để giữ tham chiếu scene/renderer qua các lần render, **không** đưa object three.js vào `useState`.

## 4. Tôn trọng chuyển động giảm & hiệu năng

- Luôn kiểm tra `window.matchMedia("(prefers-reduced-motion: reduce)")`. Nếu người dùng bật, render **một khung hình tĩnh** (hoặc rotation cực chậm gần như không nhận ra) thay vì animation loop liên tục — không tắt hẳn hiệu ứng, chỉ tắt chuyển động.
- Dừng render loop khi tab không hiển thị (`document.visibilityState === "hidden"`) hoặc khi container ra khỏi viewport (dùng `IntersectionObserver`) — hero background không cần vẽ khi người dùng đã cuộn xuống footer.
- Giữ số lượng điểm/particle thấp (vài trăm, không phải hàng chục nghìn) và hình học đơn giản (points, lines, thin wireframe) — đây là trang marketing cần tải nhanh trên di động 4G, không phải demo kỹ thuật đồ họa.
- Đặt canvas `pointer-events: none` trừ khi hiệu ứng thực sự cần tương tác chuột, để không chặn click vào nội dung/nút CTA phía trên.
- Đánh dấu container decorative: `aria-hidden="true"` — hiệu ứng nền không mang thông tin, không được để screen reader dừng lại ở đó.

## 5. Gu thẩm mỹ cho một hãng luật

Bảng màu thương hiệu đã định nghĩa trong `src/index.css` (`--color-ink-950: #050b13`, `--color-ink-900: #0a1420`, `--color-brass-500: #c9a44c`, `--color-jade-500: #22c49c`, `--color-fog-400: #9db0c4`). Dùng đúng các biến này thay vì bịa màu mới:

- Nền tối (ink-950/ink-900), điểm nhấn thưa thớt màu brass (vàng đồng) hoặc jade, phần lớn còn lại là các đường/điểm mờ màu fog với opacity thấp (0.15–0.4).
- Chuyển động **chậm** — nghĩ tốc độ như kim giờ, không phải kim giây. Rotation liên tục dưới ~0.02 rad/s, hoặc particle trôi rất nhẹ, là đủ để "cảm thấy sống động" mà không gây xao nhãng khỏi nội dung pháp lý.
- Hình khối gợi ý: mạng lưới điểm-đường (network of counsel/connections), đường viền kiến trúc mảnh (gợi liên tưởng cột/mái như trong favicon hiện có), hoặc particle field thưa dạng "hạt bụi vàng". Tránh: bloom rực rỡ, lens flare, particle nảy/bật, màu neon, bất kỳ thứ gì gợi cảm giác game hoặc crypto-startup.
- Hiệu ứng luôn nằm **phía sau** nội dung (`position: absolute; inset: 0; z-index thấp hơn text`), độ tương phản đủ để chữ trên nó vẫn đọc rõ — test với text hero thật, không chỉ nhìn riêng canvas.

## 6. Gắn vào trang

Điểm tích hợp hợp lý nhất là phần hero trong `src/components/Home1.tsx` (đang dùng `framer-motion` với các token `EASE_LUXE`, `fadeUp`, `heroLine` từ `src/motion.ts`). Đặt scene 3D làm lớp nền tuyệt đối phía sau hero text, để framer-motion tiếp tục điều khiển fade-in/parallax của *text* như hiện tại — three.js chỉ vẽ nền, không thay thế lớp animation UI đang có. Nếu component wrap toàn trang (`Curtain.tsx`, `Chrome.tsx`) có logic ẩn/hiện theo route, đảm bảo scene 3D cũng dừng render loop khi bị ẩn, theo nguyên tắc ở Mục 4.

## 7. Checklist trước khi coi là xong

- [ ] `npm run typecheck` và `npm run build` chạy sạch (three.js core có kiểu sẵn từ `@types/three`, không cần khai báo `any`).
- [ ] Component có cleanup đầy đủ (dispose geometry/material/renderer) — test bằng cách mount/unmount nhiều lần trong dev và theo dõi tab Memory/Performance của DevTools không tăng dần.
- [ ] `prefers-reduced-motion` được tôn trọng.
- [ ] Render loop dừng khi tab ẩn hoặc container ngoài viewport.
- [ ] `devicePixelRatio` được cap ở 2.
- [ ] Màu sắc dùng đúng biến thương hiệu trong `index.css`, không có màu tự chọn ngoài palette.
- [ ] Test nhanh trên viewport di động — hiệu ứng không làm cuộn giật hoặc quạt nóng máy.

## 8. File mẫu

`assets/HeroScene.template.tsx` — component TypeScript đầy đủ, sẵn sàng copy vào `src/components/`, minh hoạ toàn bộ Mục 3–4 (init/cleanup, resize, reduced-motion, visibility pause, pixel ratio cap) với một hiệu ứng mạng lưới điểm-đường màu brass/fog trên nền ink. Đọc file này khi cần code thật thay vì viết lại từ đầu.
