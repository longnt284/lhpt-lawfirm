import assert from "node:assert/strict";
import test from "node:test";
import { clamp01, layerOpacity, smoothstep } from "../src/lib/sceneMotion.ts";

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
