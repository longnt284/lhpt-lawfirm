/*
 * Khối rubik hồ sơ — model 3D dùng chung cho trang chủ và trang "Nền móng pháp lý".
 *
 * ============================================================
 * Vì sao có file này
 * ============================================================
 *
 * Trước đây "vòng đời dự án" có *hai* hình khác nhau: thẻ dẫn đường ở trang chủ
 * vẽ một toà nhà rút gọn, còn trang chi tiết vẽ một toà tháp bốn tầng có nan mặt
 * đứng và cú sét. Hai cảnh viết rời nhau nên chúng trôi mỗi bản một hướng qua
 * từng lần sửa, và người dùng bấm vào thẻ thì thấy một khối khác hẳn thứ vừa dụ
 * họ bấm. Mất đúng cái mà một tấm thẻ xem trước phải làm được: hứa trước cái sẽ
 * thấy.
 *
 * Nên hình học và chuyển động gom hết về đây, còn hai cảnh chỉ khác nhau ở chỗ
 * *cái gì điều khiển tiến trình ghép*: trang chi tiết lấy tiến trình cuộn, trang
 * chủ lấy một vòng lặp thời gian. Cùng một khối, cùng một hạt ngẫu nhiên, cùng
 * một bảng màu — đổi một dòng ở đây là hai nơi cùng đổi.
 *
 * ============================================================
 * Hình và nghĩa
 * ============================================================
 *
 * Khối là một rubik 3×3×3 ghép từ 26 khối con (bỏ khối lõi, nó không bao giờ lộ
 * ra). Lúc chưa ghép, các mảnh nằm rải rác quanh chỗ của mình như mảnh thiên
 * thạch vừa vỡ: xa tâm, xoay lệch, mờ. Tiến trình chạy tới đâu thì từng đợt mảnh
 * bay về đúng ô của nó tới đó, và khi mảnh cuối vào chỗ thì khối liền lại thành
 * một hình duy nhất.
 *
 * Năm đợt mảnh khớp đúng năm giai đoạn pháp lý của một dự án:
 *
 *   0 · nền móng     — cả tầng đáy, chín mảnh
 *   1 · cột trụ      — bốn mảnh góc của tầng giữa
 *   2 · sàn và dầm   — bốn mảnh cạnh còn lại của tầng giữa
 *   3 · mái          — vành tám mảnh của tầng trên
 *   4 · mảnh khoá    — đúng một mảnh, đóng lại mặt trên
 *
 * Đợt cuối chỉ một mảnh là có chủ đích: thiếu nó thì khối vẫn hở một lỗ ngay
 * giữa mặt trên, ai nhìn cũng thấy. Đó là toàn bộ điều trang muốn nói về giai
 * đoạn cuối của một hồ sơ.
 *
 * Khi đã liền khối, cứ vài giây một tầng lại xoay chín mươi độ đúng kiểu rubik
 * rồi *đứng nguyên ở vị trí mới* — không quay ngược lại. Đây là chuyển động duy
 * nhất trong cảnh đủ nhanh để người ta dừng mắt, và nó được phép vì nó nói rằng
 * hồ sơ đã liền khối thì mới xoay xở được.
 *
 * ============================================================
 * Ba quyết định kỹ thuật
 * ============================================================
 *
 * **Một lệnh vẽ cho toàn bộ đường nét.** Hai mươi sáu khối con, mỗi khối mười
 * hai cạnh, nếu mỗi khối một `LineSegments` thì hai mươi sáu lệnh vẽ. Ở đây tất
 * cả nằm chung một BufferGeometry và toạ độ được tính lại bằng CPU mỗi khung
 * hình: 624 đỉnh nhân một ma trận là chi phí không đáng kể, còn số lệnh vẽ giảm
 * còn một.
 *
 * **Độ mờ nướng vào màu đỉnh.** Kênh màu bốn thành phần, three.js nhân alpha đó
 * với `material.opacity`. Nhờ vậy mảnh đang bay xa mờ hơn mảnh đã vào chỗ, mảnh
 * góc đậm hơn mảnh giữa mặt — tầng bậc thị giác đầy đủ mà vẫn đúng một lệnh vẽ.
 *
 * **Ngẫu nhiên có hạt giống.** Vị trí mảnh vỡ do một bộ sinh số giả ngẫu nhiên
 * quyết định, hạt giống cố định. Hai cảnh vì thế vỡ ra *giống hệt nhau*, và mỗi
 * lần tải lại trang cũng vậy — đúng ý đồ "một model duy nhất" chứ không phải hai
 * bản na ná.
 */
