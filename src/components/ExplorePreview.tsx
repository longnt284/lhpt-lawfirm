/*
 * Khung xem trước cho hai trang 3D, đặt ngay trong thẻ dẫn đường ở trang chủ.
 *
 * Đây là lớp *quyết định có chạy WebGL hay không*, còn phần vẽ nằm ở
 * `three/ExplorePreviewScene.tsx`. Tách làm hai vì đúng một lý do: chỉ khi lớp
 * này quyết định chạy thì `import()` mới nổ, và three.js mới được tải về. Nếu
 * gộp chung, mọi khách vào trang chủ đều phải tải một thư viện đồ hoạ nặng hơn
 * toàn bộ phần còn lại của trang, kể cả người chỉ đọc một bài viết rồi rời đi.
 *
 * Thứ tự các cửa ải, từ rẻ tới đắt:
 *
 *  1. Nền tĩnh (SVG) luôn được vẽ. Nó không phải chỗ giữ chỗ tạm — với máy yếu,
 *     mạng tiết kiệm dữ liệu, hoặc người dùng bật "giảm chuyển động", đây chính
 *     là hình cuối cùng họ thấy, nên nó phải tự đứng được một mình.
 *  2. Loại sớm những máy không nên chạy: mạng chậm hoặc bật Data Saver, máy ít
 *     RAM, máy ít nhân, và trường hợp người dùng đã nói rõ là muốn ít chuyển
 *     động.
 *  3. Chỉ khi thẻ sắp vào khung nhìn mới tải mã cảnh, và còn đợi thêm một nhịp
 *     rảnh của luồng chính. Người cuộn thẳng xuống chân trang không bao giờ
 *     phải trả chi phí này.
 *
 * Việc tải sớm ở bước 3 còn có tác dụng phụ đáng giá: lúc người dùng bấm vào
 * thẻ, three.js đã nằm sẵn trong bộ nhớ đệm, nên trang 3D mở ra gần như tức
 * thì thay vì đứng ở màn hình trống chờ tải thư viện.
 */
import { useEffect, useRef, useState, type ComponentType } from "react";
import { cancelIdle, shouldRunWebGL, whenIdle, type IdleHandle } from "../lib/lazyWebgl";

export type PreviewVariant = "foundation" | "practice";

type SceneComponent = ComponentType<{
  variant: PreviewVariant;
  hovered: boolean;
  onReady?: (ready: boolean) => void;
}>;

/*
 * Mô-đun cảnh được chia sẻ giữa hai thẻ: cả hai gọi cùng một `import()`, trình
 * duyệt gộp thành một lần tải. Giữ lời hứa ở mức mô-đun để lần gọi thứ hai
 * không tạo thêm việc.
 */
let scenePromise: Promise<{ default: SceneComponent }> | null = null;
function loadScene() {
  if (!scenePromise) {
    scenePromise = import("./three/ExplorePreviewScene").then((mod) => ({
      default: mod.default as SceneComponent,
    }));
  }
  return scenePromise;
}

export function ExplorePreview({
  variant,
  hovered,
}: {
  variant: PreviewVariant;
  hovered: boolean;
}) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const [Scene, setScene] = useState<SceneComponent | null>(null);
  /*
   * Mốc để bản hình tĩnh nhường chỗ là "cảnh đã vẽ xong khung đầu", không phải
   * "mã cảnh đã tải xong".
   *
   * Bản trước dùng mốc thứ hai, và nó sai ở đúng trường hợp tệ nhất: máy không
   * dựng nổi ngữ cảnh WebGL vẫn tải mã bình thường, nên bản tĩnh mờ đi trong
   * khi canvas không bao giờ hiện — thẻ dẫn đường trở thành một ô đen. Tái hiện
   * được bằng cách chặn getContext("webgl") trong trình duyệt.
   */
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = holderRef.current;
    if (!el || !shouldRunWebGL()) return;

    let cancelled = false;
    let idle: IdleHandle | null = null;

    const start = () => {
      idle = whenIdle(() => {
        if (cancelled) return;
        loadScene()
          .then((mod) => {
            // setState với một component phải bọc trong hàm, nếu không React coi
            // chính component đó là hàm cập nhật và gọi nó với state cũ.
            if (!cancelled) setScene(() => mod.default);
          })
          .catch(() => {
            /* Tải hỏng thì nền tĩnh ở lại — không có gì để báo cho người dùng. */
          });
      });
    };

    if (typeof IntersectionObserver === "undefined") {
      start();
      return () => {
        cancelled = true;
        cancelIdle(idle);
      };
    }

    /*
     * Nới trước 320px: mã cảnh tải xong ngay trước khi thẻ lộ ra, nên người dùng
     * thấy hình động chứ không thấy nó bật lên giữa chừng.
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        start();
      },
      { rootMargin: "320px 0px" }
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      cancelIdle(idle);
    };
  }, []);

  return (
    <div ref={holderRef} className="absolute inset-0">
      <PreviewPoster variant={variant} live={live} />
      {Scene && <Scene variant={variant} hovered={hovered} onReady={setLive} />}
    </div>
  );
}

/*
 * Nền tĩnh. Nó vẽ đúng hình mà cảnh 3D sẽ dựng, chỉ ở một góc nhìn cố định, nên
 * lúc canvas chồng lên thì hình không nhảy — người dùng chỉ thấy nó bắt đầu
 * chuyển động.
 */
