import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useState } from "react";
import { Ambient, ArticleModal, Footer, Header, MobileActionBar, ScrollTop } from "./components/Chrome";
import { Approach, Hero, Pricing, Services, StatsBand } from "./components/Home1";
import type { DocItem } from "./data";
import { LocaleProvider } from "./i18n";

const SecondaryContent = lazy(() =>
  import("./components/Home2").then(({ SecondaryContent: Content }) => ({ default: Content }))
);

function SecondaryContentFallback() {
  return (
    <section className="min-h-[32rem] bg-mist-100 px-5 py-24 text-ink-900 lg:px-8" aria-label="Nội dung đang tải">
      <div className="mx-auto max-w-7xl">
        <p className="label text-[10px] text-brass-700">Kiến thức & liên hệ</p>
        <h2 className="font-display mt-4 max-w-xl text-[clamp(1.8rem,3.7vw,3rem)] leading-[1.18] font-semibold">
          Pháp lý vững cho mọi quyết định.
        </h2>
      </div>
    </section>
  );
}

export default function App() {
  const [doc, setDoc] = useState<DocItem | null>(null);

  return (
    /*
     * reducedMotion="user" là công tắc tổng: khi hệ điều hành bật "giảm chuyển
     * động", Motion tự bỏ mọi transform và chỉ giữ lại đổi màu/độ mờ. Nhờ vậy
     * từng component không phải tự kiểm tra lại.
     */
    <LocaleProvider>
      <MotionConfig reducedMotion="user">
        <div className="noise relative min-h-screen">
        <Ambient />
        <Header />
        <main className="relative" aria-label="Nội dung LHPT Law Firm">
          <Hero />
          <StatsBand />
          <Services />
          <Approach />
          <Pricing />
          <Suspense fallback={<SecondaryContentFallback />}>
            <SecondaryContent onOpen={setDoc} />
          </Suspense>
        </main>
        <Footer />
        <MobileActionBar />
        <ScrollTop />
        <ArticleModal item={doc} onClose={() => setDoc(null)} />
        </div>
      </MotionConfig>
    </LocaleProvider>
  );
}
