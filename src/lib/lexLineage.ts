import type { LegalDoc, LegalStatus } from "../content/legalDocs.ts";

/* ================= ĐỒNG BỘ HIỆU LỰC TỪ LEX & LINEAGE ================= */
/*
 * Lex & Lineage là trang tra cứu gia phả văn bản pháp luật của cùng chủ sở hữu.
 * Mỗi bản ghi ở đó đã đối chiếu với CSDL quốc gia về pháp luật (vbpl.vn) hoặc
 * Công báo, và được dựng lại mỗi lần có đợt rà soát. Tình trạng hiệu lực trên
 * trang hãng vì vậy lấy từ đó thay vì ghi tay một bản thứ hai: hai bản ghi tay
 * của cùng một sự thật sớm muộn sẽ nói khác nhau, và bản của hãng luật là bản
 * khách hàng đọc.
 *
 * Phần hãng tự viết — tóm tắt, điểm mới, lĩnh vực — giữ nguyên. Chỉ bốn trường
 * dữ kiện được lấy theo Lex & Lineage: tình trạng, ngày hiệu lực, ngày hết hiệu
 * lực và văn bản thay thế. Văn bản không có trong kho Lex & Lineage giữ nguyên
 * dữ liệu ghi tay.
 *
 * Tệp này thuần: không đọc mạng, không đọc tệp, nhận bản chụp làm tham số. Bản
 * chụp nằm ở `src/content/lexLineage.snapshot.json`, do `scripts/sync-lex-lineage.mjs`
 * ghi lúc build. Trang không gọi Lex & Lineage từ trình duyệt của khách.
 */

/** Phiên bản hợp đồng dữ liệu, khớp `FEED_SCHEMA` bên Lex & Lineage. */
export const LEX_SCHEMA = "lex-lineage/documents@1";

export type LexState = "pending" | "in-force" | "expired" | "unknown";

/** Một đoạn thời gian có cùng tình trạng, tính sẵn ở Lex & Lineage. */
export type LexSegment = {
  /** Ngày bắt đầu đoạn; chuỗi rỗng cho đoạn trước mốc đầu tiên. */
  from: string;
  state: LexState;
  since?: string;
  amended?: boolean;
  /** Kết quả lấy từ tình trạng ghi nhận, không rõ ngày bắt đầu. */
  recorded?: boolean;
  /** Hết hiệu lực cùng văn bản mà nó sửa đổi; `byId` khi đó là văn bản được sửa. */
  withParent?: boolean;
  byId?: string;
  byNumber?: string;
};

export type LexRef = { id: string; number: string };

export type LexDoc = {
  id: string;
  number: string;
  status: "active" | "amended" | "pending" | "expired";
  title: { vi: string; en: string };
  effectiveOn: string;
  verifiedOn: string;
  confidence: "verified" | "cross-check";
  segments: LexSegment[];
  replacedBy: LexRef[];
  path: { vi: string; en: string };
};

export type LexSnapshot = {
  schema: string;
  /** Ngày tra cứu gần nhất của cả kho Lex & Lineage. */
  verifiedOn: string;
  docs: LexDoc[];
};

export type LexLocale = "vi" | "en";

/** Phần gắn thêm vào văn bản đã khớp với Lex & Lineage. */
export type LexLink = {
  url: string;
  verifiedOn: string;
  /** Bản ghi còn chi tiết chưa đối chiếu được với nguồn chính thống. */
  crossCheck: boolean;
  /** Trang của văn bản thay thế, nếu có. */
  replacedByUrl?: string;
};

export type SyncedLegalDoc = LegalDoc & { lex?: LexLink };

/**
 * Khoá so khớp số hiệu. Hai kho gõ cùng một số hiệu, nhưng một dấu cách thừa
 * hay chữ "Đ" dựng sẵn so với tổ hợp đủ làm phép so bằng trượt.
 */
export function normalizeNumber(code: string): string {
  return code.normalize("NFC").replace(/\s+/g, "").toUpperCase();
}

export function indexSnapshot(snapshot: LexSnapshot): Map<string, LexDoc> {
  return new Map(snapshot.docs.map((d) => [normalizeNumber(d.number), d]));
}

