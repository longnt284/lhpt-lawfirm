import snapshot from "./lexLineage.snapshot.json";
import { indexSnapshot, type LexSnapshot } from "../lib/lexLineage";

/*
 * Bản chụp dữ liệu Lex & Lineage, ghi bởi `npm run sync:lex` (và `prebuild`).
 * Chỉ `Home2` nhập tệp này, nên nó nằm trong chunk nạp động, không nằm trong
 * đường tải đầu của trang chủ.
 */
export const LEX_SNAPSHOT = snapshot as LexSnapshot;
export const LEX_BY_NUMBER = indexSnapshot(LEX_SNAPSHOT);
export const LEX_BY_ID = new Map(LEX_SNAPSHOT.docs.map((d) => [d.id, d]));
