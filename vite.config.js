import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
