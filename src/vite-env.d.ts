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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
