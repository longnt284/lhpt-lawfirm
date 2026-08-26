/*
 * Hai cảnh 3D thu nhỏ dùng cho khối "Trải nghiệm 3D" ở trang chủ.
 *
 * Đây là bản rút gọn của hai cảnh thật trong `FoundationScene` và
 * `PracticeMapScene`. Mục đích khác hẳn: cảnh thật là nội dung của trang, còn
 * cảnh ở đây chỉ có đúng một việc — cho người lướt qua trang chủ thấy ngay rằng
 * phía sau tấm thẻ là một trang dựng bằng đồ hoạ ba chiều, chứ không phải thêm
 * một khối chữ nữa. Một hình động nhỏ nói được điều đó trong nửa giây, một dòng
 * mô tả thì không.
 *
 * Vì vậy mọi thứ ở đây bị cắt tới mức tối thiểu:
 *
 *  - chỉ đường và điểm, không mặt, không đèn, không đổ bóng, không hậu kỳ;
 *  - mật độ hình học thấp hơn cảnh thật (lưới thưa hơn, ít hạt hơn), vì khung
 *    hiển thị chỉ rộng khoảng 400px — thêm chi tiết vào đó thì mắt không thấy
 *    mà GPU vẫn phải vẽ;
 *  - không raycast, không bắt sự kiện chuột trên canvas. Cả tấm thẻ là một liên
 *    kết, nên canvas phải để con trỏ đi xuyên qua thay vì tranh mất cú bấm.
 *
 * Phần vòng đời (dựng renderer, dừng vẽ khi khuất tầm nhìn hoặc khi tab ẩn, tôn
 * trọng "giảm chuyển động", dọn tài nguyên GPU lúc rời trang) dùng lại nguyên
 * `useThreeStage` — không có lý do gì để viết lại lần thứ ba.
 */
import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { PRACTICE_LINKS, PRACTICE_NODES } from "../../content/pages3d";
import {
  disposeObject,
  fitDistance,
  useThreeStage,
  type StageHandle,
  type StageInit,
} from "../../lib/threeStage";

/* Màu lấy đúng từ bảng thương hiệu trong index.css. */
const BRASS = 0xc9a44c;
const BRASS_SOFT = 0xdfc27d;
const FOG = 0x9db0c4;
const JADE = 0x22c49c;

export type PreviewVariant = "foundation" | "practice";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

type Channel = {
  /** Con trỏ đang nằm trên thẻ chứa cảnh. */
  hoverRef: RefObject<boolean>;
};

/*
 * Một nhóm hình học xuất hiện cùng nhau trong lúc cảnh tự dựng.
 *
 * `peak` phải giữ riêng vì độ mờ của vật liệu bị ghi đè ở mỗi khung hình: nhân
 * thẳng vào `material.opacity` thì sau vài khung hình giá trị tụt về 0 và cả
 * nhóm biến mất.
 */
type Piece = {
  object: THREE.Object3D;
  material: THREE.Material & { opacity: number };
  peak: number;
  /** Giây thứ mấy kể từ lúc cảnh hiện ra thì nhóm này bắt đầu nổi lên. */
  at: number;
  /** Độ cao nhóm trồi lên trong lúc xuất hiện, tạo cảm giác được đặt vào chỗ. */
  rise: number;
};

function lineSegments(points: number[], color: number, opacity: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return { object: new THREE.LineSegments(geometry, material), material };
}

function rectPoints(half: number, y: number) {
  return [
    -half, y, -half, half, y, -half,
    half, y, -half, half, y, half,
    half, y, half, -half, y, half,
    -half, y, half, -half, y, -half,
  ];
}

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

/* ================= cảnh 1: công trình tự dựng ================= */
/*
 * Cùng bộ kết cấu với trang "Nền móng pháp lý" — móng, cột, sàn, mái, hệ chống
 * sét — nhưng dựng theo *thời gian* thay vì theo tiến trình cuộn. Trang chủ
 * không có chỗ cho năm màn hình cuộn, mà đúng cái người lướt qua cần thấy lại là
 * chuyển động dựng lên đó. Nó chạy đúng một lần, ngay lúc thẻ vào khung nhìn,
 * rồi công trình đứng yên và chỉ còn xoay rất chậm.
 */
