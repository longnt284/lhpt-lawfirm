/*
 * Cảnh 3D nền của hero: một khối hiên cột dựng bằng khung dây, đứng sau toàn bộ
 * nội dung.
 *
 * Hình lấy thẳng từ dấu hiệu nhận diện của hãng — ô vuông trong logo là một
 * hàng cột đỡ mái dốc — và từ câu tiêu đề, "Nền pháp lý vững, cho mọi công
 * trình". Người mở trang không nhìn vào một hoạ tiết trang trí: họ nhìn thấy
 * đúng cái công trình mà dòng chữ đang nói tới, dựng ở cỡ đài tưởng niệm.
 *
 * Bố cục hero quyết định gần như mọi thứ ở đây. Chữ chiếm nửa trái, bảng hồ sơ
 * năng lực chiếm nửa phải, dải ticker chốt đáy — nghĩa là không còn mảng trống
 * nào đủ rộng để đặt một vật thể vào. Vậy nên vật thể phải nằm *sau* chữ, và
 * lựa chọn duy nhất còn lại là chọn hình nào ít phá chữ nhất. Câu trả lời là
 * đường đứng: thân cột chạy dọc phía sau chữ đọc ra như một nhịp nền, giống thứ
 * lưới mảnh vốn đã có sẵn trong nền trang, trong khi đường chéo cắt ngang nét
 * chữ thì lập tức làm chữ khó đọc. Vì vậy mọi thanh ngang lớn — diềm mái, mặt
 * dốc, bậc thềm — đều được đẩy lên dải trống phía trên và xuống dải trống phía
 * dưới, chừa lại đúng phần thân cột cho vùng có chữ.
 *
 * Ba lựa chọn kỹ thuật đáng nói:
 *
 * 1. Toàn bộ khối là *một* BufferGeometry, một lệnh vẽ. Độ mờ giảm dần theo
 *    chiều sâu được nướng sẵn vào màu từng đỉnh (RGBA) chứ không dùng sương mù
 *    của three.js: sương mù pha về một màu đặc, mà canvas ở đây trong suốt và
 *    phía sau nó còn ba quầng sáng nền đang chuyển động — pha về màu đặc sẽ
 *    thành những vệt tối đè lên chúng.
 *
 * 2. Không có gì quay tròn. Một toà kiến trúc mà xoay là lập tức thành đồ hoạ
 *    game. Chiều sâu đến từ thị sai: máy quay đưa qua đưa lại rất chậm và bám
 *    nhẹ theo con trỏ, nên mặt trước và mặt sau của khối trượt lệch nhau — đó
 *    mới là thứ mắt đọc ra không gian ba chiều.
 *
 * 3. Cảnh mờ dần theo tiến trình cuộn rồi bị gỡ hẳn khỏi bố cục — xem
 *    `HeroBackdrop`. Lúc đó vòng lặp vẽ cũng dừng, do `useThreeStage` lo.
 */
import { useCallback, useMemo } from "react";
import * as THREE from "three";
import {
  disposeObject,
  useThreeStage,
  type StageHandle,
  type StageInit,
} from "../../lib/threeStage";

/* Màu lấy đúng từ bảng thương hiệu trong index.css. */
const BRASS = new THREE.Color(0xc9a44c);
const BRASS_SOFT = new THREE.Color(0xdfc27d);
const FOG = new THREE.Color(0x9db0c4);
const JADE = new THREE.Color(0x22c49c);

/* ---------- kích thước khối hiên ---------- */
const DEPTH = 0.95; // nửa bề dày khối, quyết định biên độ thị sai
const SHAFT_BOTTOM = -2.55;
const SHAFT_TOP = 2.5;
const CAP_TOP = 2.82; // đỉnh đầu cột
const ARCHITRAVE_TOP = 3.32;
const RIDGE = 4.85; // đỉnh mái dốc
const COLUMN_HALF = 0.3;

/*
 * Trục các cột. Số chẵn và bỏ trống trục giữa — đúng như một hiên cột cổ điển,
 * và cũng đúng thứ bố cục này cần: khoảng giữa khung là chỗ đậm nhất của tiêu
 * đề, không nên có thân cột chạy qua.
 */
const COLUMNS = [-5.7, -3.5, -1.35, 1.35, 3.5, 5.7];
const COLUMNS_COMPACT = [-3.5, -1.35, 1.35, 3.5];

