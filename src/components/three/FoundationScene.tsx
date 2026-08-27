/*
 * Cảnh 3D của trang "Nền móng pháp lý".
 *
 * Ý tưởng: hồ sơ pháp lý của một dự án là một *khối liền*, và trên trang này nó
 * được ghép lại ngay trước mắt người đọc. Lúc mới vào, các mảnh còn nằm rải rác
 * trong không gian như mảnh thiên thạch vừa vỡ — đúng trạng thái của một dự án
 * mà mỗi thứ giấy tờ nằm một nơi. Cuộn tới đâu thì một đợt mảnh bay về đúng ô
 * của nó tới đó, và tới giai đoạn cuối thì mảnh khoá đóng lại mặt trên: khối
 * liền, không còn chỗ hở.
 *
 * ============================================================
 * Ba thứ quyết định cảnh này có đáng nhìn hay không
 * ============================================================
 *
 * **1. Hình phải là *một* hình, ở cả hai nơi nó xuất hiện.**
 *
 * Bản trước có hai model khác nhau cho cùng một chủ đề: thẻ dẫn đường ở trang
 * chủ vẽ một toà nhà rút gọn, trang này vẽ một toà tháp bốn tầng. Người dùng bấm
 * vào thẻ vì thấy hình A rồi mở ra hình B. Giờ cả hai gọi chung
 * `createRubik` trong `rubikModel.ts` — cùng khối, cùng hạt ngẫu nhiên, cùng
 * cách vỡ. Trang này chỉ khác ở chỗ tiến trình ghép do *cuộn* quyết định, còn
 * thẻ kia do một vòng lặp thời gian.
 *
 * **2. Lắp ghép, không phải hiện dần.**
 *
 * Mỗi đợt mảnh có *động tác* riêng: bay từ xa về, vừa bay vừa xoay, chậm dần rồi
 * khớp vào chỗ kèm một nhịp nảy rất ngắn. Năm đợt lệch pha nhau nên đợt này đặt
 * xong mới tới đợt kia, thay vì cả khối cùng bật ra ở một mức độ mờ.
 *
 * **3. Cú xoay tầng là cao trào.**
 *
 * Khi mảnh cuối đã vào chỗ, cứ vài giây một tầng của khối lại xoay chín mươi độ
 * đúng kiểu rubik rồi đứng nguyên ở vị trí mới. Đó là thứ duy nhất trên trang
 * chuyển động đủ nhanh để người ta dừng mắt, và nó được phép vì nó đúng là điều
 * trang muốn nói: hồ sơ liền khối thì mới xoay xở được, còn một đống mảnh rời
 * thì không.
 *
 * Toàn bộ cảnh vẫn chỉ gồm đường và điểm, không đèn, không đổ bóng. Độ đậm nhạt
 * nướng sẵn vào màu từng đỉnh nên một lệnh vẽ chứa được nhiều mức sáng khác
 * nhau — nhờ vậy có tầng bậc thị giác mà không tốn thêm lệnh vẽ.
 */
import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import {
  disposeObject,
  fitDistance,
  useThreeStage,
  visibleWidthAt,
  type StageHandle,
  type StageInit,
} from "../../lib/threeStage";
import { smoothstep } from "../../lib/sceneMotion";
import { BRASS, BRASS_SOFT, FOG, RUBIK_WAVES, createRubik } from "./rubikModel";
import { RubikArt } from "../RubikArt";

/*
 * Mốc tiến trình cuộn mà mỗi đợt mảnh bắt đầu bay về, xếp theo đúng thứ tự năm
 * giai đoạn trong FOUNDATION_STAGES. Trang dành mỗi giai đoạn một màn hình chữ,
 * nên khối chữ thứ i nằm giữa khung nhìn khi tiến trình đạt i/4. Cộng thêm quãng
 * chuyển tiếp LAYER_RAMP, mỗi đợt ghép xong gần như đúng lúc người đọc đọc tới
 * đoạn nói về nó — đó là toàn bộ lý do trang này tồn tại, nên hai con số dưới đây
 * phải đi cùng nhau khi sửa.
 *
 * Đợt đầu bắt đầu ở số âm có chủ đích: khi khối dính vừa neo vào khung nhìn thì
 * tiến trình mới bằng 0, mà một sân khấu trống trơn trông như trang bị lỗi. Bắt
 * đầu sớm hơn một nhịp thì tầng đáy đã lấp ló trên đường bay, rồi mới hạ xuống.
 */
