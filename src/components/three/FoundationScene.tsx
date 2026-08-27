/*
 * Cảnh 3D của trang "Nền móng pháp lý".
 *
 * Ý tưởng: một toà tháp *tự lắp ghép* theo đúng nhịp người đọc cuộn qua năm giai
 * đoạn pháp lý của một dự án — móng, cột, sàn, mái, rồi hệ chống sét. Câu mở đầu
 * của hãng là "Nền pháp lý vững, cho mọi công trình", nên hình ở đây không phải
 * trang trí ngẫu nhiên mà là chính câu đó được vẽ ra.
 *
 * ============================================================
 * Ba thứ quyết định cảnh này có đáng nhìn hay không
 * ============================================================
 *
 * **1. Công trình phải có khối, không phải một cái hộp có mái dốc.**
 *
 * Bản trước là đúng một khối vuông đội mái nhọn — thứ hình mà ai cũng vẽ được
 * trong năm giây, và mắt đọc ra "cái nhà" rồi thôi, không có gì để nhìn tiếp.
 * Bản này là một toà tháp — bốn tầng trên màn ngang, hai tầng trên màn dọc: cột
 * có bề dày thật, mỗi sàn có dầm và diềm, mặt đứng có nan chia ô, đỉnh là mái
 * bằng có lan can và buồng kỹ thuật. Cùng một ngân sách vẽ, nhưng có tầng bậc
 * để mắt lần theo.
 *
 * **2. Lắp ghép, không phải hiện dần.**
 *
 * Bản trước mọi tầng đều làm đúng một việc: tăng độ mờ từ 0 lên 1. Năm lần như
 * nhau. Ở đây mỗi bộ phận có *động tác* riêng, và hướng của động tác mang nghĩa:
 * móng và cột **mọc lên** từ dưới đất, còn sàn và mái thì **hạ xuống** đúng chỗ
 * như đang được cẩu vào. Bốn tấm sàn lại lệch pha nhau một nhịp ngắn, nên tầng
 * này đặt xong mới tới tầng kia thay vì cả bốn cùng bật ra.
 *
 * **3. Cú sét là cao trào, không phải ba vòng tròn đứng yên.**
 *
 * Tầng năm nói về tranh chấp, và hệ chống sét là ẩn dụ của chính nó: cú sét vẫn
 * đánh, khác biệt nằm ở chỗ công trình có đường dẫn nó xuống đất hay không. Nên
 * ở đây một xung sáng thật sự chạy từ đỉnh cột thu lôi, xuống mái, tách làm bốn
 * theo bốn cột góc, đổ vào móng — và mặt móng loé lên một nhịp rồi tắt. Cứ chín
 * giây một lần. Đó là thứ duy nhất trên trang này chuyển động đủ nhanh để người
 * ta dừng lại xem, và nó được phép vì nó đúng là điều trang muốn nói.
 *
 * Toàn bộ cảnh vẫn chỉ gồm đường và điểm, không mặt, không đèn, không đổ bóng.
 * Độ đậm nhạt được nướng sẵn vào màu từng đỉnh nên một lệnh vẽ chứa được nhiều
 * mức sáng khác nhau — nhờ vậy có tầng bậc thị giác mà không tốn thêm lệnh vẽ.
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
import { clamp01, smoothstep } from "../../lib/sceneMotion";

/* Màu lấy đúng từ bảng thương hiệu trong index.css. */
const BRASS = new THREE.Color(0xc9a44c);
const BRASS_SOFT = new THREE.Color(0xdfc27d);
const FOG = new THREE.Color(0x9db0c4);
const JADE = new THREE.Color(0x22c49c);
const JADE_SOFT = new THREE.Color(0x7ce8cd);

/* ---------- cao độ, tính theo trục đứng của cảnh ---------- */
const HALF = 2;
const GROUND = -3;
const CAP = 0.34; // bề dày đài cọc
const STOREY = 1.25;

const COLUMN_T = 0.1; // nửa bề dày cột

/*
 * Trục các cột: bốn góc trước, rồi bốn điểm giữa cạnh. Thứ tự này quan trọng —
 * cú sét chỉ chạy theo bốn cột *góc*, tức bốn phần tử đầu mảng.
 */
