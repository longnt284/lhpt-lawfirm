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
  /** Suy ra từ độ dài `content`, không gõ tay. Xem src/lib/text.ts. */
  read: string;
  author?: string;
  featured?: boolean;
};

/** Dữ liệu thô của một bài viết; `read` được tính khi dựng. */
export type DocSeed = Omit<DocItem, "id" | "kind" | "read">;
