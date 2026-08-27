import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { RUBIK_WAVES, createRubik } from "../src/components/three/rubikModel.ts";

const CELL = 1.2;
const EDGE_POINTS = 24;

/**
 * Tâm của từng khối con, đọc ngược ra từ chính bộ đỉnh mà cảnh đang vẽ.
 *
 * Đọc từ dữ liệu vẽ chứ không từ trạng thái nội bộ là có chủ đích: thứ có thể
 * sai ở đây là *hình cuối cùng trên màn hình*, và chỉ bộ đỉnh mới nói được điều
 * đó. Kiểm tra biến nội bộ thì một lỗi ở khâu ghi toạ độ vẫn lọt.
 */
function readCentres(edges: THREE.LineSegments) {
  const attribute = edges.geometry.getAttribute("position") as THREE.BufferAttribute;
  const centres: Array<[number, number, number]> = [];
  for (let cubie = 0; cubie < attribute.count / EDGE_POINTS; cubie++) {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let i = 0; i < EDGE_POINTS; i++) {
      const index = cubie * EDGE_POINTS + i;
      x += attribute.getX(index);
      y += attribute.getY(index);
      z += attribute.getZ(index);
    }
    centres.push([x / EDGE_POINTS, y / EDGE_POINTS, z / EDGE_POINTS]);
  }
  return centres;
}

const onGrid = (centre: [number, number, number]) =>
  centre.every((value) => Math.abs(value / CELL - Math.round(value / CELL)) < 0.02);
const cellKey = (centre: [number, number, number]) =>
  centre.map((value) => Math.round(value / CELL)).join(",");

function findEdges(model: ReturnType<typeof createRubik>) {
  const edges = model.group.children.find((child) => child instanceof THREE.LineSegments);
  assert.ok(edges, "khối phải vẽ đường nét bằng một LineSegments duy nhất");
  return edges as THREE.LineSegments;
}

test("khối liền lại thành đúng một rubik 3x3x3", () => {
  const model = createRubik({ cell: CELL, twistEvery: 0 });
  const edges = findEdges(model);
  model.update({ waveProgress: () => 1, elapsed: 0, delta: 1 / 60, allowTwist: false });

  const centres = readCentres(edges);
  // 27 ô trừ ô lõi không bao giờ lộ ra.
  assert.equal(centres.length, 26);
  assert.ok(centres.every(onGrid), "mọi khối con phải nằm đúng ô lưới của nó");
  assert.equal(new Set(centres.map(cellKey)).size, 26, "không ô nào được trùng");

  model.dispose();
});

test("năm đợt ghép phủ hết khối và không đợt nào trống", () => {
  const model = createRubik({ cell: CELL, twistEvery: 0 });
  const edges = findEdges(model);

  let previous = 0;
  for (let wave = 0; wave < RUBIK_WAVES; wave++) {
    model.update({
      waveProgress: (index) => (index <= wave ? 1 : 0),
      elapsed: 0,
      delta: 1 / 60,
      allowTwist: false,
    });
    const placed = readCentres(edges).filter(onGrid).length;
    assert.ok(placed > previous, `đợt ${wave} phải đặt thêm được ít nhất một mảnh`);
    previous = placed;
  }
  assert.equal(previous, 26, "hết năm đợt thì cả 26 mảnh phải vào chỗ");

  model.dispose();
});

test("cú xoay tầng chạy rồi trả khối về đúng lưới, không mất và không chồng ô", () => {
  const model = createRubik({ cell: CELL, twistEvery: 1, twistSpan: 0.5 });
  const edges = findEdges(model);

  const delta = 1 / 60;
  let elapsed = 0;
  let sawTwistInMotion = false;

  // Bốn mươi giây là khoảng ba mươi cú xoay: đủ để một lỗi trôi số dấu phẩy
  // động trong khâu "bake" lộ ra thành ô lệch lưới hoặc hai mảnh chồng nhau.
  for (let frame = 0; frame < 60 * 40; frame++) {
    elapsed += delta;
    model.update({ waveProgress: () => 1, elapsed, delta, allowTwist: true });

    const centres = readCentres(edges);
    if (centres.some((centre) => !onGrid(centre))) {
      sawTwistInMotion = true;
      continue;
    }
    assert.equal(new Set(centres.map(cellKey)).size, 26, `khung ${frame}: có ô bị trùng`);
    for (const centre of centres) {
      for (const axis of centre) {
        assert.ok(
          Math.abs(Math.round(axis / CELL)) <= 1,
          `khung ${frame}: một mảnh trôi ra ngoài lưới 3x3x3`
        );
      }
    }
  }

  assert.ok(sawTwistInMotion, "phải có cú xoay tầng thực sự chạy");
  model.dispose();
});

test("tiến trình 0 thì các mảnh văng hẳn ra khỏi chỗ của chúng", () => {
  const model = createRubik({ cell: CELL, twistEvery: 0 });
  const edges = findEdges(model);
  model.update({ waveProgress: () => 0, elapsed: 0, delta: 1 / 60, allowTwist: false });

  const centres = readCentres(edges);
  const scattered = centres.filter(([x, y, z]) => Math.hypot(x, y, z) > CELL * 2.4).length;
  assert.ok(scattered >= 20, `chỉ có ${scattered}/26 mảnh văng ra xa`);

  model.dispose();
});
