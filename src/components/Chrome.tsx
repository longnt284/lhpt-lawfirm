import { useEffect, useState, type ReactNode } from "react";
import { FIRM, NAV_LINKS, type DocItem } from "../data";
import { useInView, usePrefersReducedMotion, useScrollProgress, useSpotlight } from "../hooks";
import { IconArrowUpRight, IconClose, IconMenu, LogoMark } from "./Icons";

/* ---------- nền ambient nhiều lớp ---------- */
export function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="bg-grid absolute inset-0 opacity-90" />
      <div className="animate-aurora-a absolute -top-48 -left-40 h-[46rem] w-[46rem] rounded-full bg-jade-500/12 blur-[140px]" />
      <div className="animate-aurora-b absolute top-1/4 -right-52 h-[42rem] w-[42rem] rounded-full bg-brass-500/10 blur-[140px]" />
      <div className="animate-aurora-c absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-ink-600/25 blur-[120px]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950 via-ink-950/60 to-transparent" />
    </div>
  );
}

/* ---------- scroll reveal ---------- */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  const show = reduced || inView;
  return (
    <div
      ref={ref}
      style={{ transitionDelay: reduced ? undefined : `${delay}ms` }}
      className={`reveal ${show ? "reveal-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- nhãn nhỏ dùng chung ---------- */
export function Kicker({
  children,
  tone = "dark",
  rule = true,
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  rule?: boolean;
}) {
  return (
    <p
      className={`label flex items-center gap-3 text-[11px] ${
        tone === "light" ? "text-brass-700" : "text-brass-400"
      }`}
    >
      {rule && <span className="inline-block h-px w-8 shrink-0 bg-current" />}
      {children}
    </p>
  );
}

/* ---------- tiêu đề section ---------- */
export function SectionHead({
  kicker,
  title,
  sub,
  tone = "dark",
  align = "left",
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
  tone?: "dark" | "light";
  align?: "left" | "center";
}) {
  const light = tone === "light";
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Reveal>
        <div className={align === "center" ? "flex justify-center" : ""}>
          <Kicker tone={tone} rule={align !== "center"}>
            {kicker}
          </Kicker>
        </div>
      </Reveal>
      <Reveal delay={90}>
        {/*
          Tiêu đề dùng serif, chữ thường và leading rộng. Bản trước dùng chữ hoa
          với leading 1.02 nên dấu tiếng Việt bị cắt và chồng lên dòng trên.
        */}
        <h2
          className={`font-display mt-4 text-[clamp(1.75rem,3.6vw,2.9rem)] leading-[1.18] font-semibold ${
            light ? "text-ink-900" : "text-snow"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={170}>
          <p
            className={`mt-5 text-[15.5px] leading-[1.75] ${
              light ? "text-ink-900/70" : "text-fog-400"
            }`}
          >
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------- header + progress bar ---------- */
export function Header() {
  const { progress, scrolled } = useScrollProgress();
  const [open, setOpen] = useState(false);

  // Khoá cuộn nền khi menu di động đang mở.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-snow/10 bg-ink-950/88 backdrop-blur-lg" : "bg-transparent"
      }`}
    >
      <div className="absolute top-0 left-0 h-[2px] w-full bg-ink-800/70">
        <div
          className="h-full bg-gradient-to-r from-brass-500 via-brass-400 to-jade-500 transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#top" className="group flex items-center gap-3" aria-label="LHPT Law Firm">
          <LogoMark className="h-9 w-9 text-snow transition-colors duration-300 group-hover:text-brass-400" />
          <span>
            <span className="font-display block text-[18px] leading-tight font-bold text-snow">
              LHPT
            </span>
            <span className="label block text-[9px] text-fog-500">Law Firm · TP.HCM</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative py-1 text-[13.5px] font-medium text-fog-300 transition-colors duration-300 hover:text-snow"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-brass-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#lien-he"
            className="sheen group hidden items-center gap-2 bg-brass-500 px-4 py-2.5 text-[13px] font-semibold text-ink-950 transition-colors duration-300 hover:bg-brass-400 sm:inline-flex"
          >
            Đặt lịch tư vấn
            <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-snow lg:hidden"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
          >
            {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-snow/10 bg-ink-950/97 px-5 py-6 backdrop-blur-lg lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-3 py-2.5 text-[15px] font-medium text-fog-300 transition-colors hover:text-brass-300"
              >
                <span className="label text-[10px] text-brass-500/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l.label}
              </a>
            ))}
            <a
              href="#lien-he"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex w-fit items-center gap-2 bg-brass-500 px-4 py-2.5 text-[13px] font-semibold text-ink-950"
            >
              Đặt lịch tư vấn
              <IconArrowUpRight className="h-4 w-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ---------- modal đọc bài ---------- */
export function ArticleModal({ item, onClose }: { item: DocItem | null; onClose: () => void }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
      const raf = requestAnimationFrame(() => setShown(true));
      return () => {
        cancelAnimationFrame(raf);
        setShown(false);
        document.body.style.overflow = "";
      };
    }
    setShown(false);
  }, [item]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-end justify-center bg-ink-950/85 p-0 backdrop-blur-sm transition-opacity duration-300 sm:items-center sm:p-6 ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div
        className={`relative max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-mist-300 bg-paper text-ink-900 shadow-2xl transition-all duration-500 ${
          shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 border border-ink-900/15 bg-mist-50 p-2 text-ink-900 transition-colors hover:border-brass-500 hover:text-brass-600"
          aria-label="Đóng"
        >
          <IconClose className="h-4 w-4" />
        </button>
        <div className="border-b border-ink-900/10 bg-mist-100 px-7 py-4 sm:px-10">
          <div className="label text-[10px] text-ink-900/55">
            {item.kind === "news" ? "Tin pháp lý" : "Bài viết chuyên sâu"} ·{" "}
            <span className="text-brass-700">{item.category}</span>
          </div>
        </div>
        <div className="px-7 py-8 sm:px-10 sm:py-10">
          <h3 className="font-display text-[1.45rem] leading-[1.28] font-semibold sm:text-[1.65rem]">
            {item.title}
          </h3>
          <p className="label mt-4 text-[10.5px] text-ink-900/50">
            {item.date} · Đọc {item.read}
            {item.author ? ` · ${item.author}` : ""}
          </p>
          <p className="mt-6 border-l-2 border-brass-500 pl-4 text-[15px] leading-[1.7] font-medium text-ink-900/85">
            {item.excerpt}
          </p>
          <div className="mt-7 space-y-5">
            {item.content.map((p, i) => (
              <p key={i} className="text-[15px] leading-[1.8] text-ink-900/78">
                {p}
              </p>
            ))}
          </div>

          {item.basis.length > 0 && (
            <div className="mt-9 border-t border-ink-900/10 pt-6">
              <p className="label text-[10px] text-ink-900/50">Cơ sở pháp lý</p>
              <ul className="mt-3 space-y-1.5">
                {item.basis.map((b) => (
                  <li
                    key={b}
                    className="flex gap-2.5 text-[12.5px] leading-[1.65] text-ink-900/70"
                  >
                    <span className="text-brass-600">§</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-900/10 pt-6">
            <p className="label max-w-xs text-[9.5px] text-ink-900/45">
              Thông tin tham khảo, không thay thế ý kiến pháp lý
            </p>
            <a
              href="#lien-he"
              onClick={onClose}
              className="sheen group inline-flex items-center gap-2 bg-ink-900 px-4 py-2.5 text-[13px] font-semibold text-snow transition-colors hover:bg-brass-600"
            >
              Hỏi luật sư
              <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- footer ---------- */
const FOOTER_SERVICES = [
  "Xây dựng · Bất động sản",
  "Tố tụng · Tranh chấp",
  "Điện mặt trời · Năng lượng",
  "Doanh nghiệp · Tuân thủ",
  "Bảo mật dữ liệu",
];

const FOOTER_SYSTEM: [string, string][] = [
  ["Bài viết pháp lý", "#bai-viet"],
  ["Tin tức nổi bật", "#tin-tuc"],
  ["Hệ thống văn bản", "#van-ban"],
  ["Đội ngũ luật sư", "#doi-ngu"],
  ["Bảng phí dịch vụ", "#bang-phi"],
];

const FOOTER_POLICY = [
  "Chính sách dịch vụ",
  "Chính sách bảo mật",
  "Quyền riêng tư & cookie",
  "Xung đột lợi ích",
];

export function Footer() {
  const onMove = useSpotlight<HTMLDivElement>();
  return (
    <footer className="relative z-10 border-t border-snow/10 bg-ink-950">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href="#top" className="flex items-center gap-3">
              <LogoMark className="h-10 w-10 text-snow" />
              <span>
                <span className="font-display block text-xl leading-tight font-bold text-snow">
                  LHPT
                </span>
                <span className="label block text-[9px] text-fog-500">Law Firm · TP.HCM</span>
              </span>
            </a>
            <p className="mt-5 max-w-sm text-[14.5px] leading-[1.75] text-fog-400">
              Hãng luật chuyên sâu về xây dựng và bất động sản, tố tụng, điện mặt trời, doanh
              nghiệp, tuân thủ và bảo vệ dữ liệu cá nhân. Pháp lý vững, nền móng bền.
            </p>
            <div
              onPointerMove={onMove}
              className="spotlight mt-6 max-w-sm border border-snow/10 p-5"
            >
              <p className="label text-[9.5px] text-brass-400">Liên hệ</p>
              <a
                href={FIRM.hotlineHref}
                className="mt-3 block text-[15px] font-semibold text-snow transition-colors hover:text-brass-300"
              >
                {FIRM.hotline}
              </a>
              <a
                href={`mailto:${FIRM.email}`}
                className="mt-1 block text-[13.5px] text-fog-300 transition-colors hover:text-brass-300"
              >
                {FIRM.email}
              </a>
              <p className="mt-3 text-[13px] leading-[1.7] text-fog-400">{FIRM.office}</p>
              <p className="mt-1 text-[13px] text-fog-500">{FIRM.hours}</p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <p className="label text-[10.5px] text-brass-400">Dịch vụ</p>
            <ul className="mt-5 space-y-3 text-[13.5px] leading-[1.6] text-fog-300">
              {FOOTER_SERVICES.map((t) => (
                <li key={t}>
                  <a href="#dich-vu" className="transition-colors hover:text-brass-300">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <p className="label text-[10.5px] text-brass-400">Hệ thống</p>
            <ul className="mt-5 space-y-3 text-[13.5px] leading-[1.6] text-fog-300">
              {FOOTER_SYSTEM.map(([t, h]) => (
                <li key={t}>
                  <a href={h} className="transition-colors hover:text-brass-300">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <p className="label text-[10.5px] text-brass-400">Pháp lý &amp; quyền riêng tư</p>
            <ul className="mt-5 space-y-3 text-[13.5px] leading-[1.6] text-fog-300">
              {FOOTER_POLICY.map((t) => (
                <li key={t}>
                  <a href="#chinh-sach" className="transition-colors hover:text-brass-300">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-snow/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="label text-[10px] text-fog-500">
            © 2026 LHPT Law Firm · Mọi quyền được bảo lưu
          </p>
          <p className="max-w-xl text-[11.5px] leading-[1.7] text-fog-500">
            Nội dung trên website là thông tin pháp lý tham khảo, không cấu thành ý kiến pháp lý
            cho bất kỳ vụ việc cụ thể nào.
          </p>
        </div>
      </div>
    </footer>
  );
}
