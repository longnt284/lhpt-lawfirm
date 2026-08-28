/*
 * Cuộn quán tính toàn trang, dựng trên Lenis.
 *
 * Đây là thay đổi nhỏ nhất về lượng code mà đổi lại nhiều nhất về *cảm giác*:
 * cuộn native nhảy từng nấc theo notch của con lăn chuột, còn cuộn quán tính
 * cho bánh đà chạy tiếp rồi dừng êm. Với một trang mà mọi cảnh 3D đều gắn vào
 * tiến trình cuộn, khác biệt đó lan sang cả phần đồ hoạ: máy quay hạ xuống nền
 * móng theo một đường liên tục thay vì giật từng bậc.
 *
 * Ba điều kiện ràng buộc cách tích hợp ở đây:
 *
 * 1. Lenis cuộn bằng cách ghi vào `documentElement.scrollTop`, nên trình duyệt
 *    vẫn bắn sự kiện `scroll` thật và `window.scrollY` vẫn đúng. Nhờ vậy toàn
 *    bộ phần đang có — `useScroll` của Motion, bộ đo tiến trình trong
 *    `threeStage.ts`, phép đo mốc bàn giao của `ChainBackdrop` — chạy nguyên
 *    vẹn, không phải sửa một dòng nào. Đây là lý do chọn Lenis thay vì tự viết
 *    hoặc dùng thư viện cuộn trên transform: loại sau làm `scrollY` đứng yên
 *    mãi ở 0 và sẽ phá sạch mọi thứ vừa kể.
 *
 * 2. Người bật "giảm chuyển động" thì không dựng Lenis. Cuộn quán tính đúng là
 *    thứ mà thiết lập đó muốn tắt — đây không phải hoạt hình trang trí mà là
 *    chuyển động chiếm trọn khung nhìn, và nó gây khó chịu thật cho người nhạy
 *    cảm với tiền đình.
 *
 * 3. Không đụng vào cuộn cảm ứng. `syncTouch` để mặc định tắt: trên di động,
 *    cuộn native đã có quán tính do hệ điều hành cung cấp, đúng nhịp mà người
 *    dùng quen. Chồng thêm một lớp quán tính nữa lên đó là cách nhanh nhất để
 *    trang bị mang tiếng "cuộn rất khó chịu trên điện thoại".
 */
import Lenis from "lenis";
import { useEffect } from "react";

let instance: Lenis | null = null;

/** Lenis đang chạy, hoặc null khi trang cuộn native (giảm chuyển động, chưa gắn). */
export function getLenis(): Lenis | null {
  return instance;
}

/*
 * Đường cong dừng của bánh đà.
 *
 * Cùng họ với EASE_LUXE trong `motion.ts` — bung nhanh rồi hãm dần — để nhịp
 * cuộn và nhịp hoạt hình giao diện nghe như cùng một hệ, chứ không phải hai
 * thư viện chạy song song mỗi bên một kiểu.
 */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Gắn cuộn quán tính cho toàn trang. Đặt một lần duy nhất, gần gốc cây React.
 *
 * Không render gì cả: Lenis làm việc trực tiếp trên `documentElement`, nên
 * không cần khung bọc — và cũng không được có khung bọc, vì một lớp `div` thêm
 * vào giữa `body` và nội dung sẽ phá vị trí của mọi phần tử `fixed` bên trong
 * (lớp nền chuỗi khối, header, thanh hành động dưới đáy).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      /*
       * lerp thay cho duration: hệ số nội suy theo khung hình cho cảm giác
       * "nặng và liên tục", trong khi duration cố định biến mỗi cú lăn thành
       * một hoạt ảnh có điểm đầu điểm cuối và nghe như bị trễ.
       *
       * 0,085 là mức đầm: đủ trôi để thấy rõ quán tính, chưa tới mức người dùng
       * lăn xong phải ngồi đợi trang bắt kịp. Trên trang này con số đó đáng chú
       * ý hơn bình thường vì trang chủ cao hơn mười ba nghìn điểm ảnh.
       */
      lerp: 0.085,
      easing: easeOutExpo,
      smoothWheel: true,
      /*
       * Cuộn cảm ứng để nguyên cho hệ điều hành — xem chú thích số 3 ở đầu file.
       */
      syncTouch: false,
      /*
       * Neo `#lien-he` và các liên kết trong trang do `ScrollManager` của
       * `App.tsx` tự xử lý, và nó cần nhảy *tức thời* chứ không cuộn mượt qua
       * cả chục màn hình. Để Lenis cũng bắt các neo đó thì hai bên giành nhau
       * cùng một cú bấm.
       */
      anchors: false,
      autoRaf: true,
    });

    instance = lenis;
    /*
     * Lenis đặt `scroll-behavior: auto` cho riêng nó qua class trên <html>, còn
     * `index.css` đặt `smooth` ở tầng base. Không nhường thì hai cơ chế cuộn
     * mượt chồng lên nhau và mỗi lệnh `scrollTo` chạy hai lần với hai nhịp khác
     * nhau. Quy tắc nhường nằm trong `index.css` (`html.lenis`).
     */
    return () => {
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}

/*
 * Đếm số lớp đang khoá cuộn thay vì một cờ bật/tắt.
 *
 * Trang này mở được nhiều lớp phủ chồng nhau — bấm "tài khoản" ngay trong khi
 * cửa sổ bài viết đang mở là đường đi có thật. Với một cờ đơn, lớp đóng trước
 * sẽ mở khoá cuộn trong khi lớp kia còn nguyên trên màn hình, và nền trang cuộn
 * lồng dưới hộp thoại.
 */
let lockCount = 0;
let restoreOverflow = "";

/**
 * Khoá cuộn nền trong lúc một lớp phủ đang mở.
 *
 * Gộp hai việc từng bị chép rời ở ba nơi (`Chrome.tsx` hai lần, `Account.tsx`
 * một lần): đặt `overflow` của body, và dừng Lenis. Phải làm cả hai —
 * `overflow: hidden` chỉ chặn cuộn native, còn Lenis bắt sự kiện `wheel` ở tầng
 * của nó nên vẫn tiếp tục cuộn trang qua lớp phủ như không có gì xảy ra.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      restoreOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      getLenis()?.stop();
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = restoreOverflow;
        getLenis()?.start();
      }
    };
  }, [active]);
}

/**
 * Nhảy tới một vị trí *tức thời*, kể cả khi Lenis đang chạy.
 *
 * Dùng cho lúc đổi trang: `window.scrollTo` một mình không đủ vì Lenis giữ
 * riêng con số vị trí của nó và sẽ kéo trang ngược về chỗ cũ ở khung hình kế
 * tiếp — trang nháy một cái rồi trôi về giữa chừng.
 */
export function scrollToInstant(target: number | HTMLElement) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { immediate: true, force: true });
    return true;
  }
  return false;
}

/** Cuộn mượt về một vị trí (nút "lên đầu trang"). */
export function scrollToSmooth(target: number | HTMLElement) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.1, easing: easeOutExpo });
    return true;
  }
  return false;
}