import * as THREE from "three";

/* Màu lấy đúng từ bảng thương hiệu trong index.css. */
export const BRASS = new THREE.Color(0xc9a44c);
export const BRASS_SOFT = new THREE.Color(0xdfc27d);
export const FOG = new THREE.Color(0x9db0c4);
export const JADE = new THREE.Color(0x22c49c);
export const JADE_SOFT = new THREE.Color(0x7ce8cd);

export const RUBIK_WAVES = 5;

const HALF_PI = Math.PI / 2;
const AXES = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
] as const;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/*
 * Bộ sinh số giả ngẫu nhiên 32 bit (mulberry32). Dùng `Math.random` thì trường
 * mảnh vỡ đổi sau mỗi lần tải, và hai cảnh trên hai trang sẽ không bao giờ vỡ
 * giống nhau — mất luôn cái cảm giác "vẫn là khối ấy" khi bấm từ thẻ vào trang.
 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mười hai cạnh của khối lập phương đơn vị, tính sẵn thành 24 đỉnh. */
const EDGE_TEMPLATE: THREE.Vector3[] = (() => {
  const c: Array<[number, number, number]> = [];
  for (const x of [-0.5, 0.5]) for (const y of [-0.5, 0.5]) for (const z of [-0.5, 0.5]) c.push([x, y, z]);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < c.length; i++) {
    for (let j = i + 1; j < c.length; j++) {
      // Hai đỉnh kề nhau khi lệch nhau đúng một trục.
      const diff =
        Number(c[i][0] !== c[j][0]) + Number(c[i][1] !== c[j][1]) + Number(c[i][2] !== c[j][2]);
      if (diff !== 1) continue;
      points.push(new THREE.Vector3(...c[i]), new THREE.Vector3(...c[j]));
    }
  }
  return points;
})();

const EDGE_POINTS = EDGE_TEMPLATE.length; // 24

/**
 * Đợt ghép của một ô lưới. Xem sơ đồ năm đợt ở đầu file — thứ tự này phải khớp
 * với FOUNDATION_STAGES, nên sửa một bên thì phải sửa cả bên kia.
 */
function waveOf(x: number, y: number, z: number) {
  if (y === -1) return 0;
  if (y === 0) return Math.abs(x) === 1 && Math.abs(z) === 1 ? 1 : 2;
  return x === 0 && z === 0 ? 4 : 3;
}

/*
 * Độ đậm của một khối con theo vai trò của nó trong hình.
 *
 * Cho cả hai mươi sáu khối cùng một độ đậm thì mắt nhận về một mớ lưới đều tăm
 * tắp — đúng thứ làm hỏng mọi hình dây. Khối góc giữ lấy hình nên đậm nhất, khối
 * giữa mặt lùi hẳn về sau, và nhờ chênh lệch đó mà khối đọc ra là một hình có
 * cạnh chứ không phải một đám ô vuông.
 */
function edgeAlphaOf(x: number, y: number, z: number) {
  const rank = Math.abs(x) + Math.abs(y) + Math.abs(z);
  if (rank === 3) return 0.62;
  if (rank === 2) return 0.4;
  return 0.26;
}

const WAVE_COLORS = [BRASS, BRASS, FOG, BRASS_SOFT, JADE];