/*
 * Mặt sau mờ hơn mặt trước. Chênh lệch này chính là thứ cho khối một bề dày:
 * không có nó, cả khối dẹt xuống thành một bản vẽ mặt đứng.
 */
const backFade = 0.34;

type Vec = [number, number, number];

class LineBatch {
  positions: number[] = [];
  colors: number[] = [];

  add(a: Vec, b: Vec, color: THREE.Color, alpha: number) {
    this.positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    this.colors.push(color.r, color.g, color.b, alpha, color.r, color.g, color.b, alpha);
  }

  /** Vẽ khung của một mặt chữ nhật nằm ở một chiều sâu cho trước. */
  rect(x0: number, x1: number, y0: number, y1: number, z: number, color: THREE.Color, alpha: number) {
    this.add([x0, y0, z], [x1, y0, z], color, alpha);
    this.add([x1, y0, z], [x1, y1, z], color, alpha);
    this.add([x1, y1, z], [x0, y1, z], color, alpha);
    this.add([x0, y1, z], [x0, y0, z], color, alpha);
  }

  /**
   * Một khối hộp: mặt trước, mặt sau mờ hơn, và bốn cạnh nối hai mặt.
   *
   * Đây là đơn vị dựng hình duy nhất của cả cảnh — thân cột, đầu cột, diềm mái
   * và bậc thềm đều là hộp, chỉ khác tỉ lệ. Nhờ vậy khối nào cũng có bề dày
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

function createHeroScene({ scene, camera, compact, reduced }: StageInit): StageHandle {
  const root = new THREE.Group();
  scene.add(root);

  const columns = compact ? COLUMNS_COMPACT : COLUMNS;
  const span = columns[columns.length - 1] + 1.15;
  const batch = new LineBatch();

  /* ---------- thân cột ---------- */
  /*
   * Đây là phần duy nhất chạy qua vùng có chữ, nên nó cũng là phần mờ nhất.
   */
  columns.forEach((x) => {
    /*
     * Thân cột cố tình *không* dựng bằng khối hộp như mọi bộ phận khác, dù bộ
     * dựng hình có sẵn hàm đó. Khung hộp thêm hai vạch ngang ở đầu và chân thân
     * cùng bốn cạnh nối, và sáu cột như vậy biến vùng có chữ thành một mạng lưới
     * ô vuông — đúng thứ làm chữ khó đọc. Bốn đường đứng là đủ để mắt đọc ra
     * cột, còn phần chấm dứt trên dưới đã có đầu cột và chân cột lo.
     */
    for (const dx of [-COLUMN_HALF, COLUMN_HALF]) {
      batch.add([x + dx, SHAFT_BOTTOM, DEPTH], [x + dx, SHAFT_TOP, DEPTH], FOG, 0.17);
      batch.add([x + dx, SHAFT_BOTTOM, -DEPTH], [x + dx, SHAFT_TOP, -DEPTH], FOG, 0.17 * backFade);
    }
    // Một đường soi giữa thân: đủ để cột không phải hai vạch song song, chưa đủ
    // để thành hoa văn.
    batch.add([x, SHAFT_BOTTOM + 0.24, DEPTH], [x, SHAFT_TOP - 0.24, DEPTH], FOG, 0.085);
  });

  /* ---------- đầu cột và chân cột ---------- */
  columns.forEach((x) => {
    batch.box(x - 0.46, x + 0.46, SHAFT_TOP, CAP_TOP, DEPTH + 0.12, BRASS, 0.24);
    batch.box(x - 0.46, x + 0.46, SHAFT_BOTTOM - 0.3, SHAFT_BOTTOM, DEPTH + 0.12, BRASS, 0.2);
  });

  /* ---------- diềm mái ---------- */
  /*
   * Thanh ngang lớn đầu tiên, và nó nằm trên dải trống phía trên tiêu đề.
   */
  batch.box(-span, span, CAP_TOP, ARCHITRAVE_TOP, DEPTH + 0.2, BRASS_SOFT, 0.3);
  batch.add([-span, CAP_TOP + 0.18, DEPTH + 0.2], [span, CAP_TOP + 0.18, DEPTH + 0.2], FOG, 0.16);

