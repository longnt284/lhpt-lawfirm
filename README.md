# LHPT Law Firm

Website Công ty Luật TNHH LHPT — hãng luật tại TP. Hồ Chí Minh, chuyên sâu Xây
dựng · Bất động sản, Tố tụng, Điện mặt trời, Doanh nghiệp · Tuân thủ và Bảo vệ
dữ liệu cá nhân.

React 18 · Vite 6 · TypeScript · Tailwind v4 · three.js · framer-motion · Lenis.
Song ngữ Việt/Anh. Cổng khách hàng chạy trên Supabase.

## Chạy

```bash
npm install
npm run dev        # máy chủ phát triển, cổng 3000
npm run build      # bản tĩnh trong dist/
npm run preview    # xem bản production
npm test           # 27 test cho phần logic thuần
npm run typecheck
npm run sync:lex   # tải lại tình trạng hiệu lực từ Lex & Lineage
```

Biến môi trường: xem `.env.example`. Thiếu khoá Supabase thì phần còn lại của
trang vẫn chạy bình thường — chỉ cổng khách hàng là không mở được.

## Trải nghiệm

- **Trang vẽ ngay khi HTML về, không đợi JavaScript.** Màn mở đầu là markup và
  CSS nội tuyến trong `index.html`, nên nó có mặt trước cả chunk React lẫn chunk
  Tailwind. `src/main.tsx` nhấc màn sau hai nhịp `requestAnimationFrame` — một
  nhịp là nhấc trước khi có gì để nhìn — và có đường lui bốn giây để chunk hỏng
  cũng không khoá khách sau tấm màn.
- **Không một yêu cầu nào rời khỏi tên miền của hãng khi tải trang.** Ba họ chữ
  tự host. Với một hãng luật bán dịch vụ bảo vệ dữ liệu cá nhân thì để chính
  trang chủ chuyển IP của khách sang bên thứ ba là một mâu thuẫn khách hàng đọc
  ra ngay.
- **Màn mở đầu là một chuyển động liền, không phải hai cảnh nối nhau.** Một khối
  hiên cột dựng bằng khung dây đứng trên mặt đất, rồi máy quay *hạ xuống dưới
  nền móng*: đài cọc, hệ giằng, bè móng, các tầng đất. Đó là luận điểm của hãng
  kể bằng hình — thứ giữ cho công trình đứng vững nằm ở phần chìm dưới đất.
- **Cảnh phản ứng lại người xem, không chỉ chạy theo vị trí cuộn.** Sân khấu 3D
  đo cả tốc độ cuộn: lướt nhanh thì máy quay lùi ra lấy thêm bối cảnh, và điểm
  nhìn chạy trước một nhịp về hướng đang đi. Biên độ giữ nhỏ — lùi 8% quãng
  cách, dời điểm nhìn 3% chiều cao cảnh — để đây là một cảm giác chứ không phải
  một trò lái máy quay.
- **Chuỗi khối chảy phía sau toàn bộ trang chủ** từ đáy màn mở đầu tới chân
  trang. Nền các khối nội dung là mực loãng chứ không phải sơn đục nên chuỗi đọc
  được xuyên suốt.
- **Thanh điều hướng biết trang đang ở đâu.** Trang chủ cao hơn mười ba nghìn
  điểm ảnh; mục ứng với khối đang cắt qua vạch giữa màn hình sẽ sáng lên kèm một
  vạch đồng vàng, và mang `aria-current` để trình đọc màn hình cũng nói được
  điều đó.
- **Hai trang chuyên đề có cảnh 3D riêng**: `/nen-mong-phap-ly` (nền móng pháp
  lý) và `/ban-do-nang-luc` (bản đồ năng lực). Cả hai nạp động, nằm ngoài đường
  tải đầu của trang chủ.
- **Giảm chuyển động được tôn trọng ở cả hai tầng.** `MotionConfig
  reducedMotion="user"` là công tắc tổng cho phần giao diện; các cảnh 3D chuyển
  sang vẽ theo yêu cầu — không vòng lặp tự chạy, chỉ vẽ lại đúng lúc người dùng
  cuộn. Người dùng tắt *chuyển động*, không phải tắt *hình*.

## Hiệu năng

