import assert from "node:assert/strict";
import test from "node:test";
import { clamp01, clampVelocity, layerOpacity, smoothstep } from "../src/lib/sceneMotion.ts";

test("scene easing clamps progress and keeps stable endpoints", () => {
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(smoothstep(0.2, 0.8, 0.2), 0);
  assert.equal(smoothstep(0.2, 0.8, 0.8), 1);
});

test("layer opacity respects both timing and material peak", () => {
  assert.equal(layerOpacity(0, 0.2, 0.6, 0.08), 0);
  assert.ok(Math.abs(layerOpacity(0.4, 0.2, 0.6, 0.08) - 0.04) < 1e-12);
  assert.equal(layerOpacity(0.8, 0.2, 0.6, 0.08), 0.08);
});

test("opening reveal stays hidden before its threshold", () => {
  assert.equal(smoothstep(0.16, 0.62, 0.1), 0);
  assert.ok(smoothstep(0.16, 0.62, 0.4) > 0);
});

test("scroll velocity is clamped symmetrically before smoothing", () => {
  // Trong dải thì tỉ lệ thuận, giữ nguyên dấu.
  assert.equal(clampVelocity(1, 2), 0.5);
  assert.equal(clampVelocity(-1, 2), -0.5);
  assert.equal(clampVelocity(0, 2), 0);

  // Vượt dải thì dừng đúng ở biên, không đi xa hơn. Đây là thứ giữ cho cảnh
  // không giật nảy khi ai đó kéo thanh cuộn.
  assert.equal(clampVelocity(50, 2), 1);
  assert.equal(clampVelocity(-50, 2), -1);
});

test("scroll velocity never leaks a broken number into the scene", () => {
  // Hai mốc thời gian trùng nhau, hoặc tab vừa hiện lại sau khi bị ẩn.
  assert.equal(clampVelocity(Number.POSITIVE_INFINITY, 2), 0);
  assert.equal(clampVelocity(Number.NEGATIVE_INFINITY, 2), 0);
  assert.equal(clampVelocity(Number.NaN, 2), 0);

  // Mức "hết cỡ" vô nghĩa cũng phải cho ra 0 chứ không phải chia cho 0.
  assert.equal(clampVelocity(1, 0), 0);
  assert.equal(clampVelocity(1, -2), 0);
  assert.equal(clampVelocity(1, Number.NaN), 0);
});
