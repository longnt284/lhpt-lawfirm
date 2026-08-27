/*
 * Chuỗi khối trôi từ trên xuống suốt chiều dài trang chủ.
 *
 * Hình: những khối hộp khung dây xâu thành một dây xoắn rất thoải, mỗi khối nối
 * với khối kế tiếp bằng hai sợi mảnh. Đọc ra là một chuỗi hồ sơ nối nhau — mắt
 * xích này khoá vào mắt xích kia — chứ không phải đồ hoạ tiền mã hoá: không có
 * khối phát sáng, không mã băm chạy, không màu neon. Vẫn đúng bảng màu của
 * hãng: phần lớn là đường mờ màu fog, mỗi chu kỳ có đúng một khối điểm nhấn màu
 * đồng thau.
 *
 * Người dùng cuộn thì chuỗi chảy xuống. Đó là toàn bộ tương tác.
 *
 * ============================================================
 * Thủ thuật quyết định hiệu năng của cảnh này: băng chuyền tuần hoàn
 * ============================================================
 *
 * Cách làm hiển nhiên là mỗi khối một Object3D, mỗi khung hình đặt lại vị trí
 * từng khối, khối nào trôi khỏi đáy thì bê ngược lên đỉnh. Cách đó tốn một lệnh
 * vẽ cho mỗi khối và một vòng lặp JavaScript cho mỗi khung hình.
 *
 * Ở đây làm khác. Toàn bộ chuỗi là *một* BufferGeometry dựng sẵn đúng một lần,
 * và cả khung hình chỉ có một dòng việc: dịch nhóm chứa nó xuống. Khi đã dịch
 * đủ một chu kỳ thì kéo về chỗ cũ — mà vì mọi khối cách nhau đúng một chu kỳ và
 * hoa văn lặp lại đúng một chu kỳ, khung hình ngay trước và ngay sau cú kéo về
 * *giống hệt nhau từng điểm ảnh*. Mắt không thấy đường nối, còn máy thì được
 * một băng chuyền vô tận với một lệnh vẽ và không một phép tính đỉnh nào.
 *
 * Cái giá phải trả nằm ở chỗ khác, và phải nói rõ để sau này không ai sửa nhầm:
 * *mọi* khác biệt giữa các khối đều phải tuần hoàn theo chu kỳ. Muốn khối thứ ba
 * nghiêng khác khối thứ chín thì không được — trừ khi ba và chín cách nhau đúng
 * bội số chu kỳ. Vì vậy mọi biến thể trong file này đều tính từ `phase`, tức vị
 * trí của khối *bên trong* chu kỳ, chứ không từ chỉ số tuyệt đối của nó.
 *
 * Dựng ba bản chồng lên nhau thay vì một là để dải hình luôn phủ kín khung nhìn
 * ở mọi pha dịch chuyển; phần thừa nằm ngoài khung hình không tốn gì đáng kể vì
 * cả cảnh chưa tới hai nghìn đỉnh.
 */
import { useCallback, useMemo, type RefObject } from "react";
import * as THREE from "three";
import {
  disposeObject,
  fitDistance,
  useThreeStage,
  type StageHandle,
  type StageInit,
} from "../../lib/threeStage";

/* Màu lấy đúng từ bảng thương hiệu trong index.css. */
const BRASS = new THREE.Color(0xc9a44c);
const BRASS_SOFT = new THREE.Color(0xdfc27d);
const FOG = new THREE.Color(0x9db0c4);
const JADE = new THREE.Color(0x22c49c);

/* ---------- nhịp của chuỗi ---------- */
/*
 * Tỉ lệ giữa `SPACING` và `BLOCK_H` là thứ quyết định hình này đọc ra cái gì, và
 * nó nhạy hơn vẻ ngoài rất nhiều. Khoảng hở gấp đôi thân khối thì mắt thấy mấy
 * cái hộp rời trôi lơ lửng; khoảng hở xấp xỉ thân khối thì mới thấy một sợi
 * xích. Cùng lúc đó khung nhìn phải chứa được chừng sáu khối — ít hơn thì không
 * đủ để thành một dòng chảy, nhiều hơn thì thành hoa văn dày đặc tranh chỗ với
 * phần chữ.
 */
const SPACING = 1.9; // khoảng cách giữa tâm hai khối liền nhau

/** Kích thước một khối và biên độ dây xoắn. */
type Shape = {
  w: number;
  h: number;
  d: number;
  lateral: number;
  depth: number;
};

