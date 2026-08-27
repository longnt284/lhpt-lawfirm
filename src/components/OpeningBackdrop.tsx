/*
 * Lớp bọc quyết định *khi nào* cảnh 3D của phần mở đầu được dựng, và khi nào nó
 * biến mất.
 *
 * Cảnh này khác hai khung xem trước ở khối "Trải nghiệm 3D" đúng một điểm, và
 * điểm đó đổi toàn bộ cách nạp: nó nằm ngay màn hình đầu tiên. Bộ quan sát khung
 * nhìn vô dụng ở đây — nó đã ở trong khung nhìn ngay giây đầu, mà đó lại là giây
 * trình duyệt đang bận nhất: dựng chữ, tính bố cục, vẽ màn hình đầu. Chen một
 * thư viện đồ hoạ vào giữa lúc đó là cách chắc chắn để làm chậm chính cái màn
 * hình mà hiệu ứng định tô điểm.
 *
 * Nên thứ tự ở đây là: trang hiện ra đầy đủ trước → `load` bắn → luồng chính
 * rảnh → lúc đó mới tải mã cảnh → cảnh hiện dần lên trong 1,4 giây. Người dùng
 * không bao giờ phải chờ nó, và nếu máy hoặc mạng không kham nổi thì phần mở đầu
 * vẫn đúng như trước khi có tính năng này: không khoảng trống, không chỗ giữ
 * chỗ, không thiếu gì cả.
 */
import { motion, type MotionValue } from "framer-motion";
import { useEffect, useState, type ComponentType, type RefObject } from "react";
import { afterPageLoad, shouldRunWebGL } from "../lib/lazyWebgl";

type SceneComponent = ComponentType<{ stageRef: RefObject<HTMLElement | null> }>;

let scenePromise: Promise<{ default: SceneComponent }> | null = null;
function loadScene() {
  if (!scenePromise) {
    scenePromise = import("./three/OpeningScene").then((mod) => ({
      default: mod.default as SceneComponent,
    }));
  }
  return scenePromise;
}

export function OpeningBackdrop({
  stageRef,
  opacity,
}: {
  stageRef: RefObject<HTMLElement | null>;
  opacity: MotionValue<number>;
}) {
  const [Scene, setScene] = useState<SceneComponent | null>(null);

  /*
   * Mờ dần ở đoạn cuối sân khấu, không phải ngay từ đầu: suốt hai màn đầu tiên
   * cảnh phải hiện đủ, chỉ tới khi khối "Lĩnh vực hành nghề" chuẩn bị lên thì nó
   * mới nhường chỗ. Làm ở lớp bọc chứ không làm trong cảnh vì đây chỉ là một
   * phép biến đổi độ mờ — compositor lo trọn vẹn, không tốn khung hình nào của
   * luồng chính.
   */
  /*
   * Khi đã mờ hẳn thì gỡ luôn khỏi bố cục bằng `display:none`.
   *
   * Không phải để tiết kiệm vài điểm ảnh: khung chứa lúc đó có kích thước bằng
   * không, nên bộ quan sát khung nhìn trong `useThreeStage` coi như cảnh đã ra
   * ngoài màn hình và dừng hẳn vòng lặp vẽ. Chỉ hạ độ mờ về 0 thôi thì canvas
   * vẫn vẽ đủ 30 khung hình mỗi giây một thứ không ai nhìn thấy.
   */
  const [dimmed, setDimmed] = useState(false);
  useEffect(() => {
    const unsubscribe = opacity.on("change", (value) => {
      // Hai ngưỡng lệch nhau, không phải một: dùng chung một mốc thì khi người
      // dùng dừng cuộn đúng ngay tại mốc đó, mỗi rung động nhỏ của con lăn lại
      // bật/tắt cảnh một lần.
      setDimmed((current) => {
        if (current && value > 0.05) return false;
        if (!current && value <= 0.02) return true;
        return current;
      });
    });
    return unsubscribe;
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
          /* Tải hỏng thì phần mở đầu ở nguyên trạng thái không có nền 3D. */
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
       * phần này thì cảnh biến mất đột ngột ở cuối sân khấu thay vì tắt dần.
       */
      style={{ opacity }}
      className={`pointer-events-none absolute inset-0 ${dimmed ? "hidden" : ""}`}
    >
      {/*
        Hiện dần trong 1,4 giây thay vì bật ra. Cảnh tới muộn hơn phần chữ vài
        trăm mili giây, nên nếu nó xuất hiện đột ngột thì người đọc thấy trang
        "giật" một cái ngay khi vừa bắt đầu đọc.
      */}
      <div className="animate-backdrop-in absolute inset-0">
        <Scene stageRef={stageRef} />
      </div>
    </motion.div>
  );
}