Đo trên bản production ở khung 1440×900: đường tải đầu — tính tới sự kiện
`load` — là **9 tài nguyên, 230 kB trên dây**, gồm 136 kB script, 13 kB CSS, 78
kB chữ và 4 kB HTML. Sau mốc đó mới tới 398 kB còn lại.

three.js nặng 130 kB gzip nằm trong phần *sau*, không nằm trong đường tải đầu —
đã kiểm lại bằng đo mạng chứ không chỉ bằng cấu hình chunk. Nó chỉ được nạp sau
khi trang tải xong hẳn, và chỉ khi máy đủ điều kiện chạy: người bật tiết kiệm dữ
liệu, đường truyền 2G và máy dưới 2 GB bộ nhớ thì không nạp (xem
`src/lib/lazyWebgl.ts`). Phần lớn khách vào đọc bài viết rồi rời đi mà không bao
giờ kéo về thư viện đồ hoạ nào.

Ngưỡng chặn ở đó cố ý hẹp, và hẹp vì đã sai một lần: bản trước loại mọi máy dưới
bốn nhân CPU, và một máy để bàn hai nhân — WebGL chạy tốt — bị cắt sạch phần 3D
mà không một dòng lỗi nào hiện ra. Số nhân CPU không nói lên được máy có chạy nổi
cảnh này hay không.

Năm cảnh 3D dùng chung một lớp nền, `src/lib/threeStage.ts`, gom về đây mọi phần
dễ làm sai của WebGL trong React: dựng renderer, dừng vẽ khi cảnh khuất tầm nhìn
hoặc tab bị ẩn, trần tốc độ khung hình cho cảnh trang trí, bộ theo dõi nhịp
khung hình tự hạ chất lượng trên máy yếu, và dọn sạch tài nguyên GPU lúc rời
trang. Tiến trình cuộn đọc từ toạ độ đã cache chứ không gọi
`getBoundingClientRect` mỗi khung hình — đọc kích thước phần tử giữa vòng lặp vẽ
buộc trình duyệt tính lại bố cục đồng bộ, đúng nguyên nhân kinh điển làm cuộn bị
giật.

Hình học của các cảnh là đường và điểm, không phải mặt đặc: đây là chủ ý thẩm mỹ
— một bản vẽ kỹ thuật, không phải một khối render — và cũng là lý do cả năm cảnh
cộng lại chỉ tốn vài lệnh vẽ. Quầng sáng dựng bằng một pipeline bloom tự viết giữ
nguyên độ trong suốt của canvas (`src/lib/bloom.ts`); `UnrealBloomPass` có sẵn
giả định nền đen nên sẽ nuốt sạch các lớp nền CSS nằm dưới canvas.

Chữ chỉ khai báo hai bộ ký tự, `latin` và `vietnamese`. Gói `@fontsource` khai
báo bảy bộ, và khai báo `latin-ext` *sau* `vietnamese` với dải chồng lên nhau ở
U+1EF2–1EF9 — nên theo quy tắc CSS thì mọi chữ "ỳ", "ỷ", "ỹ" trên trang, 141
lượt trong `src/`, kéo về một file mà bộ `vietnamese` đã chứa sẵn. Chi tiết trong
`src/fonts.css`.

## Video giới thiệu

Trang `/video` phát một video 60 giây kể lại màn mở đầu của trang chủ: hiên cột
khung dây, máy quay hạ xuống phần chìm, bốn cọc, năm tầng đất — mỗi tầng một
lĩnh vực kèm văn bản làm nền cho nó — rồi hiên cột thu về logo. Video dựng bằng
code trong `video/` (Canvas 2D, Chromium headless, nhạc tổng hợp), không dùng
tài nguyên của bên thứ ba; cách build và các lựa chọn về nội dung ở
`video/README.md`.

- Trình phát để `preload="none"`: chỉ ảnh bìa về máy khách cho tới khi khách bấm
  xem. Trang chủ chỉ thêm một liên kết chữ ở hero và một mục ở chân trang.
- Video không có lời thoại. Mục lục cạnh trình phát vừa để tua, vừa là bản chữ
  của video cho trình đọc màn hình và cho khách đọc tiếng Anh.
- Mục lục tính mốc bằng nhịp nhạc, cùng đơn vị với `video/scene.js`; test đọc
  thẳng tệp đó để hai bên không lệch nhau.

## Liên kết với Lex & Lineage

