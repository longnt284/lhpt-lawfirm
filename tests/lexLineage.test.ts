import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LEGAL_DOCS, type LegalDoc } from "../src/content/legalDocs.ts";
import {
  indexSnapshot,
  LEX_SCHEMA,
  lexStatusAt,
  normalizeNumber,
  syncLegalDoc,
  todayIso,
  type LexDoc,
  type LexSnapshot,
} from "../src/lib/lexLineage.ts";
// @ts-expect-error: script JavaScript thuần, không có khai báo kiểu.
import { readLegalCodes } from "../scripts/sync-lex-lineage.mjs";

const SITE = "https://lex.example";
const snapshot: LexSnapshot = JSON.parse(
  readFileSync(new URL("../src/content/lexLineage.snapshot.json", import.meta.url), "utf8"),
);

function lexDoc(over: Partial<LexDoc> & Pick<LexDoc, "id" | "number">): LexDoc {
  return {
    status: "active",
    title: { vi: "Luật Thử", en: "Test Law" },
    effectiveOn: "2025-01-01",
    verifiedOn: "2026-09-24",
    confidence: "verified",
    segments: [{ from: "", state: "pending" }, { from: "2025-01-01", state: "in-force" }],
    replacedBy: [],
    path: { vi: `/vi/van-ban/${over.id}`, en: `/en/van-ban/${over.id}` },
    ...over,
  };
}

function firmDoc(over: Partial<LegalDoc> = {}): LegalDoc {
  return {
    id: "x1",
    code: "1/2020/QH14",
    name: "Luật Thử 2020",
    type: "Luật",
    field: "Thử",
    effective: "01/01/2021",
    status: "Còn hiệu lực",
    summary: "Tóm tắt.",
    highlights: [],
    ...over,
  };
}

function sync(doc: LegalDoc, docs: LexDoc[], date: string, locale: "vi" | "en" = "vi") {
  const snap = { schema: LEX_SCHEMA, verifiedOn: "2026-09-24", docs };
  return syncLegalDoc(doc, indexSnapshot(snap), new Map(docs.map((d) => [d.id, d])), { date, locale, site: SITE });
}

test("script đọc số hiệu và tình trạng khớp đúng LEGAL_DOCS", () => {
  const source = readFileSync(new URL("../src/content/legalDocs.ts", import.meta.url), "utf8");
  assert.deepEqual(
    readLegalCodes(source),
    LEGAL_DOCS.map((d) => ({ code: d.code, status: d.status })),
  );
});

test("bản chụp đúng hợp đồng và tự đủ tham chiếu", () => {
  assert.equal(snapshot.schema, LEX_SCHEMA);
  const ids = new Set(snapshot.docs.map((d) => d.id));
  for (const d of snapshot.docs) {
    assert.ok(d.segments.length > 0, d.id);
    for (const r of d.replacedBy) assert.ok(ids.has(r.id), `${d.id} → ${r.id}`);
    for (const s of d.segments) if (s.byId) assert.ok(ids.has(s.byId), `${d.id} → ${s.byId}`);
  }
});

test("so khớp số hiệu bỏ qua khoảng trắng và chữ hoa thường", () => {
  assert.equal(normalizeNumber(" 175/2024/nđ-cp "), normalizeNumber("175/2024/NĐ-CP"));
});

test("văn bản không có trong Lex & Lineage giữ nguyên", () => {
  const doc = firmDoc();
  assert.equal(sync(doc, [], "2026-09-28"), doc);
});

test("văn bản chưa có hiệu lực tự đổi nhãn đúng ngày", () => {
  const lex = lexDoc({ id: "a", number: "1/2020/QH14", status: "pending", effectiveOn: "2027-01-01",
    segments: [{ from: "", state: "pending" }, { from: "2027-01-01", state: "in-force" }] });
  assert.equal(sync(firmDoc(), [lex], "2026-12-31").status, "Chưa có hiệu lực");
  const after = sync(firmDoc(), [lex], "2027-01-01");
  assert.equal(after.status, "Còn hiệu lực");
  assert.equal(after.effective, "01/01/2027");
});

test("văn bản đã sửa đổi mang nhãn của vbpl.vn", () => {
  const lex = lexDoc({ id: "a", number: "1/2020/QH14", status: "amended" });
  assert.equal(lexStatusAt(lex, "2026-09-28"), "Hết hiệu lực một phần");
});

