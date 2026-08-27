import assert from "node:assert/strict";
import test from "node:test";
import { NOT_FOUND_META } from "../src/content/notFound.ts";

test("404 metadata is unique and excluded from indexing", () => {
  assert.match(NOT_FOUND_META.title, /Không tìm thấy/);
  assert.equal(NOT_FOUND_META.robots, "noindex,follow");
  assert.equal(NOT_FOUND_META.path, "/404");
});
