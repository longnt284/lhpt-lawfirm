/*
 * Cảnh 3D của trang "Nền móng pháp lý".
 *
 * Ý tưởng: khối kiến trúc tự dựng lên theo đúng nhịp người đọc cuộn qua từng
 * giai đoạn pháp lý của một dự án — móng, cột, sàn, mái, rồi hệ chống sét. Câu
 * mở đầu của hãng là "Nền pháp lý vững, cho mọi công trình", nên hình ảnh ở đây
 * không phải trang trí ngẫu nhiên mà là chính câu đó được vẽ ra.
 *
 * Toàn bộ cảnh chỉ gồm đường và điểm, không mặt, không đèn, không đổ bóng. Với
 * một trang giới thiệu cần tải nhanh trên 4G thì đó vừa là lựa chọn thẩm mỹ (nét
 * mảnh, gợi bản vẽ kỹ thuật) vừa là lựa chọn hiệu năng: cả khối này tốn chưa tới
 * một phần trăm ngân sách vẽ của một khung hình.
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

/* Màu lấy đúng từ bảng thương hiệu trong index.css. */
const BRASS = 0xc9a44c;
const BRASS_SOFT = 0xdfc27d;
const FOG = 0x9db0c4;
const JADE = 0x22c49c;

const HALF = 2.2;
const GROUND = -3;

/*
 * Mốc tiến trình cuộn mà mỗi tầng bắt đầu hiện ra, xếp theo đúng thứ tự năm giai
 * đoạn trong FOUNDATION_STAGES. Trang dành mỗi giai đoạn một màn hình chữ, nên
 * khối chữ thứ i nằm giữa khung nhìn khi tiến trình đạt i/4. Cộng thêm quãng
 * chuyển tiếp LAYER_RAMP, mỗi tầng dựng xong gần như đúng lúc người đọc đọc tới
 * đoạn nói về nó — đó là toàn bộ lý do trang này tồn tại, nên hai con số dưới đây
 * phải đi cùng nhau khi sửa.
 */
/*
 * Tầng đầu bắt đầu ở số âm có chủ đích: khi khối dính vừa neo vào khung nhìn thì
 * tiến trình mới bằng 0, mà một sân khấu trống trơn trông như trang bị lỗi. Bắt
 * đầu sớm hơn một nhịp thì mặt móng đã mờ mờ hiện sẵn, rồi mới đậm dần lên.
 */
const LAYER_STARTS = [-0.07, 0.13, 0.37, 0.6, 0.82];
const LAYER_RAMP = 0.16;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Chuyển tiếp mềm hai đầu, tránh cảm giác phần tử "bật" ra đột ngột. */
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function buildLines(points: number[], color: number, opacity: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return { object: new THREE.LineSegments(geometry, material), material, peak: opacity };
}

/** Đường khép kín trong mặt phẳng ngang, dùng cho vành sàn và vòng chống sét. */
function ringPoints(radius: number, y: number, sides: number) {
  const points: number[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const b = ((i + 1) / sides) * Math.PI * 2;
    points.push(
      Math.cos(a) * radius, y, Math.sin(a) * radius,
      Math.cos(b) * radius, y, Math.sin(b) * radius
    );
  }
  return points;
}

function rectPoints(half: number, y: number) {
  return [
    -half, y, -half, half, y, -half,
    half, y, -half, half, y, half,
    half, y, half, -half, y, half,
    -half, y, half, -half, y, -half,
  ];
}

type Layer = {
  group: THREE.Group;
  materials: THREE.Material[];
  peaks: number[];
  /** Mốc tiến trình cuộn mà tầng này bắt đầu hiện ra. */
  start: number;
  /** Độ cao tầng trồi lên trong lúc xuất hiện, tạo cảm giác được đặt vào chỗ. */
  rise: number;
};

/*
 * `setup` chạy đúng một lần khi gắn cảnh, nên mọi thứ thay đổi theo thời gian
 * phải đi vào qua ref chứ không qua closure — nếu không, cảnh sẽ mãi dùng giá trị
 * của lần render đầu tiên.
 */
