/*
 * Lớp nền dùng chung cho mọi cảnh three.js trên trang.
 *
 * Mọi phần dễ làm sai của WebGL trong React được gom về đây một lần: dựng
 * renderer, theo dõi kích thước khung chứa, dừng vẽ khi cảnh khuất tầm nhìn, và
 * dọn sạch tài nguyên GPU lúc rời trang. Nhờ vậy từng cảnh chỉ còn phải lo đúng
 * phần hình học của nó.
 *
 * Ba quyết định đáng nói:
 *
 * 1. Vòng lặp vẽ chỉ chạy khi cảnh thực sự đang hiển thị. Trình duyệt vẫn gọi
 *    requestAnimationFrame cho tab nền ở một số nền tảng, nên nếu không tự dừng
 *    thì trang ngốn pin ngay cả khi người dùng đã chuyển sang cửa sổ khác.
 *
 * 2. Khi người dùng bật "giảm chuyển động", cảnh chuyển sang chế độ vẽ theo yêu
 *    cầu: không có vòng lặp tự chạy, chỉ vẽ lại đúng lúc người dùng cuộn. Chuyển
 *    động do chính tay người dùng tạo ra thì không gây khó chịu; thứ cần tắt là
 *    chuyển động tự thân của trang.
 *
 * 3. Tiến trình cuộn được đo từ một khối đã cache sẵn toạ độ, không đọc lại
 *    getBoundingClientRect ở mỗi khung hình. Đọc kích thước phần tử giữa vòng
 *    lặp vẽ buộc trình duyệt tính lại layout đồng bộ — đây chính là nguyên nhân
 *    kinh điển làm cuộn bị giật ở các trang có hiệu ứng theo cuộn.
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

export type StageFrame = {
  /** Số giây trôi qua kể từ khung hình trước, đã chặn trần để không nhảy vọt. */
  delta: number;
  /** Số giây kể từ lúc cảnh khởi tạo. */
  elapsed: number;
  /** Tiến trình cuộn 0→1 của khối `scrollRef`, đã làm mượt. 0 nếu không theo dõi. */
  progress: number;
  /** Vị trí con trỏ trong khung nhìn, mỗi trục −1→1, đã làm mượt. */
  pointerX: number;
  pointerY: number;
};

export type StageHandle = {
  /** Gọi mỗi khung hình, ngay trước khi renderer vẽ. */
  update?: (frame: StageFrame) => void;
  resize?: (width: number, height: number) => void;
  /** Giải phóng mọi geometry/material/texture do cảnh tự tạo. */
  dispose?: () => void;
};

export type StageInit = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
  /** Người dùng đã bật "giảm chuyển động": cảnh không được tự chuyển động. */
  reduced: boolean;
  /** Màn hình hẹp: giảm mật độ hình học để giữ khung hình mượt trên di động. */
  compact: boolean;
  /**
   * Yêu cầu vẽ lại một khung hình.
   *
   * Ở chế độ chạy bình thường đây là lệnh rỗng vì vòng lặp đã vẽ liên tục. Nó
   * chỉ thực sự có việc khi người dùng bật "giảm chuyển động": lúc đó cảnh đứng
   * yên, nên mọi thay đổi do người dùng gây ra — bấm chọn, rê chuột lên một nút
   * — phải tự thúc một khung hình, nếu không màn hình sẽ không phản hồi gì cả.
   */
  requestFrame: () => void;
};

