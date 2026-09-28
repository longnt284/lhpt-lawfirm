/// <reference types="vite/client" />

/**
 * Khai báo các biến môi trường mà mã nguồn đọc.
 *
 * Không dùng `readonly [key: string]: string` chung: gõ sai tên biến sẽ lọt qua
 * trình biên dịch và chỉ lộ ra ở lúc chạy dưới dạng `undefined`.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Gốc của Lex & Lineage; bỏ trống thì dùng địa chỉ đang chạy thật. */
  readonly VITE_LEX_LINEAGE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
