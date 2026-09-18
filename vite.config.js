import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/*
 * Chèn `rel=preload` cho đúng những file chữ vẽ nên màn hình đầu tiên.
 *
 * Vì sao cần một plugin thay vì vài dòng <link> viết sẵn trong index.html: file
 * chữ do @fontsource cung cấp đi qua bundler nên tên file có hash nội dung, và
 * hash đổi mỗi lần nâng phiên bản gói. Viết cứng tên file là hẹn ngày nó trỏ
 * vào hư không mà không ai biết — preload hỏng không báo lỗi, nó chỉ lặng lẽ
 * thôi tác dụng. Ở đây tên file được đọc thẳng từ bundle lúc build.
 *
 * Vì sao preload mà không để `font-display: swap` tự lo: swap vẫn vẽ bằng phông
 * dự phòng trước rồi mới đổi. Trên chính câu tiêu đề lớn nhất trang, cú đổi đó
 * là một lần chữ nhảy ngay giữa lúc người đọc bắt đầu đọc.
 *
 * Danh sách cố ý hẹp — bốn file, 79 kB. Preload là lời cam kết "cần ngay", nên
 * preload thừa không phải là thêm một chút lợi: nó chia băng thông của đúng
 * những file thật sự cần, ngay trong khoảnh khắc chật chội nhất của trang.
 *
 *   - Lora nét thường: câu tiêu đề mở đầu;
 *   - Be Vietnam Pro nét 400: chữ nội dung của màn đầu;
 *   - và mỗi họ đều cần *cả hai* bộ latin lẫn vietnamese, vì một từ tiếng Việt
 *     như "vững" lấy "v", "n", "g" từ bộ latin còn "ữ" từ bộ vietnamese. Thiếu
 *     một trong hai là câu tiêu đề vẽ bằng hai phông khác nhau.
 *
 * Lora nghiêng *không* nằm trong danh sách, dù câu tiêu đề mở đầu có một vế in
 * nghiêng. Hai file nghiêng nặng 50 kB — nhiều hơn cả hai file thường của Be
 * Vietnam Pro cộng lại — chỉ để phục vụ vài từ. Cái giá phải trả là vế nghiêng
 * đó vẽ bằng Georgia nghiêng trong khoảnh khắc đầu rồi đổi sang Lora, tức một
 * lần chữ xô nhẹ ở cuối dòng tiêu đề. Đổi lại, bốn file dựng nên toàn bộ phần
 * còn lại của màn hình về sớm hơn. Đây là một đánh đổi có chủ đích, không phải
 * một chỗ bỏ sót.
 *
 * Các nét 500/600/700 và IBM Plex Mono cũng ngoài danh sách: chúng phục vụ phần
 * dưới màn hình đầu, tải theo đường thường là vừa.
 */
function preloadCriticalFonts() {
  const critical = [
    /lora-latin-wght-normal/,
    /lora-vietnamese-wght-normal/,
    /be-vietnam-pro-latin-400-normal/,
    /be-vietnam-pro-vietnamese-400-normal/,
  ];
  return {
    name: "lhpt-preload-fonts",
    enforce: "post",
    apply: "build",
    transformIndexHtml(_html, ctx) {
      const files = Object.keys(ctx.bundle || {}).filter(
        (file) => file.endsWith(".woff2") && critical.some((re) => re.test(file))
      );
      return files.map((href) => ({
        tag: "link",
        injectTo: "head",
        attrs: {
          rel: "preload",
          as: "font",
          type: "font/woff2",
          // Chữ luôn lấy qua CORS kể cả cùng gốc; thiếu thuộc tính này thì bản
          // preload và bản CSS xin thành hai lượt tải riêng.
          crossorigin: "",
          href: "/" + href,
        },
      }));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCriticalFonts()],
  build: {
    rollupOptions: {
      output: {
        /*
         * Tách thư viện ra khỏi mã trang: React và Motion gần như không đổi
         * giữa các lần deploy, nên để riêng thì trình duyệt còn dùng lại được
         * bản đã cache, chỉ tải lại phần nội dung thực sự thay đổi.
         */
        manualChunks: {
          react: ["react", "react-dom"],
          motion: ["framer-motion"],
          /*
           * three.js chỉ được hai trang chuyên đề dùng tới, và cả hai trang đó
           * đều nạp động. Tách riêng để nó nằm ngoài đường tải đầu của trang chủ
           * — nếu trộn chung, mọi khách vào đọc bài viết đều phải tải một thư
           * viện đồ hoạ mà họ không bao giờ nhìn thấy.
           */
          three: ["three"],
          /*
           * Supabase chỉ được nạp động (xem sb() trong src/lib/supabase.ts) nên
           * nó vẫn là chunk tải theo yêu cầu; khai báo ở đây chỉ để đặt tên cho
           * file, giúp nhìn ra ngay trong bảng phân tích gói khi nào tầng
           * backend bị kéo vào đường tải đầu.
           */
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
});