const CORNERS: Array<[number, number]> = [
  [-HALF, -HALF],
  [HALF, -HALF],
  [HALF, HALF],
  [-HALF, HALF],
];
const COLUMN_SPOTS: Array<[number, number]> = [
  ...CORNERS,
  [0, -HALF],
  [0, HALF],
  [-HALF, 0],
  [HALF, 0],
];

/*
 * Mốc tiến trình cuộn mà mỗi tầng bắt đầu hiện ra, xếp theo đúng thứ tự năm giai
 * đoạn trong FOUNDATION_STAGES. Trang dành mỗi giai đoạn một màn hình chữ, nên
 * khối chữ thứ i nằm giữa khung nhìn khi tiến trình đạt i/4. Cộng thêm quãng
 * chuyển tiếp LAYER_RAMP, mỗi tầng dựng xong gần như đúng lúc người đọc đọc tới
 * đoạn nói về nó — đó là toàn bộ lý do trang này tồn tại, nên hai con số dưới đây
 * phải đi cùng nhau khi sửa.
 *
 * Tầng đầu bắt đầu ở số âm có chủ đích: khi khối dính vừa neo vào khung nhìn thì
 * tiến trình mới bằng 0, mà một sân khấu trống trơn trông như trang bị lỗi. Bắt
 * đầu sớm hơn một nhịp thì mặt móng đã mờ mờ hiện sẵn, rồi mới đậm dần lên.
 */
const LAYER_STARTS = [-0.07, 0.13, 0.37, 0.6, 0.82];
const LAYER_RAMP = 0.16;

/* Chu kỳ và độ dài một cú sét, tính bằng giây. */
const STRIKE_PERIOD = 9;
const STRIKE_SPAN = 2.2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Vec3 = [number, number, number];

/*
 * Gom nhiều đoạn thẳng vào một BufferGeometry duy nhất.
 *
 * Kênh màu có bốn thành phần chứ không ba: three.js bật nhánh màu có alpha trong
 * shader khi thấy thuộc tính color bốn thành phần, và alpha đó được nhân với
 * `material.opacity`. Nhờ vậy một lệnh vẽ chứa được cả đường đậm lẫn đường mờ,
 * mà độ mờ chung của cả bộ phận vẫn điều khiển được từ một chỗ khi nó xuất hiện.
 */
class Batch {
  positions: number[] = [];
  colors: number[] = [];

  add(a: Vec3, b: Vec3, color: THREE.Color, alpha: number) {
    this.positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    this.colors.push(color.r, color.g, color.b, alpha, color.r, color.g, color.b, alpha);
  }

  /** Khung chữ nhật nằm ngang ở cao độ `y`. */
  ring(half: number, y: number, color: THREE.Color, alpha: number) {
    const p: Vec3[] = [
      [-half, y, -half],
      [half, y, -half],
      [half, y, half],
      [-half, y, half],
    ];
    for (let i = 0; i < 4; i++) this.add(p[i], p[(i + 1) % 4], color, alpha);
  }

  /** Đường tròn nằm ngang, dùng cho vòng bảo vệ của cột thu lôi. */
  circle(radius: number, y: number, sides: number, color: THREE.Color, alpha: number) {
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const b = ((i + 1) / sides) * Math.PI * 2;
      this.add(
        [Math.cos(a) * radius, y, Math.sin(a) * radius],
        [Math.cos(b) * radius, y, Math.sin(b) * radius],
        color,
        alpha
      );
    }
  }

  /**
   * Một trụ đứng có bề dày thật: bốn cạnh đứng cộng hai vành ở đầu và chân.
   *
   * Cột của bản trước là *một* đoạn thẳng. Bốn cạnh thay vì một là toàn bộ khác
   * biệt giữa "cái que" và "cây cột" — mắt cần thấy hai mặt bên lệch nhau theo
   * phối cảnh thì mới đọc ra tiết diện.
   */
  post(
    x: number,
    z: number,
    t: number,
    y0: number,
    y1: number,
    color: THREE.Color,
    alpha: number
  ) {
    const corners: Array<[number, number]> = [
      [x - t, z - t],
      [x + t, z - t],
      [x + t, z + t],
      [x - t, z + t],
    ];
    corners.forEach(([cx, cz], i) => {
      this.add([cx, y0, cz], [cx, y1, cz], color, alpha);
      const [nx, nz] = corners[(i + 1) % 4];
      this.add([cx, y1, cz], [nx, y1, nz], color, alpha * 0.7);
      this.add([cx, y0, cz], [nx, y0, nz], color, alpha * 0.45);
    });
  }

  build() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(this.colors, 4));
    return geometry;
  }
}