type Cubie = {
  /** Ô lưới đích, tính bằng số ô (−1, 0, 1). Đổi sau mỗi cú xoay tầng. */
  cell: THREE.Vector3;
  /** Hướng đích. Cũng đổi sau mỗi cú xoay tầng. */
  base: THREE.Quaternion;
  /** Chỗ mảnh nằm khi chưa ghép. */
  debris: THREE.Vector3;
  /** Hướng mảnh khi chưa ghép. */
  tumble: THREE.Quaternion;
  /** Trục và tốc độ trôi lúc còn lơ lửng. */
  spinAxis: THREE.Vector3;
  spinRate: number;
  phase: number;
  wave: number;
  /** Thứ tự trong đợt, 0→1: mảnh vào chỗ lần lượt chứ không bật ra cùng lúc. */
  delay: number;
  /** Mảnh có nằm trong tầng đang xoay hay không. */
  twisting: boolean;
  color: THREE.Color;
  edgeAlpha: number;
};

export type RubikFrame = {
  /** Tiến trình ghép của đợt thứ `wave`, 0 = còn là mảnh vỡ, 1 = đã vào chỗ. */
  waveProgress: (wave: number) => number;
  elapsed: number;
  delta: number;
  /** Hệ số sáng chung; 1 là mức chuẩn, rê chuột thì cảnh ngoài đẩy lên. */
  glow?: number;
  /** Cho phép cú xoay tầng tự chạy khi khối đã liền. */
  allowTwist?: boolean;
  /** Người dùng bật "giảm chuyển động": tắt mọi chuyển động tự thân. */
  reduced?: boolean;
};

export type RubikModel = {
  /** Khối đã dựng xong; cảnh ngoài tự quyết định xoay/dời nó thế nào. */
  group: THREE.Group;
  /** Nửa cạnh khối lúc liền, dùng để canh khung hình. */
  half: number;
  /** Bán kính trường mảnh vỡ, dùng để canh khung hình lúc chưa ghép. */
  reach: number;
  /**
   * Cập nhật một khung hình. Trả về cường độ loé 0→1 của cú xoay tầng đang chạy,
   * để cảnh ngoài đồng bộ những thứ nằm ngoài khối (lưới nền, bụi) với nó.
   */
  update: (frame: RubikFrame) => number;
  dispose: () => void;
};

export type RubikOptions = {
  /** Khoảng cách tâm hai ô liền nhau. Cạnh khối lúc liền là 3 lần số này. */
  cell?: number;
  /** Tỉ lệ cạnh khối con so với ô lưới; phần chênh ra là khe hở giữa các mảnh. */
  fillRatio?: number;
  /** Mảnh vỡ văng xa cỡ nào so với nửa cạnh khối. */
  burst?: number;
  /** Giây giữa hai cú xoay tầng. Đặt 0 để tắt hẳn. */
  twistEvery?: number;
  twistSpan?: number;
  seed?: number;
};