/** Ngày hôm nay theo giờ máy người xem, dạng YYYY-MM-DD. */
export function todayIso(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** YYYY-MM-DD → DD/MM/YYYY, dạng ngày trang hãng đang dùng. */
export function isoToVn(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Đoạn áp dụng cho ngày `date`: đoạn cuối cùng bắt đầu không muộn hơn ngày đó. */
export function segmentAt(segments: readonly LexSegment[], date: string): LexSegment {
  let hit = segments[0];
  for (const s of segments) if (s.from && s.from <= date) hit = s;
  return hit;
}

const RECORDED: Record<LexDoc["status"], LegalStatus> = {
  active: "Còn hiệu lực",
  amended: "Hết hiệu lực một phần",
  pending: "Chưa có hiệu lực",
  expired: "Hết hiệu lực",
};

/**
 * Tình trạng tại ngày `date`, theo nhãn của trang hãng.
 *
 * Tính từ các đoạn hiệu lực chứ không chỉ đọc tình trạng ghi nhận, để một văn
 * bản chưa có hiệu lực tự chuyển sang còn hiệu lực đúng ngày, không phải chờ lần
 * build sau. "Hết hiệu lực một phần" là nhãn của vbpl.vn cho văn bản còn hiệu
 * lực nhưng đã bị sửa đổi hoặc bãi bỏ một phần; trang hãng dùng đúng nhãn ấy.
 */
export function lexStatusAt(doc: LexDoc, date: string): LegalStatus {
  const seg = segmentAt(doc.segments, date);
  switch (seg?.state) {
    case "pending":
      return "Chưa có hiệu lực";
    case "expired":
      return "Hết hiệu lực";
    case "in-force":
      return seg.amended || doc.status === "amended" ? "Hết hiệu lực một phần" : "Còn hiệu lực";
    default:
      return RECORDED[doc.status];
  }
}

function replacedByText(ref: LexDoc | undefined, number: string, locale: LexLocale): string {
  if (!ref) return locale === "en" ? `Instrument No. ${number}` : `Văn bản số ${number}`;
  return locale === "en" ? `${ref.title.en} No. ${ref.number}` : `${ref.title.vi} số ${ref.number}`;
}

/**
 * Văn bản của trang hãng, với bốn trường dữ kiện lấy theo Lex & Lineage tại ngày
 * `date`. Không khớp số hiệu thì trả nguyên văn bản.
 */
export function syncLegalDoc(
  doc: LegalDoc,
  index: ReadonlyMap<string, LexDoc>,
  byId: ReadonlyMap<string, LexDoc>,
  { date, locale, site }: { date: string; locale: LexLocale; site: string },
): SyncedLegalDoc {
  const lex = index.get(normalizeNumber(doc.code));
  if (!lex) return doc;

  const seg = segmentAt(lex.segments, date);
  const status = lexStatusAt(lex, date);
  const expired = status === "Hết hiệu lực";
  // Văn bản hết hiệu lực cùng văn bản mà nó sửa thì không có "văn bản thay thế":
  // `byId` khi đó trỏ tới văn bản được sửa, gọi nó là bên thay thế là nói sai.
  const replacer = expired && seg?.byId && !seg.withParent ? byId.get(seg.byId) : undefined;
  const replacerNumber = expired && seg?.byNumber && !seg.withParent ? seg.byNumber : undefined;
  // Lex & Lineage có văn bản ghi hết hiệu lực mà không ghi từ ngày nào hay văn
  // bản nào thay: nó chỉ ghi quan hệ đã đối chiếu được trên văn bản gốc. Chỗ nó im
  // lặng thì lời của hãng đứng; chỗ nó đã ghi thì nó quyết.
  const lexExpiry = expired && seg?.since && !seg.recorded ? isoToVn(seg.since) : undefined;
  const replacedBy = replacerNumber
    ? replacedByText(replacer, replacerNumber, locale)
    : expired && !seg?.withParent
      ? doc.replacedBy
      : undefined;

  return {
    ...doc,
    status,
    effective: lex.effectiveOn ? isoToVn(lex.effectiveOn) : doc.effective,
    expired: expired ? (lexExpiry ?? doc.expired) : undefined,
    replacedBy,
    lex: {
      url: `${site}${lex.path[locale]}`,
      verifiedOn: lex.verifiedOn,
      crossCheck: lex.confidence === "cross-check",
      ...(replacer ? { replacedByUrl: `${site}${replacer.path[locale]}` } : {}),
    },
  };
}
