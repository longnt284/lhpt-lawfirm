import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FIRM, NAV_LINKS, type DocItem } from "../data";
import { EASE_LUXE, SCROLL, SOFT, VIEWPORT, fadeUp, fadeUpSmall, stagger } from "../motion";
import { useSpotlight } from "../hooks";
import { IconArrowUpRight, IconClose, IconMenu, IconPhone, LogoMark } from "./Icons";
import { GoldRule, Magnetic, Reveal } from "./Motion";

export { Reveal, RevealGroup, RevealItem } from "./Motion";

/* ---------- nền ambient nhiều lớp ---------- */
/*
 * Ba quầng sáng nền vẫn chạy bằng CSS keyframe (rẻ, không tốn main thread),
 * Motion chỉ thêm hai lớp phản ứng: trôi theo tiến trình cuộn và dịch nhẹ theo
 * con trỏ. Chuyển động thị sai này làm nền có chiều sâu thay vì phẳng lì.
 */
export function Ambient() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const drift = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const driftSlow = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  const mx = useSpring(useMotionValue(0), SOFT);
  const my = useSpring(useMotionValue(0), SOFT);
  const cursorX = useSpring(useMotionValue(-500), { stiffness: 90, damping: 24 });
  const cursorY = useSpring(useMotionValue(-500), { stiffness: 90, damping: 24 });
  const cursorGlow = useMotionTemplate`radial-gradient(26rem circle at ${cursorX}px ${cursorY}px, rgba(201,164,76,0.075), transparent 68%)`;

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 40);
      my.set((e.clientY / window.innerHeight - 0.5) * 30);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, mx, my, cursorX, cursorY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="bg-grid absolute inset-0 opacity-90" />
      <motion.div style={reduced ? undefined : { y: drift, x: mx }} className="absolute inset-0">
        <div className="animate-aurora-a absolute -top-48 -left-40 h-[46rem] w-[46rem] rounded-full bg-jade-500/12 blur-[140px]" />
        <div className="animate-aurora-b absolute top-1/4 -right-52 h-[42rem] w-[42rem] rounded-full bg-brass-500/10 blur-[140px]" />
      </motion.div>
      <motion.div
        style={reduced ? undefined : { y: driftSlow, x: my }}
        className="absolute inset-0"
      >
        <div className="animate-aurora-c absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-ink-600/25 blur-[120px]" />
      </motion.div>
      {!reduced && (
        <motion.div className="absolute inset-0 hidden lg:block" style={{ background: cursorGlow }} />
      )}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink-950 via-ink-950/60 to-transparent" />
      <div className="vignette absolute inset-0" />
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
      {rule && <GoldRule className="w-8 shrink-0" />}
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
    <motion.div
      variants={stagger(0.09)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      <motion.div variants={fadeUpSmall} className={align === "center" ? "flex justify-center" : ""}>
        <Kicker tone={tone} rule={align !== "center"}>
          {kicker}
        </Kicker>
      </motion.div>
      {/*
        Tiêu đề dùng serif, chữ thường và leading rộng. Bản trước dùng chữ hoa
        với leading 1.02 nên dấu tiếng Việt bị cắt và chồng lên dòng trên.
      */}
      <motion.h2
        variants={fadeUp}
        className={`font-display mt-4 text-[clamp(1.8rem,3.7vw,3rem)] leading-[1.18] font-semibold tracking-[-0.005em] ${
          light ? "text-ink-900" : "text-snow"
        }`}
      >
        {title}
      </motion.h2>
      {sub && (
        <motion.p
          variants={fadeUp}
          className={`mt-5 text-[15.5px] leading-[1.75] ${
            light ? "text-ink-900/70" : "text-fog-400"
          }`}
        >
          {sub}
        </motion.p>
      )}
    </motion.div>
  );
}