type FoundationChannel = {
  /** Báo về React khi tầng đang dựng đổi, để thước đo bên lề khớp với hình. */
  onLayerRef: RefObject<(index: number) => void>;
};

function createFoundationScene(
  { scene, camera, compact, reduced }: StageInit,
  { onLayerRef }: FoundationChannel
): StageHandle {
  const root = new THREE.Group();
  scene.add(root);

  const layers: Layer[] = [];
  const addLayer = (
    start: number,
    rise: number,
    parts: { object: THREE.Object3D; material: THREE.Material; peak: number }[]
  ) => {
    const group = new THREE.Group();
    parts.forEach((part) => group.add(part.object));
    root.add(group);
    layers.push({
      group,
      materials: parts.map((p) => p.material),
      peaks: parts.map((p) => p.peak),
      start,
      rise,
    });
  };

  /* ---------- tầng 1: nền móng ---------- */
  const gridStep = compact ? 1.1 : 0.734;
  const gridPoints: number[] = [];
  for (let v = -HALF - 0.8; v <= HALF + 0.8 + 0.001; v += gridStep) {
    gridPoints.push(-HALF - 0.8, GROUND, v, HALF + 0.8, GROUND, v);
    gridPoints.push(v, GROUND, -HALF - 0.8, v, GROUND, HALF + 0.8);
  }
  const pilePoints: number[] = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      pilePoints.push(sx * HALF, GROUND, sz * HALF, sx * HALF, GROUND - 0.9, sz * HALF);
    }
  }
  addLayer(LAYER_STARTS[0], 0.35, [
    buildLines(gridPoints, FOG, 0.24),
    buildLines(rectPoints(HALF + 0.25, GROUND + 0.01), BRASS, 0.62),
    buildLines(pilePoints, FOG, 0.4),
  ]);

  /* ---------- tầng 2: cột trụ ---------- */
  const columnTop = 0.2;
  const columnPoints: number[] = [];
  const columnSpots: [number, number][] = [
    [-HALF, -HALF], [HALF, -HALF], [HALF, HALF], [-HALF, HALF],
    [0, -HALF], [0, HALF], [-HALF, 0], [HALF, 0],
  ];
  columnSpots.forEach(([x, z]) => {
    columnPoints.push(x, GROUND, z, x, columnTop, z);
  });
  addLayer(LAYER_STARTS[1], 0.5, [buildLines(columnPoints, BRASS, 0.58)]);

  /* ---------- tầng 3: sàn và dầm ---------- */
  const slabPoints: number[] = [];
  [-1.4, columnTop].forEach((y) => {
    slabPoints.push(...rectPoints(HALF, y));
    // dầm bắt chéo qua giữa sàn: đủ để đọc ra kết cấu, không rối mắt
    slabPoints.push(-HALF, y, 0, HALF, y, 0);
    slabPoints.push(0, y, -HALF, 0, y, HALF);
  });
  addLayer(LAYER_STARTS[2], 0.45, [buildLines(slabPoints, FOG, 0.42)]);

  /* ---------- tầng 4: mái ---------- */
  const ridgeY = 1.9;
  const roofPoints: number[] = [];
  for (const sz of [-1, 1]) {
    roofPoints.push(-HALF, columnTop, sz * HALF, 0, ridgeY, sz * HALF);
    roofPoints.push(HALF, columnTop, sz * HALF, 0, ridgeY, sz * HALF);
  }
  roofPoints.push(0, ridgeY, -HALF, 0, ridgeY, HALF);
  // hai đường hồi mái, cho khối mái có bề dày thị giác
  roofPoints.push(-HALF, columnTop, -HALF, -HALF, columnTop, HALF);
  roofPoints.push(HALF, columnTop, -HALF, HALF, columnTop, HALF);
  addLayer(LAYER_STARTS[3], 0.4, [buildLines(roofPoints, BRASS_SOFT, 0.66)]);

  /* ---------- tầng 5: hệ chống sét ---------- */
  const mastTop = 3.35;
  const mastPoints = [0, ridgeY, 0, 0, mastTop, 0];
  /*
   * Ba vòng đồng tâm quanh đỉnh cột: hình ảnh vùng được bảo vệ. Đây là tầng duy
   * nhất dùng màu ngọc, để mắt nhận ra ngay rằng phần "phòng ngừa tranh chấp"
   * khác bản chất với bốn tầng xây dựng bên dưới.
   */
  const ringParts = [0.55, 1.0, 1.5].map((radius, index) =>
    buildLines(
      ringPoints(radius, mastTop - index * 0.14, compact ? 18 : 32),
      JADE,
      0.34 - index * 0.08
    )
  );
  addLayer(LAYER_STARTS[4], 0.3, [buildLines(mastPoints, JADE, 0.7), ...ringParts]);

  /* ---------- bụi vàng lơ lửng ---------- */
  /*
   * Lớp hạt này không mang thông tin, nó chỉ giữ cho khoảng trống quanh khối
   * kiến trúc không bị "chết". Số lượng cố tình thấp: vài trăm hạt là đủ cảm
   * giác không khí, còn hàng chục nghìn hạt chỉ tổ làm nóng máy.
   */
  const dustCount = compact ? 90 : 180;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const radius = 3.2 + Math.random() * 3.4;
    const angle = Math.random() * Math.PI * 2;
    dustPositions[i * 3] = Math.cos(angle) * radius;
    dustPositions[i * 3 + 1] = GROUND - 0.5 + Math.random() * 7.6;
    dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    color: BRASS_SOFT,
    size: 0.035,
    transparent: true,
    opacity: 0.34,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  root.add(dust);

  const ringObjects = ringParts.map((part) => part.object);

  /*
   * Công trình cao 7,3 đơn vị và rộng 6; khoảng cách máy quay phải suy ra từ hai
   * số đó cùng tỉ lệ khung hình, chứ không đặt cứng — màn dọc của điện thoại hẹp
   * hơn màn ngang tới ba lần, nên một con số vừa mắt trên laptop sẽ cắt mất hai
   * bên công trình trên điện thoại.
   *
   * Trên màn rộng, chữ chiếm nửa trái nên công trình phải dời sang phải mới không
   * nằm khuất dưới lớp phủ tối. Cách dời là cho máy quay ngắm lệch sang trái chứ
   * không dịch chính khối kiến trúc: phối cảnh vẫn đúng, khối vẫn đứng thẳng thay
   * vì bị nhìn xiên.
   */
  let distance = 15.6;
  let focusOffsetX = 0;
  let focusOffsetY = 0;
  let currentLayer = -1;

  /*
   * Hai con số truyền vào fitDistance là nửa khung *mong muốn*, không phải nửa
   * kích thước công trình: công trình cao 7,3 đơn vị và ta muốn nó chiếm khoảng
   * 60% chiều cao khung, nên nửa khung cần 7,3 / 2 / 0,6 ≈ 6. Tương tự theo chiều
   * ngang. Nhờ cách đặt bài toán này, màn ngang bị ràng buộc bởi chiều cao còn màn
   * dọc của điện thoại bị ràng buộc bởi chiều ngang, và cả hai đều ra khung hợp lý
   * mà không phải đặt riêng con số cho từng loại màn.
   */
  const reframe = () => {
    distance = fitDistance(camera, camera.aspect > 1.15 ? 3.8 : 4.3, 6, 1);
    /*
     * Chữ chiếm nửa trái trên màn rộng, nên tâm công trình phải nằm ở khoảng 23%
     * bề rộng tính từ giữa sang phải thì mới lọt vào đúng khoảng trống còn lại.
     */
    const wide = camera.aspect > 1.15;
    /*
     * Màn rộng: chữ chiếm nửa trái, nên công trình dạt sang phải.
     * Màn hẹp: chữ và công trình phải chồng lên nhau vì không còn chỗ nào khác,
     * nên chúng chia nhau theo chiều đứng — công trình ở phần trên khung, thẻ chữ
     * đậu xuống đáy. Ngắm thấp hơn tâm thì vật thể nhô lên cao trong khung, cùng
     * một mẹo với phần dạt ngang, chỉ đổi trục.
     *
     * Cả hai mốc đều canh theo lúc người đọc *dừng lại để đọc*, tức khi khối chữ
     * nằm đúng giữa khung. Lúc đang cuộn thì thẻ chữ có quét ngang qua công trình,
     * nhưng đó là khoảnh khắc trôi qua chứ không phải trạng thái người ta nhìn.
     */
    focusOffsetX = wide ? -0.226 * visibleWidthAt(camera, distance) : 0;
    const visibleHeight = visibleWidthAt(camera, distance) / camera.aspect;
    focusOffsetY = wide ? 0 : -0.22 * visibleHeight;
  };
  reframe();

  return {
    resize() {
      reframe();
    },

    update({ progress, elapsed, pointerX, pointerY }) {
      layers.forEach((layer) => {
        const appear = smoothstep(layer.start, layer.start + LAYER_RAMP, progress);
        layer.group.position.y = (1 - appear) * -layer.rise;
        layer.materials.forEach((material, index) => {
          material.opacity = layer.peaks[index] * appear;
          // Bỏ hẳn lệnh vẽ khi tầng còn vô hình, thay vì vẽ một vật trong suốt.
          material.visible = appear > 0.01;
        });
      });

      /*
       * Khối đung đưa rất chậm quanh trục đứng thay vì quay tròn liên tục: người
       * đọc luôn nhìn công trình từ mặt trước, và chuyển động không bao giờ
       * giành sự chú ý với phần chữ bên cạnh.
       */
      const sway = reduced ? 0 : Math.sin(elapsed * 0.11) * 0.22;
      root.rotation.y = sway + progress * 0.45 + pointerX * 0.16;
      root.rotation.x = pointerY * 0.05;

      if (!reduced) {
        dust.rotation.y = elapsed * 0.02;
        // Vòng chống sét nở ra rồi thu lại như một nhịp thở, chỉ ở tầng cuối.
        const pulse = 1 + Math.sin(elapsed * 0.6) * 0.06;
        ringObjects.forEach((ring, index) => {
          ring.scale.setScalar(pulse - index * 0.01);
        });
      }

      /*
       * Máy quay dâng lên theo tiến trình đọc, đúng bằng nhịp công trình mọc cao:
       * mắt người đọc đi từ móng lên tới đỉnh mà không phải tự xoay góc. Biên độ
       * dâng cố tình nhỏ hơn chiều cao công trình — kéo nhiều hơn thì mỗi thời
       * điểm chỉ còn thấy một lát cắt, và người đọc mất luôn cảm giác đang nhìn
       * một toà nhà.
       */
      const focusY = -0.9 + progress * 1.8;
      camera.position.set(pointerX * 0.4, focusY + 1.5, distance - progress * distance * 0.09);
      camera.lookAt(focusOffsetX, focusY + focusOffsetY, 0);

      /*
       * Thước đo tầng bên lề lấy số từ đúng tiến trình đang điều khiển hình, chứ
       * không tự dò bằng bộ quan sát khung nhìn riêng. Hai nguồn số song song là
       * cách chắc chắn để chữ và hình lệch nhau khi người dùng nhảy cóc trong
       * trang. Chỉ báo khi đổi, nên React không phải render lại mỗi khung hình.
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
      disposeObject(root);
      scene.remove(root);
    },
  };
}

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
 * tốc phần cứng). Trang vẫn phải có hình, không được để lại một mảng trống.
 */
function StaticFallback() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="absolute inset-0 h-full w-full opacity-40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <g className="text-fog-500">
        <path d="M40 190h160M55 190V120M95 190V120M145 190V120M185 190V120" />
        <path d="M55 155h130M55 120h130" />
      </g>
      <g className="text-brass-500">
        <path d="M40 120 120 70l80 50" />
        <path d="M120 70V40" />
      </g>
    </svg>
  );
}
