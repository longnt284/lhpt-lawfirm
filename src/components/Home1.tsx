import { useEffect, useState } from "react";
import { FIRM, FIRST_TIME_DISCOUNT, PLANS, SERVICES, TICKER } from "../data";
import { useCountUp, useInView, useScrambleCycle, useSpotlight } from "../hooks";
import { Kicker, Reveal, SectionHead } from "./Chrome";
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

const SERVICE_ICONS = {
  crane: IconCrane,
  scale: IconScale,
  solar: IconSolar,
  deal: IconDeal,
  shield: IconShield,
} as const;

/* ================= HERO ================= */
export function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  const word = useScrambleCycle(WORDS);
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const count = useCountUp(600, inView, 1800);
  const onMove = useSpotlight<HTMLDivElement>();

  return (
    <section id="top" className="relative z-10 overflow-hidden pt-[128px] pb-0 lg:pt-[150px]">
      <div className={`mx-auto max-w-7xl px-5 lg:px-8 ${loaded ? "hero-in" : ""}`}>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
          {/* trái */}
          <div className="lg:col-span-7">
            <p className="label flex items-center gap-3 text-[11px] text-fog-400">
              <span className="animate-pulse-dot inline-block h-2 w-2 shrink-0 rounded-full bg-jade-500" />
              Hãng luật doanh nghiệp · {FIRM.scope}
            </p>
            {/*
              Tiêu đề chuyển sang serif chữ thường, leading 1.14. Bản trước dùng
              chữ hoa với leading 0.98 trong khung overflow:hidden nên dấu tiếng
              Việt bị cắt mất phần trên.
            */}
            <h1 className="font-display mt-6 text-[clamp(2.25rem,5.4vw,4rem)] leading-[1.14] font-semibold text-snow">
              <span className="hero-line" style={{ transitionDelay: "120ms" }}>
                Nền pháp lý vững,
              </span>
              <span className="hero-line" style={{ transitionDelay: "280ms" }}>
                cho mọi <span className="text-brass-400 italic">công trình.</span>
              </span>
            </h1>
            <p className="label mt-7 text-[12px] text-fog-300">
              <span className="text-fog-500">Trọng tâm</span>{" "}
              <span className="text-jade-400">[ {word} ]</span>
              <span className="animate-caret ml-1 inline-block h-3.5 w-2 translate-y-0.5 bg-brass-400" />
            </p>
            <p className="mt-6 max-w-xl text-[15.5px] leading-[1.8] text-fog-400">
              LHPT đồng hành cùng doanh nghiệp từ giấy phép đầu tiên đến phiên tòa cuối cùng:
              xây dựng, bất động sản, điện mặt trời, doanh nghiệp, tuân thủ và bảo vệ dữ liệu
              cá nhân.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#lien-he"
                className="sheen group inline-flex items-center gap-2.5 bg-brass-500 px-6 py-3.5 text-[14px] font-semibold text-ink-950 transition-all duration-300 hover:bg-brass-400 hover:shadow-[0_14px_44px_-10px_rgba(201,164,76,0.6)]"
              >
                Đặt lịch tư vấn
                <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="#dich-vu"
                className="group inline-flex items-center gap-2.5 border border-snow/20 px-6 py-3.5 text-[14px] font-medium text-snow transition-all duration-300 hover:border-jade-500 hover:text-jade-300"
              >
                Khám phá dịch vụ
                <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
            <p className="label mt-8 text-[10px] text-fog-500">
              Phản hồi trong {FIRM.responseTime} · Bảo mật tuyệt đối hồ sơ
            </p>
          </div>

          {/* phải — bảng hồ sơ năng lực */}
          <div className="relative lg:col-span-5">
            <div
              className="animate-floaty-b absolute top-6 -right-3 h-full w-full rotate-2 border border-snow/10 bg-ink-800/30"
              aria-hidden="true"
            />
            <div
              ref={ref}
              onPointerMove={onMove}
              className="spotlight animate-floaty relative border border-snow/15 bg-ink-850/90 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm"
            >
              <div className="flex items-center justify-between border-b border-snow/10 px-6 py-4">
                <span className="label text-[10px] text-fog-400">Hồ sơ năng lực</span>
                <span className="label flex items-center gap-2 text-[10px] text-jade-400">
                  <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-jade-500" />
                  Live · 2026
                </span>
              </div>
              <div className="flex items-end justify-between gap-4 px-6 pt-6">
                <div>
                  <p className="font-display text-[3.2rem] leading-none font-bold text-snow">
                    {count}
                    <span className="text-brass-400">+</span>
                  </p>
                  <p className="mt-2.5 text-[13px] leading-[1.5] text-fog-400">
                    Vụ việc &amp; dự án đã xử lý
                  </p>
                </div>
                <div className="relative h-[104px] w-[104px] shrink-0">
                  <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#17293f" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#22c49c"
                      strokeWidth="8"
                      strokeLinecap="round"
                      pathLength={100}
                      strokeDasharray="100"
                      strokeDashoffset={inView ? 2 : 100}
                      className="ring-anim"
                    />
                  </svg>
                  <span className="code absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-jade-300">
                    98%
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3.5 px-6">
                {(
                  [
                    ["Xây dựng · BĐS", 40, "bg-brass-500"],
                    ["Tố tụng", 20, "bg-jade-500"],
                    ["Năng lượng", 18, "bg-jade-600"],
                    ["Doanh nghiệp", 12, "bg-ink-600"],
                    ["Dữ liệu", 10, "bg-fog-500"],
                  ] as const
                ).map(([label, w, color], i) => (
                  <div key={label}>
                    <div className="label mb-1.5 flex justify-between text-[9.5px] text-fog-400">
                      <span>{label}</span>
                      <span>{w}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-ink-700">
                      <div
                        className={`bar-anim h-full ${color}`}
                        style={{
                          width: inView ? `${w}%` : "0%",
                          transitionDelay: `${300 + i * 150}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-snow/10 px-6 py-3.5">
                <span className="label text-[9px] text-fog-500">Số liệu nội bộ · 2026</span>
                <span className="label text-[9px] text-brass-500">LHPT-CAP-26</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ticker văn bản */}
      <div className="marquee relative z-10 mt-16 border-y border-snow/10 bg-ink-900/70 py-4 backdrop-blur-sm lg:mt-20">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {TICKER.map((t) => (
                <span
                  key={`${dup}-${t}`}
                  className="flex items-center gap-3 pr-3 text-[11px] font-medium tracking-[0.12em] whitespace-nowrap text-fog-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-jade-500" />
                  {t}
                  <span className="pl-3 text-brass-500">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
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
  { v: 24, suffix: " giờ", label: "Cam kết phản hồi hồ sơ", decimals: 0 },
  { v: 98, suffix: "%", label: "Khách hàng quay lại", decimals: 0 },
];

export function StatsBand() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="grid grid-cols-2 border-snow/10 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <StatCell key={s.label} {...s} delay={i * 100} />
        ))}
      </div>
    </section>
  );
}

function StatCell({
  v,
  suffix,
  label,
  decimals,
  delay,
}: {
  v: number;
  suffix: string;
  label: string;
  decimals: number;
  delay: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const val = useCountUp(v, inView, 1600, decimals);
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "reveal-in" : ""} group border-b border-l border-snow/10 px-6 py-8 transition-colors duration-300 hover:bg-ink-900/60 lg:border-b-0`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="font-display text-[2.2rem] leading-tight font-bold text-snow transition-colors duration-300 group-hover:text-brass-300 lg:text-[2.5rem]">
        {decimals > 0 ? val.toFixed(decimals) : val}
        <span className="text-jade-400">{suffix}</span>
      </p>
      <p className="mt-3 text-[13px] leading-[1.55] text-fog-400">{label}</p>
    </div>
  );
}

/* ================= DỊCH VỤ ================= */
export function Services() {
  const onMove = useSpotlight<HTMLElement>();
  return (
    <section id="dich-vu" className="relative z-10 scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHead
                kicker="Dịch vụ pháp lý"
                title={
                  <>
                    Năm trụ cột.
                    <br />
                    <span className="text-brass-400 italic">Một chuẩn mực.</span>
                  </>
                }
                sub="Mỗi mảng do luật sư thành viên phụ trách trực tiếp, chịu trách nhiệm đến cùng trên một hồ sơ."
              />
              <Reveal delay={200}>
                <ul className="mt-10 space-y-1">
                  {SERVICES.map((s) => (
                    <li key={s.num}>
                      <a
                        href={`#dv-${s.num}`}
                        className="group flex items-baseline gap-4 border-l border-snow/10 py-2.5 pl-5 transition-all duration-300 hover:border-brass-400 hover:pl-7"
                      >
                        <span className="code text-[11px] text-brass-500">{s.num}</span>
                        <span className="text-[13.5px] font-medium text-fog-300 transition-colors duration-300 group-hover:text-snow">
                          {s.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-8">
            {SERVICES.map((s, idx) => {
              const Icon = SERVICE_ICONS[s.icon];
              const isNew = s.num === "05";
              return (
                <Reveal key={s.num} delay={idx * 60}>
                  <article
                    id={`dv-${s.num}`}
                    onPointerMove={onMove}
                    className={`spotlight ${
                      isNew ? "spotlight-jade" : ""
                    } group relative scroll-mt-28 overflow-hidden border bg-ink-850/80 p-7 transition-all duration-500 hover:-translate-y-1 sm:p-9 ${
                      isNew
                        ? "border-jade-500/40 hover:border-jade-400/80 hover:shadow-[0_25px_70px_-30px_rgba(34,196,156,0.4)]"
                        : "border-snow/10 hover:border-brass-500/60 hover:shadow-[0_25px_70px_-30px_rgba(201,164,76,0.35)]"
                    }`}
                  >
                    {/*
                      Số thứ tự lớn được đẩy hẳn ra rìa phải và hạ độ đậm, tránh
                      chồng lên tiêu đề như bản trước.
                    */}
                    <span
                      className="font-display pointer-events-none absolute -top-2 right-3 text-[5.5rem] leading-none font-bold text-outline select-none sm:text-[6.5rem]"
                      aria-hidden="true"
                    >
                      {s.num}
                    </span>
                    <div className="relative">
                      <div className="flex flex-wrap items-center gap-5">
                        <span
                          className={`flex h-14 w-14 shrink-0 items-center justify-center border transition-all duration-500 ${
                            isNew
                              ? "border-jade-500/50 text-jade-400 group-hover:bg-jade-500 group-hover:text-ink-950"
                              : "border-brass-500/40 text-brass-400 group-hover:bg-brass-500 group-hover:text-ink-950"
                          }`}
                        >
                          <Icon className="h-7 w-7" />
                        </span>
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
                            Mới · 2026
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
                          Phụ trách: {s.leads.join(" · ")}
                        </span>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= BẢNG PHÍ ================= */
export function Pricing() {
  const onMove = useSpotlight<HTMLElement>();
  return (
    <section id="bang-phi" className="relative z-10 scroll-mt-24 py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[30rem] max-w-4xl rounded-full bg-brass-500/6 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead
          align="center"
          kicker="Pháp chế thuê ngoài"
          title={
            <>
              Một phòng pháp chế,
              <br />
              <span className="text-jade-400 italic">không cần phòng nhân sự.</span>
            </>
          }
          sub="Ba gói theo năm, chi phí cố định và phạm vi rõ ràng, không phát sinh ngoài báo giá đã xác nhận."
        />

        {/* ưu đãi lần đầu */}
        <Reveal delay={120}>
          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 border border-jade-500/40 bg-jade-500/[0.07] px-6 py-5 text-center sm:flex-row sm:text-left">
            <span className="font-display shrink-0 text-[2.1rem] leading-none font-bold text-jade-300">
              −{FIRST_TIME_DISCOUNT.percent}%
            </span>
            <div className="sm:pl-5">
              <p className="text-[14.5px] font-semibold text-snow">{FIRST_TIME_DISCOUNT.label}</p>
              <p className="mt-1 text-[13px] leading-[1.65] text-fog-400">
                {FIRST_TIME_DISCOUNT.detail}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 120} className="h-full">
              <article
                onPointerMove={onMove}
                className={`spotlight ${
                  p.highlight ? "" : "spotlight-jade"
                } relative flex h-full flex-col p-8 transition-all duration-500 hover:-translate-y-1.5 sm:p-9 ${
                  p.highlight
                    ? "border border-brass-500/70 bg-ink-800 shadow-[0_30px_90px_-35px_rgba(201,164,76,0.5)] hover:shadow-[0_35px_100px_-35px_rgba(201,164,76,0.65)]"
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
                  Nhận đề xuất gói
                  <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={150}>
          <div className="mx-auto mt-8 max-w-2xl text-center">
            <Kicker rule={false}>
              <span className="mx-auto text-[9.5px] leading-[1.8] text-fog-500">
                Chưa gồm thuế giá trị gia tăng, án phí, phí trọng tài &amp; chi phí nhà nước ·
                Thanh toán theo quý
              </span>
            </Kicker>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
