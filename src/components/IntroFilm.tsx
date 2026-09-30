/*
 * Khối video giới thiệu trên trang chủ.
 *
 * Trước đây trang chủ chỉ dẫn tới video bằng một liên kết chữ nhỏ ở hero và một
 * mục ở chân trang, nên khách lướt trang chủ không thấy có video. Khối này đặt
 * thẳng trình phát ngay sau màn mở đầu.
 *
 * Trình phát là "mặt tiền" bấm-để-phát: trước cú bấm chỉ có ảnh bìa, tải lười khi
 * khối cuộn tới gần. Thẻ <video> chỉ được dựng sau cú bấm, nên đường tải đầu của
 * trang chủ không nặng thêm một byte video nào.
 */
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { INTRO_VIDEO } from "../content/introVideo";
import { useLocale } from "../i18n";
import { VIEWPORT, fadeUp } from "../motion";
import { SectionHead } from "./Chrome";
import { IconArrowRight, IconPlay } from "./Icons";
import { IntroVideoSources } from "./IntroVideoSources";

export function IntroFilm() {
  const { isEnglish } = useLocale();
  const [playing, setPlaying] = useState(false);
  const label = isEnglish ? "LHPT Law Firm introduction film" : "Video giới thiệu LHPT Law Firm";

  return (
    <section id="video-gioi-thieu" className="relative z-10 scroll-mt-24 px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          kicker={isEnglish ? "Introduction film · 60 seconds" : "Video giới thiệu · 60 giây"}
          title={
            isEnglish ? (
              <>
                One minute on <span className="gilded italic">what holds us up.</span>
              </>
            ) : (
              <>
                Một phút về <span className="gilded italic">nền móng của LHPT.</span>
              </>
            )
          }
          sub={
            isEnglish
              ? "Five practice areas, the statutes beneath them, four lawyers and one point of contact."
              : "Năm lĩnh vực hành nghề, các văn bản làm nền cho chúng, bốn luật sư và một đầu mối tiếp nhận."
          }
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="mt-12"
        >
          <div className="relative aspect-video w-full overflow-hidden border border-snow/10 bg-ink-950 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
            {playing ? (
              <video className="h-full w-full" controls autoPlay playsInline aria-label={label}>
                <IntroVideoSources />
              </video>
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={isEnglish ? "Play the introduction film" : "Phát video giới thiệu"}
                className="group absolute inset-0 h-full w-full"
              >
                <img
                  src={INTRO_VIDEO.poster}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.015]"
                />
                {/*
                  Nút phát đặt ở góc trái dưới, không đặt giữa khung: ảnh bìa là
                  khung logo và tên hãng, nút giữa khung sẽ đè lên đúng chữ LHPT.
                */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent transition-opacity duration-500 group-hover:opacity-70"
                />
                <span className="absolute bottom-4 left-4 flex items-center gap-3 sm:bottom-7 sm:left-7 sm:gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brass-400/70 bg-ink-950/75 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16">
                    <IconPlay className="ml-0.5 h-5 w-5 text-brass-300 sm:h-6 sm:w-6" />
                  </span>
                  <span className="text-left">
                    <span className="block text-[14px] font-semibold text-snow sm:text-[15px]">
                      {isEnglish ? "Watch the film" : "Xem video giới thiệu"}
                    </span>
                    <span className="label mt-1 block text-[9.5px] text-fog-400">1:00 · 1080p</span>
                  </span>
                </span>
              </button>
            )}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-[12.5px] leading-[1.7] text-fog-500">
              {isEnglish
                ? "No voice-over. This film introduces our services and is not legal advice on any specific matter."
                : "Video không có lời thoại. Video giới thiệu dịch vụ, không phải ý kiến pháp lý cho vụ việc cụ thể."}
            </p>
            <Link
              to="/video"
              className="link-underline group inline-flex shrink-0 items-center gap-2 text-[13px] font-medium text-fog-300 transition-colors hover:text-brass-300"
            >
              {isEnglish ? "Chapters and transcript" : "Mục lục từng cảnh"}
              <IconArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
