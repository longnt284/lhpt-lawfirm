import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { FIRM, FIRST_TIME_DISCOUNT, PLANS, SERVICES, TICKER } from "../firm";
import { useCountUp, useInView, useScrambleCycle, useSpotlight } from "../hooks";
import { APPROACH_EN, localizeCategory, localizePlan, localizeService, useLocale } from "../i18n";
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
import { GoldRule, Magnetic, TiltCard } from "./Motion";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconCrane,
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

const WORDS_EN = ["CONSTRUCTION", "REAL ESTATE", "LITIGATION", "SOLAR ENERGY", "CORPORATE", "DATA PROTECTION"];
const TICKER_EN = [
  "LAW ON PERSONAL DATA PROTECTION 2025 · EFFECTIVE 01.01.2026",
  "LAW ON CORPORATE INCOME TAX 2025 · EFFECTIVE 01.10.2025",
  "LAW ON VALUE-ADDED TAX 2024 · EFFECTIVE 01.07.2025",
  "ELECTRICITY LAW 2024 · EFFECTIVE 01.02.2025",
  "LAND LAW 2024 · EFFECTIVE 01.08.2024",
  "LAW ON REAL ESTATE BUSINESS 2023 · EFFECTIVE 01.08.2024",
  "HOUSING LAW 2023 · EFFECTIVE 01.08.2024",
  "LAW ON BIDDING 2023 · EFFECTIVE 01.01.2024",
  "DECREE 175/2024 · CONSTRUCTION ACTIVITY MANAGEMENT",
  "DECREE 80/2024 · DIRECT POWER PURCHASE (DPPA)",
  "DECREE 58/2025 · GUIDANCE ON THE ELECTRICITY LAW",
  "LAW AMENDING THE LAW ON ENTERPRISES 2025 · NO. 76/2025/QH15",
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

/* ================= HERO ================= */
export function Hero() {
  const { isEnglish, t } = useLocale();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  /*
   * Chữ và bảng số liệu trôi lệch tốc độ khi cuộn, tạo lớp gần — lớp xa.
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
  const textY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const heroFade = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);

  const ticker = isEnglish ? TICKER_EN : TICKER;
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const onMove = useSpotlight<HTMLDivElement>();

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative z-10 pt-[128px] pb-0 lg:pt-[150px]"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
          {/* trái */}
          <motion.div
            style={reduced ? undefined : { y: textY, opacity: heroFade }}
            variants={stagger(0.13, 0.6)}
            initial="hidden"
            animate="show"
            className="lg:col-span-7"
          >
            <motion.p
              variants={fadeUpSmall}
              className="label flex items-center gap-3 text-[11px] text-fog-400"
            >
              <span className="animate-pulse-dot inline-block h-2 w-2 shrink-0 rounded-full bg-jade-500" />
              {t("legalFirm")} · {t("scope")}
            </motion.p>
            {/*
              Tiêu đề serif chữ thường, leading 1.14. Không bọc trong khung
              overflow:hidden vì khung che sẽ cắt dấu tiếng Việt ở đỉnh con chữ;
              hiệu ứng dùng mờ nhòe cộng trượt nhẹ để thay thế.
            */}
            <h1 className="font-display mt-6 text-[clamp(2.35rem,5.6vw,4.2rem)] leading-[1.14] font-semibold tracking-[-0.012em] text-snow">
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
            <motion.p variants={fadeUpSmall} className="label mt-7 text-[12px] text-fog-300">
              <span className="text-fog-500">{t("focus")}</span>{" "}
              <ScrambleWord words={isEnglish ? WORDS_EN : WORDS} />
              <span className="animate-caret ml-1 inline-block h-3.5 w-2 translate-y-0.5 bg-brass-400" />
            </motion.p>
            <p className="mt-6 max-w-xl text-[15.5px] leading-[1.8] text-fog-400">
              {t("heroBody")}
            </p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
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
            <motion.p variants={fadeUpSmall} className="label mt-8 text-[10px] text-fog-500">
              {t("response")} · {t("confidential")}
            </motion.p>
          </motion.div>

          {/* phải — bảng hồ sơ năng lực */}
          <motion.div
            style={reduced ? undefined : { y: cardY }}
            initial={{ opacity: 0, y: 46, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.1, ease: EASE_LUXE, delay: 0.75 }}
            className="relative lg:col-span-5"
          >
            <div
              className="animate-floaty-b absolute top-6 -right-3 h-full w-full rotate-2 border border-snow/10 bg-ink-800/30"
              aria-hidden="true"
            />
            <TiltCard>
              <div
                ref={ref}
                onPointerMove={onMove}
                className="spotlight animate-floaty relative border border-snow/15 bg-ink-850/90 shadow-[0_40px_100px_-35px_rgba(0,0,0,0.85)] backdrop-blur-sm"
              >
                <div className="flex items-center justify-between border-b border-snow/10 px-6 py-4">
                  <span className="label text-[10px] text-fog-400">{t("live")}</span>
                  <span className="label flex items-center gap-2 text-[10px] text-jade-400">
                    <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-jade-500" />
                    Live · 2026
                  </span>
                </div>
                <div className="flex items-end justify-between gap-4 px-6 pt-6">
                  <div>
                    <p className="font-display text-[3.2rem] leading-none font-bold text-snow">
                      <CountUp target={600} start={inView} duration={1800} />
                      <span className="text-brass-400">+</span>
                    </p>
                    <p className="mt-2.5 text-[13px] leading-[1.5] text-fog-400">
                      {t("matters")}
                    </p>
                  </div>
                  <div className="relative h-[104px] w-[104px] shrink-0">
                    <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#17293f" strokeWidth="8" />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="#22c49c"
                        strokeWidth="8"
                        strokeLinecap="round"
                        pathLength={100}
                        strokeDasharray="100"
                        initial={{ strokeDashoffset: 100 }}
                        whileInView={{ strokeDashoffset: 2 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 1.8, ease: EASE_LUXE, delay: 0.2 }}
                      />
                    </svg>
                    <span className="code absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-jade-300">
                      98%
                    </span>
                  </div>
                </div>
                <motion.div
                  variants={stagger(0.12, 0.35)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                  className="mt-6 space-y-3.5 px-6"
                >
                  {(
                    [
                      ["Xây dựng · BĐS", 40, "bg-brass-500"],
                      ["Tố tụng", 20, "bg-jade-500"],
                      ["Năng lượng", 18, "bg-jade-600"],
                      ["Doanh nghiệp", 12, "bg-ink-600"],
                      ["Dữ liệu", 10, "bg-fog-500"],
                    ] as const
                  ).map(([label, w, color]) => (
                    <motion.div key={label} variants={fadeUpSmall}>
                      <div className="label mb-1.5 flex justify-between text-[9.5px] text-fog-400">
                        <span>{localizeCategory(label, isEnglish ? "en" : "vi")}</span>
                        <span>{w}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-ink-700">
                        <motion.div
                          className={`h-full origin-left ${color}`}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{ duration: 1.2, ease: EASE_LUXE, delay: 0.25 }}
                          style={{ width: `${w}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <div className="mt-6 flex items-center justify-between border-t border-snow/10 px-6 py-3.5">
                  <span className="label text-[9px] text-fog-500">{t("internal")} · 2026</span>
                  <span className="label text-[9px] text-brass-500">LHPT-CAP-26</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>

      {/* ticker văn bản */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: EASE_LUXE, delay: 1.15 }}
        className="marquee relative z-10 mt-16 border-y border-snow/10 bg-ink-900/70 py-4 backdrop-blur-sm lg:mt-20"
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

/* ================= STATS ================= */
/*
 * Chỉ số "2,4 GW công suất NLTT đã tư vấn" được thay bằng cam kết thời gian
 * phản hồi hồ sơ, thống nhất với cam kết dịch vụ nêu ở phần chính sách.
 */
const STATS = [
  { v: 15, suffix: "+", label: "Năm hành nghề", decimals: 0 },
  { v: 600, suffix: "+", label: "Vụ việc & dự án đã xử lý", decimals: 0 },
  { v: 24, suffix: "h", label: "Cam kết phản hồi hồ sơ", decimals: 0 },
  { v: 98, suffix: "%", label: "Khách hàng quay lại", decimals: 0 },
];

export function StatsBand() {
  const { t } = useLocale();
  const stats = [
    { ...STATS[0], label: t("practiceYears") },
    { ...STATS[1], label: t("handled") },
    { ...STATS[2], label: t("responseMetric") },
    { ...STATS[3], label: t("returning") },
  ];
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="grid grid-cols-2 border-snow/10 lg:grid-cols-4"
      >
        {stats.map((s) => (
          <StatCell key={s.label} {...s} />
        ))}
      </motion.div>
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
      className="group relative border-b border-l border-snow/10 px-6 py-8 transition-colors duration-300 hover:bg-ink-900/60 lg:border-b-0"
    >
      <p className="font-display text-[2.2rem] leading-tight font-bold text-snow transition-colors duration-300 group-hover:text-brass-300 lg:text-[2.5rem]">
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

/* ================= KHÁM PHÁ — HAI TRANG CHUYÊN ĐỀ ================= */
/*
 * Hai trang này giải thích cách hãng làm việc bằng hình thay vì bằng đoạn văn:
 * một trang dựng công trình theo nhịp cuộn, một trang bày ra bản đồ các lĩnh
 * vực. Chúng nằm ngoài trang chủ nên cần một cửa vào đủ rõ ở đây, thay vì chỉ
 * nấp trong chân trang.
 */
const EXPLORE_PAGES = [
  {
    to: "/nen-mong-phap-ly",
    kicker: { vi: "Vòng đời dự án", en: "Project life cycle" },
    title: { vi: "Nền móng pháp lý", en: "Legal foundations" },
    body: {
      vi: "Năm tầng hồ sơ của một dự án xây dựng, từ đất đai tới tranh chấp. Cuộn tới đâu, công trình dựng lên tới đó.",
      en: "The five layers of a construction project's legal file, from land to dispute. The building goes up as you scroll.",
    },
    accent: "brass" as const,
    art: (
      <>
        <path d="M8 62h48M14 62V38M26 62V38M38 62V38M50 62V38" />
        <path d="M14 48h36M14 38h36" />
        <path d="M8 38 32 22l24 16" className="text-brass-400" />
        <path d="M32 22V10" className="text-jade-400" />
      </>
    ),
  },
  {
    to: "/ban-do-nang-luc",
    kicker: { vi: "Bản đồ năng lực", en: "Practice map" },
    title: { vi: "Nơi các lĩnh vực gặp nhau", en: "Where practices meet" },
    body: {
      vi: "Năm lĩnh vực hành nghề và bảy điểm giao có thật giữa chúng. Bấm vào một lĩnh vực để xem nó thường kéo theo điều gì.",
      en: "Five practice areas and seven real crossings between them. Select one to see what it usually pulls in.",
    },
    accent: "jade" as const,
    art: (
      <>
        <path d="M16 20 46 30M46 30 30 52M30 52 16 20M46 30 56 50M16 20 12 44M12 44 30 52" className="opacity-50" />
        <circle cx="16" cy="20" r="3.5" className="text-brass-400" />
        <circle cx="46" cy="30" r="3.5" className="text-brass-400" />
        <circle cx="30" cy="52" r="3.5" className="text-jade-400" />
        <circle cx="56" cy="50" r="2.5" className="text-jade-400" />
        <circle cx="12" cy="44" r="2.5" className="text-brass-400" />
      </>
    ),
  },
];

export function Explore() {
  const { isEnglish, t } = useLocale();
  const onMove = useSpotlight<HTMLElement>();
  const lang = isEnglish ? "en" : "vi";

  return (
    <section className="relative z-10 px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHead
          kicker={isEnglish ? "Explore" : "Khám phá"}
          title={
            isEnglish ? (
              <>
                Two ways to see <span className="gilded italic">how we work.</span>
              </>
            ) : (
              <>
                Hai cách để thấy <span className="gilded italic">cách chúng tôi làm việc.</span>
              </>
            )
          }
        />
        <motion.div
          variants={stagger(0.1, 0.15)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="mt-11 grid gap-6 lg:grid-cols-2"
        >
          {EXPLORE_PAGES.map((page) => (
            <motion.article key={page.to} variants={cardIn} whileHover={{ y: -6 }} transition={{ type: "spring", ...SOFT }}>
              <Link
                to={page.to}
                onPointerMove={onMove}
                className={`spotlight ${
                  page.accent === "jade" ? "spotlight-jade" : ""
                } group flex h-full flex-col justify-between gap-8 border bg-ink-850/80 p-7 transition-[border-color,box-shadow] duration-500 sm:flex-row sm:items-center sm:p-9 ${
                  page.accent === "jade"
                    ? "border-jade-500/30 hover:border-jade-400/70 hover:shadow-[0_25px_70px_-30px_rgba(34,196,156,0.4)]"
                    : "border-snow/10 hover:border-brass-500/60 hover:shadow-[0_25px_70px_-30px_rgba(201,164,76,0.35)]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="label text-[10px] text-brass-400">{page.kicker[lang]}</p>
                  <h3 className="font-display mt-3 text-[1.3rem] leading-[1.25] font-semibold text-snow sm:text-[1.5rem]">
                    {page.title[lang]}
                  </h3>
                  <p className="mt-3.5 max-w-md text-[13.5px] leading-[1.7] text-fog-400">
                    {page.body[lang]}
                  </p>
                  <span
                    className={`mt-6 inline-flex items-center gap-2 text-[13px] font-semibold transition-colors duration-300 ${
                      page.accent === "jade"
                        ? "text-jade-300 group-hover:text-jade-400"
                        : "text-brass-300 group-hover:text-brass-400"
                    }`}
                  >
                    {t("viewDetails")}
                    <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
                {/*
                  Hình minh hoạ là bản rút gọn của chính cảnh 3D bên trong trang,
                  để người dùng nhận ra mình sắp đi tới đâu trước khi bấm.
                */}
                <svg
                  viewBox="0 0 64 72"
                  aria-hidden="true"
                  className="h-24 w-24 shrink-0 self-end text-fog-500 transition-transform duration-700 group-hover:scale-105 sm:h-28 sm:w-28 sm:self-center"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                >
                  {page.art}
                </svg>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ================= PHƯƠNG PHÁP LÀM VIỆC ================= */
const APPROACH = [
  {
    num: "01",
    title: "Nhìn từ công trình",
    body: "Chúng tôi bắt đầu từ cách doanh nghiệp đang vận hành, không bắt đầu bằng một mẫu tư vấn có sẵn.",
    icon: IconCrane,
  },
  {
    num: "02",
    title: "Chốt bằng hồ sơ",
    body: "Mọi khuyến nghị đều quy về căn cứ, mốc thời gian và một người chịu trách nhiệm rõ ràng.",
    icon: IconScale,
  },
  {
    num: "03",
    title: "Đi cùng đến cùng",
    body: "Từ giấy phép, hợp đồng đến tranh chấp, đội ngũ giữ nguyên một chuẩn mực xuyên suốt hồ sơ.",
    icon: IconShield,
  },
];

export function Approach() {
  const { isEnglish, t } = useLocale();
  return (
    <section className="relative z-10 overflow-hidden border-y border-snow/10 bg-ink-900/55 py-24">
      <div className="pointer-events-none absolute -top-28 right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-brass-500/10 blur-[110px]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-5">
            <SectionHead
              kicker={t("approachKicker")}
              title={
                <>
                  {isEnglish ? (
                    <>Clear from day one.<br /><span className="gilded italic">Certain through the finish.</span></>
                  ) : (
                    <>Rõ từ đầu.<br /><span className="gilded italic">Chắc đến cuối.</span></>
                  )}
                </>
              }
              sub={t("approachSub")}
            />
            <div className="mt-9 flex items-center gap-4 border-l-2 border-brass-500 pl-5">
              <span className="font-display text-[2.8rem] leading-none font-bold text-brass-300">01</span>
              <p className="max-w-xs text-[13px] leading-[1.7] text-fog-400">
                {t("approachNote")}
              </p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="grid border border-snow/10 sm:grid-cols-3">
              {APPROACH.map((item, idx) => {
                const Icon = item.icon;
                const copy = isEnglish ? { ...item, ...APPROACH_EN[item.num as keyof typeof APPROACH_EN] } : item;
                return (
                  <motion.article
                    key={item.num}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.65, ease: EASE_LUXE, delay: idx * 0.08 }}
                    className="group relative border-b border-snow/10 bg-ink-850/75 p-6 transition-colors duration-500 last:border-b-0 hover:bg-ink-800/80 sm:border-r sm:border-b-0 sm:last:border-r-0"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <Icon className="h-6 w-6 text-brass-400 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                      <span className="code text-[11px] text-fog-500">{item.num}</span>
                    </div>
                    <h3 className="font-display mt-12 text-[1.15rem] font-semibold text-snow">{copy.title}</h3>
                    <p className="mt-3 text-[13px] leading-[1.7] text-fog-400">{copy.body}</p>
                    <span className="absolute right-6 bottom-5 left-6 h-px origin-left scale-x-0 bg-gradient-to-r from-brass-500 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
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
