import assert from "node:assert/strict";
import test from "node:test";
import { clamp01, smoothstep } from "../src/lib/sceneMotion.ts";

test("scene easing clamps progress and keeps stable endpoints", () => {
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(smoothstep(0.2, 0.8, 0.2), 0);
  assert.equal(smoothstep(0.2, 0.8, 0.8), 1);
});
