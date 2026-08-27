/*
 * Hai cảnh 3D thu nhỏ dùng cho khối "Trải nghiệm 3D" ở trang chủ.
 *
 * Cảnh ở đây chỉ có đúng một việc — cho người lướt qua trang chủ thấy ngay rằng
 * phía sau tấm thẻ là một trang dựng bằng đồ hoạ ba chiều, chứ không phải thêm
 * một khối chữ nữa. Một hình động nhỏ nói được điều đó trong nửa giây, một dòng
 * mô tả thì không.
 *
 * Hai cảnh giữ quan hệ khác nhau với trang đích của chúng, và đó là chủ ý:
 *
 *  - Khối rubik hồ sơ là *đúng* model của trang "Nền móng pháp lý", gọi chung
 *    hàm `createRubik` trong `rubikModel.ts`. Trước đây mỗi nơi một hình, và
 *    người dùng bấm vào thẻ vì thấy hình A rồi mở ra hình B — thẻ xem trước mà
 *    hứa sai thì không còn là thẻ xem trước nữa.
 *  - Chòm sao lĩnh vực thì vẫn là bản rút gọn của `PracticeMapScene`: trang thật
 *    có phần chọn lĩnh vực và bảng chữ đi kèm, những thứ không thu nhỏ được vào
 *    một khung rộng 400px mà vẫn đọc ra.
 *
 * Ngoài ra mọi thứ ở đây bị cắt tới mức tối thiểu:
 *
 *  - chỉ đường và điểm, không đèn, không đổ bóng, không hậu kỳ;
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
import { BRASS_SOFT, createRubik } from "./rubikModel";

/*
 * Màu lấy đúng từ bảng thương hiệu trong index.css. Cảnh chòm sao dùng dạng số
 * hex vì nó truyền thẳng vào `color` của vật liệu; khối rubik dùng dạng
 * `THREE.Color` của `rubikModel` vì nó phải trộn màu từng khung hình.
 */
const BRASS = 0xc9a44c;
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

/* ================= cảnh 1: khối rubik hồ sơ ================= */
/*
 * Đúng khối của trang "Nền móng pháp lý", dựng bằng cùng một hàm
 * `createRubik` — không phải một bản vẽ lại cho giống. Đó là toàn bộ điểm của
 * lần sửa này: thẻ hứa hình gì thì bấm vào phải ra đúng hình đó.
 *
 * Khác biệt duy nhất nằm ở *cái gì điều khiển tiến trình ghép*. Trang kia lấy
 * tiến trình cuộn, vì ở đó người đọc đi qua năm màn hình chữ. Trang chủ không có
 * năm màn hình để tiêu, nên ở đây là một vòng lặp: các mảnh bay về ghép thành
 * khối, khối xoay một tầng, rồi vỡ tung ra và ghép lại từ đầu. Người lướt qua
 * bắt được vòng lặp ở bất kỳ đoạn nào cũng đọc ra ngay là "một khối tự ghép".
 */
const CYCLE = 13;
const ASSEMBLE_AT = 0.3;
const WAVE_GAP = 0.55;
const WAVE_RAMP = 1.1;
const BURST_AT = 9.5;
const BURST_SPAN = 0.9;

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