export function createRubik({
  cell = 1.2,
  fillRatio = 0.84,
  burst = 2.1,
  twistEvery = 7.5,
  twistSpan = 1.15,
  seed = 20240517,
}: RubikOptions = {}): RubikModel {
  const random = mulberry32(seed);
  const group = new THREE.Group();
  const size = cell * fillRatio;
  const half = cell * 1.5;

  /* ---------- dựng danh sách khối con ---------- */
  const cubies: Cubie[] = [];
  for (const y of [-1, 0, 1]) {
    for (const x of [-1, 0, 1]) {
      for (const z of [-1, 0, 1]) {
        // Khối lõi không có mặt nào lộ ra: dựng nó chỉ tốn thêm 24 đỉnh mỗi
        // khung hình để vẽ một thứ luôn bị chính vỏ ngoài che.
        if (x === 0 && y === 0 && z === 0) continue;

        const wave = waveOf(x, y, z);
        /*
         * Mảnh vỡ văng ra *theo hướng của chính nó so với tâm*, không phải rải
         * đều trong một quả cầu. Nhờ vậy trường mảnh vỡ vẫn giữ dáng khối lập
         * phương đang nở ra — mắt đọc ra ngay là "một khối vừa vỡ", chứ không
         * phải "một đám mảnh tình cờ đứng gần nhau".
         */
        const dir = new THREE.Vector3(x, y, z).normalize();
        const distance = half * burst * (0.62 + random() * 0.75);
        const debris = dir.clone().multiplyScalar(distance);
        // Lệch ngang một chút cho khỏi thẳng hàng tăm tắp trên các tia toả.
        debris.x += (random() - 0.5) * cell * 1.6;
        debris.y += (random() - 0.5) * cell * 1.6;
        debris.z += (random() - 0.5) * cell * 1.6;

        const spinAxis = new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
        const tumble = new THREE.Quaternion().setFromAxisAngle(spinAxis, random() * Math.PI * 2);

        cubies.push({
          cell: new THREE.Vector3(x, y, z),
          base: new THREE.Quaternion(),
          debris,
          tumble,
          spinAxis,
          spinRate: 0.22 + random() * 0.3,
          phase: random() * Math.PI * 2,
          wave,
          delay: 0,
          twisting: false,
          color: WAVE_COLORS[wave].clone(),
          edgeAlpha: edgeAlphaOf(x, y, z),
        });
      }
    }
  }

  /*
   * Thứ tự vào chỗ trong một đợt: quét vòng quanh trục đứng. Xếp theo chỉ số
   * mảng thì mảnh nhảy từ góc này sang góc đối diện, nhìn ra một dãy số chứ
   * không ra một động tác; quét vòng thì cả đợt đọc như một bàn tay đặt từng
   * mảnh xuống.
   */
  for (let wave = 0; wave < RUBIK_WAVES; wave++) {
    const inWave = cubies.filter((c) => c.wave === wave);
    inWave.sort(
      (a, b) =>
        Math.atan2(a.cell.z, a.cell.x) - Math.atan2(b.cell.z, b.cell.x) || a.cell.y - b.cell.y
    );
    inWave.forEach((c, index) => {
      c.delay = inWave.length > 1 ? index / (inWave.length - 1) : 0;
    });
  }

  /* ---------- đường nét: một lệnh vẽ cho cả khối ---------- */
  const edgePositions = new Float32Array(cubies.length * EDGE_POINTS * 3);
  const edgeColors = new Float32Array(cubies.length * EDGE_POINTS * 4);
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute("position", new THREE.BufferAttribute(edgePositions, 3));
  edgeGeometry.setAttribute("color", new THREE.BufferAttribute(edgeColors, 4));
  const edgeMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    opacity: 1,
  });
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  // Trường mảnh vỡ trải rộng hơn khối nhiều lần, mà bán kính bao lại tính từ
  // khung hình đầu tiên: để three.js tự tính thì mảnh bay xa bị cắt khỏi cảnh.
  edges.frustumCulled = false;
  group.add(edges);

  const edgePositionAttribute = edgeGeometry.getAttribute("position") as THREE.BufferAttribute;
  const edgeColorAttribute = edgeGeometry.getAttribute("color") as THREE.BufferAttribute;

  /* ---------- ruột khối: một vệt mực loãng cho ra thể tích ---------- */
  /*
   * Không có lớp này thì hai mươi sáu bộ khung dây chồng lên nhau và mắt không
   * còn phân biệt được mặt trước với mặt sau. Nó cố tình rất mờ: đủ để đọc ra
   * thể tích, không đủ để tranh chỗ với đường nét.
   */
  const fillGeometry = new THREE.BoxGeometry(1, 1, 1);
  const fillMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const fills = new THREE.InstancedMesh(fillGeometry, fillMaterial, cubies.length);
  fills.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  fills.frustumCulled = false;
  group.add(fills);

  /* ---------- cú xoay tầng ---------- */
  /*
   * `MeshBasicMaterial` được vẽ theo instance thì alpha không đổi được theo từng
   * instance — chỉ có màu. Trên nền ink-950 gần đen, nhân màu với một hệ số cho
   * ra gần đúng cảm giác của giảm alpha, nên mảnh đang bay vẫn mờ hơn mảnh đã
   * vào chỗ mà không phải viết shader riêng.
   */
  let twistActive = false;
  let twistT = 0;
  let twistAxis = 0;
  let twistLayer = 0;
  let twistDir = 1;
  let twistMembers: Cubie[] = [];
  let nextTwistAt = twistEvery;

  const tmpPosition = new THREE.Vector3();
  const tmpTarget = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();
  const tmpTargetQuat = new THREE.Quaternion();
  const tmpMatrix = new THREE.Matrix4();
  const tmpScale = new THREE.Vector3();
  const tmpColor = new THREE.Color();
  const tmpFill = new THREE.Color();
  const twistQuat = new THREE.Quaternion();
  const vertex = new THREE.Vector3();

  const startTwist = (elapsed: number) => {
    twistAxis = Math.floor(random() * 3);
    twistLayer = Math.floor(random() * 3) - 1;
    twistDir = random() < 0.5 ? -1 : 1;
    const key = twistAxis === 0 ? "x" : twistAxis === 1 ? "y" : "z";
    twistMembers = cubies.filter((c) => Math.round(c.cell[key]) === twistLayer);
    twistMembers.forEach((c) => (c.twisting = true));
    // Tầng giữa của một trục chỉ có tám mảnh và không chứa mảnh góc nào; xoay nó
    // vẫn đúng luật rubik, nên không cần loại trừ.
    twistActive = twistMembers.length > 0;
    twistT = 0;
    if (!twistActive) nextTwistAt = elapsed + twistEvery;
  };

  const bakeTwist = () => {
    const axis = AXES[twistAxis];
    twistQuat.setFromAxisAngle(axis, HALF_PI * twistDir);
    twistMembers.forEach((c) => {
      c.cell.applyQuaternion(twistQuat);
      // Chặn trôi số: sau vài chục cú xoay, sai số dấu phẩy động đủ để một mảnh
      // lệch khỏi lưới và cú xoay sau chọn nhầm tầng.
      c.cell.set(Math.round(c.cell.x), Math.round(c.cell.y), Math.round(c.cell.z));
      c.base.premultiply(twistQuat).normalize();
      c.twisting = false;
    });
    twistMembers = [];
    twistActive = false;
  };

  return {
    group,
    half,
    reach: half * burst * 1.4,

    update({ waveProgress, elapsed, delta, glow = 1, allowTwist = true, reduced = false }) {
      /* ---------- nhịp cú xoay tầng ---------- */
      let assembled = 1;
      for (let wave = 0; wave < RUBIK_WAVES; wave++) {
        assembled = Math.min(assembled, waveProgress(wave));
      }

      if (reduced || !allowTwist || twistEvery <= 0) {
        if (twistActive) bakeTwist();
        nextTwistAt = elapsed + twistEvery;
      } else if (twistActive) {
        twistT += delta / twistSpan;
        if (twistT >= 1) {
          bakeTwist();
          nextTwistAt = elapsed + twistEvery;
        }
      } else if (assembled > 0.985 && elapsed >= nextTwistAt) {
        startTwist(elapsed);
      } else if (assembled <= 0.985) {
        // Khối chưa liền thì chưa xoay được: đẩy hẹn giờ theo để cú xoay đầu
        // tiên rơi vào một nhịp *sau* khi mảnh cuối vào chỗ, không phải ngay lúc
        // đó.
        nextTwistAt = elapsed + twistEvery * 0.5;
      }

      const twistEase = twistActive ? easeInOutCubic(clamp01(twistT)) : 0;
      const flare = twistActive ? Math.sin(clamp01(twistT) * Math.PI) : 0;
      if (twistActive) {
        twistQuat.setFromAxisAngle(AXES[twistAxis], HALF_PI * twistDir * twistEase);
      }

      /* ---------- từng mảnh ---------- */
      const positions = edgePositionAttribute.array as Float32Array;
      const colors = edgeColorAttribute.array as Float32Array;

      cubies.forEach((c, index) => {
        /*
         * Mảnh trong cùng một đợt lệch pha nhau: mảnh đầu đã hạ xuống trong khi
         * mảnh cuối còn đang bay. `1 - STAGGER` ở mẫu số giữ cho mảnh cuối vẫn
         * kịp về chỗ đúng lúc đợt kết thúc.
         */
        const STAGGER = 0.45;
        const raw = clamp01((waveProgress(c.wave) - c.delay * STAGGER) / (1 - STAGGER));
        const t = easeOutQuint(raw);

        /* vị trí xuất phát: mảnh còn lơ lửng thì trôi rất chậm quanh chỗ của nó */
        tmpPosition.copy(c.debris);
        if (!reduced && raw < 1) {
          const wobble = (1 - raw) * cell * 0.34;
          tmpPosition.x += Math.sin(elapsed * 0.42 + c.phase) * wobble;
          tmpPosition.y += Math.cos(elapsed * 0.35 + c.phase * 1.3) * wobble;
          tmpPosition.z += Math.sin(elapsed * 0.29 + c.phase * 0.7) * wobble;
        }

        /* vị trí đích, đã tính cả cú xoay tầng đang chạy */
        tmpTarget.copy(c.cell).multiplyScalar(cell);
        tmpTargetQuat.copy(c.base);
        const twisting = twistActive && c.twisting;
        if (twisting) {
          tmpTarget.applyQuaternion(twistQuat);
          tmpTargetQuat.premultiply(twistQuat);
        }

        tmpPosition.lerp(tmpTarget, t);

        /* hướng: mảnh đang bay thì tự quay, càng gần chỗ càng thẳng lại */
        if (raw < 1) {
          tmpQuat.setFromAxisAngle(c.spinAxis, reduced ? 0 : elapsed * c.spinRate);
          tmpQuat.multiply(c.tumble);
          tmpQuat.slerp(tmpTargetQuat, smoothstep(0, 1, t));
        } else {
          tmpQuat.copy(tmpTargetQuat);
        }

        /*
         * Một nhịp nảy rất ngắn ngay lúc mảnh chạm chỗ. Không có nó thì mảnh
         * "dừng" chứ không "khớp vào" — chênh nhau đúng cái cảm giác các mảnh
         * ăn khớp với nhau, mà cả hình này sống nhờ nó.
         */
        const snap = raw > 0.82 ? Math.sin((raw - 0.82) / 0.18 * Math.PI) * 0.07 : 0;
        const scale = size * (0.58 + 0.42 * t) * (1 + snap);
        tmpScale.setScalar(scale);

        tmpMatrix.compose(tmpPosition, tmpQuat, tmpScale);
        fills.setMatrixAt(index, tmpMatrix);

        /* độ sáng: mảnh còn bay thì mờ, vào chỗ thì đậm; tầng đang xoay loé lên */
        const settle = 0.22 + 0.78 * smoothstep(0, 0.75, t);
        const lit = twisting ? 1 + flare * 0.9 : 1;
        const alpha = Math.min(1, c.edgeAlpha * settle * glow * lit);

        tmpColor.copy(c.color);
        if (twisting && flare > 0.01) tmpColor.lerp(JADE_SOFT, flare * 0.55);
        fills.setColorAt(index, tmpFill.copy(tmpColor).multiplyScalar(settle * glow * 0.9));

        const base = index * EDGE_POINTS;
        for (let i = 0; i < EDGE_POINTS; i++) {
          vertex.copy(EDGE_TEMPLATE[i]).applyMatrix4(tmpMatrix);
          const p = (base + i) * 3;
          positions[p] = vertex.x;
          positions[p + 1] = vertex.y;
          positions[p + 2] = vertex.z;
          const q = (base + i) * 4;
          colors[q] = tmpColor.r;
          colors[q + 1] = tmpColor.g;
          colors[q + 2] = tmpColor.b;
          colors[q + 3] = alpha;
        }
      });

      edgePositionAttribute.needsUpdate = true;
      edgeColorAttribute.needsUpdate = true;
      fills.instanceMatrix.needsUpdate = true;
      if (fills.instanceColor) fills.instanceColor.needsUpdate = true;

      return flare;
    },

    dispose() {
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      fillGeometry.dispose();
      fillMaterial.dispose();
      fills.dispose();
      group.clear();
    },
  };
}
