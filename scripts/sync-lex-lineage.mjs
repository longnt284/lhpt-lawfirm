#!/usr/bin/env node
/*
 * Đồng bộ tình trạng hiệu lực từ Lex & Lineage vào `src/content/lexLineage.snapshot.json`.
 *
 *   npm run sync:lex                     tải từ $VITE_LEX_LINEAGE_URL/api/v1/documents.json
 *   npm run sync:lex -- --from <tệp|URL> đọc một bản xuất khác, ví dụ bản build
 *                                        cục bộ của Lex & Lineage:
 *                                        ../Research-Law-VN/.next/server/app/api/v1/documents.json.body
 *   node scripts/sync-lex-lineage.mjs --soft
 *                                        như trên, nhưng lỗi mạng hay sai hợp đồng
 *                                        chỉ cảnh báo và giữ bản chụp đang có.
 *                                        `prebuild` chạy chế độ này.
 *
 * Chỉ giữ văn bản trang hãng đang giới thiệu, cộng văn bản thay thế của chúng,
 * để gói JavaScript không phải mang cả kho. Tệp chỉ được ghi lại khi nội dung
 * đổi, nên chạy lại mà dữ liệu không đổi thì git không thấy gì.
 *
 * Script cố ý là JavaScript thuần và đọc số hiệu bằng biểu thức chính quy thay
 * vì nhập `legalDocs.ts`: nó chạy trong `prebuild` trên Vercel, nơi không bảo đảm
 * Node có sẵn chế độ bỏ kiểu TypeScript. Test `tests/lexLineage.test.ts` khẳng
 * định phép đọc này khớp đúng danh sách `LEGAL_DOCS`.
 */
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const SCHEMA = "lex-lineage/documents@1";
const DEFAULT_SITE = "https://lexnlineage.vercel.app";
const ROOT = new URL("..", import.meta.url);
const DOCS_TS = new URL("src/content/legalDocs.ts", ROOT);
const OUT = new URL("src/content/lexLineage.snapshot.json", ROOT);

const STATUS_LABEL = {
  active: "Còn hiệu lực",
  amended: "Hết hiệu lực một phần",
  pending: "Chưa có hiệu lực",
  expired: "Hết hiệu lực",
};
const STATES = new Set(["pending", "in-force", "expired", "unknown"]);

const args = process.argv.slice(2);
const soft = args.includes("--soft");
const fromIdx = args.indexOf("--from");
const site = (process.env.VITE_LEX_LINEAGE_URL?.trim() || DEFAULT_SITE).replace(/\/+$/, "");
const source = fromIdx >= 0 ? args[fromIdx + 1] : `${site}/api/v1/documents.json`;

export const normalizeNumber = (code) => code.normalize("NFC").replace(/\s+/g, "").toUpperCase();

/** Cặp (số hiệu, tình trạng ghi tay) của từng văn bản, theo thứ tự trong tệp. */
export function readLegalCodes(tsSource) {
  const out = [];
  const re = /code:\s*"([^"]+)"[\s\S]*?status:\s*"([^"]+)"/g;
  for (let m; (m = re.exec(tsSource)); ) out.push({ code: m[1], status: m[2] });
  return out;
}

async function load(src) {
  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`${src} trả về HTTP ${res.status}`);
    return res.json();
  }
  return JSON.parse(await readFile(src, "utf8"));
}

