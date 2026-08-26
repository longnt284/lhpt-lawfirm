/*
 * Đặt tiêu đề và mô tả cho từng trang.
 *
 * Trang này là ứng dụng một tệp HTML duy nhất, nên mọi đường dẫn đều khởi đầu từ
 * đúng phần <head> viết sẵn trong index.html. Nếu không cập nhật lại, tab trình
 * duyệt và thẻ chia sẻ của trang con sẽ mang tiêu đề của trang chủ — bất tiện khi
 * khách hàng gửi đường dẫn cho nhau, và làm công cụ tìm kiếm gom hết các trang
 * vào chung một mô tả.
 *
 * Giá trị cũ được khôi phục lúc rời trang, để quay về trang chủ không để lại
 * tiêu đề của trang vừa xem.
 */
import { useEffect } from "react";

const SITE = "https://lhpt.law";

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!element) return undefined;
  const previous = element.getAttribute(attribute);
  element.setAttribute(attribute, value);
  return () => {
    if (previous === null) element.removeAttribute(attribute);
    else element.setAttribute(attribute, previous);
  };
}

export function usePageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Đường dẫn tuyệt đối của trang, ví dụ "/nen-mong-phap-ly". */
  path: string;
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const restore = [
      setMeta('meta[name="description"]', "content", description),
      setMeta('meta[property="og:title"]', "content", title),
      setMeta('meta[property="og:description"]', "content", description),
      setMeta('meta[property="og:url"]', "content", `${SITE}${path}`),
      setMeta('meta[name="twitter:title"]', "content", title),
      setMeta('meta[name="twitter:description"]', "content", description),
      setMeta('link[rel="canonical"]', "href", `${SITE}${path}`),
    ];

    return () => {
      document.title = previousTitle;
      restore.forEach((undo) => undo?.());
    };
  }, [title, description, path]);
}