  /* ---------- mái dốc ---------- */
  /*
   * Hình tam giác lặp lại đúng nét vàng trong logo. Hai mặt trước và sau cùng
   * ba cạnh nối, nên nó cũng là một khối chứ không phải một hình phẳng.
   */
  const eaveY = ARCHITRAVE_TOP;
  const apex: Vec = [0, RIDGE, DEPTH + 0.2];
  const apexBack: Vec = [0, RIDGE, -(DEPTH + 0.2)];
  const leftEave: Vec = [-span, eaveY, DEPTH + 0.2];
  const rightEave: Vec = [span, eaveY, DEPTH + 0.2];
  const leftEaveBack: Vec = [-span, eaveY, -(DEPTH + 0.2)];
  const rightEaveBack: Vec = [span, eaveY, -(DEPTH + 0.2)];

  batch.add(leftEave, apex, BRASS, 0.42);
  batch.add(apex, rightEave, BRASS, 0.42);
  batch.add(leftEaveBack, apexBack, BRASS, 0.42 * backFade);
  batch.add(apexBack, rightEaveBack, BRASS, 0.42 * backFade);
  batch.add(apex, apexBack, BRASS, 0.24);
  batch.add(leftEave, leftEaveBack, BRASS, 0.2);
  batch.add(rightEave, rightEaveBack, BRASS, 0.2);
  // Đường viền trong của mặt dốc, lùi vào một chút — chi tiết duy nhất khiến
  // mái đọc ra là một mặt có bề dày chứ không phải hai vạch chéo.
  batch.add([-span + 0.5, eaveY + 0.26, DEPTH + 0.2], [0, RIDGE - 0.52, DEPTH + 0.2], FOG, 0.16);
  batch.add([0, RIDGE - 0.52, DEPTH + 0.2], [span - 0.5, eaveY + 0.26, DEPTH + 0.2], FOG, 0.16);

  /* ---------- bậc thềm ---------- */
  /*
   * Thanh ngang lớn thứ hai, nằm ở dải trống phía dưới, ngay trên dải ticker.
   * Ba bậc loe dần: nền của công trình, và cũng là chữ đầu tiên của tiêu đề.
   */
  const stepTop = SHAFT_BOTTOM - 0.3;
  [0, 1, 2].forEach((i) => {
    const y1 = stepTop - i * 0.36;
    const y0 = y1 - 0.36;
    const width = span + 0.36 + i * 0.46;
    const depth = DEPTH + 0.3 + i * 0.26;
    // Mỗi bậc chỉ cần mặt đứng phía trước và hai cạnh chạy về phía sau. Dựng đủ
    // khối hộp ở đây thì ba bậc chồng nhau thành một mớ đường ngang ken dày ngay
    // sát dải ticker.
    batch.rect(-width, width, y0, y1, depth, FOG, 0.19 - i * 0.03);
    batch.add([-width, y1, depth], [-width, y1, -depth], FOG, 0.1 - i * 0.02);
    batch.add([width, y1, depth], [width, y1, -depth], FOG, 0.1 - i * 0.02);
  });

  /*
   * Một dấu ngọc duy nhất, lệch tâm — cùng vai trò với ô vuông ngọc ở góc logo:
   * giữ cho cảnh không đơn sắc, mà không thêm một chi tiết nào phải giải thích.
   */
  batch.box(span - 0.5, span - 0.16, stepTop + 0.1, stepTop + 0.44, DEPTH + 0.32, JADE, 0.4);