/* ---------- header + progress bar ---------- */
export function Header() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, SCROLL);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 24)), [scrollY]);

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
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE_LUXE, delay: 0.15 }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled
          ? "border-b border-snow/10 bg-ink-950/85 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="absolute top-0 left-0 h-[2px] w-full bg-ink-800/70">
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-brass-600 via-brass-400 to-jade-400"
          style={{ scaleX: progress }}
        />
      </div>
      <motion.div
        animate={{ height: scrolled ? 66 : 76 }}
        transition={{ duration: 0.5, ease: EASE_LUXE }}
        className="mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8"
      >
        <a href="#top" className="group flex items-center gap-3" aria-label="LHPT Law Firm">
          <motion.span
            whileHover={{ rotate: -6, scale: 1.06 }}
            transition={{ type: "spring", ...SOFT }}
            className="inline-flex"
          >
            <LogoMark className="h-9 w-9 text-snow transition-colors duration-300 group-hover:text-brass-400" />
          </motion.span>
          <span>
            <span className="font-display block text-[18px] leading-tight font-bold text-snow">
              LHPT
            </span>
            <span className="label block text-[9px] text-fog-500">Law Firm · TP.HCM</span>
          </span>
        </a>
        <nav
          className="hidden items-center gap-1 lg:flex"
          onPointerLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onPointerEnter={() => setHovered(l.href)}
              className="relative px-3 py-2 text-[13.5px] font-medium text-fog-300 transition-colors duration-300 hover:text-snow"
            >
              {/*
                layoutId cho phép khối nền trượt liền mạch giữa các mục thay vì
                hiện/ẩn từng cái — chi tiết nhỏ nhưng làm menu mượt hẳn.
              */}
              {hovered === l.href && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 border border-brass-500/25 bg-snow/[0.055]"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Magnetic className="hidden sm:inline-flex">
            <a
              href="#lien-he"
              className="sheen group inline-flex items-center gap-2 bg-brass-500 px-4 py-2.5 text-[13px] font-semibold text-ink-950 transition-colors duration-300 hover:bg-brass-400"
            >
              Đặt lịch tư vấn
              <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Magnetic>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-snow lg:hidden"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
          >
            {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>
      </motion.div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_LUXE }}
            className="overflow-hidden border-t border-snow/10 bg-ink-950/97 backdrop-blur-xl lg:hidden"
          >
            <motion.nav
              variants={stagger(0.05, 0.08)}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-1 px-5 py-6"
            >
              {NAV_LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  variants={fadeUpSmall}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-3 py-2.5 text-[15px] font-medium text-fog-300 transition-colors hover:text-brass-300"
                >
                  <span className="label text-[10px] text-brass-500/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {l.label}
                </motion.a>
              ))}
              <motion.a
                variants={fadeUpSmall}
                href="#lien-he"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex w-fit items-center gap-2 bg-brass-500 px-4 py-2.5 text-[13px] font-semibold text-ink-950"
              >
                Đặt lịch tư vấn
                <IconArrowUpRight className="h-4 w-4" />
              </motion.a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ---------- CTA cố định trên mobile ---------- */