const LAYER_STARTS = [-0.07, 0.13, 0.37, 0.6, 0.82];
const LAYER_RAMP = 0.18;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type FoundationChannel = {
  /** Báo về React khi đợt mảnh đang ghép đổi, để thước đo bên lề khớp với hình. */
  onLayerRef: RefObject<(index: number) => void>;
};

function createFoundationScene(
  { scene, camera, compact, reduced }: StageInit,
  { onLayerRef }: FoundationChannel
): StageHandle {
  const root = new THREE.Group();
  scene.add(root);

  /*
   * Khối nhỏ lại trên màn dọc, và đây là quyết định về *bố cục* chứ không phải
   * về hiệu năng — số mảnh không đổi, vì đổi số mảnh là đổi luôn cái hình mà thẻ
   * ở trang chủ đã hứa. Trên màn dọc, thẻ chữ đậu xuống đáy và chiếm gần hai
   * phần ba chiều cao, nên khối chỉ còn dải trên cùng để đứng.
   */
  const model = createRubik({
    cell: compact ? 1.02 : 1.2,
    burst: compact ? 1.85 : 2.1,
    twistEvery: 8,
  });
  root.add(model.group);

  /* ---------- lưới nền ---------- */
  /*
   * Khối lơ lửng trong không gian trống thì mất hết cảm giác về kích thước: to
   * hay nhỏ, xa hay gần, mắt không có gì để so. Một tấm lưới mờ bên dưới giải
   * quyết đúng việc đó, và nó cũng chính là thứ loé lên mỗi lần khối xoay tầng.
   *
   * Nó xuất hiện cùng đợt mảnh đầu tiên — đợt "nền móng" — nên phần chữ và phần
   * hình vẫn nói cùng một điều ở giai đoạn một.
   */
  const groundY = -(model.half + (compact ? 0.95 : 1.3));
  const extent = model.half * (compact ? 2.1 : 2.5);
  const gridStep = compact ? 0.9 : 0.62;
  const gridPositions: number[] = [];
  const gridColors: number[] = [];
  const pushGrid = (a: [number, number, number], b: [number, number, number], alpha: number) => {
    gridPositions.push(...a, ...b);
    gridColors.push(FOG.r, FOG.g, FOG.b, alpha, FOG.r, FOG.g, FOG.b, alpha);
  };
  for (let v = -extent; v <= extent + 0.001; v += gridStep) {
    // Hai trục chính đậm hơn hẳn: một tấm lưới đều tăm tắp không có chỗ nào cho
    // mắt bám vào, còn tim của mặt bằng thì đọc ra ngay.
    const alpha = Math.abs(v) < 0.001 ? 0.46 : 0.16;
    pushGrid([-extent, groundY, v], [extent, groundY, v], alpha);
    pushGrid([v, groundY, -extent], [v, groundY, extent], alpha);
  }
  // Vành đồng đúng bằng hình chiếu của khối: chỗ khối sẽ đáp xuống, thấy được từ
  // trước khi mảnh đầu tiên tới nơi.
  const pad = model.half * 1.12;
  ([
    [[-pad, groundY, -pad], [pad, groundY, -pad]],
    [[pad, groundY, -pad], [pad, groundY, pad]],
    [[pad, groundY, pad], [-pad, groundY, pad]],
    [[-pad, groundY, pad], [-pad, groundY, -pad]],
  ] as Array<[[number, number, number], [number, number, number]]>).forEach(([a, b]) => {
    gridPositions.push(...a, ...b);
    gridColors.push(BRASS.r, BRASS.g, BRASS.b, 0.7, BRASS.r, BRASS.g, BRASS.b, 0.7);
  });

  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
  gridGeometry.setAttribute("color", new THREE.Float32BufferAttribute(gridColors, 4));
  const gridMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  });
  const groundGrid = new THREE.LineSegments(gridGeometry, gridMaterial);
  root.add(groundGrid);

  /* ---------- bụi vàng lơ lửng ---------- */
  /*
   * Lớp hạt này không mang thông tin, nó chỉ giữ cho khoảng trống quanh khối
   * không bị "chết" — và ở đây nó còn làm thêm một việc: cho các mảnh đang bay
   * một cái nền để mắt đo được là chúng đang chuyển động.
   */
  const dustCount = compact ? 90 : 180;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const radius = model.half * 1.6 + Math.random() * model.half * 2.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    dustPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    dustPositions[i * 3 + 1] = Math.cos(phi) * radius * 0.85;
    dustPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    color: BRASS_SOFT,
    size: 0.035,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  root.add(dust);

  /*
   * Khoảng cách máy quay suy ra từ kích thước khối cùng tỉ lệ khung hình, chứ
   * không đặt cứng — màn dọc của điện thoại hẹp hơn màn ngang tới ba lần, nên
   * một con số vừa mắt trên laptop sẽ cắt mất hai bên khối trên điện thoại.
   *
   * Trên màn rộng, chữ chiếm nửa trái nên khối phải dời sang phải mới không nằm
   * khuất dưới lớp phủ tối. Cách dời là cho máy quay ngắm lệch sang trái chứ
   * không dịch chính khối: phối cảnh vẫn đúng, khối vẫn đứng thẳng thay vì bị
   * nhìn xiên.
   */
  let distance = 15;
  let focusOffsetX = 0;
  let focusOffsetY = 0;
  let wideLayout = true;
  let currentLayer = -1;

  const reframe = () => {
    const wide = camera.aspect > 1.15;
    wideLayout = wide;
    /*
     * Màn dọc: khối chỉ được lấy chừng ba phần năm chiều cao khung. Thẻ chữ trên
     * điện thoại cao gần kín màn hình, nên phần duy nhất còn trống cho hình là
     * dải hẹp phía trên nó — một khối canh vừa khung sẽ nằm gọn sau thẻ.
     */
    const fill = wide ? 0.86 : 0.62;
    /*
     * Nửa khung mong muốn tính theo *đường chéo* của khối chứ không theo cạnh:
     * khối xoay liên tục, nên canh vừa đúng khung ở góc chính diện thì nửa vòng
     * sau hai góc bị cắt mất.
     */
    const span = model.half * Math.SQRT2 * 1.06;
    const height = span + Math.abs(groundY) * 0.55;
    distance = fitDistance(camera, span / fill, height / fill, 1);
    focusOffsetX = wide ? -0.17 * visibleWidthAt(camera, distance) : 0;
    /*
     * Ngắm thấp hơn tâm thì vật thể nhô lên cao trong khung — cùng một mẹo với
     * phần dạt ngang của màn rộng, chỉ đổi trục. Trên màn dọc chữ và hình phải
     * chồng lên nhau vì không còn chỗ nào khác, nên chúng chia nhau theo chiều
     * đứng: khối ở dải trên, thẻ chữ đậu xuống đáy.
     */
    const visibleHeight = visibleWidthAt(camera, distance) / camera.aspect;
    focusOffsetY = wide ? 0 : -0.32 * visibleHeight;
  };
  reframe();

  const target = new THREE.Vector3();
  const waveAt = (progress: number, wave: number) =>
    smoothstep(LAYER_STARTS[wave], LAYER_STARTS[wave] + LAYER_RAMP, progress);

  return {
    resize() {
      reframe();
    },

    update({ progress, elapsed, delta, pointerX, pointerY }) {
      const flare = model.update({
        waveProgress: (wave) => waveAt(progress, wave),
        elapsed,
        delta,
        allowTwist: !reduced,
        reduced,
      });

      /*
       * Lưới nền sáng thêm đúng lúc một tầng xoay — cái kết của cả hình ảnh: khối
       * xoay được là nhờ đã đứng trên một mặt bằng liền.
       */
      const grounded = waveAt(progress, 0);
      gridMaterial.opacity = Math.min(1, grounded * (1 + flare * 0.8));
      groundGrid.visible = grounded > 0.01;

      /*
       * Khối đung đưa rất chậm quanh trục đứng thay vì quay tròn liên tục: người
       * đọc luôn nhìn khối từ một góc quen, và chuyển động không bao giờ giành
       * sự chú ý với phần chữ bên cạnh. Phần cộng theo tiến trình cuộn thì có:
       * cuộn hết trang là khối đã tự khoe được ba mặt.
       */
      const sway = reduced ? 0 : Math.sin(elapsed * 0.11) * 0.2;
      /*
       * Góc nhìn giữ ở quãng ba phần tư, không bao giờ chạy qua chính diện. Nhìn
       * thẳng mặt thì một khối lập phương dẹp lại thành lưới 3×3 phẳng — mất
       * sạch chiều sâu, và mắt đọc ra một bảng ô vuông chứ không ra một khối.
       */
      root.rotation.y = -1 + sway + progress * 0.5 + pointerX * 0.16;
      root.rotation.x = pointerY * 0.05;

      if (!reduced) {
        dust.rotation.y = elapsed * 0.02;
        dustMaterial.opacity = 0.3 * (1 + flare * 0.6);
      }

      /*
       * Máy quay lùi ra xa lúc các mảnh còn tản mát rồi tiến lại gần khi khối
       * liền dần. Không phải hiệu ứng thêm thắt: ở tiến trình 0, trường mảnh vỡ
       * trải rộng gấp đôi khối, canh khung theo khối thì nửa số mảnh nằm ngoài
       * khung và khung hình đầu tiên của cả trang gần như trống — đúng lúc trang
       * cần thuyết phục người đọc rằng có gì đó đáng xem.
       */
      const assembled = waveAt(progress, RUBIK_WAVES - 1);
      const pull = lerp(1.5, 1, smoothstep(0, 0.85, progress));
      /*
       * Máy quay bắt đầu cao và chúc xuống, rồi hạ dần về ngang tầm khi khối
       * liền lại: góc chúc xuống mở hết mặt trên và tấm lưới nền ra, còn góc
       * ngang thì đúng cho một khối đã đứng vững.
       */
      /*
       * Máy quay đứng cao và chúc xuống chứ không ngang tầm: mặt trên của khối
       * phải nhìn thấy được, vì mảnh khoá — cao trào của cả trang — đáp xuống
       * đúng giữa mặt đó. Góc chúc hẹp dần khi khối liền lại, cho cảm giác đứng
       * thẳng lên trước một khối đã hoàn chỉnh.
       */
      const lift = lerp(5.4, 3.4, smoothstep(0, 0.9, progress));
      camera.position.set(pointerX * 0.4, lift, distance * pull);
      /*
       * Trên màn dọc, độ dạt đứng giữ nguyên suốt trang chứ không trả dần về
       * tâm: thẻ chữ càng về cuối càng dài, nên đó đúng là lúc khối cần nằm cao
       * nhất, không phải lúc nó được phép tụt xuống giữa khung.
       */
      target.set(focusOffsetX, focusOffsetY - assembled * 0.15, 0);
      camera.lookAt(target);

      /*
       * Thước đo bên lề lấy số từ đúng tiến trình đang điều khiển hình, chứ không
       * tự dò bằng bộ quan sát khung nhìn riêng. Hai nguồn số song song là cách
       * chắc chắn để chữ và hình lệch nhau khi người dùng nhảy cóc trong trang.
       * Chỉ báo khi đổi, nên React không phải render lại mỗi khung hình.
       */
      const layer = Math.max(
        0,
        LAYER_STARTS.reduce((found, start, index) => (progress >= start ? index : found), 0)
      );
      if (layer !== currentLayer) {
        currentLayer = layer;
        onLayerRef.current?.(layer);
      }
    },

    dispose() {
      model.dispose();
      disposeObject(root);
      scene.remove(root);
    },
  };
}