/** Kiểm hợp đồng: sai một chỗ là dừng, không ghi dữ liệu nửa đúng nửa sai. */
function validate(feed) {
  const fail = (msg) => {
    throw new Error(`Nguồn dữ liệu không đúng hợp đồng ${SCHEMA}: ${msg}`);
  };
  if (feed?.schema !== SCHEMA) fail(`schema là ${JSON.stringify(feed?.schema)}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(feed.verifiedOn ?? "")) fail("thiếu verifiedOn");
  if (!Array.isArray(feed.docs) || feed.docs.length === 0) fail("docs rỗng");
  for (const d of feed.docs) {
    const where = d?.id ?? "?";
    if (typeof d.id !== "string" || typeof d.number !== "string") fail(`${where}: thiếu id hoặc number`);
    if (!(d.status in STATUS_LABEL)) fail(`${where}: status ${d.status}`);
    if (typeof d.title?.vi !== "string" || typeof d.title?.en !== "string") fail(`${where}: thiếu title`);
    if (typeof d.effectiveOn !== "string" || typeof d.verifiedOn !== "string") fail(`${where}: thiếu ngày`);
    if (d.confidence !== "verified" && d.confidence !== "cross-check") fail(`${where}: confidence`);
    if (!Array.isArray(d.segments) || d.segments.length === 0) fail(`${where}: thiếu segments`);
    if (d.segments.some((s) => typeof s.from !== "string" || !STATES.has(s.state))) fail(`${where}: segment sai`);
    if (!Array.isArray(d.replacedBy)) fail(`${where}: thiếu replacedBy`);
    if (!d.path?.vi?.startsWith("/") || !d.path?.en?.startsWith("/")) fail(`${where}: thiếu path`);
  }
}

const pick = (d) => ({
  id: d.id,
  number: d.number,
  status: d.status,
  title: d.title,
  effectiveOn: d.effectiveOn,
  verifiedOn: d.verifiedOn,
  confidence: d.confidence,
  segments: d.segments,
  replacedBy: d.replacedBy,
  path: d.path,
});

async function main() {
  const feed = await load(source);
  validate(feed);

  const entries = readLegalCodes(await readFile(DOCS_TS, "utf8"));
  const wanted = new Set(entries.map((e) => normalizeNumber(e.code)));
  const matched = feed.docs.filter((d) => wanted.has(normalizeNumber(d.number)));

  // Kèm văn bản thay thế (và văn bản được nhắc trong các đoạn hiệu lực) để trang
  // hãng ghi được tên và dẫn được tới chúng.
  const keep = new Set(matched.map((d) => d.id));
  for (const d of matched) {
    for (const r of d.replacedBy) keep.add(r.id);
    for (const s of d.segments) if (s.byId) keep.add(s.byId);
  }
  const docs = feed.docs.filter((d) => keep.has(d.id)).map(pick);

  const next = `${JSON.stringify({ schema: feed.schema, verifiedOn: feed.verifiedOn, docs }, null, 2)}\n`;
  const prev = await readFile(OUT, "utf8").catch(() => "");
  if (next !== prev) await writeFile(OUT, next);

  const byNumber = new Map(feed.docs.map((d) => [normalizeNumber(d.number), d]));
  const missing = entries.filter((e) => !byNumber.has(normalizeNumber(e.code)));
  const drift = entries
    .map((e) => ({ ...e, lex: byNumber.get(normalizeNumber(e.code)) }))
    .filter((e) => e.lex && STATUS_LABEL[e.lex.status] !== e.status);

  console.log(
    `Lex & Lineage (tra cứu ${feed.verifiedOn}): khớp ${matched.length}/${entries.length} văn bản, ` +
      `bản chụp ${docs.length} bản ghi — ${next === prev ? "không đổi" : "đã cập nhật"}.`,
  );
  if (missing.length) {
    console.log(`  Chưa có trong Lex & Lineage, giữ dữ liệu ghi tay: ${missing.map((e) => e.code).join(", ")}`);
  }
  for (const e of drift) {
    console.log(`  ${e.code}: legalDocs.ts ghi "${e.status}", Lex & Lineage ghi "${STATUS_LABEL[e.lex.status]}".`);
  }
}

// Chỉ chạy khi gọi trực tiếp, để test nhập được các hàm ở trên.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    if (!soft) {
      console.error(err.message ?? err);
      process.exit(1);
    }
    console.warn(`Không đồng bộ được từ Lex & Lineage (${err.message ?? err}). Giữ bản chụp đang có.`);
  });
}
