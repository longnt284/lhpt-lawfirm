import { MotionConfig } from "framer-motion";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth";
import { ChainBackdrop } from "./components/ChainBackdrop";
import { Ambient, ArticleModal, Footer, Header, MobileActionBar, ScrollTop } from "./components/Chrome";
import { Explore, OpeningStage, Pricing, Services } from "./components/Home1";
import type { DocItem } from "./content/types";
import { LocaleProvider } from "./i18n";
import { runWithInstantScroll } from "./lib/instantScroll";

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
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function SecondaryContentFallback() {
  return (
    <section className="min-h-[32rem] bg-ink-900/45 px-5 py-24 text-snow lg:px-8" aria-label="Nội dung đang tải">
      <div className="mx-auto max-w-7xl">
        <p className="label text-[10px] text-brass-400">Kiến thức &amp; liên hệ</p>
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
      runWithInstantScroll(document.documentElement, requestAnimationFrame, () => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
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
        runWithInstantScroll(document.documentElement, requestAnimationFrame, () => {
          target.scrollIntoView({ block: "start", behavior: "auto" });
        });
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
  /*
   * Mốc bàn giao của lớp nền chuỗi khối: nó phải là phần tử thật trên trang chứ
   * không phải một con số phần trăm. Trang chủ cao hơn mười ba nghìn điểm ảnh và
   * còn cao thêm khi khối nội dung nạp muộn hạ xuống, nên mọi ngưỡng đóng cứng
   * theo tiến trình cuộn sẽ trôi khỏi chỗ của nó ngay lần đầu ai đó thêm một
   * khối vào giữa trang.
   */
  const openingRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      {/*
        Sân khấu mở đầu gộp hai màn hình đầu tiên vào một cảnh 3D duy nhất: công
        trình đứng trên mặt đất, rồi máy quay hạ xuống dưới nền móng. Vì hai màn
        dùng chung một canvas dính, chúng phải nằm chung một component thay vì
        đứng cạnh nhau ở đây.

        Lớp bọc quanh nó không có kiểu dáng nào — nó chỉ tồn tại để lớp nền chuỗi
        khối đo được đáy của sân khấu và biết lúc nào tới lượt mình.
      */}
      <div ref={openingRef}>
        <OpeningStage />
      </div>
      {/*
        Chuỗi khối chảy phía sau *mọi* khối còn lại của trang chủ, từ đây tới
        dòng bản quyền ở chân trang. Vị trí của nó trong DOM không quyết định
        thứ tự vẽ — nó là lớp `fixed` ở z-0, còn mọi khối nội dung đều ở z-10 —
        nhưng đặt nó ngay chỗ nó bắt đầu hiện ra thì người đọc file này không
        phải đi tìm.

        Từ lúc toàn trang về một tông tối, không còn khối nào che nó nữa: nền
        của các khối là mực loãng (`bg-ink-900/45`) chứ không phải sơn đục, nên
        chuỗi đọc được xuyên suốt. Cơ chế tắt theo khối che vẫn còn trong
        ChainBackdrop cho khối nền đục thêm về sau — khối nào che thì tự khai
        báo `data-chain-occluder` trên chính nó, chứ không liệt kê ở đây.
      */}
      <ChainBackdrop fromRef={openingRef} />
      <Services />
      <Explore />
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
          <Route
            path="*"
            element={
              <Suspense fallback={<PageFallback />}>
                <NotFoundPage />
              </Suspense>
            }
          />
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
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Shell />
          </BrowserRouter>
        </MotionConfig>
      </AuthProvider>
    </LocaleProvider>
  );
}
