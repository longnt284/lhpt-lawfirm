/*
 * Cảnh 3D của trang "Bản đồ năng lực".
 *
 * Mỗi khối bát diện là một lĩnh vực hành nghề; các đường nối là những tình huống
 * có thật trong đó một vụ việc bắt đầu ở lĩnh vực này rồi kéo theo lĩnh vực
 * khác. Thông điệp của trang nằm ở chính các đường nối đó, nên chúng sáng lên
 * khi người đọc chọn một lĩnh vực, kèm một chấm chạy dọc đường — hình ảnh hồ sơ
 * đi từ bàn này sang bàn kia.
 *
 * Cảnh này có tương tác, khác cảnh trang "Nền móng". Vì vậy nó cần đọc trạng
 * thái đang chọn của React ở mỗi khung hình. Trạng thái đó đi vào qua ref chứ
 * không qua closure: `setup` chỉ chạy một lần lúc gắn cảnh, nên giá trị bắt được
 * từ lần render đầu sẽ đứng yên mãi mãi.
 */
import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { PRACTICE_LINKS, PRACTICE_NODES } from "../../content/pages3d";
import {
  disposeObject,
  fitDistance,
  useThreeStage,
  visibleWidthAt,
  type StageHandle,
  type StageInit,
} from "../../lib/threeStage";

const BRASS = 0xc9a44c;
const JADE = 0x22c49c;
const FOG = 0x9db0c4;

type SceneChannel = {
  /** Lĩnh vực đang được chọn hoặc đang rê chuột lên. */
  activeRef: RefObject<string | null>;
  /** Giữ callback mới nhất mà không phải dựng lại cảnh. */
  handlersRef: RefObject<{
    onSelect: (id: string) => void;
    onHover: (id: string | null) => void;
  }>;
};

type NodeVisual = {
  id: string;
  group: THREE.Group;
  frame: THREE.LineBasicMaterial;
  core: THREE.PointsMaterial;
  halo: THREE.PointsMaterial;
  hit: THREE.Mesh;
  home: THREE.Vector3;
  intensity: number;
};

type LinkVisual = {
  from: string;
  to: string;
  material: THREE.LineBasicMaterial;
  pulseGeometry: THREE.BufferGeometry;
  pulseMaterial: THREE.PointsMaterial;
  a: THREE.Vector3;
  b: THREE.Vector3;
  offset: number;
  intensity: number;
};

