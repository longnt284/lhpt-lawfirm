import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TICKER_EN, WORDS_EN } from "../content/homeEnglish";
import { FIRM, FIRST_TIME_DISCOUNT, PLANS, SERVICES, TICKER } from "../firm";
import { useCountUp, useInView, useScrambleCycle, useSpotlight } from "../hooks";
import { localizePlan, localizeService, useLocale } from "../i18n";
import {
  EASE_LUXE,
  SOFT,
  VIEWPORT,
  cardIn,
  fadeUp,
  fadeUpSmall,
  heroLine,
  stagger,
} from "../motion";
import { Kicker, Reveal, SectionHead } from "./Chrome";
import { ExplorePreview } from "./ExplorePreview";
import { OpeningBackdrop } from "./OpeningBackdrop";
import { GoldRule, Magnetic } from "./Motion";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconCrane,
  IconCube,
  IconCursor,
  IconDeal,
  IconScale,
  IconShield,
  IconSolar,
} from "./Icons";

const WORDS = [
  "XÂY DỰNG",
  "BẤT ĐỘNG SẢN",
  "TỐ TỤNG",
  "ĐIỆN MẶT TRỜI",
  "DOANH NGHIỆP",
  "BẢO MẬT DỮ LIỆU",
];

const SERVICE_ICONS = {
  crane: IconCrane,
  scale: IconScale,
  solar: IconSolar,
  deal: IconDeal,
  shield: IconShield,
} as const;

/*
 * Hai giá trị dưới đây đổi theo từng khung hình: chữ xáo trộn chạy lại sau mỗi
 * 3,2 giây và con số đếm lên chạy 1,8 giây. Nếu gọi hook ngay trong Hero thì
 * mỗi lần đổi sẽ dựng lại toàn bộ hero — thẻ nghiêng, vòng SVG, năm thanh tỉ
 * trọng và dải ticker 24 mục. Tách ra thành lá riêng để React chỉ đụng vào đúng
 * nút chữ cần thay.
 */
function ScrambleWord({ words }: { words: string[] }) {
  const text = useScrambleCycle(words);
  return <span className="text-jade-400">[ {text} ]</span>;
}

function CountUp({
  target,
  start,
  duration,
}: {
  target: number;
  start: boolean;
  duration?: number;
}) {
  const value = useCountUp(target, start, duration);
  return <>{value}</>;
}

/* ================= SÂN KHẤU MỞ ĐẦU ================= */
/*
 * Hai màn hình đầu tiên của trang chủ dùng chung *một* cảnh 3D dính giữa khung
 * nhìn, và chính thao tác cuộn điều khiển máy quay đi từ màn này sang màn kia.
 *
 * Bản trước là hai khối rời: hero có nền 3D riêng, dải chỉ số là một hàng bốn ô
 * phẳng bên dưới. Người dùng đọc ra hai thứ không liên quan tới nhau. Bản này
 * kể một mạch: màn một là công trình đứng trên mặt đất, cuộn xuống thì máy quay
 * hạ qua vạch nền và phần móng hiện ra — đúng câu mà cả hãng nói về mình. Những
 * con số được đặt xuống đúng chỗ đó, nên chúng không còn là bốn ô thống kê mà
 * là phần chìm dưới đất của công trình phía trên.
 *
 * Bố cục dựa trên hai thứ: canvas `sticky` đứng yên đúng một khung nhìn, và
 * khối chữ bị kéo ngược lên đè lên nó bằng `-mt-[100svh]`. Khối chữ đứng sau
 * canvas trong DOM nên nó được vẽ đè lên — không cần z-index nào cả.
 */
export function OpeningStage() {
  const stageRef = useRef<HTMLElement | null>(null);

  return (
    <section ref={stageRef} className="relative z-10">
      <div className="pointer-events-none sticky top-0 h-[100svh] w-full overflow-hidden">
        <OpeningBackdrop stageRef={stageRef} />
      </div>
      <div className="relative -mt-[100svh]">
        <Hero />
        <Numbers />
      </div>
    </section>
  );
}

