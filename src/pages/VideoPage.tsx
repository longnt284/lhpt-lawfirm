/*
 * Trang video giới thiệu hãng.
 *
 * Trình phát không tải trước gì ngoài ảnh bìa (`preload="none"`): tệp video nặng
 * gấp vài chục lần cả đường tải đầu của trang chủ, và chỉ nên về máy khách khi
 * khách đã bấm xem.
 *
 * Mục lục bên cạnh vừa để tua tới từng cảnh, vừa là bản chữ của video. Video
 * không có lời thoại, nên người dùng trình đọc màn hình — hoặc khách đọc tiếng
 * Anh, vì chữ trên hình là tiếng Việt — nhận đủ nội dung qua mục lục này.
 */
import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Kicker } from "../components/Chrome";
import { IconArrowUpRight } from "../components/Icons";
import { pick } from "../content/pages3d";
import {
  INTRO_VIDEO,
  VIDEO_CHAPTERS,
  chapterAt,
  chapterSeconds,
  formatTimestamp,
} from "../content/video";
import { useLocale } from "../i18n";
import { usePageMeta } from "../lib/pageMeta";
import { fadeUp, fadeUpSmall, stagger } from "../motion";

export default function VideoPage() {
  const { isEnglish, t } = useLocale();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  /* -1: chưa phát lần nào, nên chưa chương nào được đánh dấu là đang phát. */
  const [active, setActive] = useState(-1);

  usePageMeta({
    title: isEnglish ? "Introduction film — LHPT Law Firm" : "Video giới thiệu — LHPT Law Firm",
    description: isEnglish
      ? "One minute on LHPT Law Firm: five practice areas, the statutes beneath them, four lawyers and one point of contact."
      : "Một phút về LHPT Law Firm: năm lĩnh vực hành nghề, các văn bản làm nền cho chúng, bốn luật sư và một đầu mối tiếp nhận.",
    path: "/video",
  });

  const seek = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = seconds;
    // Trình duyệt có thể từ chối phát (chế độ tiết kiệm dữ liệu chẳng hạn); khi
    // đó khách vẫn còn nút phát của trình phát, không cần báo lỗi.
    video.play().catch(() => undefined);
  }, []);

  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) setActive(chapterAt(video.currentTime));
  }, []);

  return (
    <section className="relative z-10 px-5 pt-[128px] pb-24 lg:px-8 lg:pt-[150px]">
      <div className="mx-auto max-w-7xl">
        <motion.div variants={stagger(0.12, 0.1)} initial="hidden" animate="show" className="max-w-3xl">
          <motion.div variants={fadeUpSmall}>
            <Kicker>{isEnglish ? "Introduction film · 60 seconds" : "Video giới thiệu · 60 giây"}</Kicker>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="font-display mt-6 text-[clamp(2.2rem,5.2vw,3.9rem)] leading-[1.14] font-semibold tracking-[-0.012em] text-snow"
          >
            {isEnglish ? (
              <>
                Sound legal ground, <span className="gilded italic">in one minute.</span>
              </>
            ) : (
              <>
                Nền pháp lý vững, <span className="gilded italic">trong một phút.</span>
              </>
            )}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-[15.5px] leading-[1.8] text-fog-400">
            {isEnglish
              ? "The camera starts at the portico and goes below ground: four piles, then five layers of soil — one per practice area, each carrying the statutes it rests on. At the end the portico folds back into our mark."
              : "Máy quay bắt đầu ở hiên cột rồi đi xuống dưới mặt đất: bốn cọc, rồi năm tầng đất — mỗi tầng một lĩnh vực hành nghề, mang theo các văn bản làm nền cho nó. Cuối cùng, hiên cột thu về chính logo của hãng."}
          </motion.p>
        </motion.div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="lg:col-span-8"
          >
            <div className="aspect-video w-full overflow-hidden border border-snow/10 bg-ink-950 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
              <video
                ref={videoRef}
                className="h-full w-full"
                controls
                playsInline
                preload="none"
                poster={INTRO_VIDEO.poster}
                onTimeUpdate={onTimeUpdate}
                aria-label={isEnglish ? "LHPT Law Firm introduction film" : "Video giới thiệu LHPT Law Firm"}
              >
                <source src={INTRO_VIDEO.webm} type="video/webm" />
                <source src={INTRO_VIDEO.mp4} type="video/mp4" />
              </video>
            </div>
            <p className="mt-4 text-[12.5px] leading-[1.7] text-fog-500">
              {isEnglish
                ? "No voice-over; the on-screen text is in Vietnamese and is given in English in the chapter list. Statute numbers were checked in September 2026. This film introduces our services and is not legal advice on any specific matter."
                : "Video không có lời thoại; chữ trên màn hình được ghi lại trong mục lục. Số hiệu văn bản đối chiếu tháng 9/2026. Video giới thiệu dịch vụ, không phải ý kiến pháp lý cho vụ việc cụ thể."}
            </p>
          </motion.div>

          <motion.nav
            variants={fadeUp}
            initial="hidden"
            animate="show"
            aria-label={isEnglish ? "Chapters" : "Mục lục"}
            className="lg:col-span-4"
          >
            <p className="label text-[10.5px] text-brass-400">{isEnglish ? "Chapters" : "Mục lục"}</p>
            <ol className="mt-5 border-t border-snow/10">
              {VIDEO_CHAPTERS.map((chapter, index) => {
                const seconds = chapterSeconds(chapter.beat);
                const current = index === active;
                return (
                  <li key={chapter.beat} className="border-b border-snow/10">
                    <button
                      type="button"
                      onClick={() => seek(seconds)}
                      aria-current={current ? "true" : undefined}
                      className={`group flex w-full gap-4 py-3.5 text-left transition-colors duration-300 ${
                        current ? "text-snow" : "text-fog-300 hover:text-snow"
                      }`}
                    >
                      <span
                        className={`code w-10 shrink-0 pt-0.5 text-[11.5px] ${
                          current ? "text-brass-300" : "text-brass-500"
                        }`}
                      >
                        {formatTimestamp(seconds)}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium leading-[1.45]">
                          {pick(chapter.title, isEnglish)}
                        </span>
                        <span className="mt-1 block text-[12.5px] leading-[1.6] text-fog-500 group-hover:text-fog-400">
                          {pick(chapter.line, isEnglish)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <Link
              to="/#lien-he"
              className="group mt-8 inline-flex items-center gap-2.5 bg-brass-500 px-6 py-3.5 text-[14px] font-semibold text-ink-950 transition-colors duration-300 hover:bg-brass-400"
            >
              {t("book")}
              <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.nav>
        </div>
      </div>
    </section>
  );
}