function createPracticeScene(
  { scene, camera, renderer, compact, reduced, width, height, requestFrame }: StageInit,
  { activeRef, handlersRef }: SceneChannel
): StageHandle {
  const root = new THREE.Group();
  scene.add(root);

  const nodes: NodeVisual[] = [];
  const hitMeshes: THREE.Mesh[] = [];
  /*
   * Hình học và vật liệu của vùng bấm dùng chung cho cả năm nút: chúng không
   * bao giờ được vẽ ra, chỉ tồn tại để raycaster có thứ để chạm vào.
   */
  const hitGeometry = new THREE.SphereGeometry(0.85, 8, 6);
  const hitMaterial = new THREE.MeshBasicMaterial();
  // visible=false trên vật liệu: renderer bỏ qua khi vẽ, nhưng raycaster vẫn
  // thấy vật thể. Đây là cách làm vùng bấm rộng hơn phần nhìn thấy.
  hitMaterial.visible = false;

  const frameGeometry = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.5, 0));

  /*
   * Toạ độ các nút được viết cho khung ngang: trải rộng 8,8 đơn vị, cao 8,2. Bê
   * nguyên bố cục đó sang màn điện thoại dựng đứng thì máy quay buộc phải lùi rất
   * xa mới thấy hết bề ngang, và chòm sao co lại thành một cụm nhỏ giữa một khung
   * hình trống trải. Vì vậy màn hẹp dùng bố cục bóp ngang, kéo cao — vẫn đúng
   * quan hệ giữa các nút, chỉ khác dáng khung.
   *
   * Phép co giãn áp vào *toạ độ* chứ không vào tỉ lệ của nhóm: nhân tỉ lệ nhóm
   * theo từng trục sẽ bóp méo luôn cả khối bát diện của mỗi nút.
   */
  const spreadX = compact ? 0.62 : 1;
  const spreadY = compact ? 1.16 : 1;
  const spreadZ = compact ? 0.8 : 1;
  const placeNode = (position: [number, number, number]) =>
    new THREE.Vector3(position[0] * spreadX, position[1] * spreadY, position[2] * spreadZ);

  PRACTICE_NODES.forEach((node) => {
    const accent = node.accent === "jade" ? JADE : BRASS;
    const home = placeNode(node.position);
    const group = new THREE.Group();
    group.position.copy(home);

    const frame = new THREE.LineBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.42,
    });
    group.add(new THREE.LineSegments(frameGeometry, frame));

    const coreGeometry = new THREE.BufferGeometry();
    coreGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
    const core = new THREE.PointsMaterial({
      color: accent,
      size: 0.13,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
    });
    group.add(new THREE.Points(coreGeometry, core));

    /*
     * Bốn hạt vệ tinh ứng với bốn đầu việc của lĩnh vực. Chúng không được gán
     * nhãn — vai trò duy nhất là cho mỗi nút một khối lượng thị giác, để bản đồ
     * trông như một chòm sao chứ không phải năm dấu chấm rời rạc.
     */
    const satelliteCount = node.items.vi.length;
    const satPositions = new Float32Array(satelliteCount * 3);
    for (let i = 0; i < satelliteCount; i++) {
      const angle = (i / satelliteCount) * Math.PI * 2;
      satPositions[i * 3] = Math.cos(angle) * 0.92;
      satPositions[i * 3 + 1] = Math.sin(angle * 1.7) * 0.34;
      satPositions[i * 3 + 2] = Math.sin(angle) * 0.92;
    }
    const haloGeometry = new THREE.BufferGeometry();
    haloGeometry.setAttribute("position", new THREE.BufferAttribute(satPositions, 3));
    const halo = new THREE.PointsMaterial({
      color: FOG,
      size: 0.055,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
      depthWrite: false,
    });
    group.add(new THREE.Points(haloGeometry, halo));

    const hit = new THREE.Mesh(hitGeometry, hitMaterial);
    hit.position.copy(home);
    hit.userData.nodeId = node.id;
    root.add(hit);
    hitMeshes.push(hit);

    root.add(group);
    nodes.push({ id: node.id, group, frame, core, halo, hit, home, intensity: 0 });
  });

  /* ---------- các đường nối giữa lĩnh vực ---------- */
  const links: LinkVisual[] = [];
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
    const material = new THREE.LineBasicMaterial({
      color: FOG,
      transparent: true,
      opacity: 0.12,
    });
    root.add(new THREE.LineSegments(geometry, material));

    const pulseGeometry = new THREE.BufferGeometry();
    pulseGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
    const pulseMaterial = new THREE.PointsMaterial({
      color: BRASS,
      size: 0.1,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      depthWrite: false,
    });
    root.add(new THREE.Points(pulseGeometry, pulseMaterial));

    links.push({
      from: link.from,
      to: link.to,
      material,
      pulseGeometry,
      pulseMaterial,
      a: from.home,
      b: to.home,
      offset: index / PRACTICE_LINKS.length,
      intensity: 0,
    });
  });

  /* ---------- nền sao thưa ---------- */
  const starCount = compact ? 110 : 240;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const radius = 7 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    starPositions[i * 3 + 1] = Math.cos(phi) * radius * 0.55;
    starPositions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: FOG,
    size: 0.04,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  /* ---------- chọn nút bằng con trỏ ---------- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let viewWidth = width;
  let viewHeight = height;
  let pointerInside = false;
  let pointerDirty = false;
  let hovered: string | null = null;

  const canvas = renderer.domElement;

  const updateNdc = (event: PointerEvent | MouseEvent) => {
    // offsetX/offsetY đã là toạ độ trong canvas, nên không phải gọi
    // getBoundingClientRect — tức không ép trình duyệt tính lại layout giữa lúc
    // người dùng đang rê chuột.
    ndc.x = (event.offsetX / viewWidth) * 2 - 1;
    ndc.y = -(event.offsetY / viewHeight) * 2 + 1;
  };

  const onPointerMove = (event: PointerEvent) => {
    pointerInside = true;
    pointerDirty = true;
    updateNdc(event);
    // Cảnh đứng yên khi người dùng bật giảm chuyển động, nên phải tự thúc khung
    // hình thì phần đánh dấu nút dưới con trỏ mới hiện ra.
    requestFrame();
  };

  const onPointerLeave = () => {
    pointerInside = false;
    pointerDirty = true;
    if (hovered) {
      hovered = null;
      canvas.style.cursor = "";
      handlersRef.current?.onHover(null);
    }
    requestFrame();
  };

  const onClick = (event: MouseEvent) => {
    updateNdc(event);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(hitMeshes, false)[0];
    const id = hit?.object.userData.nodeId as string | undefined;
    if (id) handlersRef.current?.onSelect(id);
  };

  canvas.addEventListener("pointermove", onPointerMove, { passive: true });
  canvas.addEventListener("pointerleave", onPointerLeave, { passive: true });
  canvas.addEventListener("click", onClick);

  const pulsePosition = new THREE.Vector3();

  /*
   * Chòm sao trải rộng 8,8 đơn vị và cao 8,2. Khoảng cách máy quay tính ra từ hai
   * số đó theo tỉ lệ khung hình hiện tại: trên điện thoại dựng đứng, khung hẹp
   * hơn nhiều nên máy quay phải lùi xa gấp đôi thì hai nút ngoài cùng mới không
   * bị đẩy ra ngoài mép.
   *
   * Bảng chi tiết đè lên nửa trái, nên trên màn rộng chòm sao dạt sang phải. Màn
   * hẹp thì bảng nằm trên cùng theo chiều dọc, chòm sao cứ để giữa khung.
   */
  let offsetX = 0;
  const reframe = () => {
    // Nửa khung mong muốn, không phải nửa kích thước chòm sao — xem giải thích
    // cùng cách tính ở FoundationScene. Bố cục dọc hẹp hơn nên đích cũng hẹp hơn.
    const wide = camera.aspect > 1.15;
    camera.position.z = wide
      ? fitDistance(camera, 5.5, 5.05, 1)
      : fitDistance(camera, 3.6, 5.4, 1);
    offsetX = wide ? 0.16 * visibleWidthAt(camera, camera.position.z) : 0;
  };
  reframe();

  return {
    resize(nextWidth, nextHeight) {
      viewWidth = nextWidth;
      viewHeight = nextHeight;
      reframe();
    },

    update({ elapsed, delta, pointerX, pointerY }) {
      /*
       * Chòm sao quay rất chậm quanh trục đứng — một vòng mất khoảng hai phút.
       * Đủ để cảm nhận đây là không gian ba chiều chứ không phải một hình vẽ
       * phẳng, nhưng không nhanh tới mức người đọc phải đuổi theo cái mình đang
       * muốn bấm.
       */
      if (!reduced) {
        root.rotation.y = elapsed * 0.052;
        stars.rotation.y = elapsed * -0.012;
      }
      root.rotation.x = pointerY * 0.08;
      root.position.x = offsetX + pointerX * 0.25;

      /*
       * Raycast chỉ chạy khi con trỏ vừa di chuyển hoặc khi cảnh vẫn đang quay
       * dưới con trỏ đứng yên — nút có thể tự trôi vào dưới đầu mũi tên.
       */
      if (pointerInside && (pointerDirty || !reduced)) {
        pointerDirty = false;
        root.updateMatrixWorld();
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(hitMeshes, false)[0];
        const id = (hit?.object.userData.nodeId as string | undefined) ?? null;
        if (id !== hovered) {
          hovered = id;
          canvas.style.cursor = id ? "pointer" : "";
          handlersRef.current?.onHover(id);
        }
      }

      const active = activeRef.current;
      /*
       * Ở chế độ giảm chuyển động chỉ có đúng một khung hình được vẽ cho mỗi thao
       * tác, nên phần chuyển tiếp mềm phải nhảy thẳng tới đích. Nội suy dần ở đây
       * sẽ khiến nút vừa chọn chỉ sáng lên được vài phần trăm rồi dừng lại.
       */
      const ease = reduced ? 1 : 1 - Math.exp(-9 * Math.max(delta, 1 / 120));

      nodes.forEach((node) => {
        const target = node.id === active ? 1 : 0;
        node.intensity += (target - node.intensity) * ease;
        const k = node.intensity;

        node.frame.opacity = 0.42 + k * 0.5;
        node.core.opacity = 0.85 + k * 0.15;
        node.core.size = 0.13 + k * 0.08;
        node.halo.opacity = 0.4 + k * 0.45;
        node.group.scale.setScalar(1 + k * 0.16);
        /*
         * Nút được chọn tự xoay quanh mình nó, kể cả khi cả chòm sao đang đứng
         * yên vì người dùng bật giảm chuyển động — đây là phản hồi trực tiếp cho
         * thao tác vừa rồi, không phải chuyển động tự thân của trang.
         */
        node.group.rotation.y += (0.25 + k * 0.9) * delta;
        node.group.rotation.x = Math.sin(elapsed * 0.3 + node.home.x) * 0.12 * (reduced ? 0 : 1);
      });

      links.forEach((link) => {
        const target = link.from === active || link.to === active ? 1 : 0;
        link.intensity += (target - link.intensity) * ease;
        const k = link.intensity;
        link.material.opacity = 0.12 + k * 0.4;
        link.material.color.setHex(k > 0.5 ? BRASS : FOG);

        link.pulseMaterial.opacity = k * 0.9;
        if (k > 0.01) {
          // Chấm chạy dọc đường nối: hồ sơ đi từ lĩnh vực này sang lĩnh vực kia.
          const t = (elapsed * 0.28 + link.offset) % 1;
          pulsePosition.lerpVectors(link.a, link.b, t);
          const attr = link.pulseGeometry.getAttribute("position") as THREE.BufferAttribute;
          attr.setXYZ(0, pulsePosition.x, pulsePosition.y, pulsePosition.z);
          attr.needsUpdate = true;
        }
      });
    },

    dispose() {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("click", onClick);
      canvas.style.cursor = "";

      disposeObject(root);
      disposeObject(stars);
      /*
       * Vùng bấm và khung bát diện dùng chung một hình học cho cả năm nút, nên
       * traverse ở trên đã gọi dispose nhiều lần trên cùng một đối tượng — điều
       * đó vô hại vì dispose là thao tác lặp lại được. Gọi thêm ở đây là để
       * người đọc thấy rõ ai là chủ sở hữu của mấy tài nguyên dùng chung này.
       */
      hitGeometry.dispose();
      hitMaterial.dispose();
      frameGeometry.dispose();
      scene.remove(root);
      scene.remove(stars);
    },
  };
}

