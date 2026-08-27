/*
 * Lớp bọc quyết định *khi nào* chuỗi khối được dựng, khi nào nó hiện ra, và khi
 * nào nó biến mất hẳn khỏi bố cục.
 *
 * Cảnh bên trong trải kín khung nhìn và sống suốt cả trang, nên ba câu hỏi đó
 * đáng giá hơn bản thân phần hình học. Ba quyết định:
 *
 * 1. **Không bao giờ chạy cùng lúc với cảnh mở đầu.** Hai màn hình đầu tiên đã
 *    có một canvas trải kín màn hình của riêng chúng. Cho cả hai cùng vẽ là
 *    nhân đôi phần đắt nhất — ghép lại vài triệu điểm ảnh trong suốt mỗi khung
 *    hình — và trên màn hình thì hai lớp hình học chồng nhau thành nhiễu. Chuỗi
 *    chỉ nhận bàn giao đúng lúc cảnh mở đầu tắt dần.
 *
 * 2. **Tắt khi một khối nền đục đang che khung nhìn.** Nửa dưới trang chủ xen
 *    kẽ khối nền sáng và khối nền tối, nên chuỗi chạy suốt từ đầu tới cuối
 *    trang *ở mọi chỗ nó còn nhìn thấy được*, và tắt ở những chỗ nó nằm sau một
 *    lớp sơn đục — nơi vẽ tiếp cũng không ai thấy mà vẫn tốn đúng bằng lúc thấy.
 *
 * 3. **Mờ hẳn thì gỡ khỏi bố cục bằng `display:none`.** Không phải để tiết kiệm
 *    vài điểm ảnh: khung chứa lúc đó có kích thước bằng không, nên bộ quan sát
 *    khung nhìn trong `useThreeStage` coi như cảnh đã ra ngoài màn hình và dừng
 *    hẳn vòng lặp vẽ. Chỉ hạ độ mờ về 0 thôi thì canvas vẫn vẽ đủ 30 khung hình
 *    mỗi giây một thứ không ai nhìn thấy.
 *
 * Mọi mốc đều đo từ khối thật trên trang chứ không từ một con số phần trăm
 * chiều dài trang. Trang chủ này cao hơn mười ba nghìn điểm ảnh, và hơn một nửa
 * số đó chỉ xuất hiện khi khối nội dung nạp muộn hạ xuống — mọi ngưỡng đóng
 * cứng theo tiến trình cuộn đều trôi khỏi chỗ của nó ngay lần đầu ai đó thêm
 * một khối mới vào giữa trang.
 */
import { motion, useMotionValue } from "framer-motion";
import { useEffect, useState, type ComponentType, type RefObject } from "react";
import { afterPageLoad, shouldRunWebGL } from "../lib/lazyWebgl";

type SceneComponent = ComponentType;