export type StageOptions = {
  /**
   * Khối quyết định tiến trình cuộn. Thường là một section cao vài màn hình có
   * canvas dính (sticky) bên trong; tiến trình chạy từ 0 khi đỉnh khối chạm mép
   * trên khung nhìn tới 1 khi đáy khối rời khỏi khung nhìn.
   */
  scrollRef?: RefObject<HTMLElement | null>;
  trackPointer?: boolean;
  fov?: number;
  cameraZ?: number;
  /**
   * Trần devicePixelRatio riêng cho cảnh này, dùng khi cảnh không cần nét bằng
   * mặc định. Một khung xem trước rộng 600px trên màn Retina phải vẽ 1,4 triệu
   * điểm ảnh ở mức 2 và chỉ 800 nghìn ở mức 1,5 — với hình chỉ gồm đường mảnh
   * thì mắt gần như không phân biệt được, còn GPU thì tiết kiệm gần một nửa.
   */
  maxPixelRatio?: number;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Gắn một cảnh three.js vào khung chứa và trả về ref để đặt lên `<div>`.
 *
 * `setup` được gọi đúng một lần lúc gắn cảnh, nên nó phải đọc mọi dữ liệu thay
 * đổi theo thời gian qua ref chứ không qua biến bắt được từ closure — bắt giá
 * trị của lần render đầu rồi dùng mãi là cách tạo bug âm thầm. Đổi lại, cảnh 3D
 * không bao giờ bị dựng lại chỉ vì React render lại component cha, vốn là thứ
 * gây chớp hình và rò ngữ cảnh WebGL.
 */
export function useThreeStage(
  setup: (init: StageInit) => StageHandle,
  {
    scrollRef,
    trackPointer = false,
    fov = 45,
    cameraZ = 9,
    maxPixelRatio,
  }: StageOptions = {}
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const setupRef = useRef(setup);
  /*
   * Cầu nối ra ngoài cho lệnh vẽ lại: hàm thật chỉ tồn tại bên trong effect, còn
   * ref thì ổn định qua mọi lần render nên component gọi được bất cứ lúc nào.
   */
  const requestFrameRef = useRef<() => void>(() => {});
  /*
   * `supported` chỉ chuyển thành false khi trình duyệt từ chối cấp ngữ cảnh
   * WebGL. Trang phải tự bày sẵn một bản tĩnh cho trường hợp đó thay vì để lại
   * một khoảng trống.
   */
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 640px)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        // Khử răng cưa giúp các đường mảnh của cảnh sắc nét, nhưng trên di động
        // chi phí đó không đáng so với việc giữ đủ khung hình.
        antialias: !compact,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setSupported(false);
      return;
    }

    /*
     * Trần devicePixelRatio: màn Retina khai báo 3 nghĩa là renderer phải vẽ gấp
     * chín lần số điểm ảnh của khung logic. Mắt gần như không phân biệt được quá
     * mức 2, còn GPU thì thấy rõ.
     */
    const pixelCap = Math.min(maxPixelRatio ?? Infinity, compact ? 1.5 : 2);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelCap));
    renderer.setClearAlpha(0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200);
    camera.position.z = cameraZ;

    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    /*
     * Cảnh cần cầm được lệnh vẽ lại ngay lúc dựng, nhưng bộ máy vòng lặp lại phải
     * dựng sau vì nó gọi ngược vào chính cảnh. Một biến trung gian gỡ được nút
     * thắt đó: cảnh giữ hàm bọc ngoài, phần ruột được nối vào bên dưới.
     */
    let requestFrameImpl: () => void = () => {};
    const requestFrame = () => requestFrameImpl();

    const handle = setupRef.current({
      scene,
      camera,
      renderer,
      width,
      height,
      reduced,
      compact,
      requestFrame,
    });

    /* ---------- đo tiến trình cuộn ---------- */
    /*
     * Toạ độ khối cuộn được đo lại khi bố cục đổi, không phải mỗi khung hình.
     */
    let scrollTop = 0;
    let scrollSpan = 1;
    const measureScroll = () => {
      const el = scrollRef?.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      scrollTop = rect.top + window.scrollY;
      scrollSpan = Math.max(1, rect.height - window.innerHeight);
    };
    const readProgress = () =>
      scrollRef?.current ? clamp01((window.scrollY - scrollTop) / scrollSpan) : 0;

    measureScroll();

    /* ---------- trạng thái làm mượt ---------- */
    let targetProgress = readProgress();
    let progress = targetProgress;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let pointerX = 0;
    let pointerY = 0;

    const startedAt = performance.now();
    let lastFrame = startedAt;
    let rafId = 0;
    let looping = false;
    let onScreen = true;
    let tabHidden = document.visibilityState === "hidden";

    const drawFrame = (delta: number, now: number) => {
      handle.update?.({
        delta,
        elapsed: (now - startedAt) / 1000,
        progress,
        pointerX,
        pointerY,
      });
      renderer.render(scene, camera);
    };

    /*
     * Chế độ "giảm chuyển động": vẽ đúng một khung hình cho mỗi lần người dùng
     * cuộn hoặc đổi kích thước, và bỏ hẳn phần làm mượt — nội suy chỉ có nghĩa
     * khi có vòng lặp liên tục, còn ở đây nó sẽ khiến cảnh dừng lại giữa chừng.
     */
    let staticFramePending = false;
    const requestStaticFrame = () => {
      if (staticFramePending || tabHidden) return;
      staticFramePending = true;
      requestAnimationFrame((now) => {
        staticFramePending = false;
        progress = targetProgress;
        pointerX = targetPointerX;
        pointerY = targetPointerY;
        drawFrame(0, now);
      });
    };

    const loop = (now: number) => {
      const delta = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      /*
       * Hệ số làm mượt tính theo thời gian thực chứ không theo số khung hình,
       * để cảnh chạy giống nhau trên màn 60Hz và 120Hz.
       */
      const ease = 1 - Math.exp(-8 * delta);
      progress += (targetProgress - progress) * ease;
      pointerX += (targetPointerX - pointerX) * ease;
      pointerY += (targetPointerY - pointerY) * ease;
      drawFrame(delta, now);
      rafId = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (looping) return;
      looping = true;
      lastFrame = performance.now();
      rafId = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      if (!looping) return;
      looping = false;
      cancelAnimationFrame(rafId);
    };

    const sync = () => {
      const active = onScreen && !tabHidden;
      if (!active) {
        stopLoop();
        return;
      }
      if (reduced) {
        stopLoop();
        requestStaticFrame();
        return;
      }
      startLoop();
    };

    /*
     * Nối phần ruột cho requestFrame. Ở chế độ chạy bình thường không cần làm gì
     * — vòng lặp đã vẽ mỗi khung hình rồi; thúc thêm chỉ tổ vẽ thừa.
     */
    requestFrameImpl = () => {
      if (reduced && onScreen) requestStaticFrame();
    };
    requestFrameRef.current = requestFrame;

    /* ---------- theo dõi kích thước ---------- */
    const applySize = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      if (nextWidth === 0 || nextHeight === 0) return;
      width = nextWidth;
      height = nextHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      handle.resize?.(width, height);
      measureScroll();
      targetProgress = readProgress();
      // Vòng lặp đang chạy sẽ tự vẽ khung tiếp theo ở kích thước mới; chỉ chế độ
      // vẽ theo yêu cầu mới cần thúc một khung hình.
      if (!looping) requestStaticFrame();
    };

    const resizeObserver = new ResizeObserver(applySize);
    resizeObserver.observe(container);
    if (scrollRef?.current) resizeObserver.observe(scrollRef.current);

    /* ---------- tạm dừng khi khuất tầm nhìn ---------- */
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    const onVisibility = () => {
      tabHidden = document.visibilityState === "hidden";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    /* ---------- cuộn và con trỏ ---------- */
    const onScroll = () => {
      targetProgress = readProgress();
      if (reduced) requestStaticFrame();
    };
    if (scrollRef) window.addEventListener("scroll", onScroll, { passive: true });

    const onPointerMove = (event: PointerEvent) => {
      // Bỏ qua chạm: trên di động ngón tay là công cụ cuộn, không phải con trỏ
      // rê, nên hiệu ứng bám chuột chỉ làm cảnh giật theo mỗi cú vuốt.
      if (event.pointerType === "touch") return;
      targetPointerX = (event.clientX / window.innerWidth) * 2 - 1;
      targetPointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    if (trackPointer && !reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    const onWindowResize = () => {
      measureScroll();
      targetProgress = readProgress();
    };
    window.addEventListener("resize", onWindowResize);

    sync();

    /* ---------- dọn dẹp ---------- */
    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onWindowResize);
      if (scrollRef) window.removeEventListener("scroll", onScroll);
      if (trackPointer && !reduced) window.removeEventListener("pointermove", onPointerMove);

      handle.dispose?.();
      /*
       * forceContextLoss trả ngữ cảnh WebGL về cho trình duyệt ngay lập tức.
       * Trình duyệt chỉ giữ được khoảng 8–16 ngữ cảnh cùng lúc, nên nếu chỉ
       * dispose mà không trả, người dùng đi qua đi lại vài trang là cảnh cũ nhất
       * bị thu hồi và biến mất giữa chừng.
       */
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      requestFrameRef.current = () => {};
    };
  }, [scrollRef, trackPointer, fov, cameraZ, maxPixelRatio]);

  // Bọc qua ref để danh tính hàm không đổi giữa các lần render, nhờ vậy component
  // gọi dùng được nó trong deps của useEffect mà không tạo vòng lặp cập nhật.
  const requestFrame = useCallback(() => requestFrameRef.current(), []);

  return { containerRef, supported, requestFrame };
}

