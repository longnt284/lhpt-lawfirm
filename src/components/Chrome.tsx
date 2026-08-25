import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "../auth";
import { FIRM, NAV_LINKS } from "../firm";
import type { DocItem } from "../content/types";
import { formatReadingTime, useLocale } from "../i18n";
import { EASE_LUXE, SCROLL, SOFT, VIEWPORT, fadeUp, fadeUpSmall, stagger } from "../motion";
import { useSpotlight } from "../hooks";
import {
  IconArrowUpRight,
  IconClose,
  IconDiscord,
  IconFacebook,
  IconGlobe,
  IconInstagram,
  IconLinkedin,
  IconMenu,
  IconPhone,
  IconUser,
  LogoMark,
} from "./Icons";
import { GoldRule, Magnetic, Reveal } from "./Motion";
import { Comments } from "./Comments";

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
  /*
   * Quầng sáng theo con trỏ là một khối có kích thước cố định, di chuyển bằng
   * transform. Bản trước dựng chuỗi radial-gradient rồi gán vào `background`
   * của một lớp phủ kín màn hình: đổi background-image thì trình duyệt phải vẽ
   * lại toàn bộ viewport ở mỗi khung hình con trỏ di chuyển, còn transform thì
   * compositor lo, không chạm tới luồng chính.
   */
  const cursorX = useSpring(useMotionValue(-1000), { stiffness: 90, damping: 24 });
  const cursorY = useSpring(useMotionValue(-1000), { stiffness: 90, damping: 24 });
  const pointerFrame = useRef<number | null>(null);
  const latestPointer = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      latestPointer.current = { x: e.clientX, y: e.clientY };
      if (pointerFrame.current !== null) return;
      pointerFrame.current = window.requestAnimationFrame(() => {
        pointerFrame.current = null;
        const { x, y } = latestPointer.current;
        mx.set((x / window.innerWidth - 0.5) * 40);
        my.set((y / window.innerHeight - 0.5) * 30);
        cursorX.set(x);
        cursorY.set(y);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (pointerFrame.current !== null) window.cancelAnimationFrame(pointerFrame.current);
      pointerFrame.current = null;
    };
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
        <motion.div
          className="absolute top-0 left-0 -mt-[26rem] -ml-[26rem] hidden h-[52rem] w-[52rem] rounded-full bg-[radial-gradient(circle_closest-side,rgba(201,164,76,0.075),transparent_68%)] lg:block"
          style={{ x: cursorX, y: cursorY }}
        />
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

/* ---------- công tắc ngôn ngữ ---------- */
/*
 * Hiện cả hai lựa chọn thay vì một nút "EN" đổi qua đổi lại.
 *
 * Bản cũ chỉ in mã của ngôn ngữ *sẽ chuyển sang*, nên người đọc phải suy ra
 * mình đang ở đâu và bấm vào thì đi đâu. Dạng hai ô kề nhau bỏ hẳn bước suy
 * luận đó: ô đang chọn được tô nền đồng thau, ô còn lại là đích đến. Vì cả hai
 * mã luôn hiển thị nên nút cũng bắt mắt hơn hẳn một ô viền mảnh cạnh logo.
 */
const LOCALE_OPTIONS = [
  { code: "vi" as const, label: "VI", full: "Tiếng Việt" },
  { code: "en" as const, label: "EN", full: "English" },
];

export function LanguageSwitch({
  variant = "header",
  className = "",
}: {
  variant?: "header" | "panel";
  className?: string;
}) {
  const { locale, toggleLocale, t } = useLocale();
  const panel = variant === "panel";

  return (
    <div
      role="group"
      aria-label={t("languageLabel")}
      className={`inline-flex items-center gap-1.5 border border-brass-500/45 bg-ink-900/70 p-1 shadow-[0_0_0_1px_rgba(201,164,76,0.08)] backdrop-blur-sm ${className}`}
    >
      <IconGlobe className="ml-1.5 h-3.5 w-3.5 shrink-0 text-brass-400" />
      {LOCALE_OPTIONS.map((option) => {
        const active = locale === option.code;
        return (
          <button
            key={option.code}
            type="button"
            // Đang ở ngôn ngữ nào thì bấm lại chính nó không làm gì, tránh nháy
            // lại toàn bộ cây khi người dùng bấm nhầm ô đang chọn.
            onClick={() => {
              if (!active) toggleLocale();
            }}
            aria-pressed={active}
            aria-label={active ? option.full : `${t("languageLabel")} — ${option.full}`}
            title={option.full}
            className={`label relative px-2.5 py-1.5 text-[10px] transition-colors duration-300 ${
              active ? "text-ink-950" : "text-fog-300 hover:text-brass-300"
            } ${panel ? "px-3 py-2 text-[11px]" : ""}`}
          >
            {active && (
              <motion.span
                layoutId={panel ? "locale-pill-panel" : "locale-pill"}
                className="absolute inset-0 -z-10 bg-brass-500"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {panel ? `${option.label} · ${option.full}` : option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- header + progress bar ---------- */
export function Header({ onOpenAccount }: { onOpenAccount?: () => void } = {}) {
  const [open, setOpen] = useState(false);
  const { isEnglish, t } = useLocale();
  const { user } = useAuth();
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
            <span className="label block text-[9px] whitespace-nowrap text-fog-500">Law Firm · {t("scope")}</span>
          </span>
        </a>
        <nav
          className="hidden items-center gap-1 lg:flex"
          onPointerLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onPointerEnter={() => setHovered(l.href)}
              className="relative px-3 py-2 text-[13.5px] font-medium whitespace-nowrap text-fog-300 transition-colors duration-300 hover:text-snow"
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
              {t("nav")[i]}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <LanguageSwitch />
          {onOpenAccount && (
            <button
              type="button"
              onClick={onOpenAccount}
              aria-label={user ? t("portal") : t("account")}
              title={user ? t("portal") : t("account")}
              className="hidden items-center gap-2 border border-snow/20 px-3 py-2 text-[12.5px] font-medium whitespace-nowrap text-fog-300 transition-colors hover:border-brass-500 hover:text-brass-300 sm:inline-flex"
            >
              <IconUser className="h-4 w-4" />
              <span className="hidden lg:inline">{user ? t("portal") : t("signIn")}</span>
            </button>
          )}
          <Magnetic className="hidden sm:inline-flex">
            <a
              href="#lien-he"
              className="sheen group inline-flex items-center gap-2 whitespace-nowrap bg-brass-500 px-4 py-2.5 text-[13px] font-semibold text-ink-950 transition-colors duration-300 hover:bg-brass-400"
            >
              {t("book")}
              <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Magnetic>
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-snow lg:hidden"
            aria-label={open ? (isEnglish ? "Close menu" : "Đóng menu") : isEnglish ? "Open menu" : "Mở menu"}
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
                  {t("nav")[i]}
                </motion.a>
              ))}
              <motion.div variants={fadeUpSmall} className="mt-4">
                <p className="label mb-2 text-[9px] text-fog-500">{t("languageLabel")}</p>
                <LanguageSwitch variant="panel" className="w-fit" />
              </motion.div>
              {onOpenAccount && (
                <motion.button
                  variants={fadeUpSmall}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onOpenAccount();
                  }}
                  className="mt-4 inline-flex w-fit items-center gap-2 border border-snow/20 px-4 py-2.5 text-[13px] font-semibold text-fog-200"
                >
                  <IconUser className="h-4 w-4" />
                  {user ? t("portal") : t("signIn")}
                </motion.button>
              )}
              <motion.a
                variants={fadeUpSmall}
                href="#lien-he"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex w-fit items-center gap-2 bg-brass-500 px-4 py-2.5 text-[13px] font-semibold text-ink-950"
              >
                {t("book")}
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
export function MobileActionBar({ onOpenAccount }: { onOpenAccount?: () => void } = {}) {
  const { t } = useLocale();
  return (
    <div className="fixed inset-x-4 bottom-4 z-[55] flex items-center gap-2 border border-snow/15 bg-ink-950/90 p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:hidden">
      <a
        href={FIRM.hotlineHref}
        aria-label={`${t("hotline")}: ${FIRM.hotline}`}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-jade-500/40 text-jade-300 transition-colors active:bg-jade-500/15"
      >
        <IconPhone className="h-4 w-4" />
      </a>
      {onOpenAccount && (
        <button
          type="button"
          onClick={onOpenAccount}
          aria-label={t("account")}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-snow/20 text-fog-300 transition-colors active:bg-snow/10"
        >
          <IconUser className="h-4 w-4" />
        </button>
      )}
      {/*
        Dòng trấn an bị ẩn dưới 420px. Thêm nút tài khoản vào thanh này làm bốn
        phần tử chen nhau trên màn hình 390px, và khi đó chữ bị bẻ thành ba dòng
        khiến cả thanh cao gấp đôi. Máy hẹp thì ưu tiên ba nút bấm được.
      */}
      <div className="hidden min-w-0 flex-1 px-2 min-[420px]:block">
        <p className="label truncate text-[8px] text-fog-500">{t("consultation")}</p>
        <p className="truncate text-[12px] font-semibold text-snow">{t("mobileResponse")}</p>
      </div>
      <div className="flex-1 min-[420px]:hidden" />
      <a
        href="#lien-he"
        className="sheen inline-flex shrink-0 items-center gap-1.5 bg-brass-500 px-3.5 py-3 text-[12px] font-semibold text-ink-950 active:scale-[0.98]"
      >
        {t("book")}
        <IconArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

/* ---------- nút về đầu trang kèm vòng tiến trình ---------- */
export function ScrollTop() {
  const { t } = useLocale();
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
          aria-label={t("backTop")}
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
export function ArticleModal({
  item,
  onClose,
  onRequireAccount,
}: {
  item: DocItem | null;
  onClose: () => void;
  onRequireAccount?: () => void;
}) {
  const { locale, t } = useLocale();
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
    // Đưa tiêu điểm vào panel để người dùng bàn phím ở trong hộp thoại, không
    // còn đứng ở nút đã bị lớp phủ che.
    panel.focus({ preventScroll: true });
    panel.addEventListener("scroll", updateProgress, { passive: true });
    return () => panel.removeEventListener("scroll", updateProgress);
  }, [item, readProgressRaw]);

  /*
   * Trả lại đúng giá trị cũ chứ không đặt về chuỗi rỗng: menu di động cũng khoá
   * cuộn theo cách này, nên nếu modal xoá trắng thuộc tính thì khoá của menu bị
   * gỡ mất khi đóng bài đọc.
   */
  useEffect(() => {
    if (!item) return;
    const previous = document.body.style.overflow;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      // Trả tiêu điểm về đúng thẻ bài vừa bấm, nếu không người dùng bàn phím bị
      // đẩy về đầu trang mỗi lần đóng bài đọc.
      opener?.focus?.({ preventScroll: true });
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
        >
          <motion.div
            key="panel"
            initial={{ y: 44, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.5, ease: EASE_LUXE }}
            ref={scrollRef}
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
            tabIndex={-1}
            className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-mist-300 bg-paper text-ink-900 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.75)] outline-none"
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
              aria-label={t("close")}
            >
              <IconClose className="h-4 w-4" />
            </button>
            <div className="border-b border-ink-900/10 bg-mist-100 px-7 py-4 sm:px-10">
              <div className="label text-[10px] text-ink-900/55">
                {item.kind === "news" ? t("news") : t("deepArticle")} ·{" "}
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
                {item.date} · {t("read")} {formatReadingTime(item.readMinutes, locale)}
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
                  <p className="label text-[10px] text-ink-900/50">{t("legalBasis")}</p>
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
                  {t("legalInfo")}
                </p>
                <Magnetic>
                  <a
                    href="#lien-he"
                    onClick={onClose}
                    className="sheen group inline-flex items-center gap-2 bg-ink-900 px-4 py-2.5 text-[13px] font-semibold text-snow transition-colors hover:bg-brass-600"
                  >
                    {t("askLawyer")}
                    <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </Magnetic>
              </motion.div>

              {/*
                Khối thảo luận nằm ngoài `variants={fadeUpSmall}` có chủ đích:
                nó tự nạp dữ liệu và tự dựng lại khi bình luận mới về, không nên
                chạy chung nhịp stagger với thân bài.
              */}
              {onRequireAccount && (
                <Comments
                  articleId={item.id}
                  articleKind={item.kind}
                  onRequireAccount={onRequireAccount}
                />
              )}
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

const SOCIAL_CHANNELS = [
  { label: "Discord", icon: IconDiscord },
  { label: "Instagram", icon: IconInstagram },
  { label: "LinkedIn", icon: IconLinkedin },
  { label: "Facebook", icon: IconFacebook },
];

export function Footer() {
  const { isEnglish, t } = useLocale();
  const onMove = useSpotlight<HTMLDivElement>();
  const footerServices = isEnglish
    ? ["Construction · Real Estate", "Litigation · Disputes", "Solar · Energy", "Corporate · Compliance", "Data Protection"]
    : FOOTER_SERVICES;
  const footerSystem: [string, string][] = isEnglish
    ? [["Legal insights", "#bai-viet"], ["Featured news", "#tin-tuc"], ["Legal library", "#van-ban"], ["Our lawyers", "#doi-ngu"], ["Fee schedule", "#bang-phi"]]
    : FOOTER_SYSTEM;
  const footerPolicy = isEnglish
    ? ["Service policy", "Privacy policy", "Privacy & cookies", "Conflicts of interest"]
    : FOOTER_POLICY;
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
                  <span className="label block text-[9px] text-fog-500">Law Firm · {t("scope")}</span>
                </span>
              </a>
              <p className="mt-5 max-w-sm text-[14.5px] leading-[1.75] text-fog-400">
                {isEnglish
                  ? "A specialist firm in construction and real estate, disputes, solar energy, corporate, compliance and personal data protection. Sound legal ground, durable foundations."
                  : "Hãng luật chuyên sâu về xây dựng và bất động sản, tố tụng, điện mặt trời, doanh nghiệp, tuân thủ và bảo vệ dữ liệu cá nhân. Pháp lý vững, nền móng bền."}
              </p>
            </Reveal>
            <Reveal delay={120}>
              <motion.div
                onPointerMove={onMove}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", ...SOFT }}
                className="spotlight mt-6 max-w-sm border border-snow/10 p-5"
              >
                  <p className="label text-[9.5px] text-brass-400">{isEnglish ? "Contact" : "Liên hệ"}</p>
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
                <p className="mt-3 text-[13px] leading-[1.7] text-fog-400">{isEnglish ? "Nguyen Thi Minh Khai, District 1, Ho Chi Minh City" : FIRM.office}</p>
                <p className="mt-1 text-[13px] text-fog-500">{isEnglish ? "Mon–Fri · 08:00–18:00" : FIRM.hours}</p>
              </motion.div>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-7">
                <p className="label text-[9.5px] text-brass-400">{isEnglish ? "Connect with LHPT" : "Kết nối với LHPT"}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                  {SOCIAL_CHANNELS.map(({ label, icon: SocialIcon }) => (
                    <button
                      key={label}
                      type="button"
                      disabled
                      aria-label={`${label} · ${t("socialComingSoon")}`}
                      title={`${label} · ${t("socialComingSoon")}`}
                      className="group flex items-center gap-2 border border-snow/10 px-3 py-2.5 text-left opacity-75 transition-colors hover:border-brass-500/50 disabled:cursor-not-allowed"
                    >
                      <SocialIcon className="h-4 w-4 shrink-0 text-fog-300 transition-colors group-hover:text-brass-300" />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-medium text-fog-300">{label}</span>
                        <span className="label block text-[8px] text-fog-500">{t("socialComingSoon")}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-2">
            <FooterColumn
              title={t("serviceFooter")}
              delay={60}
              items={footerServices.map((item) => [item, "#dich-vu"] as [string, string])}
            />
          </div>
          <div className="lg:col-span-2">
            <FooterColumn title={t("system")} delay={120} items={footerSystem} />
          </div>
          <div className="lg:col-span-3">
            <FooterColumn
              title={t("legalPrivacy")}
              delay={180}
              items={footerPolicy.map((item) => [item, "#chinh-sach"] as [string, string])}
            />
          </div>
        </div>
        <Reveal delay={100}>
          <div className="mt-12 flex flex-col gap-3 border-t border-snow/10 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="label text-[10px] text-fog-500">
              © 2026 LHPT Law Firm · {t("rights")}
            </p>
            <p className="max-w-xl text-[11.5px] leading-[1.7] text-fog-500">
              {t("footerDisclaimer")}
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
