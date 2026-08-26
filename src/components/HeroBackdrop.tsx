/*
 * Lớp bọc quyết định *khi nào* nền 3D của hero được dựng, và khi nào nó biến
 * mất hẳn.
 *
 * Cảnh này khác hai khung xem trước ở khối "Trải nghiệm 3D" đúng một điểm, và
 * điểm đó đổi toàn bộ cách nạp: nó nằm ngay màn hình đầu tiên. Bộ quan sát
 * khung nhìn vô dụng ở đây — nó đã ở trong khung nhìn ngay giây đầu, mà đó lại
 * là giây trình duyệt đang bận nhất: dựng chữ, tính bố cục, vẽ màn hình đầu.
 * Chen một thư viện đồ hoạ vào giữa lúc đó là cách chắc chắn để làm chậm chính
 * cái màn hình mà hiệu ứng định tô điểm.
 *
 * Nên thứ tự ở đây là: trang hiện ra đầy đủ trước → `load` bắn → luồng chính
 * rảnh → lúc đó mới tải mã cảnh → cảnh hiện dần lên trong 1,2 giây. Người dùng
 * không bao giờ phải chờ nó, và nếu máy hoặc mạng không kham nổi thì hero vẫn
 * đúng như trước khi có tính năng này: không có khoảng trống, không có chỗ giữ
 * chỗ, không thiếu gì cả.
 */
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, type ComponentType, type RefObject } from "react";
import { afterPageLoad, shouldRunWebGL } from "../lib/lazyWebgl";

let scenePromise: Promise<{ default: ComponentType }> | null = null;
function loadScene() {
  if (!scenePromise) {
    scenePromise = import("./three/HeroScene").then((mod) => ({
      default: mod.default as ComponentType,
    }));
  }
  return scenePromise;
}

export function HeroBackdrop({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  const reduced = useReducedMotion();
  const [Scene, setScene] = useState<ComponentType | null>(null);

  /*
   * Mờ dần theo tiến trình cuộn qua hero. Làm ở lớp bọc chứ không làm trong
   * cảnh: đây chỉ là một phép biến đổi độ mờ, compositor lo trọn vẹn, không tốn
   * một khung hình nào của luồng chính.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  /*
   * Khi đã mờ hẳn thì gỡ luôn khỏi bố cục bằng `display:none`.
   *
   * Không phải để tiết kiệm vài điểm ảnh: khung chứa lúc đó có kích thước bằng
   * không, nên bộ quan sát khung nhìn trong `useThreeStage` coi như cảnh đã ra
   * ngoài màn hình và dừng hẳn vòng lặp vẽ. Chỉ hạ độ mờ về 0 thôi thì canvas
   * vẫn vẽ đủ 60 khung hình mỗi giây một thứ không ai nhìn thấy.
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
          /* Tải hỏng thì hero ở nguyên trạng thái không có nền 3D. */
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
      style={reduced ? undefined : { opacity }}
      /*
        Cao đúng một màn hình, không phải cao bằng cả section.

        Trên điện thoại, hero xếp chồng chữ rồi tới bảng hồ sơ năng lực nên
        section cao khoảng 1800px — gấp đôi khung nhìn. Cho canvas trải hết chừng
        ấy thì tỉ lệ khung hình rơi xuống quanh 0,2, máy quay buộc phải lùi rất
        xa, và công trình bị đẩy xuống giữa một khung mà quá nửa nằm dưới mép màn
        hình. Khoá vào 100svh thì khung hình của cảnh chính là khung hình người
        dùng đang nhìn, trên mọi thiết bị.

        `-z-10` đặt lớp này xuống dưới nội dung hero mà vẫn nằm trong ngữ cảnh
        xếp lớp của chính section, nhờ section đã có `relative z-10`.
      */
      className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100svh] max-h-full overflow-hidden ${
        dimmed ? "hidden" : ""
      }`}
    >
      {/*
        Hiện dần trong 1,2 giây thay vì bật ra. Cảnh tới muộn hơn phần chữ vài
        trăm mili giây, nên nếu nó xuất hiện đột ngột thì người đọc thấy trang
        "giật" một cái ngay khi vừa bắt đầu đọc.
      */}
      <div className="animate-backdrop-in absolute inset-0">
        <Scene />
      </div>
    </motion.div>
  );
}
