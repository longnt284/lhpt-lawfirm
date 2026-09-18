import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

declare global {
  interface Window {
    /* Định nghĩa trong script nội tuyến ở index.html. */
    __lhptLiftCurtain?: () => void;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

/*
 * Nhấc màn mở đầu tĩnh (xem index.html).
 *
 * Hai lần requestAnimationFrame chứ không phải một. `render()` mới chỉ *xếp
 * lịch* dựng cây React; khung hình kế tiếp là lúc trình duyệt vẽ nó ra màn hình.
 * Nhấc ở lần rAF đầu là nhấc trước khi có gì để nhìn — đúng một khung hình
 * trắng lọt vào giữa, và đó lại là thứ tấm màn sinh ra để che.
 *
 * Không cần bọc try/catch hay kiểm tra thất bại: index.html đã có hẹn giờ bốn
 * giây tự nhấc màn, nên kể cả đoạn này không bao giờ chạy tới thì trang vẫn mở.
 */
requestAnimationFrame(() => requestAnimationFrame(() => window.__lhptLiftCurtain?.()));
