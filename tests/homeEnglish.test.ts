import assert from "node:assert/strict";
import test from "node:test";
import { TICKER_EN } from "../src/content/homeEnglish.ts";

test("English DPPA ticker uses the current decrees", () => {
  const text = TICKER_EN.join(" | ");
  assert.doesNotMatch(text, /DECREE 80\/2024/);
  assert.match(text, /DECREE 57\/2025/);
  assert.match(text, /DECREE 243\/2026/);
});