/*
 * `setup` chạy đúng một lần khi gắn cảnh, nên mọi thứ thay đổi theo thời gian
 * phải đi vào qua ref chứ không qua closure — nếu không, cảnh sẽ mãi dùng giá trị
 * của lần render đầu tiên.
 */
export default function FoundationScene({
  scrollRef,
  onLayerChange,
}: {
  scrollRef: RefObject<HTMLElement | null>;
  onLayerChange?: (index: number) => void;
}) {
  const onLayerRef = useRef<(index: number) => void>(() => {});
  useEffect(() => {
    onLayerRef.current = onLayerChange ?? (() => {});
  }, [onLayerChange]);

  const setup = useCallback(
    (init: StageInit) => createFoundationScene(init, { onLayerRef }),
    []
  );
  const options = useMemo(
    () => ({ scrollRef, trackPointer: true, fov: 42, cameraZ: 15 }),
    [scrollRef]
  );
  const { containerRef, supported } = useThreeStage(setup, options);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      {!supported && <StaticFallback />}
    </div>
  );
}

/*
 * Bản tĩnh cho máy không cấp được ngữ cảnh WebGL (máy cũ, trình duyệt tắt tăng
 * tốc phần cứng). Trang vẫn phải có hình, không được để lại một mảng trống — và
 * nó dùng đúng bản vẽ mà thẻ ở trang chủ dùng, nên hai nơi vẫn khớp nhau kể cả
 * trên máy không chạy nổi WebGL.
 */
function StaticFallback() {
  return (
    /*
     * Bản vẽ được đóng khung chứ không trải kín khung nhìn: kéo một khối lập
     * phương ra cả 1440px thì các đường mảnh giãn thành những vệt dài và hình
     * mất hết dáng. Trên màn rộng nó còn dạt sang phải, đúng chỗ mà cảnh 3D thật
     * đứng, để chữ bên trái không bị đường nét cắt ngang.
     */
    <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[9%]">
      <svg
        viewBox="0 0 200 132"
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-[min(78vw,560px)] opacity-70"
        fill="none"
        vectorEffect="non-scaling-stroke"
      >
        <RubikArt />
      </svg>
    </div>
  );
}
