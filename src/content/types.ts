export type DocItem = {
  id: string;
  kind: "article" | "news";
  category: string;
  title: string;
  excerpt: string;
  content: string[];
  /** Cơ sở pháp lý được trích dẫn trong bài, hiển thị tách khỏi thân bài. */
  basis: string[];
  date: string;
  /**
   * Số phút đọc, suy ra từ độ dài `content` chứ không gõ tay. Giữ ở dạng số để
   * đơn vị được ghép theo ngôn ngữ hiển thị. Xem src/lib/text.ts.
   */
  readMinutes: number;
  author?: string;
  featured?: boolean;
};

/**
 * Dữ liệu thô của một bài viết; `readMinutes` được tính khi dựng.
 *
 * `id` khai báo tường minh chứ không suy ra từ vị trí trong mảng: bản dịch tiếng
 * Anh trong src/content/english.ts tra theo id, nên nếu id trôi theo thứ tự sắp
 * xếp thì mỗi lần chèn hoặc đổi chỗ một tin là toàn bộ bản dịch lệch sang bài khác.
 */
export type DocSeed = Omit<DocItem, "kind" | "readMinutes">;