function createFoundationPreview(
  { scene, camera, compact, reduced }: StageInit,
  { hoverRef }: Channel
): StageHandle {
  const root = new THREE.Group();
  scene.add(root);

  const HALF = 2.0;
  const GROUND = -2.6;
  const COLUMN_TOP = 0.3;
  const RIDGE = 1.8;
  const MAST = 3.0;

  const pieces: Piece[] = [];
  const add = (
    part: { object: THREE.Object3D; material: THREE.Material & { opacity: number } },
    peak: number,
    at: number,
    rise: number
  ) => {
    const holder = new THREE.Group();
    holder.add(part.object);
    root.add(holder);
    pieces.push({ object: holder, material: part.material, peak, at, rise });
  };

  /* ---------- móng ---------- */
  /*
   * Lưới nền thưa hơn cảnh thật khá nhiều. Ở khung rộng chừng 400px, các đường
   * cách nhau dưới ~1 đơn vị dồn lại thành một mảng xám nhoè: tốn đúng chi phí
   * vẽ của một lưới dày mà thị giác lại nhận về ít hơn một lưới thưa.
   */
  const step = compact ? 1.34 : 1.0;
  const reach = HALF + 0.7;
  const grid: number[] = [];
  for (let v = -reach; v <= reach + 0.001; v += step) {
    grid.push(-reach, GROUND, v, reach, GROUND, v);
    grid.push(v, GROUND, -reach, v, GROUND, reach);
  }
  const piles: number[] = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      piles.push(sx * HALF, GROUND, sz * HALF, sx * HALF, GROUND - 0.8, sz * HALF);
    }
  }
  add(lineSegments(grid, FOG, 0.26), 0.26, 0, 0.3);
  add(lineSegments(piles, FOG, 0.42), 0.42, 0.1, 0.3);
  add(lineSegments(rectPoints(HALF + 0.22, GROUND + 0.01), BRASS, 0.66), 0.66, 0.18, 0.3);

  /* ---------- cột ---------- */
  const columns: number[] = [];
  ([[-HALF, -HALF], [HALF, -HALF], [HALF, HALF], [-HALF, HALF], [0, -HALF], [0, HALF], [-HALF, 0], [HALF, 0]] as const)
    .forEach(([x, z]) => columns.push(x, GROUND, z, x, COLUMN_TOP, z));
  add(lineSegments(columns, BRASS, 0.6), 0.6, 0.62, 0.5);

  /* ---------- sàn và dầm ---------- */
  const slabs: number[] = [];
  [-1.2, COLUMN_TOP].forEach((y) => {
    slabs.push(...rectPoints(HALF, y));
    slabs.push(-HALF, y, 0, HALF, y, 0);
    slabs.push(0, y, -HALF, 0, y, HALF);
  });
  add(lineSegments(slabs, FOG, 0.44), 0.44, 1.05, 0.45);

  /* ---------- mái ---------- */
  const roof: number[] = [];
  for (const sz of [-1, 1]) {
    roof.push(-HALF, COLUMN_TOP, sz * HALF, 0, RIDGE, sz * HALF);
    roof.push(HALF, COLUMN_TOP, sz * HALF, 0, RIDGE, sz * HALF);
  }
  roof.push(0, RIDGE, -HALF, 0, RIDGE, HALF);
  roof.push(-HALF, COLUMN_TOP, -HALF, -HALF, COLUMN_TOP, HALF);
  roof.push(HALF, COLUMN_TOP, -HALF, HALF, COLUMN_TOP, HALF);
  add(lineSegments(roof, BRASS_SOFT, 0.7), 0.7, 1.5, 0.4);

  /* ---------- hệ chống sét ---------- */
  add(lineSegments([0, RIDGE, 0, 0, MAST, 0], JADE, 0.72), 0.72, 1.95, 0.3);
  const rings: { material: THREE.LineBasicMaterial; object: THREE.Object3D }[] = [];
  [0.5, 0.92, 1.34].forEach((radius, index) => {
    const part = lineSegments(
      ringPoints(radius, MAST - index * 0.13, compact ? 16 : 26),
      JADE,
      0.36 - index * 0.08
    );
    add(part, 0.36 - index * 0.08, 2.1 + index * 0.12, 0.24);
    rings.push({ material: part.material as THREE.LineBasicMaterial, object: part.object });
  });

  /* ---------- bụi vàng ---------- */
  const dustCount = compact ? 40 : 70;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const radius = 2.9 + Math.random() * 2.6;
    const angle = Math.random() * Math.PI * 2;
    dustPositions[i * 3] = Math.cos(angle) * radius;
    dustPositions[i * 3 + 1] = GROUND - 0.4 + Math.random() * 6.6;
    dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    color: BRASS_SOFT,
    size: 0.036,
    transparent: true,
    opacity: 0.32,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  root.add(dust);

  /*
   * Công trình cao khoảng 6,4 đơn vị (từ đáy cọc tới đỉnh cột thu lôi) và rộng
   * 5,4. Tâm hình học nằm dưới gốc toạ độ nên phải nâng cả khối lên, nếu không
   * máy quay ngắm vào giữa sẽ thấy công trình tụt xuống đáy khung.
   */
  root.position.y = 0.35;

  /*
   * Lề 1,12 chứ không phải khít khung: khối này xoay liên tục, nên đường chéo
   * của nó quét rộng hơn hình chiếu ở góc nhìn chính diện. Canh vừa đúng khung
   * ở một góc thì nửa vòng sau lưới nền bị cắt mất hai mép.
   */
  const reframe = () => {
    camera.position.set(0, 0, fitDistance(camera, 3.1, 3.6, 1.12));
    camera.lookAt(0, 0, 0);
  };
  reframe();

  let hover = 0;

  return {
    resize() {
      reframe();
    },

    update({ elapsed, delta }) {
      const ease = reduced ? 1 : 1 - Math.exp(-7 * Math.max(delta, 1 / 120));
      hover += ((hoverRef.current ? 1 : 0) - hover) * ease;

      pieces.forEach((piece) => {
        /*
         * Ở chế độ giảm chuyển động, cảnh chỉ được vẽ đúng một khung hình mỗi
         * lần có thay đổi, nên màn dựng lên không thể chạy. Nhảy thẳng tới trạng
         * thái hoàn chỉnh là đúng ý người dùng: họ tắt chuyển động, không tắt
         * hình.
         */
        const appear = reduced ? 1 : smoothstep(piece.at, piece.at + 0.85, elapsed);
        piece.object.position.y = (1 - appear) * -piece.rise;
        // Rê chuột lên thẻ thì cả khối sáng thêm một chút — phản hồi đủ để người
        // dùng hiểu đây là thứ bấm được, không phải một tấm ảnh.
        piece.material.opacity = piece.peak * appear * (1 + hover * 0.35);
        piece.material.visible = appear > 0.01;
      });

      if (reduced) {
        root.rotation.y = -0.42;
        return;
      }

      /*
       * Vòng quay khoảng 40 giây. Chậm tới mức không giành sự chú ý với phần
       * chữ bên cạnh, nhưng vẫn đủ để mắt bắt được rằng đây là một khối ba
       * chiều chứ không phải hình vẽ phẳng. Rê chuột thì nhanh lên chừng 60%.
       */
      root.rotation.y = -0.42 + elapsed * (0.155 + hover * 0.09);
      root.rotation.x = Math.sin(elapsed * 0.24) * 0.05 - 0.04;
      dust.rotation.y = elapsed * -0.05;

      const pulse = 1 + Math.sin(elapsed * 0.9) * 0.07;
      rings.forEach((ring, index) => ring.object.scale.setScalar(pulse - index * 0.012));
    },

    dispose() {
      disposeObject(root);
      scene.remove(root);
    },
  };
}

