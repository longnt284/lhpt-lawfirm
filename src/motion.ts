/*
 * Hệ chuyển động dùng chung cho toàn trang, xây trên Motion (framer-motion).
 *
 * Nguyên tắc: một hãng luật cần chuyển động *chậm, chắc và có trọng lượng* —
 * không nảy, không giật. Vì vậy mọi easing đều là đường cong "thoát nhanh, dừng
 * êm" và biên độ dịch chuyển luôn nhỏ. Toàn bộ token nằm ở một chỗ để nhịp
 * chuyển động của trang thống nhất từ header xuống footer.
 */
import type { SpringOptions, Transition, Variants } from "framer-motion";

/** Đường cong chủ đạo: bung nhanh rồi hãm dần, cảm giác nặng và sang. */
export const EASE_LUXE = [0.22, 1, 0.36, 1] as const;
/** Dùng cho hover và các chuyển trạng thái ngắn. */
export const EASE_SOFT = [0.4, 0, 0.2, 1] as const;

/*
 * Tham số spring tách riêng khỏi Transition: useSpring() nhận SpringOptions
 * (không có trường `type`), còn prop `transition` của motion cần `type:"spring"`.
 */
/** Hover/tilt: đủ đầm để không rung khi con trỏ di chuyển nhanh. */
export const SOFT: SpringOptions = { stiffness: 180, damping: 26, mass: 0.9 };
/** Phản hồi nhanh cho nút và các chi tiết nhỏ. */
export const TIGHT: SpringOptions = { stiffness: 320, damping: 32, mass: 0.6 };
/** Thanh tiến trình cuộn: mượt, không trễ quá tay. */
export const SCROLL: SpringOptions = { stiffness: 120, damping: 28, restDelta: 0.001 };

export const SPRING_SOFT: Transition = { type: "spring", ...SOFT };
export const SPRING_TIGHT: Transition = { type: "spring", ...TIGHT };

/*
 * Ngưỡng kích hoạt khi cuộn tới. `once` để nội dung không nhấp nháy khi cuộn
 * ngược lên.
 *
 * amount phải là "some" chứ không phải một tỉ lệ: với khối cao hơn màn hình —
 * bảng 32 văn bản chẳng hạn — yêu cầu "thấy 18% chiều cao" không bao giờ đạt
 * được, và cả khối đứng nguyên ở opacity 0. Việc canh thời điểm hiện đã do
 * `margin` đảm nhiệm: phần tử phải vào sâu 80px mới bắt đầu chạy.
 */
export const VIEWPORT = { once: true, amount: "some", margin: "0px 0px -80px 0px" } as const;
export const VIEWPORT_SOON = { once: true, amount: "some", margin: "0px 0px -40px 0px" } as const;

/* ---------- variants dùng lại ---------- */

/** Khối cha: chỉ điều phối nhịp, không tự animate. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/**
 * Hiện lên kèm mờ nhòe nhẹ. Không dùng overflow:hidden ở bất kỳ đâu vì khung
 * che sẽ cắt dấu tiếng Việt (Ế, Ộ, Ữ) ở đỉnh con chữ.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE_LUXE },
  },
};

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: EASE_LUXE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE_LUXE } },
};

/** Dòng tiêu đề: trượt lên xa hơn một chút để nhấn nhịp mở màn. */
export const heroLine: Variants = {
  hidden: { opacity: 0, y: 34, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.05, ease: EASE_LUXE } },
};

/** Vạch kẻ mảnh kéo dài từ trái sang — dấu hiệu thị giác mở đầu mỗi khối. */
export const ruleDraw: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: { scaleX: 1, opacity: 1, transition: { duration: 0.9, ease: EASE_LUXE } },
};

/** Thẻ trong lưới: kèm hạ nhẹ độ lớn để có chiều sâu khi xuất hiện. */
export const cardIn: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.985, filter: "blur(7px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_LUXE },
  },
};

/** Tách chuỗi thành từ, giữ nguyên dấu tiếng Việt (chỉ cắt ở khoảng trắng). */
export function toWords(text: string): string[] {
  return text.split(" ").filter(Boolean);
}