function PreviewPoster({ variant, live }: { variant: PreviewVariant; live: boolean }) {
  /* `live` = cảnh 3D đang thực sự vẽ. Xem giải thích ở `ExplorePreview`. */
  return (
    <svg
      viewBox="0 0 200 132"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
        live ? "opacity-0" : "opacity-100"
      }`}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    >
      {variant === "foundation" ? <FoundationArt /> : <PracticeArt />}
    </svg>
  );
}

function FoundationArt() {
  return (
    /*
     * Thu nhỏ quanh tâm khung: bản vẽ này cao gần kín viewBox, nên ở tỉ lệ 1 thì
     * vòng chống sét chạm mép trên còn đầu cọc chạm mép dưới. Phép biến đổi ba
     * bước (dời tâm về gốc, co, dời trả lại) chạy đúng ở mọi trình duyệt, khác
     * với transform-origin vốn không phải trình duyệt nào cũng hiểu trong SVG.
     */
    <g strokeWidth="1" transform="translate(100,66) scale(0.93) translate(-100,-66)">
      {/* nền và cọc */}
      <g className="text-fog-500" stroke="currentColor" opacity="0.42">
        <path d="M22 110h156" />
        <path d="M34 110 48 101M74 110 88 101M126 110 140 101M166 110 180 101" opacity="0.55" />
        <path d="M48 101h132" opacity="0.5" />
        <path d="M46 110v9M78 110v9M122 110v9M154 110v9" />
      </g>
      {/* vành móng */}
      <g className="text-brass-500" stroke="currentColor" opacity="0.75">
        <path d="M32 108h136" />
      </g>
      {/* cột */}
      <g className="text-brass-500" stroke="currentColor" opacity="0.62">
        <path d="M46 108V58M78 108V58M122 108V58M154 108V58" />
      </g>
      {/* sàn và dầm */}
      <g className="text-fog-400" stroke="currentColor" opacity="0.44">
        <path d="M46 84h108M46 58h108M100 84V58" />
      </g>
      {/* mái */}
      <g className="text-brass-400" stroke="currentColor" opacity="0.8">
        <path d="M38 58 100 30l62 28" />
        <path d="M100 30v28" opacity="0.4" />
      </g>
      {/* cột thu lôi và vùng bảo vệ */}
      <g className="text-jade-400" stroke="currentColor">
        <path d="M100 30V12" opacity="0.85" />
        <ellipse cx="100" cy="12" rx="26" ry="5.5" opacity="0.34" />
        <ellipse cx="100" cy="15" rx="18" ry="3.8" opacity="0.26" />
        <ellipse cx="100" cy="18" rx="10" ry="2.2" opacity="0.2" />
      </g>
    </g>
  );
}

function PracticeArt() {
  return (
    <g strokeWidth="1">
      {/* đường nối */}
      <g className="text-fog-500" stroke="currentColor" opacity="0.28">
        <path d="M42 46 156 40M42 46 151 95M56 91 42 46M56 91 156 40M151 95 103 26M42 46 103 26M156 40 151 95" />
      </g>
      {/* chấm hồ sơ đang chạy trên một đường */}
      <g className="text-brass-400" fill="currentColor" stroke="none" opacity="0.75">
        <circle cx="88" cy="44" r="2.1" />
        <circle cx="122" cy="60" r="1.7" opacity="0.6" />
      </g>
      {/* năm lĩnh vực */}
      <g className="text-brass-500" stroke="currentColor" opacity="0.78">
        <path d="M42 39 49 46 42 53 35 46Z" />
        <path d="M156 33 163 40 156 47 149 40Z" />
        <path d="M151 88 158 95 151 102 144 95Z" />
      </g>
      <g className="text-jade-400" stroke="currentColor" opacity="0.78">
        <path d="M56 84 63 91 56 98 49 91Z" />
        <path d="M103 19 110 26 103 33 96 26Z" />
      </g>
      <g fill="currentColor" stroke="none">
        <g className="text-brass-400" opacity="0.9">
          <circle cx="42" cy="46" r="1.6" />
          <circle cx="156" cy="40" r="1.6" />
          <circle cx="151" cy="95" r="1.6" />
        </g>
        <g className="text-jade-300" opacity="0.9">
          <circle cx="56" cy="91" r="1.6" />
          <circle cx="103" cy="26" r="1.6" />
        </g>
      </g>
      {/* sao nền */}
      <g className="text-fog-500" fill="currentColor" stroke="none" opacity="0.3">
        <circle cx="20" cy="22" r="0.9" />
        <circle cx="180" cy="70" r="0.9" />
        <circle cx="30" cy="112" r="0.9" />
        <circle cx="170" cy="16" r="0.9" />
        <circle cx="120" cy="118" r="0.9" />
        <circle cx="76" cy="14" r="0.9" />
      </g>
    </g>
  );
}