  const shellGeometry = batch.build();
  const shellMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });
  root.add(new THREE.LineSegments(shellGeometry, shellMaterial));

  /* ---------- bụi vàng ---------- */
  /*
   * Số lượng cố tình thấp: vài chục hạt là đủ cho cảm giác không khí, còn hàng
   * chục nghìn hạt chỉ làm nóng máy mà mắt không đọc thêm được gì.
   */
  const dustCount = compact ? 55 : 120;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustColors = new Float32Array(dustCount * 4);
  const dustSpeeds = new Float32Array(dustCount);
  const dustFloor = stepTop - 1.6;
  const dustCeiling = RIDGE + 1.4;
  for (let i = 0; i < dustCount; i++) {
    // Hạt nằm cả trước lẫn sau khối, nên lúc máy quay đưa ngang, tầng bụi cũng
    // trượt lệch so với công trình.
    const z = (Math.random() * 2 - 1) * 4.5;
    dustPositions[i * 3] = (Math.random() * 2 - 1) * (span + 2.2);
    dustPositions[i * 3 + 1] = dustFloor + Math.random() * (dustCeiling - dustFloor);
    dustPositions[i * 3 + 2] = z;
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

  /*
   * Máy quay đứng thấp hơn tâm công trình và ngắm chếch lên: cùng một mẹo mà
   * ảnh kiến trúc vẫn dùng để một hàng cột trông cao hơn người xem.
   */
  /* Trục y của điểm ngắm được đặt lại theo tỉ lệ khung hình trong `reframe`. */
  const target = new THREE.Vector3(0, 0.85, 0);
  let baseY = -0.45;
  let baseZ = 12;

  const reframe = () => {
    const halfFov = Math.tan((camera.fov * Math.PI) / 360);
    const portrait = camera.aspect < 1;
    /*
     * Khoảng lùi suy ra từ tỉ lệ khung hình, không đặt cứng: khung dọc của điện
     * thoại hẹp hơn khung ngang tới ba lần, nên một con số vừa mắt trên laptop
     * sẽ cắt mất hai hàng cột ngoài cùng trên điện thoại.
     *
     * Ràng buộc theo chiều cao dùng số nhỏ hơn tổng chiều cao công trình có chủ
     * đích: bậc thềm dưới cùng được phép chạy ra ngoài mép dưới, vì phần đó nằm
     * sau dải ticker và không ai nhìn thấy.
     */
    const forHeight = 4.95 / halfFov;
    const forWidth = (span + 0.9) / (halfFov * camera.aspect);
    baseZ = Math.max(forHeight, forWidth);
    // Khung càng dọc thì công trình càng lùi xa, và mắt càng cần một điểm nhìn
    // thấp hơn để nó vẫn ra dáng đồ sộ.
    baseY = portrait ? -0.9 : -0.45;
    /*
     * `target` là điểm máy quay ngắm vào, nên nó cũng là cần gạt quyết định công
     * trình nằm cao hay thấp trong khung: ngắm cao hơn thì vật thể tụt xuống.
     *
     * Khung ngang cần hạ vừa đủ để đỉnh mái không chui vào sau thanh điều hướng
     * cố định ở mép trên. Khung dọc cần hạ thêm một nhịp nữa, vì ở đó chữ xếp
     * thành một cột dài và mặt dốc của mái sẽ cắt ngang đúng đoạn tiêu đề.
     */
    target.y = portrait ? 1.15 : 0.85;
  };
  reframe();

  return {
    resize() {
      reframe();
    },

    update({ elapsed, delta, pointerX, pointerY }) {
      if (reduced) {
        camera.position.set(0, baseY, baseZ);
        camera.lookAt(target);
        return;
      }

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

      /*
       * Máy quay đưa qua đưa lại theo hai nhịp lệch chu kỳ, cộng phần bám con
       * trỏ. Một vòng đưa ngang mất hơn một phút. Mặt trước và mặt sau của khối
       * trượt lệch nhau theo, và chính độ lệch đó — chứ không phải chuyển động
       * của bản thân công trình — là thứ làm mắt đọc ra chiều sâu.
       */
      const swayX = Math.sin(elapsed * 0.075) * 0.75 + pointerX * 0.9;
      const swayY = Math.sin(elapsed * 0.055) * 0.16 - pointerY * 0.28;
      camera.position.set(swayX, baseY + swayY, baseZ);
      camera.lookAt(target);
    },

    dispose() {
      disposeObject(root);
      scene.remove(root);
    },
  };
}

export default function HeroScene() {
  const setup = useCallback((init: StageInit) => createHeroScene(init), []);
  /*
   * Trần pixel ratio 1 và trần 30 khung hình mỗi giây.
   *
   * Đây là canvas duy nhất trải kín cả màn hình, nên nó là cảnh đắt nhất trang —
   * mà chi phí không nằm ở hình học (cả công trình gói trong đúng một lệnh vẽ)
   * mà ở việc xoá rồi ghép lại vài triệu điểm ảnh trong suốt ở mỗi khung. Hai
   * cái trần này cắt chi phí đó xuống còn khoảng một phần ba.
   *
   * Đổi lại gần như không mất gì: chuyển động của cảnh chậm tới mức một vòng
   * đưa máy quay mất hơn một phút, nên 30 khung hình mỗi giây không phân biệt
   * được với 60; còn hình thì chỉ gồm đường mảnh ở độ mờ 10–30% trên nền tối,
   * ở đó pixel ratio 1 làm nét mềm đi một chút chứ không làm hỏng.
   */
  const options = useMemo(
    () => ({ trackPointer: true, fov: 44, cameraZ: 12, maxPixelRatio: 1, maxFps: 30 }),
    []
  );
  const { containerRef } = useThreeStage(setup, options);

  return <div ref={containerRef} aria-hidden="true" className="absolute inset-0" />;
}
