/*
 * Quyết định *có nên* chạy thêm một cảnh WebGL hay không, và chờ đúng lúc để
 * nạp nó.
 *
 * Trang này có ba cảnh ba chiều: nền hero và hai khung xem trước ở khối "Trải
 * nghiệm 3D". Cả ba đều là phần trang trí — trang phải đọc được, bấm được và
 * đẹp nguyên vẹn khi không có cảnh nào chạy. Vì vậy luật chung nằm ở đây một
 * chỗ, thay vì mỗi component tự chế một bộ điều kiện hơi khác nhau rồi lệch dần
 * theo thời gian.
 */

/*
 * Những trường dưới đây không có ở mọi trình duyệt, nên phép kiểm tra viết theo
 * hướng "chỉ loại khi biết chắc": thiếu thông tin thì cho chạy, vì phần lớn máy
 * không khai báo `deviceMemory` là máy tính để bàn.
 */
export function shouldRunWebGL(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  /*
   * Cố tình *không* loại người bật "giảm chuyển động".
   *
   * Bản trước loại hẳn, và hậu quả là trang chủ trắng trơn phần 3D trong khi hai
   * trang chuyên đề vẫn hiện mô hình ở trạng thái đứng yên — cùng một website,
   * hai cách hành xử trái ngược, và người dùng chỉ thấy "máy tôi không hiện mô
   * hình nào cả".
   *
   * Cách đúng là thứ `useThreeStage` vốn đã làm cho hai trang kia: vẫn dựng
   * cảnh, nhưng chuyển sang chế độ vẽ theo yêu cầu — không vòng lặp tự chạy,
   * chỉ vẽ lại đúng lúc người dùng cuộn. Người dùng tắt *chuyển động*, không
   * phải tắt *hình*.
   */

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };

  if (nav.connection?.saveData) return false;
  const effective = nav.connection?.effectiveType;
  if (effective === "slow-2g" || effective === "2g") return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return false;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4) return false;

  return true;
}

/* Trình duyệt chưa có requestIdleCallback (Safari cũ) thì lùi về một hẹn giờ ngắn. */
export type IdleHandle = { kind: "idle" | "timeout"; id: number };

export function whenIdle(run: () => void, timeout = 1200): IdleHandle {
  const ric = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }
  ).requestIdleCallback;
  if (typeof ric === "function") return { kind: "idle", id: ric(run, { timeout }) };
  return { kind: "timeout", id: window.setTimeout(run, 220) };
}

export function cancelIdle(handle: IdleHandle | null) {
  if (!handle) return;
  if (handle.kind === "timeout") {
    window.clearTimeout(handle.id);
    return;
  }
  const cic = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
  cic?.(handle.id);
}

/**
 * Chạy `run` sau khi trang đã tải xong hẳn.
 *
 * Dành cho cảnh nằm ngay đầu trang: bộ quan sát khung nhìn không giúp được gì
 * vì nó *đã* ở trong khung nhìn ngay từ giây đầu, mà đó lại đúng là giây quý
 * nhất — trình duyệt đang dựng chữ, ảnh và bố cục của màn hình đầu tiên. Chen
 * một thư viện đồ hoạ vào giữa lúc đó là cách chắc chắn để làm chậm chính cái
 * màn hình mà hiệu ứng muốn tô điểm.
 *
 * Trả về hàm huỷ.
 */
export function afterPageLoad(run: () => void): () => void {
  let idle: IdleHandle | null = null;
  let cancelled = false;

  const start = () => {
    if (cancelled) return;
    idle = whenIdle(() => {
      if (!cancelled) run();
    });
  };

  if (document.readyState === "complete") {
    start();
    return () => {
      cancelled = true;
      cancelIdle(idle);
    };
  }

  window.addEventListener("load", start, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", start);
    cancelIdle(idle);
  };
}