/**
 * Khoảng cách tối thiểu để một khối rộng `halfWidth` và cao `halfHeight` lọt trọn
 * khung hình của máy quay.
 *
 * Đặt tay một con số rồi canh cho vừa màn hình mình đang mở là cái bẫy kinh điển:
 * nó vừa đúng trên màn ngang 16:9 và cắt cụt cảnh trên điện thoại dựng đứng, nơi
 * khung hình hẹp hơn ba lần. Vì máy quay bị giới hạn theo chiều dọc, chiều ngang
 * phải suy ra từ tỉ lệ khung hình — nên phép tính này lấy con số lớn hơn giữa hai
 * ràng buộc, và phải chạy lại mỗi lần khung đổi kích thước.
 */
export function fitDistance(
  camera: THREE.PerspectiveCamera,
  halfWidth: number,
  halfHeight: number,
  margin = 1.12
) {
  const halfFov = Math.tan((camera.fov * Math.PI) / 360);
  const forHeight = halfHeight / halfFov;
  const forWidth = halfWidth / (halfFov * camera.aspect);
  return Math.max(forHeight, forWidth) * margin;
}

/** Bề rộng thế giới mà máy quay nhìn thấy ở một khoảng cách cho trước. */
export function visibleWidthAt(camera: THREE.PerspectiveCamera, distance: number) {
  return 2 * distance * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
}

/**
 * Giải phóng toàn bộ geometry và material nằm dưới một nhánh scene.
 *
 * Rác của WebGL nằm ở phía trình điều khiển đồ hoạ chứ không phải trong heap của
 * JavaScript, nên bộ dọn rác của trình duyệt không đụng tới được: không gọi
 * dispose thì vùng nhớ đó ở lại tới khi đóng tab.
 */
export function disposeObject(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as Partial<THREE.Mesh>;
    mesh.geometry?.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose();
  });
}
