export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function smoothstep(edge0: number, edge1: number, value: number) {
  const progress = clamp01((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
}

export function layerOpacity(progress: number, start: number, end: number, peak: number) {
  return smoothstep(start, end, progress) * peak;
}

/**
 * Kẹp vận tốc cuộn thô về dải −1→1 theo mức `full` được coi là "hết cỡ".
 *
 * Tách riêng vì đây là chỗ dễ hỏng nhất của hiệu ứng theo vận tốc, và hỏng rất
 * kín tiếng. `raw` được tính bằng một phép chia cho khoảng thời gian giữa hai
 * khung hình; khi tab vừa hiện lại sau một lúc bị ẩn, hoặc khi trình duyệt trả
 * về hai mốc thời gian trùng nhau, phép chia đó cho ra Infinity hoặc NaN. Một
 * NaN lọt vào vị trí máy quay thì cả cảnh biến mất — không có lỗi nào trong
 * console, chỉ là màn hình trống — nên nó bị chặn ngay tại đây thay vì ở từng
 * cảnh.
 */
export function clampVelocity(raw: number, full: number) {
  if (!Number.isFinite(raw) || !(full > 0)) return 0;
  return Math.max(-1, Math.min(1, raw / full));
}