/* ================= MÀN MỘT — CÔNG TRÌNH ================= */
function Hero() {
  const { isEnglish, t } = useLocale();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  /*
   * Chữ trôi lệch tốc độ so với nền 3D khi cuộn, tạo lớp gần — lớp xa.
   *
   * Mốc đo phải là chính khối hero. Bản trước dùng scrollYProgress của cả trang:
   * trang cao hơn 12.000px nên lúc hero rời khỏi màn hình, tiến trình mới đạt
   * ~0,08 — chữ dịch được 5px và độ mờ còn 0,92, tức hiệu ứng gần như không xảy
   * ra dù Motion vẫn tính lại ở mỗi khung hình cuộn.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  /*
   * Chữ nhạt hẳn trước khi hero rời khung nhìn. Đây không phải hiệu ứng trang
   * trí: đúng lúc đó máy quay bắt đầu hạ xuống dưới nền móng, và nếu tiêu đề
   * còn đậm thì hai chuyển động giành nhau sự chú ý.
   */
  const heroFade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const ticker = isEnglish ? TICKER_EN : TICKER;

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col justify-between pt-[116px] lg:pt-[132px]"
    >
      <div className="flex flex-1 items-center">
        <motion.div
          style={reduced ? undefined : { y: textY, opacity: heroFade }}
          /*
            Trễ 0,08 giây chứ không phải 0,6. Khối chữ này chứa tiêu đề hero,
            tức phần tử lớn nhất của màn hình đầu — nó quyết định luôn mốc LCP
            của cả trang, nên mỗi phần mười giây chờ ở đây là một phần mười giây
            cộng thẳng vào điểm tốc độ.
          */
          variants={stagger(0.09, 0.08)}
          initial="hidden"
          animate="show"
          className="mx-auto w-full max-w-7xl px-5 lg:px-8"
        >
          <div className="max-w-3xl">
            <motion.p
              variants={fadeUpSmall}
              className="label flex items-center gap-3 text-[11px] text-fog-400"
            >
              <span className="animate-pulse-dot inline-block h-2 w-2 shrink-0 rounded-full bg-jade-500" />
              {t("legalFirm")} · {t("scope")}
            </motion.p>
            {/*
              Tiêu đề serif chữ thường, leading 1.12. Không bọc trong khung
              overflow:hidden vì khung che sẽ cắt dấu tiếng Việt ở đỉnh con chữ;
              hiệu ứng dùng mờ nhòe cộng trượt nhẹ để thay thế.

              Cỡ chữ lớn hơn bản trước một bậc: bảng hồ sơ năng lực ở nửa phải đã
              bỏ đi, nên tiêu đề được thừa hưởng chỗ trống đó thay vì để nó rỗng.
            */}
            <h1 className="font-display mt-7 text-[clamp(2.5rem,6.2vw,4.9rem)] leading-[1.1] font-semibold tracking-[-0.015em] text-snow">
              <motion.span variants={heroLine} className="block">
                {isEnglish ? "Sound legal ground," : "Nền pháp lý vững,"}
              </motion.span>
              <motion.span variants={heroLine} className="block">
                {isEnglish ? (
                  <>for every <span className="gilded italic">undertaking.</span></>
                ) : (
                  <>cho mọi <span className="gilded italic">công trình.</span></>
                )}
              </motion.span>
            </h1>
            <motion.p variants={fadeUpSmall} className="label mt-8 text-[12px] text-fog-300">
              <span className="text-fog-500">{t("focus")}</span>{" "}
              <ScrambleWord words={isEnglish ? WORDS_EN : WORDS} />
              <span className="animate-caret ml-1 inline-block h-3.5 w-2 translate-y-0.5 bg-brass-400" />
            </motion.p>
            <p className="mt-7 max-w-xl text-[15.5px] leading-[1.8] text-fog-400">
              {t("heroBody")}
            </p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
              <Magnetic strength={8}>
                <a
                  href="#lien-he"
                  className="sheen group inline-flex items-center gap-2.5 bg-brass-500 px-6 py-3.5 text-[14px] font-semibold text-ink-950 transition-all duration-300 hover:bg-brass-400 hover:shadow-[0_14px_44px_-10px_rgba(201,164,76,0.6)]"
                >
                  {t("book")}
                  <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>
              <Magnetic strength={6}>
                <a
                  href="#dich-vu"
                  className="group inline-flex items-center gap-2.5 border border-snow/20 px-6 py-3.5 text-[14px] font-medium text-snow transition-all duration-300 hover:border-jade-500 hover:text-jade-300"
                >
                  {t("explore")}
                  <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Magnetic>
            </motion.div>
            {/*
              Cửa vào sớm nhất cho hai trang 3D.

              Khối "Trải nghiệm 3D" ở giữa trang chủ mới là nơi giới thiệu chúng
              tử tế, nhưng nó nằm sau hero, dải chỉ số và sáu thẻ dịch vụ — với
              người chỉ lướt một màn hình rồi quyết định đi tiếp hay ở lại thì
              nó không tồn tại. Hai dòng chữ ở đây rẻ về mặt thị giác, không
              tranh chỗ với hai nút chính, mà vẫn nói được rằng website này có
              thứ để xem chứ không chỉ để đọc.
            */}
            <motion.div
              variants={fadeUpSmall}
              className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-l-2 border-brass-500/60 pl-4"
            >
              <span className="label flex items-center gap-2 text-[9.5px] whitespace-nowrap text-brass-400">
                <IconCube className="h-3.5 w-3.5 shrink-0" />
                {isEnglish ? "See it in 3D" : "Xem bằng 3D"}
              </span>
              {(
                [
                  ["/nen-mong-phap-ly", "Nền móng pháp lý", "Legal foundations"],
                  ["/ban-do-nang-luc", "Bản đồ năng lực", "Practice map"],
                ] as const
              ).map(([to, vi, en], index) => (
                <span key={to} className="flex items-center gap-3">
                  {index > 0 && <span className="text-fog-500">·</span>}
                  <Link
                    to={to}
                    // Rê chuột là tín hiệu sớm nhất của ý định bấm: bắt đầu tải
                    // chunk trang ngay từ đây thì lúc bấm gần như không phải chờ.
                    onPointerEnter={() => prefetchPage(to)}
                    onFocus={() => prefetchPage(to)}
                    className="link-underline text-[12.5px] font-medium whitespace-nowrap text-fog-300 transition-colors duration-300 hover:text-brass-300"
                  >
                    {isEnglish ? en : vi}
                  </Link>
                </span>
              ))}
            </motion.div>
            <motion.p variants={fadeUpSmall} className="label mt-7 text-[10px] text-fog-500">
              {t("response")} · {t("confidential")}
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* ticker văn bản — cũng là đường chân trời của màn một */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE_LUXE, delay: 0.55 }}
        className="marquee relative border-y border-snow/10 bg-ink-900/70 py-4 backdrop-blur-sm"
      >
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {ticker.map((item) => (
                <span
                  key={`${dup}-${item}`}
                  className="flex items-center gap-3 pr-3 text-[11px] font-medium tracking-[0.12em] whitespace-nowrap text-fog-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-jade-500" />
                  {item}
                  <span className="pl-3 text-brass-500">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ================= MÀN HAI — PHẦN CHÌM DƯỚI ĐẤT ================= */
/*
 * Bản trước gọi khối này là "dải chỉ số": bốn ô số liệu nằm ngay dưới hero,
 * không nói gì ngoài chính bốn con số. Ở đây chúng được đặt vào đúng lúc máy
 * quay vừa hạ xuống dưới vạch nền, nên chúng đọc ra là *nền móng* của hãng chứ
 * không phải một bảng thống kê. Cùng bốn con số, khác hẳn ý nghĩa.
 */
const STATS = [
  { v: 15, suffix: "+", decimals: 0 },
  { v: 600, suffix: "+", decimals: 0 },
  { v: 24, suffix: "h", decimals: 0 },
  { v: 98, suffix: "%", decimals: 0 },
];

function Numbers() {
  const { isEnglish, t } = useLocale();
  const stats = [
    { ...STATS[0], label: t("practiceYears") },
    { ...STATS[1], label: t("handled") },
    { ...STATS[2], label: t("responseMetric") },
    { ...STATS[3], label: t("returning") },
  ];

  return (
    <section className="relative flex min-h-[100svh] items-center px-5 py-24 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="max-w-2xl"
        >
          <motion.div variants={fadeUpSmall}>
            <Kicker>{isEnglish ? "Below ground" : "Phần chìm dưới đất"}</Kicker>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display mt-5 text-[clamp(1.8rem,4.2vw,3.1rem)] leading-[1.16] font-semibold text-snow"
          >
            {isEnglish ? (
              <>
                What holds a building up is{" "}
                <span className="gilded italic">the part nobody sees.</span>
              </>
            ) : (
              <>
                Thứ giữ công trình đứng vững nằm ở{" "}
                <span className="gilded italic">phần không ai nhìn thấy.</span>
              </>
            )}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-[15px] leading-[1.8] text-fog-400"
          >
            {isEnglish
              ? "Fifteen years of files, six hundred matters closed, and a response clock we actually keep. That is the foundation sitting under every recommendation we sign."
              : "Mười lăm năm hồ sơ, sáu trăm vụ việc đã khép lại, và một cam kết thời gian được giữ đúng. Đó là nền móng nằm dưới mọi khuyến nghị chúng tôi ký tên."}
          </motion.p>
        </motion.div>

        {/*
          Nền mờ là bắt buộc chứ không phải trang trí: các ô này nằm chồng lên hệ
          giằng và bè móng đang chuyển động, mà một con số thì phải đọc được ngay
          lập tức.
          
          Nhưng chỉ mờ 42%, và không làm nhoè hậu cảnh: hệ giằng phía sau vẫn đọc
          ra được xuyên qua tấm nền. Đó là chủ ý — cả khối này nói rằng những con
          số *là* phần móng, nên che khuất hẳn phần móng thì mất luôn ý đó.
        */}
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="mt-14 grid grid-cols-2 border-t border-l border-snow/12 bg-ink-950/[0.42] lg:grid-cols-4"
        >
          {stats.map((s) => (
            <StatCell key={s.label} {...s} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StatCell({
  v,
  suffix,
  label,
  decimals,
}: {
  v: number;
  suffix: string;
  label: string;
  decimals: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const val = useCountUp(v, inView, 1600, decimals);
  return (
    <motion.div
      ref={ref}
      variants={cardIn}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", ...SOFT }}
      className="group relative border-r border-b border-snow/12 px-6 py-9 transition-colors duration-300 hover:bg-ink-900/70 lg:px-7 lg:py-11"
    >
      <p className="font-display text-[2.4rem] leading-tight font-bold text-snow transition-colors duration-300 group-hover:text-brass-300 lg:text-[3rem]">
        {decimals > 0 ? val.toFixed(decimals) : val}
        <span className="text-jade-400">{suffix}</span>
      </p>
      <p className="mt-3 text-[13px] leading-[1.55] text-fog-400">{label}</p>
      {/* Vạch vàng chỉ hiện khi rê chuột, giữ lưới số liệu sạch khi đứng yên. */}
      <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-brass-500 to-transparent transition-all duration-500 group-hover:w-full" />
    </motion.div>
  );
}

/* ================= DỊCH VỤ ================= */
export function Services() {
  const { locale, isEnglish, t } = useLocale();
  const onMove = useSpotlight<HTMLElement>();
  const services = SERVICES.map((service) => localizeService(service, locale));
  return (
    <section id="dich-vu" className="relative z-10 scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHead
                  kicker={t("servicesKicker")}
                title={
                  <>
                    {isEnglish ? (
                      <>Five pillars.<br /><span className="gilded italic">One standard.</span></>
                    ) : (
                      <>Năm trụ cột.<br /><span className="gilded italic">Một chuẩn mực.</span></>
                    )}
                  </>
                }
                sub={t("servicesSub")}
              />
              <motion.ul
                variants={stagger(0.07, 0.2)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT}
                className="mt-10 space-y-1"
              >
                {services.map((s) => (
                  <motion.li key={s.num} variants={fadeUpSmall}>
                    <a
                      href={`#dv-${s.num}`}
                      className="group flex items-baseline gap-4 border-l border-snow/10 py-2.5 pl-5 transition-all duration-300 hover:border-brass-400 hover:pl-7"
                    >
                      <span className="code text-[11px] text-brass-500">{s.num}</span>
                      <span className="text-[13.5px] font-medium text-fog-300 transition-colors duration-300 group-hover:text-snow">
                        {s.title}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-8">
            {services.map((s, idx) => {
              const Icon = SERVICE_ICONS[s.icon];
              const isNew = s.num === "05";
              return (
                <motion.article
                  key={s.num}
                  id={`dv-${s.num}`}
                  onPointerMove={onMove}
                  variants={cardIn}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  transition={{ delay: (idx % 3) * 0.07 }}
                  whileHover="hover"
                  className={`spotlight ${
                    isNew ? "spotlight-jade" : ""
                  } group relative scroll-mt-28 overflow-hidden border bg-ink-850/80 p-7 transition-[border-color,box-shadow] duration-500 sm:p-9 ${
                    isNew
                      ? "border-jade-500/40 hover:border-jade-400/80 hover:shadow-[0_25px_70px_-30px_rgba(34,196,156,0.4)]"
                      : "border-snow/10 hover:border-brass-500/60 hover:shadow-[0_25px_70px_-30px_rgba(201,164,76,0.35)]"
                  }`}
                >
                  {/*
                    Số thứ tự lớn nằm hẳn ở rìa phải và nhạt màu; khi rê chuột nó
                    trôi nhẹ sang trái, đủ để thấy chiều sâu mà không chạm tiêu đề.
                  */}
                  <motion.span
                    variants={{ hover: { x: -10, opacity: 0.85 } }}
                    transition={{ type: "spring", ...SOFT }}
                    className="font-display pointer-events-none absolute -top-2 right-3 text-[5.5rem] leading-none font-bold text-outline select-none sm:text-[6.5rem]"
                    aria-hidden="true"
                  >
                    {s.num}
                  </motion.span>
                  <motion.div
                    variants={{ hover: { y: -5 } }}
                    transition={{ type: "spring", ...SOFT }}
                    className="relative"
                  >
                    <div className="flex flex-wrap items-center gap-5">
                      <motion.span
                        variants={{ hover: { rotate: -5, scale: 1.05 } }}
                        transition={{ type: "spring", ...SOFT }}
                        className={`flex h-14 w-14 shrink-0 items-center justify-center border transition-colors duration-500 ${
                          isNew
                            ? "border-jade-500/50 text-jade-400 group-hover:bg-jade-500 group-hover:text-ink-950"
                            : "border-brass-500/40 text-brass-400 group-hover:bg-brass-500 group-hover:text-ink-950"
                        }`}
                      >
                        <Icon className="h-7 w-7" />
                      </motion.span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-[1.2rem] leading-[1.25] font-semibold text-snow sm:text-[1.4rem]">
                          {s.title}
                        </h3>
                        <p className="mt-1.5 text-[13.5px] leading-[1.6] text-fog-400">
                          {s.tagline}
                        </p>
                      </div>
                      {isNew && (
                        <span className="label hidden shrink-0 items-center gap-2 border border-jade-500/60 px-2.5 py-1 text-[9px] text-jade-300 sm:inline-flex">
                          <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-jade-500" />
                          {isEnglish ? "New · 2026" : "Mới · 2026"}
                        </span>
                      )}
                    </div>
                    <ul className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                      {s.items.map((it) => (
                        <li
                          key={it}
                          className="flex items-start gap-3 text-[14px] leading-[1.6] text-fog-300"
                        >
                          <IconCheck className="mt-1 h-4 w-4 shrink-0 text-jade-500" />
                          {it}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-7 flex flex-wrap items-center gap-2">
                      {s.tags.map((t) => (
                        <span
                          key={t}
                          className={`label border border-snow/15 px-2.5 py-1 text-[9px] text-fog-400 transition-colors duration-300 ${
                            isNew
                              ? "group-hover:border-jade-500/50 group-hover:text-jade-300"
                              : "group-hover:border-brass-500/40 group-hover:text-brass-300"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                      <span className="ml-auto text-[11.5px] text-fog-500">
                        {t("serviceLeads")}: {s.leads.join(" · ")}
                      </span>
                    </div>
                  </motion.div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= TRẢI NGHIỆM 3D — HAI TRANG CHUYÊN ĐỀ ================= */
/*
 * Hai trang này giải thích cách hãng làm việc bằng hình thay vì bằng đoạn văn:
 * một trang dựng công trình theo nhịp cuộn, một trang bày ra bản đồ các lĩnh
 * vực và các điểm giao giữa chúng.
 *
 * Bản trước đại diện cho mỗi trang bằng một hình vẽ nét mảnh rộng 96px nằm nép
 * ở mép thẻ, màu xám nhạt, đứng yên. Đặt cạnh năm thẻ dịch vụ và một bảng phí,
 * nó không có gì để mắt bám vào: người lướt trang chủ đọc lướt tiêu đề rồi đi
 * tiếp, và hai trang công phu nhất của website gần như không ai mở.
 *
 * Bản này đổi cách nói. Mỗi thẻ mở đầu bằng chính cảnh 3D của trang đó, thu nhỏ
 * và tự chạy: công trình tự dựng lên từng tầng, chòm sao lĩnh vực xoay chậm với
 * những chấm hồ sơ chạy dọc các đường nối. Một khối đang chuyển động trong
 * không gian nói ngay được điều mà dòng chữ "trang tương tác" phải mất vài giây
 * mới nói xong — và nó nói đúng vào lúc mắt quét qua.
 *
 * Phần chi phí của lựa chọn đó được xử lý ở `ExplorePreview`: three.js chỉ được
 * tải khi thẻ sắp vào khung nhìn, trên máy đủ khoẻ, và người dùng chưa nói là
 * muốn ít chuyển động. Ai không rơi vào diện đó vẫn thấy một hình tĩnh vẽ đúng
 * cảnh ấy.
 */
const EXPLORE_PAGES = [
  {
    to: "/nen-mong-phap-ly",
    variant: "foundation" as const,
    kicker: { vi: "Vòng đời dự án", en: "Project life cycle" },
    title: { vi: "Nền móng pháp lý", en: "Legal foundations" },
    body: {
      vi: "Năm tầng hồ sơ của một dự án xây dựng, từ đất đai tới tranh chấp. Cuộn tới đâu, công trình dựng lên tới đó.",
      en: "The five layers of a construction project's legal file, from land to dispute. The building goes up as you scroll.",
    },
    /* Nói thẳng người dùng phải làm gì ở trang kia — ý định bấm đến từ đây. */
    hint: { vi: "Cuộn để dựng công trình", en: "Scroll to build" },
    meta: { vi: "5 tầng hồ sơ", en: "5 layers" },
    accent: "brass" as const,
  },
  {
    to: "/ban-do-nang-luc",
    variant: "practice" as const,
    kicker: { vi: "Bản đồ năng lực", en: "Practice map" },
    title: { vi: "Nơi các lĩnh vực gặp nhau", en: "Where practices meet" },
    body: {
      vi: "Năm lĩnh vực hành nghề và bảy điểm giao có thật giữa chúng. Bấm vào một lĩnh vực để xem nó thường kéo theo điều gì.",
      en: "Five practice areas and seven real crossings between them. Select one to see what it usually pulls in.",
    },
    hint: { vi: "Bấm vào một lĩnh vực", en: "Select a practice area" },
    meta: { vi: "5 lĩnh vực · 7 điểm giao", en: "5 areas · 7 crossings" },
    accent: "jade" as const,
  },
];

/*
 * Nạp trước chunk của trang đích ngay khi con trỏ chạm vào thẻ.
 *
 * Hai trang này nặng: mã trang cộng với thư viện đồ hoạ. Nếu chỉ bắt đầu tải lúc
 * người dùng bấm thì họ nhìn một màn hình trống chừng một nhịp — đúng lúc vừa
 * quyết định là muốn xem. Rê chuột đi trước cú bấm khoảng vài trăm mili giây, đủ
 * để phần lớn quãng tải diễn ra trước khi trang đổi.
 *
 * Vite đã tách sẵn hai trang này thành chunk riêng (xem `lazy()` trong App.tsx),
 * nên `import()` ở đây trỏ đúng vào chunk đó chứ không tạo bản sao thứ hai.
 */
const PAGE_CHUNKS: Record<string, () => Promise<unknown>> = {
  "/nen-mong-phap-ly": () => import("../pages/FoundationPage"),
  "/ban-do-nang-luc": () => import("../pages/PracticeMapPage"),
};
const prefetched = new Set<string>();

function prefetchPage(to: string) {
  if (prefetched.has(to)) return;
  prefetched.add(to);
  // Tải hỏng thì bỏ dấu để lần rê chuột sau còn thử lại; người dùng không cần
  // biết gì, cú bấm vẫn đi qua đường tải bình thường của router.
  PAGE_CHUNKS[to]?.().catch(() => prefetched.delete(to));
}

function ExploreCard({
  page,
  lang,
}: {
  page: (typeof EXPLORE_PAGES)[number];
  lang: "vi" | "en";
}) {
  const onMove = useSpotlight<HTMLAnchorElement>();
  /*
   * Trạng thái rê chuột nằm ở từng thẻ chứ không ở khối cha: đặt ở cha thì mỗi
   * lần con trỏ đi qua một thẻ, React dựng lại cả hai — kể cả thẻ không liên
   * quan — và cảnh 3D bên trong nhận một lượt render thừa ở mỗi lần.
   */
  const [active, setActive] = useState(false);
  const jade = page.accent === "jade";

  /*
   * Cùng một cử chỉ vừa bật hiệu ứng vừa châm ngòi tải trước. Bàn phím đi qua
   * `focus` nên người dùng không dùng chuột cũng được lợi như nhau.
   */
  const engage = useCallback(() => {
    setActive(true);
    prefetchPage(page.to);
  }, [page.to]);
  const release = useCallback(() => setActive(false), []);

  return (
    <motion.article
      variants={cardIn}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", ...SOFT }}
      className="h-full"
    >
      <Link
        to={page.to}
        onPointerEnter={engage}
        onPointerLeave={release}
        onFocus={engage}
        onBlur={release}
        onPointerMove={onMove}
        className={`spotlight ${
          jade ? "spotlight-jade" : ""
        } group flex h-full flex-col overflow-hidden border bg-ink-850/80 transition-[border-color,box-shadow] duration-500 ${
          jade
            ? "border-jade-500/35 hover:border-jade-400/75 hover:shadow-[0_30px_84px_-32px_rgba(34,196,156,0.45)]"
            : "border-brass-500/30 hover:border-brass-400/75 hover:shadow-[0_30px_84px_-32px_rgba(201,164,76,0.42)]"
        }`}
      >
        {/*
          Khung xem trước. Tỉ lệ cố định bằng aspect-ratio chứ không bằng chiều
          cao tính theo màn hình: chiều cao khung phải chốt được từ trước khi
          canvas gắn vào, nếu không bố cục nhảy một nhịp ngay giữa lúc người dùng
          đang cuộn tới.
        */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-950">
          <ExplorePreview variant={page.variant} hovered={active} />
          {/*
            Quầng tối bốn góc: giữ cho nhãn và đường viền thẻ không bị các nét
            sáng của cảnh cắt ngang, đồng thời tạo cảm giác cảnh chìm vào trong
            thẻ thay vì dán lên trên.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_38%,rgba(5,11,19,0.72)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink-850 to-transparent"
          />

          {/*
            Nhãn "3D · Tương tác" là chi tiết làm nhiều việc nhất trong cả khối:
            nó nói rõ đây không phải ảnh minh hoạ mà là một thứ mở ra được. Chấm
            nhấp nháy mượn đúng ngôn ngữ của thẻ "Live" ở hero, nên người đã cuộn
            qua hero hiểu ngay nó nghĩa là gì.
          */}
          <span
            className={`label absolute top-4 left-4 inline-flex items-center gap-2 border px-2.5 py-1.5 text-[9px] backdrop-blur-sm transition-colors duration-500 ${
              jade
                ? "border-jade-500/40 bg-ink-950/70 text-jade-300 group-hover:border-jade-400/70"
                : "border-brass-500/40 bg-ink-950/70 text-brass-300 group-hover:border-brass-400/70"
            }`}
          >
            <span
              className={`animate-pulse-dot h-1.5 w-1.5 rounded-full ${
                jade ? "bg-jade-500" : "bg-brass-500"
              }`}
            />
            {lang === "en" ? "3D · Interactive" : "3D · Tương tác"}
          </span>

          <span className="label absolute top-4 right-4 text-[9px] text-fog-500">
            {page.meta[lang]}
          </span>

          {/*
            Câu chỉ dẫn thao tác đặt ngay trên cảnh, không đẩy xuống thân thẻ:
            người đọc phải biết mình sẽ *làm gì* ở trang kia trước khi cân nhắc
            có bấm hay không.
          */}
          <span className="label absolute bottom-4 left-6 flex items-center gap-2.5 text-[9.5px] text-fog-400">
            <IconCursor
              className={`h-3.5 w-3.5 shrink-0 transition-colors duration-500 ${
                jade ? "text-jade-400" : "text-brass-400"
              }`}
            />
            {page.hint[lang]}
          </span>
        </div>

        {/* ---------- thân thẻ ---------- */}
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <p className={`label text-[10px] ${jade ? "text-jade-400" : "text-brass-400"}`}>
            {page.kicker[lang]}
          </p>
          <h3 className="font-display mt-3 text-[1.4rem] leading-[1.22] font-semibold text-snow sm:text-[1.65rem]">
            {page.title[lang]}
          </h3>
          <p className="mt-3.5 mb-7 max-w-md text-[13.5px] leading-[1.7] text-fog-400">
            {page.body[lang]}
          </p>

          {/*
            Lời gọi hành động là một nút thật, không phải một dòng chữ có mũi
            tên. Cả thẻ vẫn là một liên kết, nhưng mắt cần một đích rõ ràng để
            biết chỗ nào bấm được — đó là chênh lệch giữa "chắc là đọc thêm được"
            và "bấm vào đây".
          */}
          {/*
            `mt-auto` đẩy nút xuống đáy thẻ. Hai thẻ nằm cạnh nhau trong lưới nên
            luôn cao bằng nhau; không có nó thì thẻ nào có đoạn mô tả ngắn hơn sẽ
            có nút nằm cao hơn thẻ kia, và hai lời gọi hành động lệch nhau đúng
            một dòng chữ.
          */}
          <span
            className={`mt-auto inline-flex w-fit items-center gap-2.5 border px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
              jade
                ? "border-jade-500/50 text-jade-300 group-hover:border-jade-400 group-hover:bg-jade-500/10"
                : "border-brass-500/50 text-brass-300 group-hover:border-brass-400 group-hover:bg-brass-500/10"
            }`}
          >
            {lang === "en" ? "Open the 3D page" : "Mở trang 3D"}
            <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

export function Explore() {
  const { isEnglish } = useLocale();
  const lang = isEnglish ? "en" : "vi";

  return (
    /*
      Khối này có nền riêng và hai đường kẻ ngang chặn hai đầu, khác với các khối
      kể chuyện bằng chữ phía trên và phía dưới. Đó là cách rẻ nhất để cắt nhịp
      cuộn: mắt đang đọc lướt một chuỗi khối giống nhau thì dừng lại ở chỗ nền
      đổi màu, và đúng lúc đó nó gặp hai cảnh 3D đang chạy.
    */
    <section
      id="trai-nghiem-3d"
      className="relative z-10 overflow-hidden border-y border-snow/10 bg-ink-900/45 px-5 py-24 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-brass-500/[0.07] blur-[130px]"
      />
      <div className="relative mx-auto max-w-7xl">
        <SectionHead
          kicker={isEnglish ? "3D experience" : "Trải nghiệm 3D"}
          title={
            isEnglish ? (
              <>
                Two ways to <span className="gilded italic">see how we work.</span>
              </>
            ) : (
              <>
                Hai cách để <span className="gilded italic">thấy cách chúng tôi làm việc.</span>
              </>
            )
          }
          sub={
            isEnglish
              ? "Two interactive pages built in real-time 3D, running in your browser. Not a brochure — you drive them by scrolling and clicking."
              : "Hai trang tương tác dựng bằng đồ hoạ ba chiều, chạy thẳng trong trình duyệt. Không phải ảnh giới thiệu — bạn điều khiển chúng bằng thao tác cuộn và bấm."
          }
        />
        <motion.div
          variants={stagger(0.12, 0.15)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-7"
        >
          {EXPLORE_PAGES.map((page) => (
            <ExploreCard key={page.to} page={page} lang={lang} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ================= BẢNG PHÍ ================= */
export function Pricing() {
  const { locale, isEnglish, t } = useLocale();
  const onMove = useSpotlight<HTMLElement>();
  const plans = PLANS.map((plan) => localizePlan(plan, locale));
  return (
    <section id="bang-phi" className="relative z-10 scroll-mt-24 py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[30rem] max-w-4xl rounded-full bg-brass-500/6 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead
          align="center"
          kicker={t("pricingKicker")}
          title={
            <>
              {isEnglish ? (
                <>One legal function,<br /><span className="text-jade-400 italic">without a full legal department.</span></>
              ) : (
                <>Một phòng pháp chế,<br /><span className="text-jade-400 italic">không cần phòng nhân sự.</span></>
              )}
            </>
          }
          sub={t("pricingSub")}
        />

        {/* ưu đãi lần đầu */}
        <Reveal delay={120}>
          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 border border-jade-500/40 bg-jade-500/[0.07] px-6 py-5 text-center sm:flex-row sm:text-left">
            <motion.span
              initial={{ scale: 0.75, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
              className="font-display shrink-0 text-[2.1rem] leading-none font-bold text-jade-300"
            >
              −{FIRST_TIME_DISCOUNT.percent}%
            </motion.span>
            <div className="sm:pl-5">
              <p className="text-[14.5px] font-semibold text-snow">{t("firstTime")}</p>
              <p className="mt-1 text-[13px] leading-[1.65] text-fog-400">{t("firstTimeDetail")}</p>
            </div>
          </div>
        </Reveal>

        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="mt-12 grid items-stretch gap-6 lg:grid-cols-3"
        >
          {plans.map((p) => (
            <motion.article
              key={p.id}
              variants={cardIn}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", ...SOFT }}
              onPointerMove={onMove}
              className={`spotlight ${
                p.highlight ? "" : "spotlight-jade"
              } relative flex h-full flex-col p-8 transition-[border-color,box-shadow] duration-500 sm:p-9 ${
                p.highlight
                  ? "border border-brass-500/70 bg-ink-800 shadow-[0_30px_90px_-35px_rgba(201,164,76,0.5)] hover:shadow-[0_40px_110px_-35px_rgba(201,164,76,0.7)]"
                  : "border border-snow/12 bg-ink-850 hover:border-jade-500/50"
              }`}
            >
              {p.badge && (
                <span className="label absolute -top-3 left-8 bg-brass-500 px-3 py-1.5 text-[9px] font-semibold text-ink-950">
                  {p.badge}
                </span>
              )}
              <p
                className={`label text-[10.5px] ${
                  p.highlight ? "text-brass-400" : "text-jade-400"
                }`}
              >
                {p.name}
              </p>
              <GoldRule className="mt-3 w-12" />
              <div className="mt-6 flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-[1.85rem] leading-tight font-bold text-snow sm:text-[2.1rem]">
                  {p.price}
                </span>
                <span className="text-[13.5px] text-fog-400">{p.unit}</span>
              </div>
              <p
                className={`mt-3 text-[12.5px] leading-[1.6] ${
                  p.highlight ? "text-brass-300" : "text-fog-400"
                }`}
              >
                {p.approx}
              </p>
              <p className="mt-5 text-[13.5px] leading-[1.7] text-fog-400">{p.note}</p>
              <ul className="mt-7 flex-1 space-y-3.5 border-t border-snow/10 pt-7">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-[13.5px] leading-[1.6] text-fog-300"
                  >
                    <IconCheck
                      className={`mt-1 h-4 w-4 shrink-0 ${
                        p.highlight ? "text-brass-400" : "text-jade-500"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#lien-he"
                className={`sheen group mt-9 inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-[14px] font-semibold transition-all duration-300 ${
                  p.highlight
                    ? "bg-brass-500 text-ink-950 hover:bg-brass-400"
                    : "border border-snow/20 text-snow hover:border-jade-500 hover:text-jade-300"
                }`}
              >
                {t("choosePlan")}
                <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </motion.article>
          ))}
        </motion.div>
        <Reveal delay={150}>
          <div className="mx-auto mt-8 max-w-2xl text-center">
            <Kicker rule={false}>
              <span className="mx-auto text-[9.5px] leading-[1.8] text-fog-500">
                {isEnglish ? "Excludes VAT, court fees, arbitration fees and state charges · Paid quarterly" : "Chưa gồm thuế giá trị gia tăng, án phí, phí trọng tài & chi phí nhà nước · Thanh toán theo quý"}
              </span>
            </Kicker>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
