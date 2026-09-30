/*
 * Video giới thiệu hãng và mục lục chương của nó.
 *
 * Mã nguồn video nằm ở `video/` (xem video/README.md); đây chỉ là phần trang web
 * cần: đường dẫn bản xuất và mục lục. Mục lục vừa để tua tới từng cảnh, vừa là
 * bản chữ của video cho người không xem được hình — video không có lời thoại, mọi
 * thông tin đều là chữ trên màn hình.
 *
 * Mốc chương tính bằng nhịp nhạc (96 nhịp mỗi phút), cùng đơn vị với khối SYNC
 * trong video/scene.js; tests/videoChapters.test.ts giữ hai bên khớp nhau.
 */
import type { Bilingual } from "./pages3d";

export const INTRO_VIDEO = {
  webm: "/video/gioi-thieu.webm",
  mp4: "/video/gioi-thieu.mp4",
  poster: "/video/gioi-thieu.jpg",
  seconds: 60,
} as const;

export const VIDEO_BPM = 96;

export type VideoChapter = { beat: number; title: Bilingual; line: Bilingual };

export const VIDEO_CHAPTERS: VideoChapter[] = [
  {
    beat: 0,
    title: { vi: "Mặt đất", en: "Above ground" },
    line: { vi: "Nền pháp lý vững, cho mọi công trình.", en: "Sound legal ground, for every undertaking." },
  },
  {
    beat: 12,
    title: { vi: "Phần chìm", en: "Below ground" },
    line: {
      vi: "Thứ giữ công trình đứng vững nằm ở phần không ai nhìn thấy.",
      en: "What holds a building up is the part nobody sees.",
    },
  },
  {
    beat: 24,
    title: { vi: "01 · Xây dựng · Bất động sản", en: "01 · Construction · Real Estate" },
    line: { vi: "Pháp lý toàn vòng đời dự án, từ đất đến sổ.", en: "Full-lifecycle project counsel, from land to title." },
  },
  {
    beat: 32,
    title: { vi: "02 · Tố tụng · Giải quyết tranh chấp", en: "02 · Litigation · Dispute Resolution" },
    line: {
      vi: "Chiến lược kiện và đàm phán dựa trên hồ sơ, không cảm tính.",
      en: "Litigation and negotiation strategy grounded in the record, not instinct.",
    },
  },
  {
    beat: 40,
    title: { vi: "03 · Điện mặt trời · Năng lượng", en: "03 · Solar · Energy" },
    line: {
      vi: "Đồng hành từ giấy phép điện lực đến hợp đồng mua bán điện dài hạn.",
      en: "From power permits to long-term power purchase arrangements.",
    },
  },
  {
    beat: 48,
    title: { vi: "04 · Doanh nghiệp · Tuân thủ", en: "04 · Corporate · Compliance" },
    line: {
      vi: "Hậu phương pháp lý cho vận hành doanh nghiệp mỗi ngày.",
      en: "A legal back office for the daily operation of a business.",
    },
  },
  {
    beat: 56,
    title: { vi: "05 · Bảo mật dữ liệu · Công nghệ", en: "05 · Data Protection · Technology" },
    line: {
      vi: "Tuân thủ dữ liệu cá nhân trước khi bị phạt, không phải sau.",
      en: "Turn personal data obligations into a working control system.",
    },
  },
  {
    beat: 64,
    title: { vi: "Đội ngũ", en: "Our lawyers" },
    line: { vi: "Bốn luật sư. Một đầu mối.", en: "Four lawyers. One point of contact." },
  },
  {
    beat: 72,
    title: { vi: "Quy trình tiếp nhận", en: "Intake process" },
    line: {
      vi: "Đánh giá sơ bộ trong 24 giờ làm việc, đề xuất phương án và báo phí trong 3 ngày làm việc. Không phát sinh phí ngoài báo giá đã xác nhận bằng văn bản.",
      en: "An initial assessment within 24 business hours, a proposed approach and fee quote within three business days. No fee arises beyond a written quote confirmed by the client.",
    },
  },
  {
    beat: 80,
    title: { vi: "LHPT Law Firm", en: "LHPT Law Firm" },
    line: {
      vi: "Hiên cột thu về logo của hãng. lhpt.law · contact@lhpt.law",
      en: "The portico folds into the firm's mark. lhpt.law · contact@lhpt.law",
    },
  },
];

export const chapterSeconds = (beat: number) => (beat * 60) / VIDEO_BPM;

/** "0:15", "1:00" — dạng mốc thời gian quen thuộc của trình phát video. */
export function formatTimestamp(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

/** Chương đang phát tại một thời điểm: chương cuối cùng đã bắt đầu. */
export function chapterAt(seconds: number) {
  let index = 0;
  VIDEO_CHAPTERS.forEach((chapter, i) => {
    if (chapterSeconds(chapter.beat) <= seconds) index = i;
  });
  return index;
}