/*
 * Khối *hẹp hơn* trên màn hình dọc, và đây không phải chuyện tiết kiệm tài
 * nguyên mà là một ràng buộc hình học không tránh được.
 *
 * Số khối thấy được theo chiều dọc đã bị chốt ở khoảng sáu. Một khi đã chốt như
 * vậy thì chiều cao mỗi khối tính theo điểm ảnh cũng bị chốt theo — và với tỉ lệ
 * hai-trên-một của bản màn hình ngang, bề ngang khối chiếm gần một phần ba bề
 * ngang một chiếc điện thoại. Lùi máy quay ra xa không cứu được: lùi ra thì thấy
 * nhiều khối hơn theo chiều dọc, và chiều cao mỗi khối co lại đúng bằng tỉ lệ
 * đã mất. Cần gạt duy nhất còn lại là chính tỉ lệ của khối.
 */
const WIDE: Shape = { w: 0.82, h: 0.42, d: 0.4, lateral: 1.25, depth: 1 };
const NARROW: Shape = { w: 0.58, h: 0.42, d: 0.34, lateral: 0.95, depth: 0.85 };

/*
 * Quãng đường chuỗi trôi được khi người dùng cuộn hết trang, tính bằng số khối.
 *
 * Con số này là cần gạt chính của cảm giác: nhỏ quá thì chuỗi gần như đứng yên
 * trong khi trang đã chạy mấy màn hình, lớn quá thì mỗi cú lăn chuột thành một
 * vệt mờ. Bốn tám khối trên một trang cao khoảng mười ba màn hình rơi vào
 * khoảng bốn khối trôi qua cho mỗi màn hình cuộn — đủ để thấy rõ là dòng chảy,
 * chưa đủ để giành sự chú ý với phần chữ.
 */
const FLOW_BLOCKS = 48;

/* Chuỗi vẫn trôi rất chậm khi người dùng dừng cuộn — một khối mất hơn tám giây. */
const IDLE_DRIFT = 0.3;

/* Mặt sau mờ hơn mặt trước — chênh lệch này chính là thứ cho khối một bề dày. */
const BACK_FADE = 0.34;

const TAU = Math.PI * 2;

/** Số dư luôn không âm; `%` của JavaScript giữ dấu của số bị chia. */
const wrap = (value: number, span: number) => ((value % span) + span) % span;

type Vec3 = [number, number, number];

class LineBatch {
  positions: number[] = [];
  colors: number[] = [];

  add(a: Vec3, b: Vec3, color: THREE.Color, alpha: number) {
    this.positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    this.colors.push(color.r, color.g, color.b, alpha, color.r, color.g, color.b, alpha);
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
    // Không ghi vào bộ đệm chiều sâu: các đường đều mờ và chồng lên nhau, ghi
    // chiều sâu sẽ khiến đường vẽ trước che mất đường vẽ sau tuỳ thứ tự.
    depthWrite: false,
    opacity,
  });
  return { object: new THREE.LineSegments(batch.build(), material), material };
}

/**
 * Tám đỉnh của một khối hộp đã xoay quanh trục đứng rồi nghiêng, đặt tại `center`.
 *
 * Xoay được nướng thẳng vào toạ độ đỉnh lúc dựng chứ không đặt lên Object3D:
 * cả chuỗi phải nằm gọn trong một geometry duy nhất, nên không có chỗ cho phép
 * biến hình riêng của từng khối.
 */
function boxCorners(
  shape: Shape,
  center: Vec3,
  yaw: number,
  roll: number,
  scale: number
): Vec3[] {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cr = Math.cos(roll);
  const sr = Math.sin(roll);
  const w = shape.w * scale;
  const h = shape.h * scale;
  const d = shape.d * scale;

  const corners: Vec3[] = [];
  // Thứ tự bit: 0 = x, 1 = y, 2 = z. Nhờ vậy hai đỉnh của một cạnh luôn lệch
  // nhau đúng một bit, và bảng cạnh bên dưới viết được bằng phép XOR.
  for (let i = 0; i < 8; i++) {
    const lx = (i & 1 ? 1 : -1) * w;
    const ly = (i & 2 ? 1 : -1) * h;
    const lz = (i & 4 ? 1 : -1) * d;

    // Nghiêng quanh trục Z trước, rồi xoay quanh trục Y.
    const rx = lx * cr - ly * sr;
    const ry = lx * sr + ly * cr;
    corners.push([
      center[0] + rx * cy + lz * sy,
      center[1] + ry,
      center[2] - rx * sy + lz * cy,
    ]);
  }
  return corners;
}

const BOX_EDGES: Array<[number, number]> = [];
for (let i = 0; i < 8; i++) {
  for (const bit of [1, 2, 4]) {
    const j = i ^ bit;
    if (j > i) BOX_EDGES.push([i, j]);
  }
}