/**
 * Một bộ phận lắp ghép được: hình học của nó, mốc nó bắt đầu vào chỗ, và hướng
 * nó đi vào.
 *
 * `rise` dương là mọc lên từ dưới, âm là hạ xuống từ trên. Dấu của con số này
 * chính là chỗ mang nghĩa: móng và cột mọc lên khỏi mặt đất, còn sàn và mái được
 * cẩu xuống đặt vào — cùng một dòng mã, hai động tác trái ngược mà ai xem cũng
 * đọc ra được là công trường đang làm gì.
 */
type Part = {
  object: THREE.LineSegments;
  material: THREE.LineBasicMaterial;
  start: number;
  rise: number;
};

function createFoundationScene(
  { scene, camera, compact, reduced }: StageInit,
  { onLayerRef }: FoundationChannel
): StageHandle {
  const root = new THREE.Group();
  scene.add(root);

  /*
   * Số tầng phụ thuộc bề rộng màn hình, và đây là quyết định về *bố cục* chứ
   * không phải về hiệu năng.
   *
   * Trên màn dọc, thẻ chữ đậu xuống đáy và chiếm gần hai phần ba chiều cao, nên
   * công trình chỉ còn dải trên cùng để đứng. Một toà tháp bốn tầng nhét vào dải
   * đó thì hoặc bị thẻ chữ che mất hai phần ba, hoặc phải thu nhỏ tới mức không
   * còn đọc ra tầng nào với tầng nào. Hai tầng thì vừa khít dải đó mà vẫn giữ
   * nguyên toàn bộ từ vựng hình: móng, cột, sàn, mái bằng, cột thu lôi.
   */
  const storeys = compact ? 2 : 4;
  const pileDrop = compact ? 0.9 : 1.7;
  const pileBottom = GROUND - CAP - pileDrop;
  const roofY = GROUND + STOREY * storeys;
  const crownY = roofY + 0.95;
  const mastTop = crownY + (compact ? 1.35 : 1.75);

  const parts: Part[] = [];
  const addPart = (batch: Batch, start: number, rise: number, peak = 1) => {
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      opacity: peak,
    });
    const object = new THREE.LineSegments(batch.build(), material);
    root.add(object);
    const part: Part = { object, material, start, rise };
    parts.push(part);
    return part;
  };

  /* ================= tầng 1 — nền móng ================= */
  const foundation = new Batch();

  // Lưới mặt bằng: nền của cả cảnh, và cũng là thứ loé lên khi cú sét đổ xuống.
  const extent = HALF + 0.9;
  const gridStep = compact ? 0.9 : 0.6;
  for (let v = -extent; v <= extent + 0.001; v += gridStep) {
    // Đường trục giữa đậm hơn hẳn: một tấm lưới đều tăm tắp không có chỗ nào cho
    // mắt bám vào, còn hai trục chính thì đọc ra ngay là tim công trình.
    const axis = Math.abs(v) < 0.001;
    const a = axis ? 0.55 : 0.24;
    foundation.add([-extent, GROUND, v], [extent, GROUND, v], FOG, a);
    foundation.add([v, GROUND, -extent], [v, GROUND, extent], FOG, a);
  }
  foundation.ring(HALF + 0.4, GROUND + 0.01, BRASS, 0.8);
  foundation.ring(HALF + 0.52, GROUND + 0.01, BRASS, 0.26);
  const groundGrid = addPart(foundation, LAYER_STARTS[0], 0.35);

  // Đài cọc và cọc: phần chìm dưới đất, mọc *xuống* nên nó vào chỗ sau mặt lưới.
  const piles = new Batch();
  CORNERS.forEach(([x, z]) => {
    piles.post(x, z, 0.3, GROUND - CAP, GROUND, BRASS_SOFT, 0.34);
    piles.post(x, z, 0.13, pileBottom, GROUND - CAP, FOG, 0.22);
  });
  addPart(piles, LAYER_STARTS[0] + 0.05, 0.7);

  /* ================= tầng 2 — cột trụ ================= */
  /*
   * Chỉ bốn cột góc được dựng thành trụ có tiết diện; bốn cột giữa cạnh là một
   * nét đơn mờ.
   *
   * Bản đầu cho cả tám cột đều có tiết diện, và kết quả là bốn tám nét đứng chen
   * trong một khối rộng bốn đơn vị — mắt đọc ra giàn giáo chứ không ra công
   * trình. Tầng bậc mới là thứ tạo ra hình khối: bốn trụ góc đậm giữ lấy hình,
   * mọi nét còn lại phải lùi hẳn về sau.
   */
  const columns = new Batch();
  COLUMN_SPOTS.forEach(([x, z], index) => {
    if (index < 4) columns.post(x, z, COLUMN_T, GROUND, roofY, BRASS, 0.5);
    else columns.add([x, GROUND, z], [x, roofY, z], FOG, 0.16);
  });
  addPart(columns, LAYER_STARTS[1], 1);

  /* ================= tầng 3 — sàn và dầm ================= */
  /*
   * Bốn tấm sàn, mỗi tấm một bộ phận riêng và lệch pha nhau một nhịp ngắn. Đây là
   * chỗ công trình có khối: bản trước chỉ có hai mặt phẳng trống, nên dù cột đã
   * dựng thì mắt vẫn không thấy đây là một toà nhà có tầng.
   */
  const plateGap = 0.055;
  for (let s = 1; s <= storeys; s++) {
    const y = GROUND + s * STOREY;
    const plate = new Batch();
    plate.ring(HALF, y, FOG, 0.44);
    // Diềm sàn: một vành thứ hai thấp hơn vài phần trăm, cho mép sàn có bề dày.
    plate.ring(HALF, y - 0.07, FOG, 0.16);
    CORNERS.forEach(([x, z]) => plate.add([x, y, z], [x, y - 0.07, z], FOG, 0.2));
    // Dầm bắt qua giữa sàn: đủ để đọc ra kết cấu, chưa đủ để rối mắt.
    plate.add([-HALF, y, 0], [HALF, y, 0], FOG, 0.22);
    plate.add([0, y, -HALF], [0, y, HALF], FOG, 0.22);
    if (!compact) {
      const q = HALF / 2;
      plate.add([-HALF, y, -q], [HALF, y, -q], FOG, 0.1);
      plate.add([-HALF, y, q], [HALF, y, q], FOG, 0.1);
    }
    // rise âm: tấm sàn được hạ từ trên xuống, không mọc lên từ dưới.
    addPart(plate, LAYER_STARTS[2] + (s - 1) * plateGap, -1.5);
  }

  /* ================= tầng 4 — mái và mặt đứng ================= */
  const crown = new Batch();
  // Nan mặt đứng: thứ biến bộ khung thành một công trình đã hoàn thiện. Rất mờ —
  // chúng chỉ để mặt đứng không trống trơn, không được tranh chỗ với bốn trụ góc.
  const mullions = compact ? 2 : 3;
  for (let i = 1; i <= mullions; i++) {
    const u = -HALF + (i * 2 * HALF) / (mullions + 1);
    crown.add([u, GROUND, -HALF], [u, roofY, -HALF], FOG, 0.07);
    crown.add([u, GROUND, HALF], [u, roofY, HALF], FOG, 0.07);
    crown.add([-HALF, GROUND, u], [-HALF, roofY, u], FOG, 0.07);
    crown.add([HALF, GROUND, u], [HALF, roofY, u], FOG, 0.07);
  }
  /*
   * Đỉnh là mái bằng có lan can và một buồng kỹ thuật ở giữa, không phải mái dốc.
   *
   * Bản đầu thử một khối chóp cụt: vành nhỏ đặt cao hơn vành lớn rồi nối bốn góc
   * lại. Nhìn ra cái lều. Mái bằng cộng buồng kỹ thuật thì đọc ra ngay là một toà
   * nhà hiện đại — và tiện thể cho cột thu lôi một cái bệ để đứng, thay vì mọc
   * thẳng lên từ một mặt phẳng trống.
   */
  crown.ring(HALF, roofY, BRASS_SOFT, 0.5);
  crown.ring(HALF, roofY + 0.17, BRASS_SOFT, 0.34);
  CORNERS.forEach(([x, z]) => {
    crown.add([x, roofY, z], [x, roofY + 0.17, z], BRASS_SOFT, 0.3);
  });
  crown.post(0, 0, HALF * 0.4, roofY, crownY, BRASS_SOFT, 0.4);
  addPart(crown, LAYER_STARTS[3], -1.2);

  /* ================= tầng 5 — hệ chống sét ================= */
  const mast = new Batch();
  mast.post(0, 0, 0.045, crownY, mastTop, JADE, 0.72);
  addPart(mast, LAYER_STARTS[4], -0.9);

  const ringsBatch = new Batch();
  [0.6, 1.05, 1.55].forEach((radius, index) => {
    ringsBatch.circle(radius, mastTop - index * 0.16, compact ? 18 : 32, JADE, 0.3 - index * 0.07);
  });
  const rings = addPart(ringsBatch, LAYER_STARTS[4] + 0.03, 0);

  /* ---------- bụi vàng lơ lửng ---------- */
  /*
   * Lớp hạt này không mang thông tin, nó chỉ giữ cho khoảng trống quanh công
   * trình không bị "chết". Số lượng cố tình thấp: vài trăm hạt là đủ cảm giác
   * không khí, còn hàng chục nghìn hạt chỉ tổ làm nóng máy.
   */
  const dustCount = compact ? 80 : 160;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const radius = 3.4 + Math.random() * 3.2;
    const angle = Math.random() * Math.PI * 2;
    dustPositions[i * 3] = Math.cos(angle) * radius;
    dustPositions[i * 3 + 1] = GROUND - 0.5 + Math.random() * 9;
    dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    color: BRASS_SOFT,
    size: 0.035,
    transparent: true,
    opacity: 0.32,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  root.add(dust);

  /* ---------- xung sét ---------- */
  /*
   * Năm *vệt* sáng, không phải năm chấm sáng: một chạy dọc cột thu lôi, bốn chạy
   * xuống bốn cột góc.
   *
   * Bản đầu dùng THREE.Points. Điểm của WebGL khi không gán texture thì vẽ ra
   * hình vuông đặc, nên cú sét hiện lên thành bốn ô vuông con trôi xuống — vừa
   * thô, vừa không đọc ra là dòng điện đang truyền. Một đoạn thẳng ngắn có đầu
   * sáng và đuôi tắt dần thì đọc ra ngay, lại đúng thứ ngôn ngữ đường nét của cả
   * cảnh, và không phải kéo thêm một texture nào vào gói tải.
   *
   * Độ sáng đầu–đuôi nướng sẵn vào màu đỉnh và không đổi nữa; mỗi khung hình chỉ
   * còn phải đặt lại toạ độ. Mười đỉnh thì phép tính không đáng kể.
   */
  /*
   * Hai mươi vệt chứ không phải năm: mỗi trụ được thắp sáng theo *cả bốn cạnh*
   * của nó, bốn cạnh cột thu lôi rồi bốn cạnh của từng cột góc.
   *
   * Lý do là một giới hạn của WebGL chứ không phải sở thích: `linewidth` của
   * LineBasicMaterial bị hầu hết trình duyệt bỏ qua, nên mọi đường đều đúng một
   * điểm ảnh, và một nét đơn thì cú sét chỉ chiếm dăm điểm ảnh trên màn hình —
   * đo ra thì nó chạy đúng, mà nhìn thì không ai thấy. Thắp cả bốn cạnh vừa cho
   * đủ độ dày, vừa đúng nghĩa hơn: dòng điện đi trong lòng cột, nên cả cây cột
   * sáng lên chứ không phải một sợi chỉ trượt dọc nó.
   */
  const STREAK = 1.1;
  const BOLT_SLOTS = 20;
  const boltPositions = new Float32Array(BOLT_SLOTS * 2 * 3);
  const boltColors = new Float32Array(BOLT_SLOTS * 2 * 4);
  for (let i = 0; i < BOLT_SLOTS; i++) {
    boltColors.set([JADE_SOFT.r, JADE_SOFT.g, JADE_SOFT.b, 1], i * 8);
    boltColors.set([JADE_SOFT.r, JADE_SOFT.g, JADE_SOFT.b, 0.04], i * 8 + 4);
  }
  const boltGeometry = new THREE.BufferGeometry();
  boltGeometry.setAttribute("position", new THREE.BufferAttribute(boltPositions, 3));
  boltGeometry.setAttribute("color", new THREE.BufferAttribute(boltColors, 4));
  const boltMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  });
  const bolts = new THREE.LineSegments(boltGeometry, boltMaterial);
  bolts.visible = false;
  root.add(bolts);

  const boltAttribute = boltGeometry.getAttribute("position") as THREE.BufferAttribute;

  /** Đặt vệt sáng thứ `i`: đầu ở (x, y, z), đuôi kéo ngược lên trên `len` đơn vị. */
  const setStreak = (i: number, x: number, y: number, z: number, len: number) => {
    const p = boltAttribute.array as Float32Array;
    const o = i * 6;
    p[o] = x;
    p[o + 1] = y;
    p[o + 2] = z;
    p[o + 3] = x;
    p[o + 4] = y + len;
    p[o + 5] = z;
  };

  /** Thắp sáng cả bốn cạnh của một trụ tiết diện `t` đặt tại (x, z). */
  const EDGE: Array<[number, number]> = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  const setPostStreak = (
    slot: number,
    x: number,
    z: number,
    t: number,
    y: number,
    len: number
  ) => {
    EDGE.forEach(([ox, oz], j) => setStreak(slot + j, x + ox * t, y, z + oz * t, len));
  };

  const MAST_T = 0.045;

  /*
   * Công trình cao khoảng 9,7 đơn vị (từ chân cọc tới đỉnh thu lôi) và rộng 5,8;
   * khoảng cách máy quay phải suy ra từ hai số đó cùng tỉ lệ khung hình, chứ không
   * đặt cứng — màn dọc của điện thoại hẹp hơn màn ngang tới ba lần, nên một con số
   * vừa mắt trên laptop sẽ cắt mất hai bên công trình trên điện thoại.
   *
   * Trên màn rộng, chữ chiếm nửa trái nên công trình phải dời sang phải mới không
   * nằm khuất dưới lớp phủ tối. Cách dời là cho máy quay ngắm lệch sang trái chứ
   * không dịch chính công trình: phối cảnh vẫn đúng, khối vẫn đứng thẳng thay vì
   * bị nhìn xiên.
   */
  let distance = 15;
  let focusOffsetX = 0;
  let focusOffsetY = 0;
  let currentLayer = -1;

  /*
   * Con số truyền vào fitDistance là nửa khung *mong muốn*, không phải nửa kích
   * thước công trình — và nó được suy ra từ chiều cao thật của tháp chứ không
   * đóng cứng, vì chính chiều cao đó đã đổi theo bề rộng màn hình ở trên.
   *
   * Phần trăm khung mà công trình được phép chiếm cũng khác nhau: màn rộng thì
   * chữ nằm bên trái nên công trình lấy gần trọn chiều cao; màn dọc thì thẻ chữ
   * đậu xuống đáy, công trình chỉ còn dải trên nên phải nhường lại hơn một nửa.
   */
  const towerHeight = mastTop - pileBottom;
  const reframe = () => {
    const wide = camera.aspect > 1.15;
    /*
     * `fill` chỉ có tác dụng trên màn rộng, và biết điều đó thì đỡ mất công chỉnh
     * nhầm chỗ: `fitDistance` lấy con số *lớn hơn* giữa ràng buộc theo chiều cao
     * và ràng buộc theo chiều ngang. Màn ngang thì chiều cao thắng, nên `fill`
     * quyết định khung. Màn dọc của điện thoại hẹp gấp đôi nên chiều ngang luôn
     * thắng, và lúc đó cần gạt duy nhất còn tác dụng là nửa bề ngang mong muốn
     * cùng với độ dạt đứng bên dưới.
     */
    const fill = 0.8;
    distance = fitDistance(camera, wide ? 3.9 : 4.1, towerHeight / 2 / fill, 1);
    /*
     * Màn rộng: chữ chiếm nửa trái, nên công trình dạt sang phải.
     * Màn hẹp: chữ và công trình phải chồng lên nhau vì không còn chỗ nào khác,
     * nên chúng chia nhau theo chiều đứng — công trình ở phần trên khung, thẻ chữ
     * đậu xuống đáy. Ngắm thấp hơn tâm thì vật thể nhô lên cao trong khung, cùng
     * một mẹo với phần dạt ngang, chỉ đổi trục.
     */
    focusOffsetX = wide ? -0.17 * visibleWidthAt(camera, distance) : 0;
    const visibleHeight = visibleWidthAt(camera, distance) / camera.aspect;
    focusOffsetY = wide ? 0 : -0.2 * visibleHeight;
  };
  reframe();

  const target = new THREE.Vector3();

  return {
    resize() {
      reframe();
    },

    update({ progress, elapsed, pointerX, pointerY }) {
      for (const part of parts) {
        const appear = smoothstep(part.start, part.start + LAYER_RAMP, progress);
        part.object.position.y = (1 - appear) * -part.rise;
        part.material.opacity = appear;
        // Bỏ hẳn lệnh vẽ khi bộ phận còn vô hình, thay vì vẽ một vật trong suốt.
        part.object.visible = appear > 0.01;
      }

      /*
       * Khối đung đưa rất chậm quanh trục đứng thay vì quay tròn liên tục: người
       * đọc luôn nhìn công trình từ mặt trước, và chuyển động không bao giờ giành
       * sự chú ý với phần chữ bên cạnh.
       */
      const sway = reduced ? 0 : Math.sin(elapsed * 0.11) * 0.22;
      root.rotation.y = sway + progress * 0.45 + pointerX * 0.16;
      root.rotation.x = pointerY * 0.05;

      /* ---------- cú sét ---------- */
      /*
       * Chỉ chạy khi hệ chống sét đã dựng xong, và không chạy ở chế độ giảm
       * chuyển động — đây là chuyển động tự thân nhanh nhất của cả trang, đúng
       * thứ mà người bật chế độ đó muốn tắt.
       */
      const armed = smoothstep(LAYER_STARTS[4], LAYER_STARTS[4] + LAYER_RAMP, progress);
      let flare = 0;

      if (!reduced && armed > 0.5) {
        const phase = (elapsed % STRIKE_PERIOD) / STRIKE_SPAN;
        if (phase < 1) {
          bolts.visible = true;

          if (phase < 0.28) {
            // Chặng một: xung chạy dọc cột thu lôi xuống mái.
            const t = phase / 0.28;
            setPostStreak(0, 0, 0, MAST_T, lerp(mastTop, crownY, t), STREAK * 0.6);
            // Bốn cột chưa tới lượt: thu về độ dài 0 để không thấy chúng.
            CORNERS.forEach(([x, z], i) =>
              setPostStreak(4 + i * 4, x, z, COLUMN_T, roofY, 0)
            );
            boltMaterial.opacity = armed;
          } else if (phase < 0.72) {
            // Chặng hai: tách làm bốn, đổ xuống theo bốn cột góc.
            const t = (phase - 0.28) / 0.44;
            const y = lerp(roofY, GROUND - CAP, t * t); // nhanh dần, như rơi
            setPostStreak(0, 0, 0, MAST_T, crownY, 0);
            // Vệt dài ra theo tốc độ rơi: cùng một mẹo với vệt mờ của ảnh chụp
            // vật đang chuyển động nhanh, và nó làm cú sét ra dáng cú sét.
            CORNERS.forEach(([x, z], i) =>
              setPostStreak(4 + i * 4, x, z, COLUMN_T, y, STREAK * (0.5 + t))
            );
            boltMaterial.opacity = armed;
          } else {
            // Chặng ba: xung đã vào đất, mặt móng loé lên rồi tắt.
            const t = (phase - 0.72) / 0.28;
            setPostStreak(0, 0, 0, MAST_T, crownY, 0);
            CORNERS.forEach(([x, z], i) =>
              setPostStreak(4 + i * 4, x, z, COLUMN_T, GROUND - CAP, STREAK * 1.5 * (1 - t))
            );
            boltMaterial.opacity = (1 - t) * armed;
            flare = (1 - t) * armed;
          }
          boltAttribute.needsUpdate = true;
        } else {
          bolts.visible = false;
        }
      } else {
        bolts.visible = false;
      }

      /*
       * Mặt móng sáng thêm đúng lúc xung đổ vào — cái kết của cả hình ảnh: sét
       * đánh xuống thì thứ nhận lấy nó là nền móng.
       */
      groundGrid.material.opacity = Math.min(
        1,
        smoothstep(LAYER_STARTS[0], LAYER_STARTS[0] + LAYER_RAMP, progress) * (1 + flare * 1.5)
      );

      if (!reduced) {
        dust.rotation.y = elapsed * 0.02;
        // Vòng bảo vệ nở ra rồi thu lại như một nhịp thở, chỉ ở tầng cuối.
        rings.object.scale.setScalar(1 + Math.sin(elapsed * 0.6) * 0.05);
      }

      /*
       * Máy quay dâng lên theo tiến trình đọc, đúng bằng nhịp công trình mọc cao:
       * mắt người đọc đi từ móng lên tới đỉnh mà không phải tự xoay góc. Biên độ
       * dâng cố tình nhỏ hơn chiều cao công trình — kéo nhiều hơn thì mỗi thời
       * điểm chỉ còn thấy một lát cắt, và người đọc mất luôn cảm giác đang nhìn
       * một toà nhà.
       */
      const focusY = lerp(GROUND + 1, crownY - 0.5, progress);
      /*
       * Máy quay bắt đầu cao và chúc xuống, rồi hạ dần về ngang tầm khi công
       * trình mọc lên.
       *
       * Không phải hiệu ứng thêm thắt mà là sửa một lỗi thật: ở góc ngang, mặt
       * bằng móng bị nhìn gần như đúng cạnh nên cả tấm lưới dẹp lại thành một
       * vệt mảnh, và khung hình đầu tiên của cả trang gần như trống trơn — đúng
       * lúc trang cần thuyết phục người đọc rằng có gì đó đáng xem. Nhìn chúc
       * xuống thì mặt bằng mở ra hết, và đó cũng đúng là cách người ta trình bày
       * một bản vẽ mặt bằng.
       */
      const lift = lerp(3.4, 1.2, progress);
      camera.position.set(pointerX * 0.4, focusY + lift, distance - progress * distance * 0.08);
      target.set(focusOffsetX, focusY + focusOffsetY, 0);
      camera.lookAt(target);

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

/*
 * `setup` chạy đúng một lần khi gắn cảnh, nên mọi thứ thay đổi theo thời gian
 * phải đi vào qua ref chứ không qua closure — nếu không, cảnh sẽ mãi dùng giá trị
 * của lần render đầu tiên.
 */
type FoundationChannel = {
  /** Báo về React khi tầng đang dựng đổi, để thước đo bên lề khớp với hình. */
  onLayerRef: RefObject<(index: number) => void>;
};

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
        <path d="M40 210h160M62 210V78M178 210V78M62 176h116M62 143h116M62 110h116" />
        <path d="M96 210V78M144 210V78" />
      </g>
      <g className="text-brass-500">
        <path d="M62 78h116M76 78V60h88v18" />
      </g>
      <g className="text-jade-500">
        <path d="M120 60V30M104 40h32" />
      </g>
    </svg>
  );
}
