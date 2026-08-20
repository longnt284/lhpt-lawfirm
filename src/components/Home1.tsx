import { useEffect, useState } from "react";
import { PLANS, SERVICES, TICKER } from "../data";
import { useCountUp, useInView, useScrambleCycle } from "../hooks";
import { Reveal, SectionHead } from "./Chrome";
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
  "THƯƠNG MẠI",
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

  return (
    <section id="top" className="relative z-10 overflow-hidden pt-[128px] pb-0 lg:pt-[150px]">
      <div className={`mx-auto max-w-7xl px-5 lg:px-8 ${loaded ? "hero-in" : ""}`}>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
          {/* trái */}
          <div className="lg:col-span-7">
            <p className="font-mono flex items-center gap-3 text-[11px] tracking-[0.3em] text-fog-400 uppercase">
              <span className="animate-pulse-dot inline-block h-2 w-2 rounded-full bg-jade-500" />
              Hãng luật doanh nghiệp — TP.HCM · Hà Nội
            </p>
            <h1 className="font-display mt-7 text-[clamp(2.5rem,6.6vw,4.9rem)] leading-[0.98] font-black tracking-tight text-snow uppercase">
              <span className="hero-line">
                <span className="hero-line-inner" style={{ transitionDelay: "120ms" }}>
                  Nền pháp lý vững,
                </span>
              </span>
              <span className="hero-line">
                <span className="hero-line-inner" style={{ transitionDelay: "280ms" }}>
                  cho mọi <span className="text-brass-400">công trình.</span>
                </span>
              </span>
            </h1>
            <p className="font-mono mt-7 text-sm tracking-wider text-fog-300">
              <span className="text-fog-500">TRỌNG TÂM ▸</span>{" "}
              <span className="text-jade-400">[ {word} ]</span>
              <span className="animate-blink ml-1 inline-block h-4 w-2 translate-y-0.5 bg-brass-400" />
            </p>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-fog-400">
              LHPT đồng hành cùng doanh nghiệp từ giấy phép đầu tiên đến phiên tòa cuối cùng —
              xây dựng, bất động sản, năng lượng tái tạo, thương mại và bảo mật dữ liệu.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#lien-he"
                className="group inline-flex items-center gap-2.5 bg-brass-500 px-6 py-3.5 text-sm font-bold text-ink-950 transition-all duration-300 hover:bg-brass-400 hover:shadow-[0_12px_40px_-10px_rgba(201,164,76,0.55)]"
              >
                Đặt lịch tư vấn
                <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="#dich-vu"
                className="group inline-flex items-center gap-2.5 border border-snow/20 px-6 py-3.5 text-sm font-semibold text-snow transition-all duration-300 hover:border-jade-500 hover:text-jade-300"
              >
                Khám phá dịch vụ
                <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
            <p className="font-mono mt-8 text-[10px] tracking-[0.28em] text-fog-500 uppercase">
              Phản hồi trong 24 giờ · Bảo mật tuyệt đối hồ sơ
            </p>
          </div>

          {/* phải — bảng hồ sơ năng lực */}
          <div className="relative lg:col-span-5">
            <div
              className="animate-floaty-b absolute top-6 -right-3 h-full w-full rotate-2 border border-snow/10 bg-ink-800/30"
              aria-hidden="true"
            />
            <div ref={ref} className="animate-floaty relative border border-snow/15 bg-ink-850/90 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-snow/10 px-6 py-4">
                <span className="font-mono text-[10px] tracking-[0.3em] text-fog-400 uppercase">
                  Hồ sơ năng lực
                </span>
                <span className="font-mono flex items-center gap-2 text-[10px] tracking-widest text-jade-400">
                  <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-jade-500" />
                  LIVE · 2026
                </span>
              </div>
              <div className="flex items-end justify-between gap-4 px-6 pt-6">
                <div>
                  <p className="font-display text-[3.4rem] leading-none font-black text-snow">
                    {count}
                    <span className="text-brass-400">+</span>
                  </p>
                  <p className="mt-2 text-xs font-medium text-fog-400">
                    Vụ việc &amp; dự án đã xử lý
                  </p>
                </div>
                {/* vòng 98% */}
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
                      pathLength={100}
                      strokeDasharray="100"
                      strokeDashoffset={inView ? 2 : 100}
                      className="ring-anim"
                    />
                  </svg>
                  <span className="font-mono absolute inset-0 flex flex-col items-center justify-center text-sm font-bold text-jade-300">
                    98%
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3.5 px-6">
                {[
                  ["Xây dựng — BĐS", 40, "bg-brass-500"],
                  ["Tố tụng", 20, "bg-jade-500"],
                  ["Năng lượng", 18, "bg-jade-600"],
                  ["Thương mại", 12, "bg-ink-600"],
                  ["Dữ liệu", 10, "bg-fog-500"],
                ].map(([label, w, color], i) => (
                  <div key={label as string}>
                    <div className="mb-1.5 flex justify-between font-mono text-[10px] tracking-wider text-fog-400 uppercase">
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
                <span className="font-mono text-[9px] tracking-[0.22em] text-fog-500 uppercase">
                  Số liệu nội bộ · 02.2026
                </span>
                <span className="font-mono text-[9px] tracking-[0.22em] text-brass-500 uppercase">
                  LHPT-CAP-26
                </span>
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
                  className="font-mono flex items-center gap-3 pr-3 text-[11px] tracking-[0.18em] whitespace-nowrap text-fog-300"
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
const STATS = [
  { v: 15, suffix: "+", label: "Năm hành nghề", decimals: 0 },
  { v: 600, suffix: "+", label: "Vụ việc & dự án", decimals: 0 },
  { v: 2.4, suffix: " GW", label: "Công suất NLTT đã tư vấn", decimals: 1 },
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
      className={`reveal ${inView ? "reveal-in" : ""} group border-b border-l border-snow/10 px-6 py-8 transition-colors hover:bg-ink-900/60 lg:border-b-0`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="font-mono text-4xl font-bold text-snow transition-colors group-hover:text-brass-300 lg:text-[2.6rem]">
        {decimals > 0 ? val.toFixed(decimals) : val}
        <span className="text-jade-400">{suffix}</span>
      </p>
      <p className="mt-3 text-[13px] font-medium text-fog-400">{label}</p>
    </div>
  );
}

/* ================= DỊCH VỤ ================= */
export function Services() {
  return (
    <section id="dich-vu" className="relative z-10 scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* trái sticky */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHead
                kicker="Dịch vụ pháp lý"
                title={
                  <>
                    Năm trụ cột.
                    <br />
                    <span className="text-brass-400">Một chuẩn mực.</span>
                  </>
                }
                sub="Mỗi mảng do một luật sư trưởng phụ trách — chịu trách nhiệm đến cùng trên một hồ sơ."
              />
              <Reveal delay={200}>
                <ul className="mt-10 space-y-1">
                  {SERVICES.map((s) => (
                    <li key={s.num}>
                      <a
                        href={`#dv-${s.num}`}
                        className="group flex items-baseline gap-4 border-l border-snow/10 py-2.5 pl-5 transition-all duration-300 hover:border-brass-400 hover:pl-7"
                      >
                        <span className="font-mono text-xs text-brass-500">{s.num}</span>
                        <span className="font-display text-sm font-bold tracking-wide text-fog-300 uppercase transition-colors group-hover:text-snow">
                          {s.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
          {/* phải — cards */}
          <div className="space-y-6 lg:col-span-8">
            {SERVICES.map((s, idx) => {
              const Icon = SERVICE_ICONS[s.icon];
              const isNew = s.num === "05";
              return (
                <Reveal key={s.num} delay={idx * 60}>
                  <article
                    id={`dv-${s.num}`}
                    className={`group relative scroll-mt-28 overflow-hidden border bg-ink-850/80 p-7 transition-all duration-500 hover:-translate-y-1 sm:p-9 ${
                      isNew
                        ? "border-jade-500/40 hover:border-jade-400/80 hover:shadow-[0_25px_70px_-30px_rgba(34,196,156,0.4)]"
                        : "border-snow/10 hover:border-brass-500/60 hover:shadow-[0_25px_70px_-30px_rgba(201,164,76,0.35)]"
                    }`}
                  >
                    <span
                      className="font-display pointer-events-none absolute -top-5 right-4 text-[7rem] leading-none font-black text-outline select-none"
                      aria-hidden="true"
                    >
                      {s.num}
                    </span>
                    <div className="relative">
                      <div className="flex items-center gap-5">
                        <span
                          className={`flex h-14 w-14 shrink-0 items-center justify-center border transition-all duration-500 ${
                            isNew
                              ? "border-jade-500/50 text-jade-400 group-hover:bg-jade-500 group-hover:text-ink-950"
                              : "border-brass-500/40 text-brass-400 group-hover:bg-brass-500 group-hover:text-ink-950"
                          }`}
                        >
                          <Icon className="h-7 w-7" />
                        </span>
                        <div>
                          <h3 className="font-display text-xl font-black tracking-tight text-snow uppercase sm:text-2xl">
                            {s.title}
                          </h3>
                          <p className="mt-1 text-sm text-fog-400">{s.tagline}</p>
                        </div>
                        {isNew && (
                          <span className="font-mono ml-auto hidden shrink-0 animate-pulse items-center gap-2 border border-jade-500/60 px-2.5 py-1 text-[9px] tracking-[0.2em] text-jade-300 uppercase sm:inline-flex">
                            <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-jade-500" />
                            Mới · 2026
                          </span>
                        )}
                      </div>
                      <ul className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                        {s.items.map((it) => (
                          <li key={it} className="flex items-start gap-3 text-[14px] text-fog-300">
                            <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-jade-500" />
                            {it}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-7 flex flex-wrap gap-2">
                        {s.tags.map((t) => (
                          <span
                            key={t}
                            className={`font-mono border border-snow/15 px-2.5 py-1 text-[10px] tracking-[0.2em] text-fog-400 uppercase transition-colors ${
                              isNew
                                ? "group-hover:border-jade-500/50 group-hover:text-jade-300"
                                : "group-hover:border-brass-500/40 group-hover:text-brass-300"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
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
              <span className="text-jade-400">không cần phòng nhân sự.</span>
            </>
          }
          sub="Gói trọn tháng hoặc trọn năm — chi phí cố định, phạm vi rõ ràng, không phát sinh ngoài báo giá."
        />
        <div className="mx-auto mt-14 grid max-w-4xl gap-6 lg:grid-cols-2">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 120}>
              <article
                className={`relative flex h-full flex-col p-8 transition-all duration-500 hover:-translate-y-1.5 sm:p-9 ${
                  p.highlight
                    ? "border border-brass-500/70 bg-ink-800 shadow-[0_30px_90px_-35px_rgba(201,164,76,0.5)] hover:shadow-[0_35px_100px_-35px_rgba(201,164,76,0.65)]"
                    : "border border-snow/12 bg-ink-850 hover:border-jade-500/50"
                }`}
              >
                {p.badge && (
                  <span className="font-mono absolute -top-3.5 left-8 bg-brass-500 px-3 py-1.5 text-[10px] font-bold tracking-[0.22em] text-ink-950 uppercase">
                    {p.badge}
                  </span>
                )}
                <p
                  className={`font-mono text-[11px] tracking-[0.28em] uppercase ${
                    p.highlight ? "text-brass-400" : "text-jade-400"
                  }`}
                >
                  {p.name}
                </p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-mono text-[2rem] leading-none font-bold text-snow sm:text-[2.35rem]">
                    {p.price}
                  </span>
                  <span className="font-mono text-sm text-fog-400">{p.unit}</span>
                </div>
                <p
                  className={`font-mono mt-3 text-[11px] tracking-wider ${
                    p.highlight ? "text-brass-300" : "text-fog-400"
                  }`}
                >
                  {p.approx}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-fog-400">{p.note}</p>
                <ul className="mt-7 flex-1 space-y-3.5 border-t border-snow/10 pt-7">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[14px] text-fog-300">
                      <IconCheck
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          p.highlight ? "text-brass-400" : "text-jade-500"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#lien-he"
                  className={`group mt-9 inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold transition-all duration-300 ${
                    p.highlight
                      ? "bg-brass-500 text-ink-950 hover:bg-brass-400"
                      : "border border-snow/20 text-snow hover:border-jade-500 hover:text-jade-300"
                  }`}
                >
                  Nhận đề xuất gói
                  <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={150}>
          <p className="font-mono mx-auto mt-8 max-w-2xl text-center text-[10px] leading-relaxed tracking-[0.18em] text-fog-500 uppercase">
            * Chưa gồm VAT, án phí, phí trọng tài &amp; chi phí nhà nước · Gói năm thanh toán theo quý
          </p>
        </Reveal>
      </div>
    </section>
  );
}