/* ================= cảnh 2: chòm sao các lĩnh vực ================= */
/*
 * Bản thu nhỏ của bản đồ năng lực. Trên trang thật, các đường nối chỉ sáng lên
 * khi người đọc chọn một lĩnh vực; ở đây không có ai chọn cả, nên thay vào đó
 * một chấm sáng chạy vòng dọc từng đường nối. Đó chính là điều trang kia muốn
 * nói — hồ sơ đi từ lĩnh vực này sang lĩnh vực khác — chỉ là nói mà không cần
 * người dùng thao tác gì.
 */
function createPracticePreview(
  { scene, camera, compact, reduced }: StageInit,
  { hoverRef }: Channel
): StageHandle {
  const root = new THREE.Group();
  scene.add(root);

  /*
   * Toạ độ gốc viết cho khung lớn của trang thật (trải 6,7 đơn vị). Khung xem
   * trước gần vuông hơn, nên chòm sao được bóp lại quanh tâm của chính nó thay
   * vì để máy quay lùi ra xa — lùi xa thì các nút co lại thành mấy dấu chấm.
   */
  const SPREAD = compact ? 0.74 : 0.82;
  const CENTER = new THREE.Vector3(0.1, 0.5, 0.1);
  const place = ([x, y, z]: [number, number, number]) =>
    new THREE.Vector3((x - CENTER.x) * SPREAD, (y - CENTER.y) * SPREAD, (z - CENTER.z) * SPREAD);

  /*
   * Khối bát diện gốc chỉ tồn tại để EdgesGeometry đọc ra các cạnh; nó không bao
   * giờ được vẽ. Vẫn giữ tham chiếu để dispose cho đúng vòng đời, dù nó chưa
   * từng chiếm một byte nào phía trình điều khiển đồ hoạ.
   */
  const octahedron = new THREE.OctahedronGeometry(0.46, 0);
  const frameGeometry = new THREE.EdgesGeometry(octahedron);
  const coreGeometry = new THREE.BufferGeometry();
  coreGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));

  type Node = {
    id: string;
    group: THREE.Group;
    frame: THREE.LineBasicMaterial;
    core: THREE.PointsMaterial;
    home: THREE.Vector3;
    at: number;
  };
  const nodes: Node[] = [];

  PRACTICE_NODES.forEach((node, index) => {
    const accent = node.accent === "jade" ? JADE : BRASS;
    const home = place(node.position);
    const group = new THREE.Group();
    group.position.copy(home);

    const frame = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.5 });
    group.add(new THREE.LineSegments(frameGeometry, frame));

    const core = new THREE.PointsMaterial({
      color: accent,
      size: 0.13,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false,
    });
    group.add(new THREE.Points(coreGeometry, core));

    root.add(group);
    nodes.push({ id: node.id, group, frame, core, home, at: index * 0.13 });
  });

  /* ---------- đường nối và chấm chạy ---------- */
  type Link = {
    material: THREE.LineBasicMaterial;
    pulseGeometry: THREE.BufferGeometry;
    pulseMaterial: THREE.PointsMaterial;
    a: THREE.Vector3;
    b: THREE.Vector3;
    offset: number;
    at: number;
  };
  const links: Link[] = [];

  /*
   * Bảy đường nối, mỗi đường một chấm — cả cụm dưới mười lệnh vẽ. Gộp các đường
   * vào một BufferGeometry duy nhất sẽ tiết kiệm hơn nữa, nhưng lúc đó không còn
   * điều khiển được độ mờ của từng đường trong màn dựng lên, và bảy lệnh vẽ thì
   * không phải thứ đáng đi đổi.
   */
  PRACTICE_LINKS.forEach((link, index) => {
    const from = nodes.find((n) => n.id === link.from);
    const to = nodes.find((n) => n.id === link.to);
    if (!from || !to) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [from.home.x, from.home.y, from.home.z, to.home.x, to.home.y, to.home.z],
        3
      )
    );
    const material = new THREE.LineBasicMaterial({ color: FOG, transparent: true, opacity: 0.2 });
    root.add(new THREE.LineSegments(geometry, material));

    const pulseGeometry = new THREE.BufferGeometry();
    pulseGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
    const pulseMaterial = new THREE.PointsMaterial({
      color: BRASS,
      size: 0.11,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
    });
    root.add(new THREE.Points(pulseGeometry, pulseMaterial));

    links.push({
      material,
      pulseGeometry,
      pulseMaterial,
      a: from.home,
      b: to.home,
      offset: index / PRACTICE_LINKS.length,
      at: 0.65 + index * 0.07,
    });
  });

  /* ---------- nền sao thưa ---------- */
  const starCount = compact ? 45 : 80;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const radius = 4.6 + Math.random() * 3.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    starPositions[i * 3 + 1] = Math.cos(phi) * radius * 0.6;
    starPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: FOG,
    size: 0.042,
    transparent: true,
    opacity: 0.32,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  /* Cùng lý do với cảnh công trình: chừa lề cho biên độ quét lúc chòm sao xoay. */
  const reframe = () => {
    camera.position.set(0, 0, fitDistance(camera, 3.4, 3.1, 1.12));
    camera.lookAt(0, 0, 0);
  };
  reframe();

  const pulsePosition = new THREE.Vector3();
  let hover = 0;

  return {
    resize() {
      reframe();
    },

    update({ elapsed, delta }) {
      const ease = reduced ? 1 : 1 - Math.exp(-7 * Math.max(delta, 1 / 120));
      hover += ((hoverRef.current ? 1 : 0) - hover) * ease;
      const glow = 1 + hover * 0.4;

      nodes.forEach((node) => {
        const appear = reduced ? 1 : smoothstep(node.at, node.at + 0.7, elapsed);
        node.frame.opacity = 0.5 * appear * glow;
        node.core.opacity = 0.9 * appear;
        node.core.size = 0.13 + hover * 0.03;
        node.group.scale.setScalar(appear * (1 + hover * 0.1));
        node.group.visible = appear > 0.01;
        if (!reduced) {
          node.group.rotation.y += (0.3 + hover * 0.45) * delta;
          node.group.rotation.x = Math.sin(elapsed * 0.35 + node.home.x) * 0.14;
        }
      });

      links.forEach((link) => {
        const appear = reduced ? 1 : smoothstep(link.at, link.at + 0.55, elapsed);
        link.material.opacity = (0.2 + hover * 0.16) * appear;
        link.material.visible = appear > 0.01;

        if (reduced) {
          link.pulseMaterial.opacity = 0;
          return;
        }
        /*
         * Chấm chạy hết một đường trong khoảng bốn giây rồi quay lại đầu. Nó mờ
         * dần ở hai đầu đường thay vì biến mất đột ngột — nếu không, mắt bắt
         * đúng khoảnh khắc nhảy về và cả hiệu ứng lộ ra là một vòng lặp.
         */
        const t = (elapsed * 0.24 + link.offset) % 1;
        link.pulseMaterial.opacity = Math.sin(t * Math.PI) * (0.55 + hover * 0.35) * appear;
        pulsePosition.lerpVectors(link.a, link.b, t);
        const attr = link.pulseGeometry.getAttribute("position") as THREE.BufferAttribute;
        attr.setXYZ(0, pulsePosition.x, pulsePosition.y, pulsePosition.z);
        attr.needsUpdate = true;
      });

      if (reduced) {
        root.rotation.y = 0.2;
        return;
      }
      /*
       * Chòm sao quay nhanh hơn công trình một chút: nó không có "mặt trước" nên
       * góc nhìn đổi liên tục là điều tự nhiên, còn công trình thì phải giữ mặt
       * chính diện để đọc ra hình dáng.
       */
      root.rotation.y = 0.2 + elapsed * (0.19 + hover * 0.1);
      root.rotation.x = Math.sin(elapsed * 0.2) * 0.08;
      stars.rotation.y = elapsed * -0.03;
      starMaterial.opacity = 0.32 * glow;
    },

    dispose() {
      disposeObject(root);
      disposeObject(stars);
      /*
       * Khung bát diện và điểm lõi dùng chung cho cả năm nút, nên traverse ở
       * trên đã gọi dispose nhiều lần trên cùng một đối tượng — vô hại, vì
       * dispose lặp lại được. Gọi thêm ở đây cho rõ ai là chủ của chúng.
       */
      frameGeometry.dispose();
      octahedron.dispose();
      coreGeometry.dispose();
      scene.remove(root);
      scene.remove(stars);
    },
  };
}

