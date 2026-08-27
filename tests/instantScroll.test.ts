import assert from "node:assert/strict";
import test from "node:test";
import { runWithInstantScroll } from "../src/lib/instantScroll.ts";

test("forces auto scrolling for one frame and restores the inline value", () => {
  const root = { style: { scrollBehavior: "smooth" } };
  const queued: Array<() => void> = [];
  let behaviorDuringAction = "";

  runWithInstantScroll(root, (callback) => queued.push(callback), () => {
    behaviorDuringAction = root.style.scrollBehavior;
  });

  assert.equal(behaviorDuringAction, "auto");
  assert.equal(root.style.scrollBehavior, "auto");
  queued[0]();
  assert.equal(root.style.scrollBehavior, "smooth");
});
