import { MotionConfig } from "framer-motion";
import { useState } from "react";
import { Ambient, ArticleModal, Footer, Header, ScrollTop } from "./components/Chrome";
import { Curtain } from "./components/Curtain";
import { Hero, Pricing, Services, StatsBand } from "./components/Home1";
import { Articles, Contact, Documents, News, Policies, Team } from "./components/Home2";
import type { DocItem } from "./data";

export default function App() {
  const [doc, setDoc] = useState<DocItem | null>(null);

  return (
    /*
     * reducedMotion="user" là công tắc tổng: khi hệ điều hành bật "giảm chuyển
     * động", Motion tự bỏ mọi transform và chỉ giữ lại đổi màu/độ mờ. Nhờ vậy
     * từng component không phải tự kiểm tra lại.
     */
    <MotionConfig reducedMotion="user">
      <div className="noise relative min-h-screen">
        <Curtain />
        <Ambient />
        <Header />
        <main className="relative">
          <Hero />
          <StatsBand />
          <Services />
          <Pricing />
          <News onOpen={setDoc} />
          <Articles onOpen={setDoc} />
          <Documents />
          <Team />
          <Policies />
          <Contact />
        </main>
        <Footer />
        <ScrollTop />
        <ArticleModal item={doc} onClose={() => setDoc(null)} />
      </div>
    </MotionConfig>
  );
}
