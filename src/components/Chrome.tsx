import { useEffect, useState, type ReactNode } from "react";
import { NAV_LINKS, type DocItem } from "../data";
import { useInView, usePrefersReducedMotion, useScrollProgress } from "../hooks";
import { IconArrowUpRight, IconClose, IconMenu, LogoMark } from "./Icons";

/* ---------- nền ambient nhiều lớp ---------- */
export function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="bg-grid absolute inset-0 opacity-90" />
      <div className="animate-drift-a absolute -top-40 -left-40 h-[44rem] w-[44rem] rounded-full bg-jade-500/12 blur-[130px]" />
      <div className="animate-drift-b absolute -right-48 top-1/3 h-[40rem] w-[40rem] rounded-full bg-brass-500/10 blur-[130px]" />
      <div className="absolute bottom-0 left-1/4 h-[26rem] w-[26rem] rounded-full bg-ink-600/25 blur-[110px]" />
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
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${show ? "reveal-in" : ""} ${className}`}
    >
      {children}
    </div>
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
        <p
          className={`font-mono text-[11px] font-medium tracking-[0.28em] uppercase ${
            light ? "text-brass-600" : "text-brass-400"
          }`}
        >
          <span className="mr-3 inline-block h-px w-8 translate-y-[-3px] bg-current align-middle" />
          {kicker}
        </p>
      </Reveal>
      <Reveal delay={90}>
        <h2
          className={`font-display mt-5 text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.02] font-black tracking-tight uppercase ${
            light ? "text-ink-900" : "text-snow"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={170}>
          <p className={`mt-5 text-[15px] leading-relaxed ${light ? "text-ink-900/65" : "text-fog-400"}`}>
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
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-snow/10 bg-ink-950/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="absolute top-0 left-0 h-[2px] w-full bg-ink-800">
        <div
          className="h-full bg-gradient-to-r from-brass-500 to-jade-500 transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#top" className="group flex items-center gap-3" aria-label="Kiến Pháp Law">
          <LogoMark className="h-9 w-9 text-snow transition-colors group-hover:text-brass-400" />
          <span className="leading-none">
            <span className="font-display block text-[17px] font-black tracking-tight text-snow">
              KIẾN PHÁP
            </span>
            <span className="font-mono mt-1 block text-[9px] tracking-[0.32em] text-fog-500">
              LAW FIRM · EST. 2011
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative text-[13px] font-medium text-fog-300 transition-colors hover:text-snow"
            >
              {l.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-brass-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#lien-he"
            className="group hidden items-center gap-2 bg-brass-500 px-4 py-2.5 text-[13px] font-bold text-ink-950 transition-all hover:bg-brass-400 sm:inline-flex"
          >
            Đặt lịch tư vấn
            <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-snow lg:hidden"
            aria-label="Menu"
          >
            {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-snow/10 bg-ink-950/97 px-5 py-6 backdrop-blur-md lg:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-mono text-sm tracking-widest text-fog-300 uppercase transition-colors hover:text-brass-400"
              >
                <span className="mr-3 text-brass-500/60">0{i + 1}</span>
                {l.label}
              </a>
            ))}
            <a
              href="#lien-he"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex w-fit items-center gap-2 bg-brass-500 px-4 py-2.5 text-[13px] font-bold text-ink-950"
            >
              Đặt lịch tư vấn
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
          <div className="font-mono text-[10px] tracking-[0.25em] text-ink-900/55 uppercase">
            {item.kind === "news" ? "Tin pháp lý" : "Bài viết chuyên sâu"} ·{" "}
            <span className="text-brass-600">{item.category}</span>
          </div>
        </div>
        <div className="px-7 py-8 sm:px-10 sm:py-10">
          <h3 className="font-display text-2xl leading-tight font-black tracking-tight sm:text-[1.7rem]">
            {item.title}
          </h3>
          <p className="font-mono mt-4 text-[11px] tracking-widest text-ink-900/50 uppercase">
            {item.date} · Đọc {item.read}
            {item.author ? ` · ${item.author}` : ""}
          </p>
          <p className="mt-6 border-l-2 border-brass-500 pl-4 text-[15px] font-semibold text-ink-900/85">
            {item.excerpt}
          </p>
          <div className="mt-6 space-y-5">
            {item.content.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-ink-900/75">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-ink-900/10 pt-6">
            <p className="font-mono text-[10px] tracking-[0.2em] text-ink-900/45 uppercase">
              Thông tin tham khảo — không thay thế ý kiến pháp lý
            </p>
            <a
              href="#lien-he"
              onClick={onClose}
              className="group inline-flex items-center gap-2 bg-ink-900 px-4 py-2.5 text-[13px] font-bold text-snow transition-colors hover:bg-brass-600"
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
export function Footer() {
  return (
    <footer className="relative z-10 border-t border-snow/10 bg-ink-950">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href="#top" className="flex items-center gap-3">
              <LogoMark className="h-10 w-10 text-snow" />
              <span className="leading-none">
                <span className="font-display block text-lg font-black tracking-tight text-snow">
                  KIẾN PHÁP
                </span>
                <span className="font-mono mt-1 block text-[9px] tracking-[0.32em] text-fog-500">
                  LAW FIRM · EST. 2011
                </span>
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-fog-400">
              Hãng luật chuyên sâu về xây dựng — bất động sản, tố tụng, năng lượng tái tạo và
              thương mại. Pháp lý vững, nền móng bền.
            </p>
            <p className="font-mono mt-6 text-[10px] leading-relaxed tracking-wider text-fog-500">
              GPHĐ SỐ 41.02.1688/TP/ĐKHĐ · ĐOÀN LS TP.HCM
              <br />
              MST 0312 688 411 · TP.HCM — HÀ NỘI
            </p>
          </div>
          <div className="lg:col-span-2">
            <p className="font-mono text-[11px] tracking-[0.25em] text-brass-400 uppercase">Dịch vụ</p>
            <ul className="mt-5 space-y-3 text-sm text-fog-300">
              {[
                "Xây dựng — BĐS",
                "Tố tụng & tranh chấp",
                "Điện mặt trời",
                "Thương mại — dịch vụ",
              ].map((t) => (
                <li key={t}>
                  <a href="#dich-vu" className="transition-colors hover:text-brass-300">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <p className="font-mono text-[11px] tracking-[0.25em] text-brass-400 uppercase">Hệ thống</p>
            <ul className="mt-5 space-y-3 text-sm text-fog-300">
              {[
                ["Bài viết pháp lý", "#bai-viet"],
                ["Tin tức nổi bật", "#tin-tuc"],
                ["Văn bản hiện hành", "#van-ban"],
                ["Đội ngũ luật sư", "#doi-ngu"],
                ["Bảng phí", "#bang-phi"],
              ].map(([t, h]) => (
                <li key={t}>
                  <a href={h} className="transition-colors hover:text-brass-300">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <p className="font-mono text-[11px] tracking-[0.25em] text-brass-400 uppercase">
              Pháp lý & quyền riêng tư
            </p>
            <ul className="mt-5 space-y-3 text-sm text-fog-300">
              {[
                "Chính sách dịch vụ",
                "Chính sách bảo mật",
                "Quyền riêng tư & cookie",
                "Xung đột lợi ích",
              ].map((t) => (
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
          <p className="font-mono text-[11px] tracking-wider text-fog-500">
            © 2026 KIẾN PHÁP LAW — MỌI QUYỀN ĐƯỢC BẢO LƯU
          </p>
          <p className="max-w-xl text-[11px] leading-relaxed text-fog-500">
            Nội dung trên website là thông tin pháp lý tham khảo, không cấu thành ý kiến pháp lý
            cho bất kỳ vụ việc cụ thể nào.
          </p>
        </div>
      </div>
    </footer>
  );
}