/**
 * Một khối trong chuỗi: khung hộp, một vạch niêm phong trên mặt trước, và điểm
 * neo để nối sang khối kế tiếp.
 *
 * Cạnh nằm hẳn ở mặt sau được vẽ mờ hơn. Đó là toàn bộ thứ tạo ra cảm giác khối
 * có bề dày — cảnh này không có đèn, không có mặt đặc, nên chiều sâu phải đến từ
 * chênh lệch độ mờ cộng với chuyển động thị sai của máy quay.
 */
function emitBlock(
  batch: LineBatch,
  shape: Shape,
  center: Vec3,
  yaw: number,
  roll: number,
  scale: number,
  color: THREE.Color,
  alpha: number
) {
  const corners = boxCorners(shape, center, yaw, roll, scale);
  for (const [a, b] of BOX_EDGES) {
    // Cạnh có cả hai đỉnh ở mặt sau (bit 4 tắt) thì mờ hẳn; cạnh nối trước–sau
    // nằm ở khoảng giữa.
    const front = (a & 4 ? 1 : 0) + (b & 4 ? 1 : 0);
    const fade = front === 2 ? 1 : front === 1 ? 0.7 : BACK_FADE;
    batch.add(corners[a], corners[b], color, alpha * fade);
  }

  /*
   * Vạch niêm phong: một đường ngang chạy giữa mặt trước, thụt vào hai đầu. Chi
   * tiết duy nhất bên trong khối, và nó có việc của nó — thiếu nó thì mười tám
   * cái hộp rỗng nhìn ra một dãy lồng chim, có nó thì ra một xấp hồ sơ đã đóng
   * dấu.
   */
  const [c0, c1] = [corners[4], corners[5]]; // hai đỉnh dưới của mặt trước
  const [c2, c3] = [corners[6], corners[7]]; // hai đỉnh trên của mặt trước
  const mid = (a: Vec3, b: Vec3, t: number): Vec3 => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
  const left = mid(mid(c0, c2, 0.5), mid(c1, c3, 0.5), 0.16);
  const right = mid(mid(c0, c2, 0.5), mid(c1, c3, 0.5), 0.84);
  batch.add(left, right, color, alpha * 0.55);
}

/**
 * Vị trí tâm và tư thế của khối thứ `i`.
 *
 * Mọi thứ ở đây chỉ phụ thuộc `phase` — vị trí của khối bên trong chu kỳ — chứ
 * không phụ thuộc `i`. Đó là điều kiện sống còn của băng chuyền tuần hoàn: khối
 * thứ `i` và khối thứ `i + PERIOD` phải giống nhau tuyệt đối, nếu không cú kéo
 * về cuối mỗi chu kỳ sẽ hiện ra thành một cú giật.
 */
function blockPose(shape: Shape, phase: number) {
  const angle = phase * TAU;
  return {
    x: Math.sin(angle) * shape.lateral,
    z: Math.cos(angle) * shape.depth,
    // Khối xoay theo tiếp tuyến của dây xoắn, nên nó luôn "quay mặt" đúng hướng
    // đang đi thay vì trượt ngang một cách vô lý.
    yaw: Math.cos(angle) * 0.42,
    roll: Math.sin(angle + 1.1) * 0.075,
  };
}

/**
 * Dựng một sợi chuỗi hoàn chỉnh: các khối, các mối nối, và ba bản chồng lên nhau
 * để dải hình luôn dài hơn khung nhìn.
 */
function buildStrand(
  shape: Shape,
  period: number,
  scale: number,
  color: THREE.Color,
  accent: THREE.Color,
  alpha: number
) {
  const batch = new LineBatch();
  const span = period * SPACING;
  /*
   * Đặt dải hình sao cho vùng *luôn* được phủ kín — phần giao của mọi pha dịch
   * chuyển — nằm cân đối quanh gốc toạ độ, để máy quay ngắm thẳng vào giữa mà
   * không bao giờ nhìn thấy hai đầu hở của dải.
   */
  const top = 2 * span - SPACING / 2;
  const count = period * 3;

  const centerOf = (i: number): Vec3 => {
    const pose = blockPose(shape, (i % period) / period);
    return [pose.x, top - i * SPACING, pose.z];
  };

  for (let i = 0; i < count; i++) {
    const phase = (i % period) / period;
    const pose = blockPose(shape, phase);
    const center = centerOf(i);
    // Đúng một khối mỗi chu kỳ được tô đồng thau. Điểm nhấn thưa thì mới là điểm
    // nhấn; tô tất cả thì thành một dây đèn.
    const isAccent = i % period === 0;
    emitBlock(
      batch,
      shape,
      center,
      pose.yaw,
      pose.roll,
      scale,
      isAccent ? accent : color,
      isAccent ? alpha * 1.5 : alpha
    );

    /*
     * Mối nối sang khối kế tiếp: hai sợi song song lệch sang hai bên, không phải
     * một sợi ở giữa. Một sợi thì nhìn ra dây treo; hai sợi thì nhìn ra mắt xích
     * — cùng số đường, khác hẳn ý nghĩa.
     */
    if (i < count - 1) {
      const next = centerOf(i + 1);
      const gapAlpha = alpha * 0.5;
      const rail = shape.w * 0.37 * scale;
      for (const offset of [-rail, rail]) {
        batch.add(
          [center[0] + offset, center[1] - shape.h * scale, center[2]],
          [next[0] + offset, next[1] + shape.h * scale, next[2]],
          color,
          gapAlpha
        );
      }
    }
  }

  return { batch, span };
}