Lex & Lineage (repo `Research-Law-VN`, `https://lexnlineage.vercel.app`) là
trang tra cứu gia phả văn bản pháp luật của cùng chủ sở hữu; mỗi bản ghi ở đó
đã đối chiếu với vbpl.vn hoặc Công báo. Hai trang chạy độc lập: trang này không
gọi sang đó từ trình duyệt của khách, và vẫn build được khi bên kia không trả lời.

- **Tình trạng hiệu lực lấy từ Lex & Lineage.** `prebuild` chạy
  `scripts/sync-lex-lineage.mjs --soft`: tải `/api/v1/documents.json` (hợp đồng
  `lex-lineage/documents@1`), kiểm hợp đồng, giữ lại đúng các văn bản của
  `src/content/legalDocs.ts` cùng văn bản thay thế của chúng, ghi vào
  `src/content/lexLineage.snapshot.json` (khoảng 4 kB sau nén). Lỗi mạng hay
  sai hợp đồng thì giữ bản chụp đã commit, build không dừng.
- **Chỉ bốn trường được thay**: tình trạng, ngày hiệu lực, ngày hết hiệu lực,
  văn bản thay thế (`src/lib/lexLineage.ts`). Tóm tắt, điểm mới, lĩnh vực là lời
  của hãng, giữ nguyên. Chỗ Lex & Lineage chưa ghi (văn bản không có trong kho,
  hoặc có mà chưa ghi văn bản thay thế) thì dữ liệu ghi tay của hãng đứng.
- **Tính tại hôm nay.** Tình trạng tính từ các đoạn hiệu lực chứ không chỉ đọc
  nhãn, nên văn bản tới ngày có hiệu lực hay ngày bị thay thế tự đổi nhãn mà
  không phải chờ lần build sau. Thêm nhãn "Chưa có hiệu lực" cho trường hợp đó.
- **Dẫn qua lại.** Mỗi văn bản đã khớp có nút "Gia phả & diễn biến hiệu lực" và
  dòng ghi ngày đối chiếu; văn bản thay thế là liên kết; đầu mục có lối "Tra cứu
  đầy đủ", chân trang có mục Lex & Lineage. Chân trang Lex & Lineage dẫn ngược
  về mục liên hệ của hãng.
- **Giữ dữ liệu ghi tay khớp.** `npm run sync:lex` in ra văn bản nào trong
  `legalDocs.ts` đang ghi tình trạng khác Lex & Lineage, và văn bản nào chưa có
  bên đó.

Đổi tên miền Lex & Lineage thì đặt `VITE_LEX_LINEAGE_URL` (xem `.env.example`);
cả trang lẫn script đồng bộ đọc cùng biến này.

## Cấu trúc

- `index.html` — thẻ chia sẻ, dữ liệu có cấu trúc, màn mở đầu tĩnh và nội dung
  dự phòng khi không có JavaScript.
- `src/App.tsx` — router, bố cục khung, quản lý cuộn khi đổi trang.
- `src/components/Home1.tsx`, `Home2.tsx` — các khối của trang chủ. `Home2` nạp
  động.
- `src/components/Chrome.tsx` — header, footer, modal bài viết, thanh hành động
  di động.
- `src/components/three/` — năm cảnh 3D.
- `src/pages/VideoPage.tsx`, `src/content/video.ts` — trang video và mục lục.
- `video/` — mã nguồn video giới thiệu; bản xuất ở `public/video/`.
- `src/lib/threeStage.ts` — vòng đời và vòng lặp vẽ dùng chung của mọi cảnh.
- `src/lib/bloom.ts` — bloom giữ nguyên độ trong suốt.
- `src/content/` — nội dung: bài viết, tin tức, văn bản pháp luật, bản tiếng Anh,
  bản chụp Lex & Lineage.
- `src/lib/lexLineage.ts`, `scripts/sync-lex-lineage.mjs` — đồng bộ tình trạng
  hiệu lực từ Lex & Lineage.
- `src/i18n.tsx`, `src/firm.ts` — song ngữ và dữ liệu hãng.
- `src/fonts.css` — khai báo chữ tự host.
- `supabase/` — lược đồ cổng khách hàng.
- `tests/` — test cho phần logic thuần, chạy bằng test runner của Node.
- `references/` — mười hai repo tham khảo và lý do chọn từng cái. Manifest khoá
  commit ở `references/repositories.json`.
- `docs/superpowers/` — đặc tả và kế hoạch của các đợt làm trước.