/*
 * Component xuất ra ngoài. Nó được nạp động (xem `ExplorePreview.tsx`) nên chỉ
 * lúc này three.js mới thực sự được tải về — trang chủ ở trạng thái vừa mở
 * không hề đụng tới thư viện đồ hoạ.
 */
export default function ExplorePreviewScene({
  variant,
  hovered,
}: {
  variant: PreviewVariant;
  hovered: boolean;
}) {
  const hoverRef = useRef(hovered);
  useEffect(() => {
    hoverRef.current = hovered;
  }, [hovered]);

  /*
   * Deps rỗng có chủ đích: cảnh phải dựng đúng một lần. `variant` không đổi
   * trong suốt đời của component — mỗi thẻ dựng một cảnh riêng — nên bắt nó từ
   * closure ở đây là an toàn.
   */
  const setup = useCallback(
    (init: StageInit) =>
      variant === "foundation"
        ? createFoundationPreview(init, { hoverRef })
        : createPracticePreview(init, { hoverRef }),
    []
  );
  /*
   * Trần 1,5 thay vì 2: khung này chỉ rộng vài trăm điểm ảnh và chỉ chứa đường
   * mảnh, nên phần nét thêm ở mức 2 gần như không nhìn ra, trong khi số điểm ảnh
   * phải vẽ tăng gần gấp đôi — và ở đây có hai khung chạy cùng lúc.
   */
  const options = useMemo(() => ({ fov: 40, cameraZ: 9, maxPixelRatio: 1.5 }), []);
  const { containerRef, supported, requestFrame } = useThreeStage(setup, options);

  /*
   * Khi người dùng bật "giảm chuyển động", cảnh đứng yên và chỉ vẽ theo yêu cầu.
   * Lúc đó thay đổi trạng thái rê chuột phải tự thúc một khung hình, nếu không
   * thẻ sẽ không phản hồi gì cả.
   */
  useEffect(() => {
    requestFrame();
  }, [hovered, requestFrame]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
        supported ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
