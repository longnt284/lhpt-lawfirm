import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth";
import { Ambient, ArticleModal, Footer, Header, MobileActionBar, ScrollTop } from "./components/Chrome";
import { Approach, Explore, Hero, Pricing, Services, StatsBand } from "./components/Home1";
import type { DocItem } from "./content/types";
import { LocaleProvider } from "./i18n";

const SecondaryContent = lazy(() =>
  import("./components/Home2").then(({ SecondaryContent: Content }) => ({ default: Content }))
);

/*
 * Cổng khách hàng tách thành chunk riêng: nó kéo theo @supabase/supabase-js và
 * chỉ mở khi người dùng bấm vào tài khoản, nên không có lý do gì để nằm trong
 * gói tải đầu của một trang mà phần lớn khách chỉ đọc bài viết.
 */
const AccountDialog = lazy(() =>
  import("./components/Account").then(({ AccountDialog: Dialog }) => ({ default: Dialog }))
);

/*
 * Hai trang chuyên đề dùng three.js. Chúng phải nằm ngoài gói tải đầu: riêng thư
 * viện đồ hoạ đã nặng hơn toàn bộ phần còn lại của trang chủ, trong khi phần lớn
 * khách vào đọc bài viết rồi rời đi mà không mở tới chúng.
 */
const FoundationPage = lazy(() => import("./pages/FoundationPage"));
const PracticeMapPage = lazy(() => import("./pages/PracticeMapPage"));

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

/* Giữ chỗ đúng bằng một màn hình để lúc tải chunk trang không bị hụt bố cục. */
function PageFallback() {
  return <div className="min-h-[100svh]" aria-hidden="true" />;
}

/*
 * Router không tự cuộn khi đổi trang: chuyển từ chân trang chủ sang một trang
 * khác sẽ giữ nguyên vị trí cuộn cũ, nên người dùng rơi vào giữa trang mới.
 *
 * Với địa chỉ có neo (#lien-he chẳng hạn) thì khối cần tới có thể còn nằm trong
 * một chunk đang tải, vì vậy phải thử lại vài khung hình thay vì tìm một lần rồi
 * bỏ cuộc. Mốc thời gian chặn trên để không có vòng lặp nào sống mãi.
 */
function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    let frame = 0;
    const deadline = performance.now() + 2500;

    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        // Nhảy thẳng chứ không cuộn mượt: đây là lần đầu trang hiện ra, cuộn mượt
        // qua cả chục màn hình chỉ khiến người dùng phải ngồi chờ.
        target.scrollIntoView({ block: "start", behavior: "auto" });
        return;
      }
      if (performance.now() < deadline) frame = requestAnimationFrame(tryScroll);
    };

    frame = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);

  return null;
}

function HomeRoute({ onOpenDoc }: { onOpenDoc: (doc: DocItem | null) => void }) {
  return (
    <>
      <Hero />
      <StatsBand />
      <Services />
      <Explore />
      <Approach />
      <Pricing />
      <Suspense fallback={<SecondaryContentFallback />}>
        <SecondaryContent onOpen={onOpenDoc} />
      </Suspense>
    </>
  );
}

function Shell() {
  const [doc, setDoc] = useState<DocItem | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const openAccount = useCallback(() => setAccountOpen(true), []);

  return (
    <div className="noise relative min-h-screen">
      <ScrollManager />
      <Ambient />
      <Header onOpenAccount={openAccount} />
      <main className="relative" aria-label="Nội dung LHPT Law Firm">
        <Routes>
          <Route path="/" element={<HomeRoute onOpenDoc={setDoc} />} />
          <Route
            path="/nen-mong-phap-ly"
            element={
              <Suspense fallback={<PageFallback />}>
                <FoundationPage />
              </Suspense>
            }
          />
          <Route
            path="/ban-do-nang-luc"
            element={
              <Suspense fallback={<PageFallback />}>
                <PracticeMapPage />
              </Suspense>
            }
          />
          {/*
            Địa chỉ lạ trả về trang chủ thay vì một trang lỗi: trang này là hồ sơ
            giới thiệu, để khách rơi vào ngõ cụt thì mất khách chứ không được gì.
          */}
          <Route path="*" element={<HomeRoute onOpenDoc={setDoc} />} />
        </Routes>
      </main>
      <Footer />
      <MobileActionBar onOpenAccount={openAccount} />
      <ScrollTop />
      <ArticleModal
        item={doc}
        onClose={() => setDoc(null)}
        onRequireAccount={openAccount}
      />
      <Suspense fallback={null}>
        <AccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    /*
     * reducedMotion="user" là công tắc tổng: khi hệ điều hành bật "giảm chuyển
     * động", Motion tự bỏ mọi transform và chỉ giữ lại đổi màu/độ mờ. Nhờ vậy
     * từng component không phải tự kiểm tra lại.
     */
    <LocaleProvider>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <Shell />
          </BrowserRouter>
        </MotionConfig>
      </AuthProvider>
    </LocaleProvider>
  );
}