function createFoundationPreview(
  { scene, camera, compact, reduced }: StageInit,
  { hoverRef }: Channel
): StageHandle {
  const root = new THREE.Group();
  scene.add(root);

  /*
   * Số mảnh giữ nguyên trên mọi khổ màn hình — giảm mật độ ở đây là đổi luôn cái
   * hình mà thẻ đang hứa. Thứ co lại là kích thước ô và tầm văng của mảnh vỡ, để
   * cả trường mảnh vẫn nằm gọn trong khung rộng chừng bốn trăm điểm ảnh.
   */
  const model = createRubik({
    cell: compact ? 0.92 : 1.0,
    burst: compact ? 1.7 : 1.95,
    twistEvery: 5.5,
  });
  root.add(model.group);

  /* ---------- bụi vàng ---------- */
  const dustCount = compact ? 40 : 70;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const radius = model.half * 1.5 + Math.random() * model.half * 2.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    dustPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    dustPositions[i * 3 + 1] = Math.cos(phi) * radius * 0.8;
    dustPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    color: BRASS_SOFT,
    size: 0.036,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  root.add(dust);

  /*
   * Lề rộng hơn khối kha khá: khối vừa xoay liên tục vừa có lúc vỡ tung, nên
   * canh khít khung ở trạng thái liền thì lúc vỡ các mảnh bị cắt cụt ở mép thẻ.
   * Đổi lại, lúc liền khối trông hơi nhỏ trong khung — đó là cái giá đúng để
   * trả, vì màn vỡ ra mới là thứ giữ mắt người lướt.
   */
  const reframe = () => {
    const span = model.half * 2.05;
    camera.position.set(0, 0, fitDistance(camera, span, span * 0.94, 1.06));
    camera.lookAt(0, 0, 0);
  };
  reframe();

  let hover = 0;
  /*
   * Đồng hồ riêng chứ không dùng thẳng `elapsed`: rê chuột lên thẻ thì vòng lặp
   * chạy nhanh thêm một chút, và cách duy nhất để tăng tốc mà không làm cả cảnh
   * nhảy một nhịp là cộng dồn delta đã nhân hệ số.
   */
  let clock = 0;

  return {
    resize() {
      reframe();
    },

    update({ delta }) {
      const ease = reduced ? 1 : 1 - Math.exp(-7 * Math.max(delta, 1 / 120));
      hover += ((hoverRef.current ? 1 : 0) - hover) * ease;
      const glow = 1 + hover * 0.32;

      if (reduced) {
        /*
         * Người dùng đã tắt chuyển động: khối đứng nguyên ở trạng thái liền. Nhảy
         * thẳng tới đó là đúng ý họ — họ tắt chuyển động, không tắt hình.
         */
        model.update({
          waveProgress: () => 1,
          elapsed: 0,
          delta: 0,
          glow,
          allowTwist: false,
          reduced: true,
        });
        root.rotation.set(0.16, -0.5, 0);
        return;
      }

      clock += delta * (1 + hover * 0.3);
      const phase = clock % CYCLE;
      /*
       * Màn vỡ dùng đường cong dốc ở đầu, ngược hẳn với màn ghép. Chạy ngược
       * đúng đường cong của màn ghép thì mảnh rời chỗ rất chậm rồi mới nhanh
       * dần — đọc ra là "tan ra", không phải "nổ tung".
       */
      const burst = 1 - easeOutQuart(clamp01((phase - BURST_AT) / BURST_SPAN));

      const flare = model.update({
        waveProgress: (wave) => {
          const at = ASSEMBLE_AT + wave * WAVE_GAP;
          return Math.min(smoothstep(at, at + WAVE_RAMP, phase), burst);
        },
        elapsed: clock,
        delta,
        glow,
        allowTwist: true,
      });

      /*
       * Vòng quay khoảng 40 giây. Chậm tới mức không giành sự chú ý với phần chữ
       * bên cạnh, nhưng vẫn đủ để mắt bắt được rằng đây là một khối ba chiều chứ
       * không phải hình vẽ phẳng. Rê chuột thì nhanh lên chừng 30%.
       */
      root.rotation.y = -0.5 + clock * 0.155;
      root.rotation.x = 0.2 + Math.sin(clock * 0.24) * 0.05;
      dust.rotation.y = clock * -0.05;
      dustMaterial.opacity = 0.3 * glow * (1 + flare * 0.5);
    },

    dispose() {
      model.dispose();
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
  onReady,
}: {
  variant: PreviewVariant;
  hovered: boolean;
  /** Gọi khi cảnh đã vẽ xong khung hình đầu, hoặc khi nó mất khả năng vẽ. */
  onReady?: (ready: boolean) => void;
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
  const options = useMemo(
    () => ({ fov: 40, cameraZ: 9, maxPixelRatio: 1.5, maxFps: 30 }),
    []
  );
  const { containerRef, ready, requestFrame } = useThreeStage(setup, options);

  /*
   * Bản hình tĩnh nằm dưới canvas chỉ được phép mờ đi khi cảnh đã thực sự vẽ.
   * Trên máy không dựng nổi WebGL, `ready` không bao giờ bật, nên bản tĩnh ở
   * lại — thay vì thẻ trở thành một ô đen như bản trước.
   */
  useEffect(() => {
    onReady?.(ready);
  }, [ready, onReady]);

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
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