test("văn bản bị thay thế: ngày, tên và đường dẫn văn bản thay thế", () => {
  const next = lexDoc({ id: "b", number: "2/2025/QH15", title: { vi: "Luật Mới", en: "New Law" } });
  const old = lexDoc({
    id: "a", number: "1/2020/QH14", status: "expired", replacedBy: [{ id: "b", number: "2/2025/QH15" }],
    segments: [
      { from: "", state: "pending" },
      { from: "2025-01-01", state: "in-force" },
      { from: "2026-07-01", state: "expired", since: "2026-07-01", byId: "b", byNumber: "2/2025/QH15" },
    ],
  });
  const vi = sync(firmDoc(), [old, next], "2026-09-28");
  assert.equal(vi.status, "Hết hiệu lực");
  assert.equal(vi.expired, "01/07/2026");
  assert.equal(vi.replacedBy, "Luật Mới số 2/2025/QH15");
  assert.equal(vi.lex?.url, `${SITE}/vi/van-ban/a`);
  assert.equal(vi.lex?.replacedByUrl, `${SITE}/vi/van-ban/b`);
  assert.equal(sync(firmDoc(), [old, next], "2026-09-28", "en").replacedBy, "New Law No. 2/2025/QH15");
  // Trước ngày văn bản mới có hiệu lực thì văn bản cũ vẫn còn hiệu lực.
  const before = sync(firmDoc(), [old, next], "2026-06-30");
  assert.equal(before.status, "Còn hiệu lực");
  assert.equal(before.replacedBy, undefined);
});

test("Lex & Lineage không ghi bên thay thế thì giữ lời của hãng", () => {
  const lex = lexDoc({ id: "a", number: "1/2020/QH14", status: "expired",
    segments: [{ from: "", state: "pending" }, { from: "2025-01-01", state: "in-force" },
      { from: "2026-09-24", state: "expired", recorded: true, since: "2026-09-24" }] });
  const out = sync(firmDoc({ status: "Hết hiệu lực", expired: "01/02/2025", replacedBy: "Luật X số 9/2024/QH15" }), [lex], "2026-09-28");
  assert.equal(out.status, "Hết hiệu lực");
  assert.equal(out.expired, "01/02/2025");
  assert.equal(out.replacedBy, "Luật X số 9/2024/QH15");
});

test("văn bản hết hiệu lực cùng luật được sửa thì không gọi luật đó là bên thay thế", () => {
  const lex = lexDoc({ id: "a", number: "1/2020/QH14", status: "expired",
    segments: [{ from: "", state: "pending" }, { from: "2025-01-01", state: "in-force" },
      { from: "2026-07-01", state: "expired", since: "2026-07-01", withParent: true, byId: "p", byNumber: "3/2014/QH13" }] });
  const out = sync(firmDoc({ replacedBy: "không được hiện" }), [lex], "2026-09-28");
  assert.equal(out.expired, "01/07/2026");
  assert.equal(out.replacedBy, undefined);
});

test("dữ liệu thật: năm văn bản hết hiệu lực trong năm 2026 hiện đúng bên thay thế", () => {
  const index = indexSnapshot(snapshot);
  const byId = new Map(snapshot.docs.map((d) => [d.id, d]));
  const at = (code: string) => {
    const doc = LEGAL_DOCS.find((d) => d.code === code);
    assert.ok(doc, code);
    return syncLegalDoc(doc, index, byId, { date: "2026-09-28", locale: "vi", site: SITE });
  };
  const expected: [string, string, string][] = [
    ["50/2014/QH13", "01/07/2026", "135/2025/QH15"],
    ["175/2024/NĐ-CP", "01/07/2026", "217/2026/NĐ-CP"],
    ["06/2021/NĐ-CP", "01/07/2026", "207/2026/NĐ-CP"],
    ["61/2020/QH14", "01/03/2026", "143/2025/QH15"],
    ["38/2019/QH14", "01/07/2026", "108/2025/QH15"],
  ];
  for (const [code, date, by] of expected) {
    const d = at(code);
    assert.equal(d.status, "Hết hiệu lực", code);
    assert.equal(d.expired, date, code);
    assert.ok(d.replacedBy?.endsWith(`số ${by}`), `${code}: ${d.replacedBy}`);
  }
  // Lex & Lineage chưa ghi quan hệ thay thế cho Luật Điện lực 2004: giữ ghi chép của hãng.
  assert.equal(at("28/2004/QH11").replacedBy, "Luật Điện lực số 61/2024/QH15");
});

test("ngày hôm nay theo giờ máy, dạng ISO", () => {
  assert.equal(todayIso(new Date(2026, 8, 5)), "2026-09-05");
});