/**
 * Bụi sáng thưa trôi cùng dòng chảy, tuần hoàn theo đúng chu kỳ của chuỗi.
 *
 * Toạ độ Y bị ép về đúng bội số của chu kỳ nên lớp này dùng chung được thủ thuật
 * băng chuyền: nó cũng chỉ là một nhóm bị dịch xuống, không có vòng lặp cập nhật
 * nào ở mỗi khung hình.
 */
function buildMotes(count: number, span: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 13;
    positions[i * 3 + 1] = 2 * span - Math.random() * span * 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: BRASS_SOFT,
    size: 0.045,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  return { object: new THREE.Points(geometry, material), material };
}

function createChainScene({ scene, camera, compact, reduced }: StageInit): StageHandle {
  const root = new THREE.Group();
  scene.add(root);

  const shape = compact ? NARROW : WIDE;

  /*
   * Chu kỳ phải dài hơn số khối thấy được cùng lúc, nếu không người dùng nhìn
   * thẳng vào chỗ hoa văn lặp lại và cả thủ thuật băng chuyền lộ ra. Khung nhìn
   * chứa khoảng sáu khối, và những khung dọc rất hẹp đẩy con số đó lên tám —
   * chín là mức có dư ở cả hai đầu.
   *
   * Thêm vài khối không tốn gì đáng nói: cả cảnh vẫn gói trong ba lệnh vẽ.
   */
  const period = 9;

  /* ---------- sợi gần ---------- */
  const near = buildStrand(shape, period, 1, FOG, BRASS, 0.24);
  const nearLayer = lineLayer(near.batch, 1);
  const nearGroup = new THREE.Group();
  nearGroup.add(nearLayer.object);
  root.add(nearGroup);

  /* ---------- sợi xa ---------- */
  /*
   * Sợi thứ hai nhỏ hơn, mờ hơn, lùi sâu hơn, và trôi chậm hơn. Chuyển động thị
   * sai giữa hai sợi là thứ biến một dải hình phẳng thành một không gian có
   * chiều sâu — rẻ hơn nhiều so với thêm đèn hay sương mù, và đây cũng là lớp
   * đầu tiên bị bỏ khi máy không theo kịp.
   */
  const far = buildStrand(shape, period, 0.8, FOG, JADE, 0.115);
  const farLayer = lineLayer(far.batch, 1);
  const farGroup = new THREE.Group();
  farGroup.position.set(compact ? 1.2 : 2.9, 0, -6);
  farGroup.add(farLayer.object);
  root.add(farGroup);

  /* ---------- bụi ---------- */
  const motes = compact ? null : buildMotes(90, near.span);
  const moteGroup = new THREE.Group();
  if (motes) {
    moteGroup.add(motes.object);
    root.add(moteGroup);
  }

  /* ---------- khung hình ---------- */
  /*
   * Máy quay chỉ lùi đủ xa để bề ngang của chuỗi lọt khung. Cố tình *không* cho
   * chiều dọc lọt khung: chuỗi phải tràn khỏi mép trên và mép dưới, vì đó chính
   * là thứ nói với mắt rằng dòng chảy không có điểm đầu và điểm cuối.
   */
  const halfWidth = shape.lateral + shape.w + 0.5;
  const reframe = () => {
    camera.position.z = Math.max(15, fitDistance(camera, halfWidth, 0, 1.05));
  };
  reframe();

  const target = new THREE.Vector3(0, 0, 0);

  return {
    resize() {
      reframe();
    },

    quality(tier) {
      // Bỏ lớp phụ theo đúng thứ tự ít mất mát nhất: bụi trước, rồi tới sợi xa.
      if (tier >= 1) moteGroup.visible = false;
      if (tier >= 2) farGroup.visible = false;
    },

    update({ elapsed, progress, pointerX, pointerY }) {
      /*
       * Cuộn là nguồn chuyển động chính, thời gian chỉ là phần trôi nền để chuỗi
       * không chết cứng lúc người đọc dừng lại. Ở chế độ giảm chuyển động thì bỏ
       * hẳn phần trôi nền: lúc đó cảnh chỉ được phép nhúc nhích khi chính tay
       * người dùng cuộn.
       */
      const flow = progress * FLOW_BLOCKS * SPACING + (reduced ? 0 : elapsed * IDLE_DRIFT);

      // Ba lớp, ba tốc độ, cùng một nguồn. Đây là toàn bộ phần việc của mỗi
      // khung hình — không có đỉnh nào bị tính lại.
      nearGroup.position.y = -wrap(flow, near.span);
      farGroup.position.y = -wrap(flow * 0.62, far.span);
      moteGroup.position.y = -wrap(flow * 0.34, near.span);

      /*
       * Máy quay đưa qua đưa lại rất chậm — một vòng mất hơn một phút — và bám
       * nhẹ theo con trỏ. Chuỗi thì không tự xoay: một dãy khối mà tự quay tròn
       * là lập tức thành đồ hoạ game. Chiều sâu đến từ chỗ máy quay dịch chỗ,
       * làm sợi gần và sợi xa trượt lệch nhau.
       */
      const sway = reduced ? 0 : 1;
      camera.position.x = (Math.sin(elapsed * 0.068) * 0.85 + pointerX * 0.75) * sway;
      camera.position.y = (Math.sin(elapsed * 0.049) * 0.35 - pointerY * 0.5) * sway;
      camera.lookAt(target);
    },

    dispose() {
      disposeObject(root);
      scene.remove(root);
    },
  };
}