export default function PracticeMapScene({
  activeId,
  onSelect,
  onHover,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const activeRef = useRef<string | null>(activeId);
  const handlersRef = useRef({ onSelect, onHover });

  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    handlersRef.current = { onSelect, onHover };
  }, [onSelect, onHover]);

  /*
   * Deps rỗng có chủ đích: cảnh phải được dựng đúng một lần. Mọi thứ thay đổi
   * theo thời gian đều đi qua hai ref ở trên, nên closure này không cần cập nhật.
   */
  const setup = useCallback(
    (init: StageInit) => createPracticeScene(init, { activeRef, handlersRef }),
    []
  );
  const options = useMemo(
    () => ({
      trackPointer: true,
      fov: 46,
      cameraZ: 11.5,
      /*
       * Cảnh này mạnh tay nhất: nó là chủ thể của cả trang chứ không phải lớp
       * nền, và các nút bát diện phát sáng chính là thứ nói lên "mỗi đường nối
       * là một vụ việc đã đi qua hãng".
       */
      bloom: { threshold: 0.5, strength: 1.0, radius: 1.8 },
    }),
    []
  );
  const { containerRef, supported, requestFrame } = useThreeStage(setup, options);

  /*
   * Chọn lĩnh vực bằng bàn phím hoặc bằng danh sách bên cạnh cũng phải làm cảnh
   * cập nhật, kể cả khi cảnh đang đứng yên vì người dùng bật giảm chuyển động.
   */
  useEffect(() => {
    requestFrame();
  }, [activeId, requestFrame]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0"
      data-webgl={supported ? "on" : "off"}
    >
      {!supported && <StaticFallback />}
    </div>
  );
}

