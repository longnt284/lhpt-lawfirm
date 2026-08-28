/*
 * Cảnh 3D của phần mở đầu trang chủ — hai màn hình đầu tiên, một khối hình duy
 * nhất, một chuyển động liên tục điều khiển bằng thao tác cuộn.
 *
 * Màn một: một khối hiên cột dựng bằng khung dây, đứng trên mặt đất. Hình lấy
 * từ chính logo của hãng — ô vuông trong logo là một hàng cột đỡ mái dốc — và
 * từ câu tiêu đề, "cho mọi công trình".
 *
 * Màn hai: người xem *đi xuống dưới mặt đất*. Máy quay hạ qua bậc thềm, qua
 * vạch nền, và phần không ai nhìn thấy hiện ra: đài cọc, hệ giằng, bè móng, các
 * tầng đất. Đó là toàn bộ luận điểm của hãng được kể bằng hình thay vì bằng
 * chữ — thứ giữ cho công trình đứng vững nằm ở phần chìm dưới đất, và những con
 * số của hãng được đặt đúng vào chỗ đó.
 *
 * Vì hai màn là một khối liền, người dùng không thấy hai hiệu ứng nối vào nhau
 * mà thấy một chuyển động duy nhất: họ đang đi xuống. Canvas dính (sticky) đứng
 * yên giữa khung nhìn suốt cả quãng đó, còn chữ thì trôi qua bên trên.
 *
 * Bốn lựa chọn kỹ thuật đáng nói:
 *
 * 1. Mỗi tầng — trên mặt đất, vạch nền, dưới mặt đất — là *một* BufferGeometry,
 *    một lệnh vẽ. Tách ba là để đổi độ mờ từng tầng theo tiến trình cuộn, chứ
 *    không phải vì hình học đòi hỏi.
 *
 * 2. Độ mờ giảm dần theo chiều sâu được nướng sẵn vào màu từng đỉnh (RGBA) chứ
 *    không dùng sương mù của three.js: sương mù pha về một màu đặc, mà canvas ở
 *    đây trong suốt và phía sau nó còn ba quầng sáng nền đang chuyển động — pha
 *    về màu đặc sẽ thành những vệt tối đè lên chúng.
 *
 * 3. Không có gì quay tròn. Một toà kiến trúc mà xoay là lập tức thành đồ hoạ
 *    game. Chiều sâu đến từ thị sai: máy quay đưa qua đưa lại rất chậm và bám
 *    nhẹ theo con trỏ, nên mặt trước và mặt sau của khối trượt lệch nhau.
 *
 * 4. Toàn bộ đường xuống nội suy bằng smoothstep trên tiến trình cuộn đã được
 *    làm mượt sẵn ở `useThreeStage`. Bám thẳng vào scrollY thô thì mỗi nấc lăn
 *    chuột thành một cú giật của máy quay.
 */
import { useCallback, useMemo, type RefObject } from "react";
import * as THREE from "three";
import {
  disposeObject,
  useThreeStage,
  type StageHandle,
  type StageInit,
} from "../../lib/threeStage";
import { clamp01, smoothstep } from "../../lib/sceneMotion";

/* Màu lấy đúng từ bảng thương hiệu trong index.css. */
const BRASS = new THREE.Color(0xc9a44c);
const BRASS_SOFT = new THREE.Color(0xdfc27d);
const FOG = new THREE.Color(0x9db0c4);
const JADE = new THREE.Color(0x22c49c);

/* ---------- cao độ, tính từ mặt đất ---------- */
const DEPTH = 0.95; // nửa bề dày khối trên mặt đất, quyết định biên độ thị sai
const SHAFT_BOTTOM = -2.55;
const SHAFT_TOP = 2.5;
const CAP_TOP = 2.82;
const ARCHITRAVE_TOP = 3.32;
const RIDGE = 4.85;
const COLUMN_HALF = 0.3;

const STEP_TOP = SHAFT_BOTTOM - 0.3;
const STEP_COUNT = 3;
const STEP_RISE = 0.36;
const GROUND_Y = STEP_TOP - STEP_COUNT * STEP_RISE - 0.06;

