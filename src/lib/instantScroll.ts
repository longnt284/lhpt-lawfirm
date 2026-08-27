type ScrollRoot = { style: { scrollBehavior: string } };
type Schedule = (callback: () => void) => unknown;

/**
 * Chạy đúng một thao tác định vị khi CSS toàn cục đang bật smooth scrolling.
 * Giá trị inline cũ được khôi phục ở frame kế tiếp, sau khi trình duyệt đã nhận
 * lệnh cuộn tức thời.
 */
export function runWithInstantScroll(
  root: ScrollRoot,
  schedule: Schedule,
  action: () => void
) {
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  action();
  schedule(() => {
    root.style.scrollBehavior = previous;
  });
}
