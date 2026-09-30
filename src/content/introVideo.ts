/*
 * Đường dẫn bản xuất của video giới thiệu (mã nguồn ở video/).
 *
 * Tách khỏi video.ts có chủ đích: khối video trên trang chủ nằm trong chunk tải
 * đầu và chỉ cần mấy đường dẫn này. Nếu nó import video.ts thì bundler kéo luôn
 * cả mục lục chương hai thứ tiếng — vốn chỉ trang /video dùng — vào chunk đó.
 */
export const INTRO_VIDEO = {
  mp4: "/video/gioi-thieu.mp4",
  webm: "/video/gioi-thieu.webm",
  poster: "/video/gioi-thieu.jpg",
  seconds: 60,
} as const;
