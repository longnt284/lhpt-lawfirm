/**
 * Ước lượng thời gian đọc từ chính nội dung bài viết.
 *
 * Trước đây trường `read` được gõ tay trong dữ liệu nên nhanh chóng lệch khỏi
 * độ dài thực của bài. Tính tại thời điểm dựng module giữ cho hai thứ luôn khớp.
 *
 * Lưu ý về tiếng Việt: đếm theo khoảng trắng cho ra số âm tiết, không phải số
 * từ vựng ("bảo vệ dữ liệu cá nhân" là 5 âm tiết nhưng 3 từ). Vì vậy tốc độ ở
 * đây tính theo âm tiết mỗi phút, không dùng lại chuẩn 200-250 từ/phút của
 * tiếng Anh. 150 âm tiết/phút là mức sát với văn bản pháp lý có mật độ thuật
 * ngữ và số hiệu văn bản cao.
 */
const SYLLABLES_PER_MINUTE = 150;

export function countSyllables(parts: string[]): number {
  return parts.reduce((total, part) => {
    return total + part.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
}

/**
 * Trả về số phút, không kèm đơn vị. Đơn vị do lớp hiển thị ghép theo ngôn ngữ
 * đang chọn (xem formatReadingTime trong src/i18n.tsx) — nếu nhúng sẵn "phút" ở
 * đây thì bản tiếng Anh sẽ hiện "Read 5 phút".
 */
export function readingMinutes(parts: string[]): number {
  return Math.max(1, Math.round(countSyllables(parts) / SYLLABLES_PER_MINUTE));
}
