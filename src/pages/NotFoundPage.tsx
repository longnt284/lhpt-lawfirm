import { Link } from "react-router-dom";
import { NOT_FOUND_META } from "../content/notFound";
import { usePageMeta } from "../lib/pageMeta";

export default function NotFoundPage() {
  usePageMeta(NOT_FOUND_META);

  return (
    <section
      data-chain-occluder
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink-950 px-5 pb-20 pt-36 lg:px-8"
      aria-labelledby="not-found-title"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-jade-500/[0.06] blur-3xl"
      />
      <div className="mx-auto w-full max-w-5xl border-l border-brass-500/35 pl-6 sm:pl-10">
        <p className="label text-[11px] text-brass-400">MÃ ĐỊNH TUYẾN · 404</p>
        <p aria-hidden="true" className="font-display mt-5 text-[clamp(5rem,18vw,12rem)] leading-none text-white/[0.06]">
          404
        </p>
        <h1
          id="not-found-title"
          className="font-display -mt-8 max-w-3xl text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-[1.08] text-snow sm:-mt-14"
        >
          Đường dẫn này không còn trong hồ sơ.
        </h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-fog-300 sm:text-lg">
          Nội dung có thể đã được chuyển hoặc địa chỉ chưa chính xác. Bạn có thể trở về trang chủ hoặc tiếp tục từ danh mục dịch vụ pháp lý.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-12 items-center justify-center bg-brass-500 px-6 text-sm font-semibold text-ink-950 transition-colors hover:bg-brass-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass-300"
          >
            Về trang chủ
          </Link>
          <Link
            to="/#dich-vu"
            className="inline-flex min-h-12 items-center justify-center border border-fog-500/35 px-6 text-sm font-semibold text-snow transition-colors hover:border-jade-400 hover:text-jade-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade-300"
          >
            Xem lĩnh vực hành nghề
          </Link>
        </div>
      </div>
    </section>
  );
}