/*
 * Cả trang là một khối cuộn duy nhất, nên mốc đo tiến trình chính là phần tử gốc
 * của tài liệu: `useThreeStage` lấy chiều cao của nó trừ đi chiều cao khung nhìn,
 * ra đúng quãng cuộn từ đầu tới cuối trang.
 *
 * Đi đường này thay vì tự nghe sự kiện cuộn còn được thêm một thứ không hiển
 * nhiên: `ResizeObserver` trong sân khấu đang theo dõi chính phần tử đó, nên khi
 * khối nội dung nạp muộn hạ xuống và trang cao thêm vài nghìn điểm ảnh, tiến
 * trình tự đo lại. Nếu đóng cứng chiều cao trang ở lần đo đầu thì chuỗi sẽ chảy
 * hết đà khi người đọc mới ở lưng chừng.
 */
function usePageRef(): RefObject<HTMLElement | null> {
  return useMemo(() => ({ current: document.documentElement as HTMLElement }), []);
}

export default function ChainScene() {
  const setup = useCallback((init: StageInit) => createChainScene(init), []);
  const pageRef = usePageRef();

  /*
   * Trần pixel ratio 1 và trần 30 khung hình mỗi giây, giống cảnh mở đầu và vì
   * cùng một lý do: đây là canvas trong suốt trải kín màn hình, nên chi phí nằm
   * ở số điểm ảnh phải ghép lại chứ không ở hình học — cả cảnh chỉ ba lệnh vẽ.
   *
   * `adaptive` thì chỉ cảnh này bật. Hai cảnh xem trước và cảnh mở đầu đều trôi
   * qua trong vài màn hình cuộn, còn cảnh này sống suốt cả trang: nó là cảnh duy
   * nhất mà việc đo vài giây rồi tự hạ chất lượng kịp có tác dụng.
   */
  const options = useMemo(
    () => ({
      scrollRef: pageRef,
      trackPointer: true,
      fov: 42,
      cameraZ: 15,
      maxPixelRatio: 1,
      maxFps: 30,
      adaptive: true,
    }),
    [pageRef]
  );
  const { containerRef } = useThreeStage(setup, options);

  /*
   * Mặt nạ chuyển sắc ở hai mép: chuỗi phải *tan* vào nền chứ không bị cắt cụt
   * bởi mép màn hình. Làm bằng CSS chứ không bằng sương mù của three.js — sương
   * mù pha về một màu đặc, mà canvas ở đây trong suốt và phía sau nó còn các
   * quầng sáng nền đang chuyển động, nên pha màu đặc sẽ thành hai vệt tối đè lên
   * chúng. Mặt nạ CSS thì do compositor lo, không tốn khung hình nào.
   */
  return <div ref={containerRef} aria-hidden="true" className="chain-mask absolute inset-0" />;
}