const PILE_BOTTOM = GROUND_Y - 5.1;
const RAFT_Y = PILE_BOTTOM - 0.4;
const PILE_HALF = 0.2;
const PILE_DEPTH = 0.62;

/*
 * Trục các cột. Số chẵn và bỏ trống trục giữa — đúng như một hiên cột cổ điển,
 * và cũng đúng thứ bố cục này cần: giữa khung là chỗ đậm nhất của tiêu đề.
 */
const COLUMNS = [-5.7, -3.5, -1.35, 1.35, 3.5, 5.7];
const COLUMNS_COMPACT = [-3.5, -1.35, 1.35, 3.5];

/* Mặt sau mờ hơn mặt trước — chênh lệch này chính là thứ cho khối một bề dày. */
const backFade = 0.34;

type Vec = [number, number, number];

class LineBatch {
  positions: number[] = [];
  colors: number[] = [];

  add(a: Vec, b: Vec, color: THREE.Color, alpha: number) {
    this.positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    this.colors.push(color.r, color.g, color.b, alpha, color.r, color.g, color.b, alpha);
  }

  /** Khung của một mặt chữ nhật nằm ở một chiều sâu cho trước. */
  rect(x0: number, x1: number, y0: number, y1: number, z: number, color: THREE.Color, alpha: number) {
    this.add([x0, y0, z], [x1, y0, z], color, alpha);
    this.add([x1, y0, z], [x1, y1, z], color, alpha);
    this.add([x1, y1, z], [x0, y1, z], color, alpha);
    this.add([x0, y1, z], [x0, y0, z], color, alpha);
  }

  /**
   * Một khối hộp: mặt trước, mặt sau mờ hơn, và bốn cạnh nối hai mặt.
   *
   * Đây là đơn vị dựng hình chính của cảnh — thân cột, đầu cột, diềm mái, bậc
   * thềm, đài cọc đều là hộp, chỉ khác tỉ lệ. Nhờ vậy khối nào cũng có bề dày
   * thật, và chuyển động thị sai đọc ra được ở mọi bộ phận.
   */
  box(x0: number, x1: number, y0: number, y1: number, depth: number, color: THREE.Color, alpha: number) {
    this.rect(x0, x1, y0, y1, depth, color, alpha);
    this.rect(x0, x1, y0, y1, -depth, color, alpha * backFade);
    const edge = alpha * 0.7;
    for (const x of [x0, x1]) {
      for (const y of [y0, y1]) {
        this.add([x, y, depth], [x, y, -depth], color, edge * backFade);
      }
    }
  }

  /** Bốn đường đứng của một thân trụ, không có vạch ngang ở hai đầu. */
  shaft(x: number, half: number, y0: number, y1: number, depth: number, color: THREE.Color, alpha: number) {
    for (const dx of [-half, half]) {
      this.add([x + dx, y0, depth], [x + dx, y1, depth], color, alpha);
      this.add([x + dx, y0, -depth], [x + dx, y1, -depth], color, alpha * backFade);
    }
  }

  build() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
    // itemSize 4: three.js bật nhánh màu có kênh alpha trong shader khi thấy
    // thuộc tính color bốn thành phần. Đây là cách duy nhất để một lệnh vẽ duy
    // nhất chứa được nhiều mức mờ khác nhau.
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(this.colors, 4));
    return geometry;
  }
}

function lineLayer(batch: LineBatch, opacity: number) {
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    opacity,
  });
  return { object: new THREE.LineSegments(batch.build(), material), material };
}

type FillBox = {
  position: Vec;
  size: Vec;
};

function fillLayer(boxes: FillBox[], color: THREE.Color, peak: number) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: peak,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const object = new THREE.InstancedMesh(geometry, material, boxes.length);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  boxes.forEach((box, index) => {
    position.set(...box.position);
    scale.set(...box.size);
    matrix.compose(position, rotation, scale);
    object.setMatrixAt(index, matrix);
  });
  object.instanceMatrix.needsUpdate = true;
  return { object, material, peak };
}