/*
 * Bản tĩnh cho máy không cấp được ngữ cảnh WebGL: máy cũ, trình duyệt tắt tăng
 * tốc phần cứng, hoặc trình điều khiển đồ hoạ nằm trong danh sách bị chặn.
 *
 * Trang "Nền móng pháp lý" đã có sẵn một bản như thế này từ đầu; trang này thì
 * không, nên trên đúng những máy đó nửa phải của trang là một mảng trống hoàn
 * toàn — không hình, không chữ, không dấu hiệu nào cho biết đáng lẽ phải có gì.
 * Đây là chỗ bịt lại khe hở đó.
 *
 * Toạ độ lấy từ chính PRACTICE_NODES, chiếu phẳng theo trục x và y, nên hình ở
 * đây là đúng chòm sao mà cảnh 3D dựng lên, chỉ mất chiều sâu.
 */
function StaticFallback() {
  const project = (node: (typeof PRACTICE_NODES)[number]) => ({
    x: 120 + node.position[0] * 26,
    y: 120 - node.position[1] * 26,
    accent: node.accent,
  });
  const points = new Map(PRACTICE_NODES.map((node) => [node.id, project(node)]));

  return (
    /*
      Khung chứa cảnh cao gần bằng cả trang, nên để svg trải kín inset-0 thì nó
      phóng theo chiều cao và chòm sao nở to gấp mấy lần bản 3D thật. Chốt cạnh
      theo cạnh ngắn hơn của khung nhìn rồi canh giữa thì giữ được đúng tỉ lệ mà
      mắt đã quen từ cảnh có WebGL.
    */
    <svg
      viewBox="0 0 240 240"
      className="absolute top-1/2 left-1/2 h-[min(66vh,66vw)] w-[min(66vh,66vw)] -translate-x-1/2 -translate-y-1/2 opacity-50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    >
      <g className="text-fog-500" opacity="0.4">
        {PRACTICE_LINKS.map((link) => {
          const from = points.get(link.from);
          const to = points.get(link.to);
          if (!from || !to) return null;
          return (
            <line key={`${link.from}-${link.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
          );
        })}
      </g>
      {PRACTICE_NODES.map((node) => {
        const p = points.get(node.id);
        if (!p) return null;
        const r = 9;
        return (
          <g key={node.id} className={node.accent === "jade" ? "text-jade-400" : "text-brass-400"}>
            <path d={`M${p.x} ${p.y - r} L${p.x + r} ${p.y} L${p.x} ${p.y + r} L${p.x - r} ${p.y}Z`} />
            <circle cx={p.x} cy={p.y} r="1.8" fill="currentColor" stroke="none" />
          </g>
        );
      })}
    </svg>
  );
}
