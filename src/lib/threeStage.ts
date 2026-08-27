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
  /**
   * Bộ theo dõi nhịp khung hình đã hạ mức chất lượng xuống `tier`.
   *
   * 0 là mức đầy đủ, và các mức sau đó là lời đề nghị cảnh tự bớt việc: ẩn lớp
   * phụ, giảm mật độ hình học, bỏ chi tiết nhỏ. Mức 3 nghĩa là sân khấu sắp
   * dừng hẳn — cảnh không cần làm gì thêm.
   *
   * Chỉ được gọi khi `adaptive` bật, và chỉ theo một chiều: đã hạ thì không
   * nâng lại. Xem chú thích ở phần bộ theo dõi bên dưới để biết vì sao.
   */
  quality?: (tier: number) => void;
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
  /**
   * Trần số khung hình mỗi giây.
   *
   * Dành cho cảnh trang trí có chuyển động chậm hơn hẳn một hoạt ảnh giao diện:
   * ở đây một vòng đưa máy quay mất hơn một phút và hạt bụi trôi vài điểm ảnh
   * mỗi giây, nên vẽ 60 lần mỗi giây là vẽ đi vẽ lại gần như đúng một hình.
   * Hạ xuống 30 thì mắt không phân biệt được, còn chi phí thì giảm một nửa —
   * và chi phí đó không nằm ở hình học (cả cảnh chỉ hai lệnh vẽ) mà ở việc xoá
   * rồi ghép lại hàng triệu điểm ảnh của một canvas trong suốt cỡ màn hình.
   *
   * Bỏ trống thì cảnh chạy theo đúng nhịp màn hình.
   */
  maxFps?: number;
  /**
   * Bật bộ theo dõi nhịp khung hình: máy nào không theo kịp thì tự hạ chất
   * lượng, thay vì bắt mọi máy chạy chung một cấu hình.
   *
   * Cần thiết đúng một chỗ: cảnh nền trải kín màn hình và sống suốt cả trang.
   * Những cảnh chỉ hiện trong một khối rồi trôi qua thì không đáng — người dùng
   * đã cuộn khỏi chúng trước khi bộ theo dõi kịp kết luận.
   *
   * Cách chọn máy yếu bằng cấu hình khai báo sẵn (`deviceMemory`,
   * `hardwareConcurrency`) đã được thử và đã sai một lần — xem chú thích trong
   * `lazyWebgl.ts`. Đo nhịp khung hình *thật* của chính cảnh này thì không đoán
   * nhầm: máy nào tụt là máy đó tụt, bất kể nó khai báo gì.
   */
  adaptive?: boolean;
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
    maxFps,
    adaptive = false,
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
   * WebGL, hoặc khi ngữ cảnh đang chạy bị thu hồi giữa chừng. Trang phải tự bày
   * sẵn một bản tĩnh cho trường hợp đó thay vì để lại một khoảng trống.
   */
  const [supported, setSupported] = useState(true);
  /*
   * `ready` chỉ bật lên sau khi cảnh *thực sự vẽ xong khung hình đầu tiên*.
   *
   * Khác biệt với `supported` nhỏ mà quan trọng: mã cảnh tải xong không có
   * nghĩa là cảnh hiện ra được. Nơi nào có sẵn một bản hình tĩnh đặt dưới canvas
   * thì phải chờ đúng mốc này mới cho bản tĩnh mờ đi — chờ theo mốc "mô-đun đã
   * tải" thì trên máy không dựng nổi WebGL, bản tĩnh biến mất mà canvas thì
   * không bao giờ hiện, và người dùng nhìn thấy một ô đen.
   */
  const [ready, setReady] = useState(false);

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
      // three.js ném lỗi ngay trong hàm dựng khi không xin được ngữ cảnh WebGL.
      setSupported(false);
      setReady(false);
      return;
    }

    /*
     * Trần devicePixelRatio: màn Retina khai báo 3 nghĩa là renderer phải vẽ gấp
     * chín lần số điểm ảnh của khung logic. Mắt gần như không phân biệt được quá
     * mức 2, còn GPU thì thấy rõ.
     */
    const pixelCap = Math.min(maxPixelRatio ?? Infinity, compact ? 1.5 : 2);
    const basePixelRatio = Math.min(window.devicePixelRatio || 1, pixelCap);
    let pixelRatio = basePixelRatio;
    renderer.setPixelRatio(pixelRatio);
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

    let firstFrameDrawn = false;
    let disposed = false;

    const drawFrame = (delta: number, now: number) => {
      handle.update?.({
        delta,
        elapsed: (now - startedAt) / 1000,
        progress,
        pointerX,
        pointerY,
      });
      renderer.render(scene, camera);
      if (!firstFrameDrawn && !disposed) {
        firstFrameDrawn = true;
        setReady(true);
      }
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

    /*
     * Trừ đi một nửa chu kỳ màn hình 60Hz: nếu so đúng bằng 1000/maxFps thì một
     * khung hình tới sớm hơn ngưỡng đúng vài phần nghìn giây sẽ bị bỏ, và nhịp
     * thực tế tụt xuống còn một nửa trần mong muốn thay vì đúng bằng nó.
     */
    let targetFps = maxFps ?? 60;
    let minFrameGap = maxFps ? 1000 / maxFps - 8 : 0;

    /* ---------- bộ theo dõi nhịp khung hình ---------- */
    /*
     * Ý tưởng: đo khoảng cách giữa những khung hình *đã vẽ* rồi so với nhịp mà
     * cảnh nhắm tới. Máy chạy thoải mái thì hai con số gần bằng nhau; máy đuối
     * thì khoảng cách giãn ra, và giãn đều chứ không phải một hai lần.
     *
     * Ba chi tiết giữ cho nó không kết luận bừa:
     *
     * 1. Bỏ qua quãng khởi động. Khung hình đầu tiên còn gánh việc biên dịch
     *    shader và tải nốt phần còn lại của trang, nên chúng luôn chậm — kết
     *    luận ở đó thì máy nào cũng bị coi là yếu.
     *
     * 2. Xét theo *tỉ lệ* khung hình trễ trong một cửa sổ dài vài giây, không
     *    xét từng khung. Một cú giật lẻ do trình duyệt thu gom rác không phải
     *    là máy yếu; một phần ba số khung hình trễ liên tục thì mới là.
     *
     * 3. Chỉ hạ, không nâng lại. Nâng lại nghe hợp lý nhưng tạo ra vòng dao
     *    động: hạ xong máy chạy đủ nhanh → nâng lên → lại tụt → lại hạ, và
     *    người dùng thấy chất lượng hình nhấp nháy. Thà giữ mức thấp.
     */
    let tier = 0;
    let sampleCount = 0;
    let lateCount = 0;
    let watchdogArmedAt = 0;

    const resetWatchdog = () => {
      sampleCount = 0;
      lateCount = 0;
      // Quãng khởi động được cấp lại sau mỗi lần vòng lặp chạy tiếp: khung hình
      // đầu tiên sau khi quay lại tab luôn chậm vì GPU vừa bị đánh thức.
      watchdogArmedAt = performance.now() + 1500;
    };

    const stepDownQuality = () => {
      tier += 1;
      // Báo cho cảnh *trước* khi sân khấu ra tay. Ở mức 3 thứ tự này quyết định:
      // cảnh kịp bỏ bớt lớp, khung hình cuối cùng vẽ ra đã là bản gọn nhẹ, rồi
      // vòng lặp mới dừng lại trên đúng khung hình đó.
      handle.quality?.(tier);
      switch (tier) {
        case 1:
          /*
           * Hạ độ phân giải trước tiên. Với một canvas trong suốt trải kín màn
           * hình, phần lớn chi phí nằm ở số điểm ảnh phải xoá rồi ghép lại chứ
           * không ở hình học — nên đây là cần gạt hiệu quả nhất, và cũng là cần
           * gạt ít bị để ý nhất khi hình chỉ gồm đường mảnh trên nền tối.
           */
          pixelRatio = Math.max(0.6, basePixelRatio * 0.7);
          renderer.setPixelRatio(pixelRatio);
          renderer.setSize(width, height);
          break;
        case 2:
          // Vẫn không đủ: bớt số khung hình, và nhờ cảnh bỏ những lớp phụ.
          targetFps = 20;
          minFrameGap = 1000 / targetFps - 8;
          break;
        default:
          /*
           * Ba lần hạ mà vẫn không theo kịp thì cảnh này không dành cho máy
           * đang chạy. Dừng hẳn còn tử tế hơn là để trang cuộn giật suốt phiên
           * — phần 3D vốn chỉ là lớp trang trí, mất nó không mất gì của nội
           * dung.
           */
          renderer.render(scene, camera);
          stopLoop();
          break;
      }
    };

    const sampleFrame = (gap: number, now: number) => {
      if (tier >= 3 || now < watchdogArmedAt) return;
      sampleCount += 1;
      // 1,45 lần nhịp mục tiêu: đủ rộng để không bắt nhầm sai số làm tròn của
      // requestAnimationFrame, đủ hẹp để nhận ra nhịp đã tụt còn hai phần ba.
      if (gap > (1000 / targetFps) * 1.45) lateCount += 1;
      if (sampleCount < 120) return;
      const late = lateCount / sampleCount;
      resetWatchdog();
      if (late > 0.35) stepDownQuality();
    };

    const loop = (now: number) => {
      // Xin khung tiếp theo trước khi làm gì khác, để một khung bị bỏ qua vì
      // trần tốc độ không làm đứt cả vòng lặp.
      rafId = requestAnimationFrame(loop);
      if (minFrameGap && now - lastFrame < minFrameGap) return;

      const gap = now - lastFrame;
      const delta = Math.min(0.05, gap / 1000);
      lastFrame = now;
      if (adaptive) sampleFrame(gap, now);
      /*
       * Hệ số làm mượt tính theo thời gian thực chứ không theo số khung hình,
       * để cảnh chạy giống nhau trên màn 60Hz và 120Hz.
       */
      const ease = 1 - Math.exp(-8 * delta);
      progress += (targetProgress - progress) * ease;
      pointerX += (targetPointerX - pointerX) * ease;
      pointerY += (targetPointerY - pointerY) * ease;
      drawFrame(delta, now);
    };

    const startLoop = () => {
      // Mức 3 là lời từ chối dứt khoát của bộ theo dõi: cuộn qua cuộn lại không
      // được phép làm cảnh sống dậy.
      if (looping || tier >= 3) return;
      looping = true;
      lastFrame = performance.now();
      resetWatchdog();
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

    /*
     * Ngữ cảnh WebGL có thể bị thu hồi giữa chừng: trình điều khiển đồ hoạ khởi
     * động lại, máy chuyển sang GPU tiết kiệm điện, hoặc trình duyệt lấy lại ngữ
     * cảnh cũ nhất khi đã cấp quá nhiều. Lúc đó canvas biến thành một ô trống mà
     * không có lỗi nào được ném ra — nếu không bắt sự kiện này thì trang lặng lẽ
     * mất hình và không ai biết vì sao.
     *
     * Không gọi preventDefault: nói với trình duyệt rằng ta *không* định khôi
     * phục, và lùi hẳn về bản hình tĩnh. Khôi phục đúng cách đòi hỏi nạp lại
     * toàn bộ tài nguyên GPU của cảnh, mà với một lớp trang trí thì cái giá đó
     * không đáng.
     */
    const onContextLost = () => {
      stopLoop();
      if (disposed) return;
      firstFrameDrawn = false;
      setReady(false);
      setSupported(false);
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

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
      disposed = true;
      stopLoop();
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
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
  }, [scrollRef, trackPointer, fov, cameraZ, maxPixelRatio, maxFps, adaptive]);

  // Bọc qua ref để danh tính hàm không đổi giữa các lần render, nhờ vậy component
  // gọi dùng được nó trong deps của useEffect mà không tạo vòng lặp cập nhật.
  const requestFrame = useCallback(() => requestFrameRef.current(), []);

  return { containerRef, supported, ready, requestFrame };
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