export function MobileActionBar() {
  return (
    <div className="fixed inset-x-4 bottom-4 z-[55] flex items-center gap-2 border border-snow/15 bg-ink-950/90 p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:hidden">
      <a
        href={FIRM.hotlineHref}
        aria-label={`Gọi ${FIRM.hotline}`}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-jade-500/40 text-jade-300 transition-colors active:bg-jade-500/15"
      >
        <IconPhone className="h-4 w-4" />
      </a>
      <div className="min-w-0 flex-1 px-2">
        <p className="label truncate text-[8px] text-fog-500">Tư vấn pháp lý</p>
        <p className="truncate text-[12px] font-semibold text-snow">Phản hồi trong 24 giờ</p>
      </div>
      <a
        href="#lien-he"
        className="sheen inline-flex shrink-0 items-center gap-1.5 bg-brass-500 px-3.5 py-3 text-[12px] font-semibold text-ink-950 active:scale-[0.98]"
      >
        Đặt lịch
        <IconArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

/* ---------- nút về đầu trang kèm vòng tiến trình ---------- */
export function ScrollTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const [show, setShow] = useState(false);
  const ring = useSpring(scrollYProgress, SCROLL);
  const dash: MotionValue<number> = useTransform(ring, (v) => 100 - v * 100);

  useEffect(() => scrollY.on("change", (v) => setShow(v > 900)), [scrollY]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.85 }}
          transition={{ duration: 0.4, ease: EASE_LUXE }}
          whileHover={{ y: -3 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Về đầu trang"
          className="group fixed right-5 bottom-5 z-[60] hidden h-12 w-12 items-center justify-center border border-snow/15 bg-ink-900/85 backdrop-blur-md sm:flex"
        >
          <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(238,244,250,0.09)" strokeWidth="1.5" />
            <motion.circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="var(--color-brass-400)"
              strokeWidth="1.5"
              pathLength={100}
              strokeDasharray="100"
              style={{ strokeDashoffset: dash }}
            />
          </svg>
          <span className="relative text-brass-400 transition-transform duration-300 group-hover:-translate-y-0.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ---------- modal đọc bài ---------- */
export function ArticleModal({ item, onClose }: { item: DocItem | null; onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const readProgressRaw = useMotionValue(0);
  const readProgress = useSpring(readProgressRaw, SCROLL);

  useEffect(() => {
    const panel = scrollRef.current;
    if (!item || !panel) return;
    const updateProgress = () => {
      const max = panel.scrollHeight - panel.clientHeight;
      readProgressRaw.set(max > 0 ? panel.scrollTop / max : 0);
    };
    updateProgress();
    panel.addEventListener("scroll", updateProgress, { passive: true });
    return () => panel.removeEventListener("scroll", updateProgress);
  }, [item, readProgressRaw]);

  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [item]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_LUXE }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-950/85 p-0 backdrop-blur-md sm:items-center sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
        >
          <motion.div
            key="panel"
            initial={{ y: 44, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.5, ease: EASE_LUXE }}
            ref={scrollRef}
            className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-mist-300 bg-paper text-ink-900 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.75)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thanh tiến trình đọc bám theo phần đã cuộn trong chính modal. */}
            <motion.div
              className="sticky top-0 left-0 z-20 h-[2px] origin-left bg-gradient-to-r from-brass-600 to-jade-500"
              style={{ scaleX: readProgress }}
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 border border-ink-900/15 bg-mist-50 p-2 text-ink-900 transition-colors hover:border-brass-500 hover:text-brass-600"
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
            <motion.div
              variants={stagger(0.06, 0.12)}
              initial="hidden"
              animate="show"
              className="px-7 py-8 sm:px-10 sm:py-10"
            >
              <motion.h3
                variants={fadeUpSmall}
                className="font-display text-[1.45rem] leading-[1.28] font-semibold sm:text-[1.65rem]"
              >
                {item.title}
              </motion.h3>
              <motion.p variants={fadeUpSmall} className="label mt-4 text-[10.5px] text-ink-900/50">
                {item.date} · Đọc {item.read}
                {item.author ? ` · ${item.author}` : ""}
              </motion.p>
              <motion.p
                variants={fadeUpSmall}
                className="mt-6 border-l-2 border-brass-500 pl-4 text-[15px] leading-[1.7] font-medium text-ink-900/85"
              >
                {item.excerpt}
              </motion.p>
              <div className="mt-7 space-y-5">
                {item.content.map((p, i) => (
                  <motion.p
                    key={i}
                    variants={fadeUpSmall}
                    className="text-[15px] leading-[1.8] text-ink-900/78"
                  >
                    {p}
                  </motion.p>
                ))}
              </div>

              {item.basis.length > 0 && (
                <motion.div variants={fadeUpSmall} className="mt-9 border-t border-ink-900/10 pt-6">
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
                </motion.div>
              )}

              <motion.div
                variants={fadeUpSmall}
                className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-900/10 pt-6"
              >
                <p className="label max-w-xs text-[9.5px] text-ink-900/45">
                  Thông tin tham khảo, không thay thế ý kiến pháp lý
                </p>
                <Magnetic>
                  <a
                    href="#lien-he"
                    onClick={onClose}
                    className="sheen group inline-flex items-center gap-2 bg-ink-900 px-4 py-2.5 text-[13px] font-semibold text-snow transition-colors hover:bg-brass-600"
                  >
                    Hỏi luật sư
                    <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </Magnetic>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

function FooterColumn({
  title,
  items,
  delay,
}: {
  title: string;
  items: [string, string][];
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <p className="label text-[10.5px] text-brass-400">{title}</p>
      <GoldRule className="mt-3 w-10" />
      <ul className="mt-5 space-y-3 text-[13.5px] leading-[1.6] text-fog-300">
        {items.map(([t, h]) => (
          <li key={t}>
            <a href={h} className="link-underline transition-colors hover:text-brass-300">
              {t}
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function Footer() {
  const onMove = useSpotlight<HTMLDivElement>();
  return (
    <footer className="relative z-10 border-t border-snow/10 bg-ink-950">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
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
            </Reveal>
            <Reveal delay={120}>
              <motion.div
                onPointerMove={onMove}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", ...SOFT }}
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
              </motion.div>
            </Reveal>
          </div>
          <div className="lg:col-span-2">
            <FooterColumn
              title="Dịch vụ"
              delay={60}
              items={FOOTER_SERVICES.map((t) => [t, "#dich-vu"] as [string, string])}
            />
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title="Hệ thống" delay={120} items={FOOTER_SYSTEM} />
          </div>
          <div className="lg:col-span-3">
            <FooterColumn
              title="Pháp lý & quyền riêng tư"
              delay={180}
              items={FOOTER_POLICY.map((t) => [t, "#chinh-sach"] as [string, string])}
            />
          </div>
        </div>
        <Reveal delay={100}>
          <div className="mt-12 flex flex-col gap-3 border-t border-snow/10 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="label text-[10px] text-fog-500">
              © 2026 LHPT Law Firm · Mọi quyền được bảo lưu
            </p>
            <p className="max-w-xl text-[11.5px] leading-[1.7] text-fog-500">
              Nội dung trên website là thông tin pháp lý tham khảo, không cấu thành ý kiến pháp lý
              cho bất kỳ vụ việc cụ thể nào.
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
