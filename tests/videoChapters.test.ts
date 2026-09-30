import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  INTRO_VIDEO,
  VIDEO_BPM,
  VIDEO_CHAPTERS,
  chapterAt,
  chapterSeconds,
  formatTimestamp,
} from "../src/content/video.ts";

/* Đọc thẳng mã nguồn video: mục lục trên trang phải khớp đúng cảnh trong tệp đã render. */
const scene = readFileSync(new URL("../video/scene.js", import.meta.url), "utf8");
const SYNC = JSON.parse(scene.split("/*SYNC*/")[1].split("/*END*/")[0].split("=")[1].trim().replace(/;$/, ""));
const sceneNumber = (name: string) => Number(scene.match(new RegExp(`const ${name} = (\\d+)`))?.[1]);

test("video chapters use the scene's tempo and length", () => {
  assert.equal(sceneNumber("BPM"), VIDEO_BPM);
  assert.equal(chapterSeconds(sceneNumber("TOTAL_BEATS")), INTRO_VIDEO.seconds);
});

test("the five practice-area chapters start where the scene opens each area", () => {
  const areaChapters = VIDEO_CHAPTERS.filter((c) => /^0\d · /.test(c.title.vi)).map((c) => c.beat);
  assert.deepEqual(areaChapters, SYNC.areas);
});

test("chapters are ordered and inside the film", () => {
  const beats = VIDEO_CHAPTERS.map((c) => c.beat);
  assert.deepEqual(beats, [...beats].sort((a, b) => a - b));
  assert.equal(beats[0], 0);
  assert.ok(chapterSeconds(beats[beats.length - 1]) < INTRO_VIDEO.seconds);
});

test("timestamps and the active chapter", () => {
  assert.equal(formatTimestamp(0), "0:00");
  assert.equal(formatTimestamp(chapterSeconds(24)), "0:15");
  assert.equal(formatTimestamp(60), "1:00");
  assert.equal(chapterAt(0), 0);
  assert.equal(chapterAt(15), 2);
  assert.equal(chapterAt(14.99), 1);
  assert.equal(chapterAt(59), VIDEO_CHAPTERS.length - 1);
});
