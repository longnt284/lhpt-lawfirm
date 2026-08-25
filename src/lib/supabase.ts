import type { SupabaseClient } from "@supabase/supabase-js";
import type { PracticeArea } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Đã cấu hình backend hay chưa. Kiểm tra đồng bộ, không cần tải thư viện.
 *
 * Phần lớn nội dung của website là tĩnh: dịch vụ, bảng phí, bài viết, văn bản
 * pháp luật. Chỉ cổng khách hàng, đặt lịch và bình luận mới cần backend, nên
 * thiếu biến môi trường thì các tính năng đó tự ẩn thay vì làm trắng trang.
 */
export const backendReady = Boolean(url && key);

let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * Lấy client Supabase, nạp thư viện ở lần gọi đầu tiên.
 *
 * `@supabase/supabase-js` nặng khoảng 240 kB chưa nén. Import tĩnh sẽ kéo nó
 * vào chunk khởi đầu của trang, tức mọi độc giả chỉ vào đọc một bài viết đều
 * phải tải cả tầng xác thực và realtime. Nạp động đẩy khối đó sang chunk riêng,
 * chỉ tải khi có người thực sự mở tài khoản, đặt lịch hay bình luận.
 *
 * Promise được nhớ lại nên nhiều lời gọi song song vẫn dùng chung một client
 * duy nhất — quan trọng, vì mỗi client tự giữ phiên đăng nhập riêng.
 */
export function sb(): Promise<SupabaseClient> {
  if (!backendReady) {
    return Promise.reject(
      new Error(
        "Chưa cấu hình Supabase. Đặt VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY trong .env"
      )
    );
  }
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(url as string, key as string, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    );
  }
  return clientPromise;
}

/* ================= ÁNH XẠ LĨNH VỰC ================= */

/**
 * Nối tên dịch vụ hiển thị trên trang với giá trị enum practice_area.
 *
 * Khoá là `title` tiếng Việt trong SERVICES (src/firm.ts) vì đó là giá trị mà
 * ô chọn trong form gửi lên, không phụ thuộc ngôn ngữ đang hiển thị.
 */
export const AREA_BY_SERVICE: Record<string, PracticeArea> = {
  "Xây dựng · Bất động sản": "construction_realestate",
  "Tố tụng · Giải quyết tranh chấp": "litigation",
  "Điện mặt trời · Năng lượng": "energy",
  "Doanh nghiệp · Tuân thủ": "corporate",
  "Bảo mật dữ liệu · Công nghệ": "data_protection",
  "Gói pháp chế thường niên": "retainer",
};

export const AREA_LABELS: Record<PracticeArea, { vi: string; en: string }> = {
  construction_realestate: { vi: "Xây dựng · Bất động sản", en: "Construction · Real Estate" },
  litigation: { vi: "Tố tụng · Tranh chấp", en: "Litigation · Disputes" },
  energy: { vi: "Điện mặt trời · Năng lượng", en: "Solar · Energy" },
  corporate: { vi: "Doanh nghiệp · Tuân thủ", en: "Corporate · Compliance" },
  data_protection: { vi: "Bảo mật dữ liệu", en: "Data Protection" },
  retainer: { vi: "Gói pháp chế", en: "Retainer" },
  other: { vi: "Khác", en: "Other" },
};

/* ================= THÔNG BÁO LỖI ================= */

/*
 * Lỗi từ trigger chống spam trả về mã SQLSTATE. Dịch sang câu người đọc hiểu
 * được, thay vì đẩy nguyên văn thông báo của PostgreSQL ra giao diện.
 */
const ERROR_BY_CODE: Record<string, { vi: string; en: string }> = {
  "53400": {
    vi: "Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
    en: "Too many requests. Please try again in a few minutes.",
  },
  "23505": {
    vi: "Nội dung hoặc khung giờ này đã được ghi nhận trước đó.",
    en: "This content or time slot has already been recorded.",
  },
  "42501": {
    vi: "Thao tác không được phép với tài khoản hiện tại.",
    en: "This action is not permitted for the current account.",
  },
  "22007": {
    vi: "Thời điểm không hợp lệ.",
    en: "Invalid date or time.",
  },
  "23503": {
    vi: "Dữ liệu tham chiếu không hợp lệ.",
    en: "Invalid reference data.",
  },
};

type MaybePostgrestError = { code?: string; message?: string } | null | undefined;

export function describeError(error: MaybePostgrestError, locale: "vi" | "en"): string {
  if (!error) return "";
  const mapped = error.code ? ERROR_BY_CODE[error.code] : undefined;
  if (mapped) return mapped[locale];
  // Trigger tự raise thường kèm câu tiếng Việt đã đủ nghĩa; giữ nguyên.
  if (error.message) return error.message;
  return locale === "en" ? "An unexpected error occurred." : "Đã có lỗi không mong muốn.";
}