let scenePromise: Promise<{ default: SceneComponent }> | null = null;
function loadScene() {
  if (!scenePromise) {
    scenePromise = import("./three/ChainScene").then((mod) => ({
      default: mod.default as SceneComponent,
    }));
  }
  return scenePromise;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Độ mờ của lớp nền, tính từ vị trí thật của các khối trên trang.
 *
 * Hai thứ nhân với nhau:
 *
 * - **Cổng bàn giao**: chuỗi chỉ được phép hiện sau khi sân khấu mở đầu đã tắt.
 * - **Cổng che khuất**: chuỗi tắt khi một khối nền đục đang phủ khung nhìn.
 *
 * Cổng thứ hai là thứ đáng nói. Nửa dưới trang chủ xen kẽ khối nền sáng và khối
 * nền tối, nên không có *một* mốc "từ đây trở xuống thì tắt" nào đúng cả: tắt
 * sớm thì mất chuỗi ở ba khối nền tối phía dưới, để chạy suốt thì phần lớn thời
 * gian là vẽ một thứ nằm sau lớp sơn đục.
 *
 * Cách giải ở đây không dùng ngưỡng nào hết. Mỗi khối nền đục tự khai báo bằng
 * `data-chain-occluder`, và độ mờ của chuỗi đúng bằng phần khung nhìn *chưa* bị
 * chúng che. Khối nền sáng phủ kín màn hình thì chuỗi tắt hẳn; phủ một nửa thì
 * chuỗi mờ một nửa. Chuyển tiếp tự khớp với tốc độ cuộn mà không cần chỉnh tay
 * con số nào, và thêm hay bớt một khối nội dung sau này cũng không phải sửa gì
 * ở đây.
 *
 * Cách chia việc theo đúng lối của `threeStage.ts`: đo đạc — thứ buộc trình
 * duyệt tính lại bố cục — chỉ chạy khi bố cục đổi; còn mỗi lần cuộn thì chỉ đọc
 * `scrollY` và làm vài phép tính số học trên mảng đã đo sẵn. Đọc kích thước phần
 * tử trong bộ nghe sự kiện cuộn là nguyên nhân kinh điển làm cuộn bị giật.
 */
function useChainOpacity(fromRef: RefObject<HTMLElement | null>) {
  const opacity = useMotionValue(0);

  useEffect(() => {
    let fadeInFrom = 0;
    let fadeInTo = 1;
    /* Các khối nền đục, toạ độ tính theo tài liệu: [đỉnh, đáy]. */
    let occluders: Array<[number, number]> = [];

    const measure = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      const from = fromRef.current;
      if (from) {
        /*
         * Hiện dần khi đáy sân khấu mở đầu đi từ 95% xuống 35% chiều cao khung
         * nhìn. `OpeningBackdrop` tắt dần trong khoảng 14% cuối quãng cuộn của
         * chính sân khấu đó, tức chừng một phần bảy khung nhìn cuối — nên hai
         * đường cong gần như trùng khít, và đoạn cả hai cảnh cùng vẽ chỉ dài
         * khoảng nửa khung nhìn cuộn.
         */
        const openingBottom = from.getBoundingClientRect().bottom + scrollY;
        fadeInFrom = openingBottom - vh * 0.95;
        fadeInTo = openingBottom - vh * 0.35;
      }

      /*
       * Gộp các khoảng chồng lấn thành những khoảng rời nhau ngay từ lúc đo.
       *
       * Chỗ này từng sai và cái sai không lộ ra bằng mắt. Bản đầu lấy khoảng che
       * *nhiều nhất* thay vì tổng, nên đúng chỗ giáp ranh giữa hai khối nền sáng
       * nằm liền nhau — mỗi khối che một nửa khung nhìn — phép tính ra 50% và
       * lớp nền chạy tiếp, trong khi màn hình thực tế đã bị che kín 100%. Không
       * ai thấy gì bất thường vì nó nằm sau lớp sơn đục; chỉ có cái máy là vẫn
       * vẽ đủ 30 khung hình mỗi giây cho không ai xem.
       *
       * Gộp sẵn ở đây thì mỗi lần cuộn chỉ còn việc cộng, và các khối lồng nhau
       * hay xếp chồng sau này cũng không tính trùng.
       */
      const raw = [...document.querySelectorAll("[data-chain-occluder]")]
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return [rect.top + scrollY, rect.bottom + scrollY] as [number, number];
        })
        .sort((a, b) => a[0] - b[0]);

      occluders = [];
      for (const range of raw) {
        const last = occluders[occluders.length - 1];
        if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
        else occluders.push([range[0], range[1]]);
      }
    };

    const apply = () => {
      const top = window.scrollY;
      const vh = window.innerHeight;
      const bottom = top + vh;

      const enter = clamp01((top - fadeInFrom) / Math.max(1, fadeInTo - fadeInFrom));

      // Các khoảng đã rời nhau từ lúc đo, nên cộng thẳng ra đúng phần khung nhìn
      // bị che, không tính trùng.
      let covered = 0;
      for (const [oTop, oBottom] of occluders) {
        const overlap = Math.min(oBottom, bottom) - Math.max(oTop, top);
        if (overlap > 0) covered += overlap;
      }

      opacity.set(enter * (1 - clamp01(covered / vh)));
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };

    const remeasure = () => {
      measure();
      apply();
    };

    remeasure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    /*
     * Khối nội dung phía dưới nạp muộn và làm trang cao thêm hơn bảy nghìn điểm
     * ảnh khi nó hạ xuống — và nó mang theo ba trong bốn khối nền đục. Không đo
     * lại thì danh sách khối che rỗng, và chuỗi sẽ vẽ suốt nửa dưới trang sau
     * lưng những khối nội dung đục.
     */
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      observer.disconnect();
    };
  }, [fromRef, opacity]);

  return opacity;
}

export function ChainBackdrop({
  /** Khối mở đầu. Chuỗi hiện lên khi đáy khối này sắp rời khung nhìn. */
  fromRef,
}: {
  fromRef: RefObject<HTMLElement | null>;
}) {
  const [Scene, setScene] = useState<SceneComponent | null>(null);
  const opacity = useChainOpacity(fromRef);

  const [dimmed, setDimmed] = useState(true);
  useEffect(() => {
    const apply = (value: number) => {
      // Hai ngưỡng lệch nhau, không phải một: dùng chung một mốc thì khi người
      // dùng dừng cuộn đúng ngay tại mốc đó, mỗi rung động nhỏ của con lăn lại
      // bật/tắt cảnh một lần — và mỗi lần bật là một lần bộ quan sát khung nhìn
      // khởi động lại vòng lặp vẽ.
      setDimmed((current) => {
        if (current && value > 0.05) return false;
        if (!current && value <= 0.02) return true;
        return current;
      });
    };
    apply(opacity.get());
    return opacity.on("change", apply);
  }, [opacity]);

  useEffect(() => {
    if (!shouldRunWebGL()) return;
    let cancelled = false;
    const cancel = afterPageLoad(() => {
      loadScene()
        .then((mod) => {
          // setState với một component phải bọc trong hàm, nếu không React coi
          // chính component đó là hàm cập nhật và gọi nó với state cũ.
          if (!cancelled) setScene(() => mod.default);
        })
        .catch(() => {
          /* Tải hỏng thì trang ở nguyên trạng thái không có lớp nền chuỗi. */
        });
    });
    return () => {
      cancelled = true;
      cancel();
    };
  }, []);

  if (!Scene) return null;

  return (
    <motion.div
      aria-hidden="true"
      /*
       * Độ mờ được áp cả khi người dùng bật "giảm chuyển động". Đó là chủ ý và
       * thống nhất với `MotionConfig reducedMotion="user"` đặt ở App: chế độ đó
       * bỏ mọi phép biến hình, nhưng giữ lại đổi màu và đổi độ mờ. Bỏ luôn cả
       * phần này thì chuỗi bật ra và tắt phụt giữa trang thay vì chuyển giao.
       */
      style={{ opacity }}
      className={`pointer-events-none fixed inset-0 z-0 ${dimmed ? "hidden" : ""}`}
    >
      <div className="animate-backdrop-in absolute inset-0">
        <Scene />
      </div>
    </motion.div>
  );
}
