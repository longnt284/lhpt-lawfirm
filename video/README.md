# LHPT Law Firm — video giới thiệu "Nền móng"

Video ngang 16:9 (1920×1080, 60 fps, 60 giây) giới thiệu hãng. Mọi khung hình được vẽ
bằng Canvas 2D thuần, là hàm thuần của thời gian `t`, rồi render qua Chromium headless và
mã hóa bằng ffmpeg. Hình học 3D là đường khung dây, chiếu phối cảnh bằng tay ngay trong
`scene.js`, nên không cần WebGL. Nhạc nền tổng hợp bằng code (96 BPM, Đô thứ, kết ở Đô
trưởng), khóa nhịp với hình qua khối `SYNC` trong `scene.js`. Không có mẫu âm thanh, ảnh
hay đoạn phim nào của bên thứ ba.

Kịch bản kể tiếp màn mở đầu của trang chủ (`src/components/three/OpeningScene.tsx`): hiên
cột đứng trên mặt đất, máy quay hạ xuống phần chìm. Bảng màu lấy đúng `src/index.css`;
logo và biểu tượng lĩnh vực chép nguyên đường vẽ từ `src/components/Icons.tsx`. Hiên cột
dựng bốn cột như logo, nên ở cảnh cuối các nét của mặt đứng trượt về đúng nét logo.

## Cấu trúc

| Tệp | Vai trò |
| --- | --- |
| `index.html`, `scene.js` | Toàn bộ cảnh, máy quay, chiếu phối cảnh, hậu kỳ (quầng sáng, vignette, hạt) |
| `audio.py` | Tổng hợp nhạc: drone, pad, piano gảy, chuông, trống nhẹ, búa đóng cọc, nét bút, hồi âm |
| `render.mjs` | Render song song nhiều worker, ghép segment |
| `fonts/` | Lora, Be Vietnam Pro (SIL OFL, giấy phép kèm theo) |
| `../public/video/gioi-thieu.*` | Bản xuất cho web (MP4 H.264/AAC, WebM VP9/Opus, ảnh bìa), phát ở trang `/video` |

## Kịch bản (theo nhịp, 1 nhịp = 0,625 giây)

| Nhịp | Cảnh |
| --- | --- |
| 0–12 | Mặt đất: vạch nền, bậc thềm, bốn cột, diềm, mái được vẽ ra; "Nền pháp lý vững, cho mọi công trình." |
| 12–24 | Phần chìm: máy quay qua vạch nền, đóng bốn cọc, dựng giằng; "Thứ giữ công trình đứng vững nằm ở phần không ai nhìn thấy." |
| 24–64 | Năm tầng đất, mỗi tầng một lĩnh vực: biểu tượng, tên, câu giới thiệu, văn bản nền tảng |
| 64–80 | Bốn luật sư trên bốn cọc; ba mốc của quy trình tiếp nhận sáng lên trên ba thanh giằng |
| 80–96 | Máy quay lùi xa, hiên cột thu về logo; tên hãng, câu chủ đề, liên hệ, lời miễn trừ |

Mục lục ở trang `/video` (`src/content/video.ts`) tính mốc bằng cùng đơn vị nhịp;
`tests/videoChapters.test.ts` đọc thẳng `scene.js` để giữ hai bên khớp nhau.

## Nguồn nội dung và các lựa chọn pháp lý

- Lĩnh vực, câu giới thiệu, đội ngũ, quy trình tiếp nhận, địa chỉ và hotline lấy nguyên
  văn từ `src/firm.ts`. Sửa ở đó thì sửa `AREAS`, `TEAM`, `PLEDGES` trong `scene.js`, mục
  lục trong `src/content/video.ts`, rồi render lại.
- Website ghi trong video là tên miền tạm `lhptlawfirm.vn` (hằng `WEBSITE` trong
  `scene.js`), không phải `lhpt.law` như `src/firm.ts`. Video không ghi email cho tới khi
  hộp thư theo tên miền chính thức được xác nhận. Đổi tên miền thì sửa `WEBSITE` và dòng
  cuối mục lục trong `src/content/video.ts`, rồi render lại từ khung 3150 (xem Build).
- Số hiệu văn bản nền tảng lấy từ `src/content/lexLineage.snapshot.json` (bản ghi đã đối
  chiếu) và `src/content/legalDocs.ts`. Video chỉ ghi số hiệu và tên, **không ghi tình
  trạng hiệu lực**: video là tệp cố định, tình trạng thì đổi theo thời gian. Lời miễn trừ
  cuối video ghi tháng đối chiếu.
- Video hứa *quy trình* (thời hạn đánh giá, báo phí, không phát sinh phí ngoài báo giá),
  không hứa kết quả vụ việc; không so sánh với hãng khác; không nêu tên khách hàng hay vụ
  việc; không đưa giá gói hay ưu đãi — những thứ đó đổi theo chính sách phí, trong khi
  video thì không tự đổi theo.
- Số năm của từng luật sư là số năm hành nghề ghi ở `LAWYERS`; video không cộng dồn hay
  làm tròn thành con số quảng bá.

## Build

```bash
pip install numpy scipy imageio-ffmpeg
export FFMPEG=$(python3 -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())")
cd video
node render.mjs video 4          # -> out/video_silent.mp4
# Chỉ đổi đoạn chốt (từ nhịp 84, khung 3150)? Render lại riêng đoạn đó rồi ghép:
#   node render.mjs video 4 3150   # -> out/video_part_3150.mp4
#   $FFMPEG -i out/video_silent.mp4 -i out/video_part_3150.mp4 -filter_complex \
#     "[0:v]trim=end_frame=3150,setpts=PTS-STARTPTS[a];[a][1:v]concat=n=2:v=1[v]" -map "[v]" \
#     -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p -tune animation out/video_spliced.mp4
python3 audio.py                 # -> out/audio.wav
cd out
# MP4 cho web, mã hóa 2 lượt
$FFMPEG -y -i video_silent.mp4 -c:v libx264 -preset slow -profile:v high -level:v 4.2 -b:v 2500k -maxrate 4M -bufsize 6M -pix_fmt yuv420p -pass 1 -an -f mp4 /dev/null
$FFMPEG -y -i video_silent.mp4 -i audio.wav -c:v libx264 -preset slow -profile:v high -level:v 4.2 -b:v 2500k -maxrate 4M -bufsize 6M -pix_fmt yuv420p -pass 2 \
  -c:a aac -b:a 160k -shortest -movflags +faststart ../../public/video/gioi-thieu.mp4
# WebM cho trình duyệt ưu tiên VP9
$FFMPEG -y -i video_silent.mp4 -i audio.wav -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -c:a libopus -b:a 128k -shortest ../../public/video/gioi-thieu.webm
# Ảnh bìa: logo đã khóa, nhịp 88
node ../render.mjs stills 55 && $FFMPEG -y -i stills/t055.00.jpg -q:v 3 ../../public/video/gioi-thieu.jpg
```

Xem trước trực tiếp: `npx http-server video` rồi mở `index.html?preview`.
