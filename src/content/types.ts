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

/** Dữ liệu thô của một bài viết; `readMinutes` được tính khi dựng. */
export type DocSeed = Omit<DocItem, "id" | "kind" | "readMinutes">;