function createOpeningScene({ scene, camera, compact, reduced }: StageInit): StageHandle {
  const root = new THREE.Group();
  scene.add(root);

  const columns = compact ? COLUMNS_COMPACT : COLUMNS;
  const span = columns[columns.length - 1] + 1.15;
  const pointerScale = window.matchMedia?.("(pointer: coarse)").matches ? 0 : 1;

  /* ================= tầng trên mặt đất ================= */
  const above = new LineBatch();

  /*
   * Thân cột cố tình *không* dựng bằng khối hộp như mọi bộ phận khác. Khung hộp
   * thêm hai vạch ngang ở đầu và chân thân cùng bốn cạnh nối, và sáu cột như vậy
   * biến vùng có chữ thành một mạng lưới ô vuông — đúng thứ làm chữ khó đọc.
   */
  columns.forEach((x) => {
    above.shaft(x, COLUMN_HALF, SHAFT_BOTTOM, SHAFT_TOP, DEPTH, FOG, 0.17);
    // Một đường soi giữa thân: đủ để cột không phải hai vạch song song, chưa đủ
    // để thành hoa văn.
    above.add([x, SHAFT_BOTTOM + 0.24, DEPTH], [x, SHAFT_TOP - 0.24, DEPTH], FOG, 0.085);
  });

  columns.forEach((x) => {
    above.box(x - 0.46, x + 0.46, SHAFT_TOP, CAP_TOP, DEPTH + 0.12, BRASS, 0.24);
    above.box(x - 0.46, x + 0.46, SHAFT_BOTTOM - 0.3, SHAFT_BOTTOM, DEPTH + 0.12, BRASS, 0.2);
  });

  /* Diềm mái — thanh ngang lớn đầu tiên, nằm trên dải trống phía trên tiêu đề. */
  above.box(-span, span, CAP_TOP, ARCHITRAVE_TOP, DEPTH + 0.2, BRASS_SOFT, 0.3);
  above.add([-span, CAP_TOP + 0.18, DEPTH + 0.2], [span, CAP_TOP + 0.18, DEPTH + 0.2], FOG, 0.16);

  /* Mái dốc — lặp lại đúng nét vàng trong logo, và cũng là một khối có bề dày. */
  const eaveZ = DEPTH + 0.2;
  const apex: Vec = [0, RIDGE, eaveZ];
  const apexBack: Vec = [0, RIDGE, -eaveZ];
  above.add([-span, ARCHITRAVE_TOP, eaveZ], apex, BRASS, 0.42);
  above.add(apex, [span, ARCHITRAVE_TOP, eaveZ], BRASS, 0.42);
  above.add([-span, ARCHITRAVE_TOP, -eaveZ], apexBack, BRASS, 0.42 * backFade);
  above.add(apexBack, [span, ARCHITRAVE_TOP, -eaveZ], BRASS, 0.42 * backFade);
  above.add(apex, apexBack, BRASS, 0.24);
  above.add([-span, ARCHITRAVE_TOP, eaveZ], [-span, ARCHITRAVE_TOP, -eaveZ], BRASS, 0.2);
  above.add([span, ARCHITRAVE_TOP, eaveZ], [span, ARCHITRAVE_TOP, -eaveZ], BRASS, 0.2);
  above.add([-span + 0.5, ARCHITRAVE_TOP + 0.26, eaveZ], [0, RIDGE - 0.52, eaveZ], FOG, 0.16);
  above.add([0, RIDGE - 0.52, eaveZ], [span - 0.5, ARCHITRAVE_TOP + 0.26, eaveZ], FOG, 0.16);

  /* Bậc thềm — thanh ngang lớn thứ hai, ở dải trống phía dưới. */
  for (let i = 0; i < STEP_COUNT; i++) {
    const y1 = STEP_TOP - i * STEP_RISE;
    const y0 = y1 - STEP_RISE;
    const width = span + 0.36 + i * 0.46;
    const depth = DEPTH + 0.3 + i * 0.26;
    above.rect(-width, width, y0, y1, depth, FOG, 0.19 - i * 0.03);
    above.add([-width, y1, depth], [-width, y1, -depth], FOG, 0.1 - i * 0.02);
    above.add([width, y1, depth], [width, y1, -depth], FOG, 0.1 - i * 0.02);
  }

  /* ================= vạch nền ================= */
  /*
   * Ranh giới giữa hai màn. Nó là thứ duy nhất luôn hiện rõ suốt cả quãng cuộn,
   * và khi máy quay hạ xuống, nó quét lên khỏi khung — cú quét đó chính là thứ
   * nói cho người xem biết họ vừa đi xuống dưới mặt đất chứ không phải cảnh vừa
   * đổi sang một hình khác.
   */
  const ground = new LineBatch();
  const groundReach = span + 5.5;
  ground.add([-groundReach, GROUND_Y, DEPTH + 1.4], [groundReach, GROUND_Y, DEPTH + 1.4], BRASS, 0.5);
  ground.add([-groundReach, GROUND_Y, -(DEPTH + 1.4)], [groundReach, GROUND_Y, -(DEPTH + 1.4)], BRASS, 0.26);
  for (const x of [-groundReach, groundReach]) {
    ground.add([x, GROUND_Y, DEPTH + 1.4], [x, GROUND_Y, -(DEPTH + 1.4)], BRASS, 0.2);
  }

  /* ================= tầng dưới mặt đất ================= */
  const below = new LineBatch();

  /* Cọc và đài cọc dưới mỗi trục cột. */
  columns.forEach((x) => {
    below.box(x - 0.46, x + 0.46, GROUND_Y - 0.56, GROUND_Y - 0.06, PILE_DEPTH + 0.2, BRASS, 0.34);
    below.shaft(x, PILE_HALF, PILE_BOTTOM, GROUND_Y - 0.56, PILE_DEPTH, FOG, 0.3);
    // Trục tim cọc: một đường mảnh chạy suốt, đủ để thân cọc có lõi thay vì chỉ
    // là hai vạch song song.
    below.add([x, PILE_BOTTOM, PILE_DEPTH], [x, GROUND_Y - 0.56, PILE_DEPTH], FOG, 0.12);
  });

  /*
   * Ba cao độ giằng ngang. Đây là phần làm cho tầng móng đọc ra là một hệ kết
   * cấu chứ không phải mấy cây cọc rời cắm xuống đất, nên nó được vẽ đậm hơn
   * bản thân thân cọc.
   */
  const tieLevels = [GROUND_Y - 1.6, GROUND_Y - 3.0, GROUND_Y - 4.4];
  tieLevels.forEach((y, level) => {
    for (const z of [PILE_DEPTH, -PILE_DEPTH]) {
      below.add(
        [columns[0], y, z],
        [columns[columns.length - 1], y, z],
        FOG,
        (0.26 - level * 0.04) * (z > 0 ? 1 : backFade)
      );
    }
    // Bản mã tại mỗi nút giằng: một vạch ngắn cắt ngang thân cọc.
    columns.forEach((x) => {
      below.add([x - 0.34, y, PILE_DEPTH], [x + 0.34, y, PILE_DEPTH], BRASS, 0.2 - level * 0.03);
    });
  });

  /*
   * Giằng chéo giữa các cặp cọc liền nhau, ở cả ba khoang. Chỉ vẽ mặt trước:
   * thêm mặt sau thì hai lớp chéo chồng lên nhau thành một mảng rối, mà bề dày
   * của tầng móng đã do đài cọc và bè móng nói hộ rồi.
   */
  for (let i = 0; i < columns.length - 1; i++) {
    const a = columns[i];
    const b = columns[i + 1];
    const bays: [number, number][] = [
      [GROUND_Y - 0.56, tieLevels[0]],
      [tieLevels[0], tieLevels[1]],
      [tieLevels[1], tieLevels[2]],
    ];
    bays.forEach(([top, bottom], level) => {
      const alpha = 0.15 - level * 0.025;
      below.add([a, top, PILE_DEPTH], [b, bottom, PILE_DEPTH], FOG, alpha);
      below.add([b, top, PILE_DEPTH], [a, bottom, PILE_DEPTH], FOG, alpha);
    });
  }

  /* Bè móng: mặt phẳng đáy mà toàn bộ sức nặng dồn xuống. */
  const raftHalf = span + 0.6;
  const raftDepth = PILE_DEPTH + 1.1;
  below.rect(-raftHalf, raftHalf, RAFT_Y - 0.5, RAFT_Y, raftDepth, BRASS, 0.42);
  below.rect(-raftHalf, raftHalf, RAFT_Y - 0.5, RAFT_Y, -raftDepth, BRASS, 0.42 * backFade);
  for (const x of [-raftHalf, raftHalf]) {
    below.add([x, RAFT_Y, raftDepth], [x, RAFT_Y, -raftDepth], BRASS, 0.28);
    below.add([x, RAFT_Y - 0.5, raftDepth], [x, RAFT_Y - 0.5, -raftDepth], BRASS, 0.18);
  }
  columns.forEach((x) => {
    below.add([x, RAFT_Y, raftDepth], [x, RAFT_Y, -raftDepth], FOG, 0.18);
    below.add([x, PILE_BOTTOM, PILE_DEPTH], [x, RAFT_Y, PILE_DEPTH], FOG, 0.2);
    below.add([x, PILE_BOTTOM, -PILE_DEPTH], [x, RAFT_Y, -PILE_DEPTH], FOG, 0.2 * backFade);
  });

  /*
   * Các tầng đất. Không có thông tin nào ở đây — chúng chỉ để mắt đọc ra rằng
   * phần dưới này nằm *trong lòng đất*, chứ không phải một kết cấu khác lơ lửng
   * trong không trung.
   */
  const strataReach = span + 4.2;
  [1.4, 2.7, 4.0].forEach((drop, i) => {
    const y = GROUND_Y - drop;
    for (const z of [DEPTH + 2.6, -(DEPTH + 2.6)]) {
      below.add([-strataReach, y, z], [strataReach, y, z], FOG, (0.095 - i * 0.018) * (z > 0 ? 1 : 0.6));
    }
  });

  /*
   * Nền đá dưới bè móng.
   *
   * Không có nó thì phần dưới cùng của khung — chừng một phần tư chiều cao —
   * trống trơn ngay lúc người đọc dừng lại ở khối số liệu, và cả cảnh trông như
   * bị cắt cụt. Vài vạch ngang thưa dần là đủ để đáy khung đọc ra là *đáy của
   * một thứ gì đó* chứ không phải chỗ hết dữ liệu.
   */
  [1.15, 2.05, 2.95, 3.8].forEach((drop, i) => {
    const y = RAFT_Y - 0.5 - drop;
    for (const z of [DEPTH + 2.6, -(DEPTH + 2.6)]) {
      below.add([-strataReach, y, z], [strataReach, y, z], FOG, (0.075 - i * 0.016) * (z > 0 ? 1 : 0.6));
    }
    // Vài vạch đứng ngắn nối hai tầng đá: đủ để lớp dưới cùng có kết cấu, chưa
    // đủ để thành một tấm lưới thứ hai.
    if (i < 3) {
      [-0.62, -0.18, 0.28, 0.7].forEach((k, j) => {
        if ((i + j) % 2 !== 0) return;
        const x = k * strataReach;
        below.add([x, y, DEPTH + 2.6], [x, y - 0.9, DEPTH + 2.6], FOG, 0.05 - i * 0.012);
      });
    }
  });

  /*
   * Một dấu ngọc duy nhất ở đáy, lệch tâm — cùng vai trò với ô vuông ngọc ở góc
   * logo: giữ cho cảnh không đơn sắc, mà không thêm chi tiết nào phải giải thích.
   */
  below.box(raftHalf - 0.62, raftHalf - 0.2, RAFT_Y - 0.5, RAFT_Y, raftDepth + 0.02, JADE, 0.42);

  const aboveLayer = lineLayer(above, 1);
  const groundLayer = lineLayer(ground, 1);
  const belowLayer = lineLayer(below, 0);
  const aboveBrassFill = fillLayer(
    [
      {
        position: [0, (CAP_TOP + ARCHITRAVE_TOP) / 2, 0],
        size: [span * 2, ARCHITRAVE_TOP - CAP_TOP, (DEPTH + 0.2) * 2],
      },
      ...columns.flatMap((x) => [
        {
          position: [x, (SHAFT_TOP + CAP_TOP) / 2, 0] as Vec,
          size: [0.92, CAP_TOP - SHAFT_TOP, (DEPTH + 0.12) * 2] as Vec,
        },
        {
          position: [x, SHAFT_BOTTOM - 0.15, 0] as Vec,
          size: [0.92, 0.3, (DEPTH + 0.12) * 2] as Vec,
        },
      ]),
    ],
    BRASS,
    0.065
  );

  const aboveStepFill = fillLayer(
    Array.from({ length: STEP_COUNT }, (_, index) => {
      const y1 = STEP_TOP - index * STEP_RISE;
      const y0 = y1 - STEP_RISE;
      const width = span + 0.36 + index * 0.46;
      const depth = DEPTH + 0.3 + index * 0.26;
      return {
        position: [0, (y0 + y1) / 2, 0] as Vec,
        size: [width * 2, STEP_RISE, depth * 2] as Vec,
      };
    }),
    FOG,
    0.032
  );

  const belowBrassFill = fillLayer(
    [
      ...columns.map((x) => ({
        position: [x, GROUND_Y - 0.31, 0] as Vec,
        size: [0.92, 0.5, (PILE_DEPTH + 0.2) * 2] as Vec,
      })),
      {
        position: [0, RAFT_Y - 0.25, 0],
        size: [raftHalf * 2, 0.5, raftDepth * 2],
      },
    ],
    BRASS,
    0.075
  );

  const belowPileFill = fillLayer(
    columns.map((x) => ({
      position: [x, (PILE_BOTTOM + GROUND_Y - 0.56) / 2, 0],
      size: [PILE_HALF * 2, GROUND_Y - 0.56 - PILE_BOTTOM, PILE_DEPTH * 2],
    })),
    FOG,
    0.036
  );

  const washMaterial = new THREE.MeshBasicMaterial({
    color: 0x41627b,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const washHeight = GROUND_Y - (RAFT_Y - 3.8);
  const subsurfaceWash = new THREE.Mesh(
    new THREE.PlaneGeometry(strataReach * 2, washHeight),
    washMaterial
  );
  subsurfaceWash.position.set(0, GROUND_Y - washHeight / 2, -4.1);
  subsurfaceWash.visible = false;

  root.add(
    aboveBrassFill.object,
    aboveStepFill.object,
    aboveLayer.object,
    groundLayer.object,
    subsurfaceWash,
    belowBrassFill.object,
    belowPileFill.object,
    belowLayer.object
  );
  belowLayer.object.visible = false;
  belowBrassFill.object.visible = false;
  belowPileFill.object.visible = false;

  /* ================= bụi vàng ================= */
  /*
   * Trải suốt từ đỉnh mái xuống tới bè móng, nên nó là thứ duy nhất có mặt ở cả
   * hai màn — và chính vì vậy nó khâu hai màn lại làm một: lúc máy quay hạ
   * xuống, tầng bụi trôi qua khung liên tục thay vì cắt.
   */
  const dustCount = compact ? 70 : 150;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustColors = new Float32Array(dustCount * 4);
  const dustSpeeds = new Float32Array(dustCount);
  const dustFloor = RAFT_Y - 1;
  const dustCeiling = RIDGE + 1.4;
  for (let i = 0; i < dustCount; i++) {
    // Hạt nằm cả trước lẫn sau khối, nên lúc máy quay đưa ngang, tầng bụi cũng
    // trượt lệch so với công trình.
    dustPositions[i * 3] = (Math.random() * 2 - 1) * (span + 2.2);
    dustPositions[i * 3 + 1] = dustFloor + Math.random() * (dustCeiling - dustFloor);
    dustPositions[i * 3 + 2] = (Math.random() * 2 - 1) * 4.5;
    const tint = Math.random() < 0.25 ? BRASS_SOFT : BRASS;
    dustColors[i * 4] = tint.r;
    dustColors[i * 4 + 1] = tint.g;
    dustColors[i * 4 + 2] = tint.b;
    dustColors[i * 4 + 3] = 0.24 + Math.random() * 0.34;
    dustSpeeds[i] = 0.05 + Math.random() * 0.09;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute("color", new THREE.BufferAttribute(dustColors, 4));
  const dustMaterial = new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    sizeAttenuation: true,
    depthWrite: false,
  });
  root.add(new THREE.Points(dustGeometry, dustMaterial));
  const dustAttribute = dustGeometry.getAttribute("position") as THREE.BufferAttribute;

  /* ================= đường đi của máy quay ================= */
  /*
   * Hai chỗ đứng, và cả quãng cuộn chỉ là phép nội suy giữa chúng. Toạ độ được
   * tính lại mỗi lần khung đổi kích thước chứ không đặt cứng: khung dọc của
   * điện thoại hẹp hơn khung ngang tới ba lần, nên một con số vừa mắt trên
   * laptop sẽ cắt mất hai hàng cột ngoài cùng trên điện thoại.
   */
  const stand = {
    aboveY: -0.45,
    aboveZ: 12,
    aboveTargetY: 0.85,
    belowY: GROUND_Y - 2.4,
    belowZ: 12,
    belowTargetY: GROUND_Y - 3.1,
  };

  const reframe = () => {
    const halfFov = Math.tan((camera.fov * Math.PI) / 360);
    const portrait = camera.aspect < 1;

    /*
     * Ràng buộc theo chiều cao dùng số nhỏ hơn tổng chiều cao công trình có chủ
     * đích: bậc thềm dưới cùng được phép chạy ra ngoài mép dưới, vì lúc đó nó
     * nằm sau dải ticker và không ai nhìn thấy.
     */
    stand.aboveZ = Math.max(5.35 / halfFov, (span + 0.9) / (halfFov * camera.aspect));
    stand.belowZ = Math.max(3.5 / halfFov, (span + 1.3) / (halfFov * camera.aspect));

    /*
     * Khung càng dọc thì công trình càng lùi xa, và mắt càng cần một điểm nhìn
     * thấp hơn để nó vẫn ra dáng đồ sộ. `targetY` là điểm máy quay ngắm vào, nên
     * nó cũng là cần gạt quyết định vật thể nằm cao hay thấp trong khung: ngắm
     * cao hơn thì vật thể tụt xuống.
     */
    stand.aboveY = portrait ? -0.9 : -0.45;
    stand.aboveTargetY = portrait ? 1.15 : 0.85;
  };
  reframe();

  const target = new THREE.Vector3();

  return {
    resize() {
      reframe();
    },

    update({ elapsed, delta, progress, pointerX, pointerY }) {
      /*
       * Nhịp của cả phần mở đầu.
       *
       * `descent` là quãng đi xuống, `reveal` là quãng tầng móng hiện lên. Hai
       * mốc cố tình lệch nhau: móng bắt đầu mờ mờ hiện ra *trước* khi máy quay
       * rời khỏi công trình, nên người cuộn thấy có gì đó ở dưới rồi mới đi
       * xuống — chứ không phải đi xuống một chỗ tối rồi mới có gì đó bật ra.
       */
      const descent = smoothstep(0.34, 0.9, progress);
      const reveal = smoothstep(0.16, 0.62, progress);

      aboveLayer.material.opacity = 1 - descent * 0.76;
      const aboveOpacity = 1 - descent * 0.76;
      aboveBrassFill.material.opacity = aboveBrassFill.peak * aboveOpacity;
      aboveStepFill.material.opacity = aboveStepFill.peak * aboveOpacity;
      belowLayer.material.opacity = reveal;
      belowLayer.object.visible = reveal > 0.01;
      belowBrassFill.material.opacity = belowBrassFill.peak * reveal;
      belowPileFill.material.opacity = belowPileFill.peak * reveal;
      belowBrassFill.object.visible = reveal > 0.01;
      belowPileFill.object.visible = reveal > 0.01;
      washMaterial.opacity = reveal * 0.028;
      subsurfaceWash.visible = reveal > 0.01;
      // Vạch nền đậm dần lúc tới gần rồi nhạt đi khi đã ở hẳn bên dưới.
      groundLayer.material.opacity = 0.45 + Math.sin(clamp01(progress * 1.4) * Math.PI) * 0.55;

      if (!reduced) {
        /*
         * Bụi trôi lên rất chậm rồi vòng lại đáy. Đây là chuyển động tự thân duy
         * nhất của cảnh, và nó chậm tới mức phải nhìn vài giây mới thấy — vừa đủ
         * để cảnh không chết cứng, chưa đủ để giành sự chú ý với tiêu đề.
         */
        const positions = dustAttribute.array as Float32Array;
        for (let i = 0; i < dustCount; i++) {
          const index = i * 3 + 1;
          let y = positions[index] + dustSpeeds[i] * delta;
          if (y > dustCeiling) y = dustFloor;
          positions[index] = y;
        }
        dustAttribute.needsUpdate = true;
      }

      /*
       * Máy quay đưa qua đưa lại theo hai nhịp lệch chu kỳ, cộng phần bám con
       * trỏ. Một vòng đưa ngang mất hơn một phút. Mặt trước và mặt sau của khối
       * trượt lệch nhau theo, và chính độ lệch đó — chứ không phải chuyển động
       * của bản thân công trình — là thứ làm mắt đọc ra chiều sâu.
       *
       * Biên độ hẹp lại khi đang đi xuống: lúc đó chuyển động chính là cú hạ
       * theo phương đứng, thêm một cú lắc ngang mạnh chỉ làm nhoè nó.
       */
      const swayScale = reduced ? 0 : 1 - descent * 0.55;
      const swayX =
        (Math.sin(elapsed * 0.075) * 0.75 + pointerX * 0.9 * pointerScale) * swayScale;
      const swayY =
        (Math.sin(elapsed * 0.055) * 0.16 - pointerY * 0.28 * pointerScale) * swayScale;

      const camY = stand.aboveY + (stand.belowY - stand.aboveY) * descent;
      const camZ = stand.aboveZ + (stand.belowZ - stand.aboveZ) * descent;
      const targetY = stand.aboveTargetY + (stand.belowTargetY - stand.aboveTargetY) * descent;

      camera.position.set(swayX, camY + swayY, camZ);
      target.set(0, targetY, 0);
      camera.lookAt(target);
    },

    dispose() {
      disposeObject(root);
      scene.remove(root);
    },
  };
}

export default function OpeningScene({ stageRef }: { stageRef: RefObject<HTMLElement | null> }) {
  const setup = useCallback((init: StageInit) => createOpeningScene(init), []);
  /*
   * Trần pixel ratio 1 và trần 30 khung hình mỗi giây.
   *
   * Đây là canvas duy nhất trải kín cả màn hình, nên nó là cảnh đắt nhất trang —
   * mà chi phí không nằm ở hình học (cả cảnh gói trong bốn lệnh vẽ) mà ở việc
   * xoá rồi ghép lại vài triệu điểm ảnh trong suốt ở mỗi khung. Hai cái trần này
   * cắt chi phí đó xuống còn khoảng một phần ba.
   *
   * Đổi lại gần như không mất gì: chuyển động tự thân của cảnh chậm tới mức một
   * vòng đưa máy quay mất hơn một phút, còn cú hạ xuống thì do tay người dùng
   * điều khiển và đã được làm mượt sẵn — 30 khung hình mỗi giây không phân biệt
   * được với 60. Hình thì chỉ gồm đường mảnh ở độ mờ 10–40% trên nền tối, ở đó
   * pixel ratio 1 làm nét mềm đi một chút chứ không làm hỏng.
   */
  const options = useMemo(
    () => ({
      scrollRef: stageRef,
      trackPointer: true,
      fov: 44,
      cameraZ: 12,
      maxPixelRatio: 1,
      maxFps: 30,
      /*
       * Quầng sáng cho khung công trình. Ngưỡng đặt cao (0,62) để chỉ những nét
       * vàng đồng của kết cấu bắt sáng, còn lưới nền mờ và hạt bụi thì không —
       * cho quầng bám vào tất cả thì cả màn hình sáng đều lên như sương mù, và
       * kết cấu mất hẳn vai trò chủ thể.
       */
      bloom: { threshold: 0.62, strength: 0.75, radius: 1.5 },
    }),
    [stageRef]
  );
  const { containerRef } = useThreeStage(setup, options);

  return <div ref={containerRef} aria-hidden="true" className="absolute inset-0" />;
}
