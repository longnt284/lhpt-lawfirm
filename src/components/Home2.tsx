import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ARTICLES,
  ARTICLE_CATEGORIES,
  FIRM,
  LAWYERS,
  LEGAL_DOCS,
  LEGAL_FIELDS,
  NEWS,
  POLICIES_PRIVACY,
  POLICIES_SERVICE,
  SERVICES,
  type DocItem,
  type PolicyItem,
} from "../data";
import { useDebounced, useSpotlight } from "../hooks";
import { AREA_BY_SERVICE, backendReady, describeError, sb } from "../lib/supabase";
import {
  interpolate,
  localizeCategory,
  localizeDoc,
  localizeLegalDoc,
  localizeLawyer,
  localizePolicy,
  localizeService,
  localizeStatus,
  localizeType,
  formatReadingTime,
  useLocale,
} from "../i18n";
import { EASE_LUXE, SOFT, VIEWPORT, cardIn, fadeUpSmall, stagger } from "../motion";
import { Kicker, Reveal, SectionHead } from "./Chrome";
import { GoldRule, Magnetic } from "./Motion";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconChevron,
  IconClock,
  IconDoc,
  IconMail,
  IconPhone,
  IconPin,
  IconPlus,
  IconSearch,
  IconShield,
} from "./Icons";

/** Chuyển động đóng/mở dùng chung cho mọi khối gập trên trang. */
const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto" as const, opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.42, ease: EASE_LUXE },
};

/* ================= TIN TỨC PHÁP LÝ ================= */
export function News({ onOpen }: { onOpen: (d: DocItem) => void }) {
  const { locale, isEnglish, t } = useLocale();
  const [featuredRaw, ...restRaw] = NEWS;
  const featured = featuredRaw ? localizeDoc(featuredRaw, locale) : null;
  const rest = restRaw.map((item) => localizeDoc(item, locale));
  const onMove = useSpotlight<HTMLButtonElement>();
  if (!featured) return null;
  return (
    /*
      `data-chain-occluder` đánh dấu khối có nền đục che kín lớp nền 3D phía sau
      (xem ChainBackdrop). Nhờ nó lớp nền tự tắt đúng những đoạn không ai nhìn
      thấy nó, thay vì vẽ tiếp sau lưng một lớp sơn. Đổi khối này sang nền trong
      suốt thì nhớ bỏ thuộc tính đi.
    */
    <section
      id="tin-tuc"
      data-chain-occluder
      className="relative z-10 scroll-mt-24 bg-mist-100 py-24 text-ink-900"
    >
      <div className="bg-grid-light absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            tone="light"
            kicker={t("newsKicker")}
            title={
              <>
                {isEnglish ? (
                  <>Policy moves,<br /><span className="gilded-ink italic">before you have to ask.</span></>
                ) : (
                  <>Chuyển động chính sách,<br /><span className="gilded-ink italic">cập nhật trước khi bạn hỏi.</span></>
                )}
              </>
            }
          />
          <Reveal delay={150}>
            <p className="label text-[10px] text-ink-900/50">{NEWS.length} {isEnglish ? "published updates" : "tin đã đăng"}</p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <motion.button
              onClick={() => onOpen(featured)}
              onPointerMove={onMove}
              whileHover="hover"
              whileTap={{ scale: 0.995 }}
              className="spotlight group relative flex h-full w-full flex-col overflow-hidden bg-ink-900 p-8 text-left text-snow transition-shadow duration-500 hover:shadow-[0_45px_90px_-35px_rgba(10,20,32,0.75)] sm:p-10"
            >
              <motion.span
                variants={{ hover: { y: -6, scale: 1.02 } }}
                transition={{ type: "spring", ...SOFT }}
                className="absolute inset-0"
              />
              <motion.div
                variants={{ hover: { scale: 1.12, rotate: -4, opacity: 0.09 } }}
                transition={{ type: "spring", ...SOFT }}
                className="font-display pointer-events-none absolute -top-6 right-0 text-[9rem] leading-none font-bold text-snow/[0.04] select-none"
                aria-hidden="true"
              >
                §
              </motion.div>
              <span className="label relative w-fit border border-jade-500/50 px-2.5 py-1 text-[9.5px] text-jade-300">
                {t("featured")} · {localizeCategory(featured.category, locale)}
              </span>
              <h3 className="font-display relative mt-6 max-w-lg text-[1.4rem] leading-[1.3] font-semibold sm:text-[1.65rem]">
                {featured.title}
              </h3>
              <p className="relative mt-4 max-w-lg text-[14px] leading-[1.75] text-fog-300">
                {featured.excerpt}
              </p>
              <div className="relative mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
                <span className="label text-[10px] text-fog-500">
                  {featured.date} · {t("read")} {formatReadingTime(featured.readMinutes, locale)}
                </span>
                <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-brass-400 transition-all duration-300 group-hover:gap-3.5 group-hover:text-brass-300">
                  {isEnglish ? "Read news" : "Đọc tin"}
                  <IconArrowRight className="h-4 w-4" />
                </span>
              </div>
            </motion.button>
          </Reveal>
          <motion.div
            variants={stagger(0.07, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="lg:col-span-5"
          >
            {rest.map((n) => (
              <motion.button
                key={n.id}
                variants={fadeUpSmall}
                onClick={() => onOpen(n)}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", ...SOFT }}
                className="group flex w-full items-start justify-between gap-5 border-b border-ink-900/10 py-5 text-left transition-colors first:border-t"
              >
                <div>
                  <p className="label text-[9.5px] text-brass-700">
                    {n.date} · {localizeCategory(n.category, locale)} · {formatReadingTime(n.readMinutes, locale)}
                  </p>
                  <h4 className="mt-2 text-[14.5px] leading-[1.55] font-semibold text-ink-900 transition-colors duration-300 group-hover:text-brass-700">
                    {n.title}
                  </h4>
                </div>
                <IconArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-900/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brass-600" />
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ================= BÀI VIẾT PHÁP LÝ ================= */
const PAGE_SIZE = 12;

export function Articles({ onOpen }: { onOpen: (d: DocItem) => void }) {
  const { locale, contentVersion, isEnglish, t } = useLocale();
  const [cat, setCat] = useState<string>("Tất cả");
  const [q, setQ] = useState("");
  const query = useDebounced(q);
  const [shown, setShown] = useState(PAGE_SIZE);
  const onMove = useSpotlight<HTMLButtonElement>();

  /*
   * Dịch cả kho một lần cho mỗi ngôn ngữ, kèm sẵn chuỗi để dò tìm. Bản trước gọi
   * localizeDoc hai lượt cho từng bài (một lần trong filter, một lần trong map)
   * ngay trên mỗi phím gõ — tức 200 lần dựng lại object cho mỗi ký tự.
   */
  const corpus = useMemo(
    () =>
      ARTICLES.map((article) => {
        const localized = localizeDoc(article, locale);
        return {
          article,
          localized,
          haystack:
            `${article.title} ${article.excerpt} ${article.basis.join(" ")} ${localized.title} ${localized.excerpt}`.toLowerCase(),
        };
      }),
    // contentVersion: bản dịch tiếng Anh tới sau, phải tính lại kho khi nó về.
    [locale, contentVersion]
  );

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return corpus
      .filter(
        (entry) =>
          (cat === "Tất cả" || entry.article.category === cat) &&
          (needle === "" || entry.haystack.includes(needle))
      )
      .map((entry) => entry.localized);
  }, [corpus, cat, query]);

  // Đổi bộ lọc thì quay lại trang đầu, tránh trạng thái "đã mở rộng" dính lại.
  useEffect(() => {
    setShown(PAGE_SIZE);
  }, [cat, query, locale]);

  const visible = list.slice(0, shown);

  return (
    <section
      id="bai-viet"
      data-chain-occluder
      className="relative z-10 scroll-mt-24 bg-mist-50 py-24 text-ink-900"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead
          tone="light"
          kicker={t("articlesKicker")}
          title={
            <>
              {isEnglish ? (
                <>Short analysis,<br /><span className="gilded-ink italic">faster decisions.</span></>
              ) : (
                <>Phân tích ngắn,<br /><span className="gilded-ink italic">quyết định nhanh.</span></>
              )}
            </>
          }
          sub={t("articlesSub")}
        />

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center">
            <label className="relative lg:w-80">
              <span className="sr-only">{t("searchArticles")}</span>
              <IconSearch className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink-900/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("searchArticlesPlaceholder")}
                className="w-full border border-ink-900/15 bg-paper py-3 pr-4 pl-11 text-[13.5px] text-ink-900 placeholder-ink-900/40 transition-colors outline-none focus:border-brass-500"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {ARTICLE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={`label relative px-3.5 py-2 text-[10px] transition-colors duration-300 ${
                    cat === c
                      ? "text-snow"
                      : "border border-ink-900/15 text-ink-900/60 hover:border-brass-500 hover:text-brass-700"
                  }`}
                >
                  {/* Khối nền trượt sang mục vừa chọn thay vì nhảy cóc. */}
                  {cat === c && (
                    <motion.span
                      layoutId="article-chip"
                      className="absolute inset-0 -z-10 bg-ink-900 shadow-[0_10px_30px_-12px_rgba(10,20,32,0.5)]"
                      transition={{ type: "spring", stiffness: 400, damping: 36 }}
                    />
                  )}
                  {localizeCategory(c, locale)}
                </button>
              ))}
            </div>
            <span className="label text-[10px] text-ink-900/45 lg:ml-auto">
              {visible.length}/{list.length} {isEnglish ? "articles" : "bài viết"}
            </span>
          </div>
        </Reveal>

        {list.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-col items-center gap-3 border border-ink-900/10 bg-paper px-6 py-16 text-center"
          >
            <IconDoc className="h-8 w-8 text-ink-900/30" />
            <p className="text-[14px] text-ink-900/60">
              {t("noResults")}
            </p>
          </motion.div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {visible.map((a, i) => (
                <motion.button
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 22, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.55, ease: EASE_LUXE, delay: (i % 4) * 0.05 }}
                  whileHover={{ y: -8 }}
                  onClick={() => onOpen(a)}
                  onPointerMove={onMove}
                  className="spotlight group flex h-full w-full flex-col border border-mist-300 bg-paper p-6 text-left transition-[border-color,box-shadow] duration-500 hover:border-ink-900/70 hover:shadow-[0_30px_65px_-25px_rgba(10,20,32,0.4)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="label text-[9px] text-brass-700">{a.category}</span>
                    <span className="text-[10.5px] text-ink-900/45">
                      {formatReadingTime(a.readMinutes, locale)}
                    </span>
                  </div>
                  <h3 className="font-display mt-4 text-[15.5px] leading-[1.4] font-semibold text-ink-900 transition-colors duration-300 group-hover:text-brass-700">
                    {a.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-[1.65] text-ink-900/60">
                    {a.excerpt}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-900/10 pt-4">
                    <span className="text-[10.5px] text-ink-900/45">
                      {a.date} · {a.author}
                    </span>
                    <IconArrowUpRight className="h-4 w-4 shrink-0 text-ink-900/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brass-600" />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}

        {shown < list.length && (
          <Reveal delay={100}>
            <div className="mt-10 flex justify-center">
              <Magnetic>
                <button
                  onClick={() => setShown((n) => n + PAGE_SIZE)}
                  className="sheen group inline-flex items-center gap-2.5 border border-ink-900/20 px-7 py-3.5 text-[13.5px] font-semibold text-ink-900 transition-all duration-300 hover:border-brass-600 hover:text-brass-700"
                >
                  {t("loadMoreArticles").replace("{n}", String(Math.min(PAGE_SIZE, list.length - shown)))}
                  <IconChevron className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </button>
              </Magnetic>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ================= VĂN BẢN PHÁP LUẬT ================= */
const DOC_PAGE_SIZE = 12;

const STATUS_STYLE: Record<string, string> = {
  "Còn hiệu lực": "border-jade-500/40 text-jade-300",
  "Hết hiệu lực một phần": "border-brass-500/50 text-brass-300",
  "Hết hiệu lực": "border-fog-500/40 text-fog-400",
};

/** Nhãn rút gọn cho cột hẹp; trạng thái đầy đủ nằm trong phần mở rộng. */
const STATUS_SHORT: Record<string, string> = {
  "Còn hiệu lực": "Còn hiệu lực",
  "Hết hiệu lực một phần": "Hiệu lực một phần",
  "Hết hiệu lực": "Hết hiệu lực",
};

const STATUS_DOT: Record<string, string> = {
  "Còn hiệu lực": "bg-jade-500",
  "Hết hiệu lực một phần": "bg-brass-400",
  "Hết hiệu lực": "bg-fog-500",
};

export function Documents() {
  const { locale, contentVersion, isEnglish, t } = useLocale();
  const [q, setQ] = useState("");
  const query = useDebounced(q);
  const [field, setField] = useState("Tất cả");
  const [openId, setOpenId] = useState<string | null>(null);
  const [shown, setShown] = useState(DOC_PAGE_SIZE);

  const corpus = useMemo(
    () =>
      LEGAL_DOCS.map((doc) => {
        const localized = localizeLegalDoc(doc, locale);
        return {
          doc,
          localized,
          haystack:
            `${doc.code} ${doc.name} ${localized.name} ${doc.summary} ${localized.summary}`.toLowerCase(),
        };
      }),
    // contentVersion: xem chú thích ở Articles.
    [locale, contentVersion]
  );

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return corpus
      .filter(
        (entry) =>
          (field === "Tất cả" || entry.doc.field === field) &&
          (needle === "" || entry.haystack.includes(needle))
      )
      .map((entry) => entry.localized);
  }, [corpus, field, query]);

  useEffect(() => {
    setShown(DOC_PAGE_SIZE);
    setOpenId(null);
  }, [query, field, locale]);

  const visible = list.slice(0, shown);
  const expiredCount = useMemo(
    () => LEGAL_DOCS.filter((d) => d.status === "Hết hiệu lực").length,
    []
  );

  return (
    <section id="van-ban" className="relative z-10 scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            kicker={t("docsKicker")}
            title={
              <>
                {isEnglish ? (
                  <>Current law,<br /><span className="text-jade-400 italic">within a three-second scan.</span></>
                ) : (
                  <>Pháp luật hiện hành,<br /><span className="text-jade-400 italic">tra cứu trong ba giây.</span></>
                )}
              </>
            }
            sub={t("docsSub")}
          />
          <Reveal delay={150}>
            <div className="text-right">
              <p className="label text-[10px] text-fog-500">
                {String(list.length).padStart(2, "0")} / {LEGAL_DOCS.length} {isEnglish ? "instruments" : "văn bản"}
              </p>
              <p className="label mt-1.5 text-[10px] text-fog-500">
                {isEnglish ? `${expiredCount} repealed or superseded` : `Trong đó ${expiredCount} đã hết hiệu lực`}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <span className="sr-only">{t("searchDocs")}</span>
              <IconSearch className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-fog-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("searchDocsPlaceholder")}
                className="w-full border border-snow/12 bg-ink-850 py-3.5 pr-4 pl-11 text-[13.5px] text-snow placeholder-fog-500 transition-colors outline-none focus:border-jade-500"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {LEGAL_FIELDS.map((f) => (
                <button
                  key={f}
                  onClick={() => setField(f)}
                  aria-pressed={field === f}
                  className={`label relative px-3.5 py-2 text-[9.5px] transition-colors duration-300 ${
                    field === f
                      ? "text-ink-950"
                      : "border border-snow/15 text-fog-400 hover:border-jade-500/60 hover:text-jade-300"
                  }`}
                >
                  {field === f && (
                    <motion.span
                      layoutId="doc-chip"
                      className="absolute inset-0 -z-10 bg-jade-500"
                      transition={{ type: "spring", stiffness: 400, damping: 36 }}
                    />
                  )}
                  {localizeCategory(f, locale)}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-8 border border-snow/10 bg-ink-900/60">
            <div className="label hidden grid-cols-12 gap-3 border-b border-snow/10 px-6 py-3.5 text-[9.5px] text-fog-500 md:grid">
              <span className="col-span-2">{isEnglish ? "Number" : "Số hiệu"}</span>
              <span className="col-span-4">{isEnglish ? "Instrument" : "Văn bản"}</span>
              <span className="col-span-2">{isEnglish ? "Field" : "Lĩnh vực"}</span>
              <span className="col-span-2">{isEnglish ? "Effective" : "Hiệu lực"}</span>
              <span className="col-span-2 text-right">{isEnglish ? "Status" : "Tình trạng"}</span>
            </div>

            {list.length === 0 && (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <IconDoc className="h-8 w-8 text-fog-500" />
                <p className="text-[14px] text-fog-400">
                  {t("noResults")}
                </p>
              </div>
            )}

            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((d) => {
                const open = openId === d.id;
                const expired = d.status === "Hết hiệu lực";
                return (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.35, ease: EASE_LUXE }}
                    className={`border-b border-snow/8 transition-colors last:border-b-0 ${
                      open ? "border-l-2 border-l-jade-500 bg-ink-850" : "hover:bg-ink-850/60"
                    }`}
                  >
                    <button
                      onClick={() => setOpenId(open ? null : d.id)}
                      aria-expanded={open}
                      className="grid w-full grid-cols-1 items-start gap-1.5 px-5 py-4 text-left md:grid-cols-12 md:items-center md:gap-3 md:px-6"
                    >
                      <span
                        className={`code text-[12px] font-semibold md:col-span-2 ${
                          expired
                            ? "text-fog-500 line-through decoration-fog-500/50"
                            : "text-jade-400"
                        }`}
                      >
                        {d.code}
                      </span>
                      <span
                        className={`text-[13.5px] leading-[1.5] font-medium md:col-span-4 ${
                          expired ? "text-fog-400" : "text-snow"
                        }`}
                      >
                        {d.name}
                      </span>
                      <span className="text-[11.5px] text-fog-400 md:col-span-2">
                        {localizeType(d.type, locale)} · {localizeCategory(d.field, locale)}
                      </span>
                      <span className="code text-[11px] text-fog-400 md:col-span-2">
                        {d.effective}
                        {d.expired ? ` → ${d.expired}` : ""}
                      </span>
                      <span className="flex items-center gap-2 md:col-span-2 md:justify-end">
                        <span
                          className={`label inline-flex items-center gap-2 border px-2 py-1 text-[8.5px] leading-none whitespace-nowrap ${
                            STATUS_STYLE[d.status]
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[d.status]}`}
                          />
                          {localizeStatus(d.status, locale)}
                        </span>
                        <motion.span
                          animate={{ rotate: open ? 180 : 0 }}
                          transition={{ duration: 0.35, ease: EASE_LUXE }}
                          className="inline-flex"
                        >
                          <IconChevron
                            className={`h-4 w-4 shrink-0 ${open ? "text-jade-400" : "text-fog-500"}`}
                          />
                        </motion.span>
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div {...collapse} className="overflow-hidden">
                          <div className="px-5 pb-6 md:px-6">
                            <p className="max-w-3xl text-[13.5px] leading-[1.75] text-fog-300">
                              {d.summary}
                            </p>

                            {/* Điểm mới, điểm đáng chú ý của quy định */}
                            <div className="mt-5 border-l-2 border-brass-500/50 pl-4">
                              <p className="label text-[9.5px] text-brass-400">
                                {isEnglish ? "Key changes & highlights" : "Điểm mới & đáng chú ý"}
                              </p>
                              <ul className="mt-2.5 space-y-2">
                                {d.highlights.map((h) => (
                                  <li
                                    key={h}
                                    className="flex gap-2.5 text-[13px] leading-[1.7] text-fog-300"
                                  >
                                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass-500" />
                                    {h}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {d.replacedBy && (
                              <p className="mt-4 text-[12.5px] leading-[1.65] text-fog-400">
                                <span className="text-fog-500">{isEnglish ? "Replaced by: " : "Được thay thế bởi: "}</span>
                                <span className="text-jade-300">{d.replacedBy}</span>
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Reveal>

        {shown < list.length && (
          <Reveal delay={120}>
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShown((n) => n + DOC_PAGE_SIZE)}
                className="label border border-snow/20 px-5 py-3 text-[9.5px] text-fog-300 transition-colors duration-300 hover:border-jade-500 hover:text-jade-300"
              >
                {t("loadMoreDocs").replace("{n}", String(Math.min(DOC_PAGE_SIZE, list.length - shown)))}
              </button>
            </div>
          </Reveal>
        )}

        <Reveal delay={220}>
          <p className="label mt-5 text-[9.5px] text-fog-500">
            {t("docsFootnote")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= ĐỘI NGŨ ================= */
/** Lấy chữ cái đầu của tên riêng để dựng ô chân dung tạm khi chưa có ảnh. */
function initials(name: string): string {
  const parts = name.replace(/^(LS\.|Lawyer)\s*/, "").trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Team() {
  const { locale, isEnglish, t } = useLocale();
  const onMove = useSpotlight<HTMLElement>();
  const lawyers = LAWYERS.map((lawyer) => localizeLawyer(lawyer, locale));
  return (
    <section id="doi-ngu" className="relative z-10 scroll-mt-24 bg-ink-900/70 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead
          kicker={t("teamKicker")}
          title={
            <>
              {isEnglish ? (
                <>The counsel responsible<br /><span className="gilded italic">for every file.</span></>
              ) : (
                <>Người chịu trách nhiệm<br /><span className="gilded italic">trên từng hồ sơ.</span></>
              )}
            </>
          }
          sub={t("teamSub")}
        />
        <motion.div
          variants={stagger(0.09)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {lawyers.map((l) => (
            <motion.article
              key={l.id}
              variants={cardIn}
              whileHover="hover"
              onPointerMove={onMove}
              className="spotlight group relative flex h-full flex-col overflow-hidden border border-snow/10 bg-ink-850 transition-[border-color,box-shadow] duration-500 hover:border-brass-500/50 hover:shadow-[0_35px_75px_-30px_rgba(201,164,76,0.45)]"
            >
              <motion.div
                variants={{ hover: { y: -8 } }}
                transition={{ type: "spring", ...SOFT }}
                className="flex h-full flex-col"
              >
                {/*
                  Ô chân dung để trống có chủ đích: ảnh của bốn luật sư sẽ được bổ
                  sung sau. Khi có ảnh, chỉ cần điền `img` trong src/data.ts.
                */}
                <div className="relative aspect-[4/5] overflow-hidden border-b border-snow/10 bg-ink-800">
                  {l.img ? (
                    <motion.img
                      src={l.img}
                      alt={l.name}
                      loading="lazy"
                      variants={{ hover: { scale: 1.06 } }}
                      transition={{ duration: 0.8, ease: EASE_LUXE }}
                      className="h-full w-full object-cover grayscale-[45%] transition-[filter] duration-700 group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="bg-grid absolute inset-0 flex items-center justify-center">
                      <motion.span
                        variants={{ hover: { scale: 1.08 } }}
                        transition={{ type: "spring", ...SOFT }}
                        className="font-display text-[3.4rem] leading-none font-bold text-snow/12 transition-colors duration-500 group-hover:text-brass-400/30"
                        aria-hidden="true"
                      >
                        {initials(l.name)}
                      </motion.span>
                    </div>
                  )}
                  <span className="label absolute top-4 left-4 border border-snow/20 bg-ink-950/60 px-2 py-1 text-[9px] text-fog-300 backdrop-blur-sm">
                    {l.years}
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-5 pt-5 pb-6">
                  <h3 className="font-display text-[1.05rem] leading-[1.3] font-semibold text-snow">
                    {l.name}
                  </h3>
                  <p className="label mt-1.5 text-[9.5px] text-brass-400">{l.role}</p>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {l.focus.map((f) => (
                      <span
                        key={f}
                        className="label border border-snow/12 px-2 py-0.5 text-[8.5px] text-fog-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`mailto:${l.email}`}
                    className="mt-auto inline-flex items-center gap-2 pt-4 text-[12px] break-all text-fog-400 transition-colors hover:text-jade-300"
                  >
                    <IconMail className="h-3.5 w-3.5 shrink-0" />
                    {l.email}
                  </a>
                </div>
              </motion.div>
            </motion.article>
          ))}
        </motion.div>
        <Reveal delay={200}>
          <div className="mt-10 flex justify-center">
            <Kicker rule={false}>
              <span className="text-[10px] text-fog-500">
                {isEnglish ? `Practising within ${t("scope")}` : `Hành nghề trong phạm vi ${t("scope")}`}
              </span>
            </Kicker>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= CHÍNH SÁCH & BẢO MẬT ================= */
function Accordion({ items }: { items: PolicyItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      {items.map((it, i) => (
        <div key={it.q} className="border-b border-ink-900/10">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="group flex w-full items-center justify-between gap-4 py-4 text-left"
          >
            <span className="font-display text-[14.5px] leading-[1.5] font-semibold text-ink-900 transition-colors duration-300 group-hover:text-brass-700">
              {it.q}
            </span>
            <motion.span
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.35, ease: EASE_LUXE }}
              className={`shrink-0 border border-ink-900/20 p-1.5 transition-colors duration-300 ${
                open === i ? "border-brass-600 text-brass-700" : "text-ink-900/50"
              }`}
            >
              <IconPlus className="h-3.5 w-3.5" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div {...collapse} className="overflow-hidden">
                <p className="pr-10 pb-5 text-[13.5px] leading-[1.8] text-ink-900/68">{it.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function Policies() {
  const { locale, isEnglish, t } = useLocale();
  const servicePolicies = POLICIES_SERVICE.map((item) => localizePolicy(item, locale));
  const privacyPolicies = POLICIES_PRIVACY.map((item) => localizePolicy(item, locale));
  return (
    <section
      id="chinh-sach"
      data-chain-occluder
      className="relative z-10 scroll-mt-24 bg-mist-100 py-24 text-ink-900"
    >
      <div className="bg-grid-light absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead
          tone="light"
          kicker={t("policiesKicker")}
          title={
            <>
              {isEnglish ? (
                <>Transparent in the way<br /><span className="gilded-ink italic">we structure our fees.</span></>
              ) : (
                <>Minh bạch như cách<br /><span className="gilded-ink italic">chúng tôi tính phí.</span></>
              )}
            </>
          }
          sub={isEnglish ? "Service, confidentiality and privacy policies written for clients to read — not for lawyers to hide behind." : "Chính sách dịch vụ, bảo mật và quyền riêng tư, viết để khách hàng đọc chứ không phải để luật sư né trách nhiệm."}
        />
        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="border-t-2 border-brass-500 pt-6">
              <div className="flex items-center gap-3">
                <IconDoc className="h-5 w-5 shrink-0 text-brass-700" />
                <h3 className="font-display text-[1.05rem] font-semibold">{t("servicePolicy")}</h3>
              </div>
              <div className="mt-5">
                <Accordion items={servicePolicies} />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="border-t-2 border-jade-500 pt-6">
              <div className="flex items-center gap-3">
                <IconShield className="h-5 w-5 shrink-0 text-jade-600" />
                <h3 className="font-display text-[1.05rem] font-semibold">
                  {t("privacyPolicy")}
                </h3>
              </div>
              <div className="mt-5">
                <Accordion items={privacyPolicies} />
              </div>
            </div>
          </Reveal>
        </div>
        <motion.div
          variants={stagger(0.07, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="mt-12 flex flex-wrap items-center gap-3"
        >
          {[
            ...(isEnglish ? ["Strictly confidential files", "No data sharing", "Compliant with the Law on Personal Data Protection 2025"] : ["Bảo mật hồ sơ tuyệt đối", "Không chia sẻ dữ liệu", "Tuân thủ Luật Bảo vệ dữ liệu cá nhân 2025"]),
            `DPO: ${FIRM.dpoEmail}`,
          ].map((t) => (
            <motion.span
              key={t}
              variants={fadeUpSmall}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", ...SOFT }}
              className="label border border-ink-900/15 px-3.5 py-2 text-[9.5px] text-ink-900/60"
            >
              {t}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ================= LIÊN HỆ ================= */
const AREAS = [...SERVICES.map((s) => s.title), "Gói pháp chế thường niên"];

export function SecondaryContent({ onOpen }: { onOpen: (d: DocItem) => void }) {
  return (
    <>
      <News onOpen={onOpen} />
      <Articles onOpen={onOpen} />
      <Documents />
      <Team />
      <Policies />
      <Contact />
    </>
  );
}

export function Contact() {
  const { locale, isEnglish, t } = useLocale();
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", area: AREAS[0], msg: "" });
  // Bẫy mật ong: người dùng thật không bao giờ thấy ô này nên không bao giờ điền.
  const [trap, setTrap] = useState("");
  // Handler gắn cho cả <a> và <div>, nên khai báo ở mức HTMLElement.
  const onMove = useSpotlight<HTMLElement>();

  /*
   * Gửi thẳng vào bảng contact_requests thay vì mở mailto.
   *
   * mailto phụ thuộc vào việc máy khách có trình soạn thư hay không, và yêu cầu
   * gửi đi thì hãng không có bản ghi nào để đối chiếu. Trigger
   * guard_contact_request() ở phía cơ sở dữ liệu lo giới hạn tần suất theo băm
   * địa chỉ IP và chấm điểm nội dung rác trước khi ghi.
   */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (trap) return; // im lặng bỏ qua trình gửi rác tự động
    setError("");
    setSent("");

    if (!backendReady) {
      // Chưa cấu hình backend thì vẫn phải có đường liên hệ, quay về mailto.
      const subject = encodeURIComponent(
        `[LHPT] ${form.area} — ${form.name || (isEnglish ? "Client" : "Khách hàng")}`
      );
      const body = encodeURIComponent(
        isEnglish
          ? `Contact: ${form.name}\nPhone/Email: ${form.phone}\nPractice area: ${form.area}\n\nMatter details:\n${form.msg}`
          : `Liên hệ: ${form.name}\nSĐT/Email: ${form.phone}\nLĩnh vực: ${form.area}\n\nNội dung:\n${form.msg}`
      );
      window.location.href = `mailto:${FIRM.email}?subject=${subject}&body=${body}`;
      setSent(isEnglish ? "Email composer opened." : "Đã mở trình soạn email.");
      return;
    }

    setBusy(true);
    try {
      const contact = form.phone.trim();
      const looksLikeEmail = contact.includes("@");
      const client = await sb();
      const { data, error: err } = await client
        .from("contact_requests")
        .insert({
          full_name: form.name.trim(),
          contact,
          email: looksLikeEmail ? contact : null,
          phone: looksLikeEmail ? null : contact,
          practice_area: AREA_BY_SERVICE[form.area] ?? "other",
          message: form.msg.trim() || null,
          locale,
          source: "website_contact",
          user_agent: navigator.userAgent.slice(0, 500),
        })
        .select("reference")
        .maybeSingle();

      if (err) {
        setError(describeError(err, locale));
        return;
      }
      const reference = (data as { reference?: string } | null)?.reference;
      setSent(
        isEnglish
          ? `Enquiry received${reference ? ` · ref ${reference}` : ""} — we will respond within 24 hours.`
          : `Đã nhận yêu cầu${reference ? ` · mã ${reference}` : ""} — chúng tôi phản hồi trong 24 giờ.`
      );
      setForm({ name: "", phone: "", area: AREAS[0], msg: "" });
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full border border-snow/12 bg-ink-900 px-3.5 py-3 text-[14px] text-snow placeholder-fog-500 outline-none transition-colors focus:border-brass-500";

  const areaOptions = [
    ...SERVICES.map((service) => ({ value: service.title, label: localizeService(service, locale).title })),
    { value: "Gói pháp chế thường niên", label: isEnglish ? "Annual legal support plan" : "Gói pháp chế thường niên" },
  ];
  const cards = [
    { icon: IconPhone, label: t("hotline"), value: FIRM.hotline, href: FIRM.hotlineHref, jade: false },
    { icon: IconMail, label: "Email", value: FIRM.email, href: `mailto:${FIRM.email}`, jade: false },
    { icon: IconPin, label: t("office"), value: isEnglish ? "Nguyen Thi Minh Khai, District 1" : FIRM.officeShort, href: undefined, jade: true },
    { icon: IconClock, label: t("workHours"), value: isEnglish ? "Mon–Fri · 08:00–18:00" : FIRM.hours, href: undefined, jade: true },
  ];

  return (
    <section id="lien-he" className="relative z-10 scroll-mt-24 overflow-hidden py-24">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-jade-500/8 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <SectionHead
              kicker={t("contactKicker")}
              title={
                <>
                  {isEnglish ? (
                    <>Need the right legal decision<br /><span className="gilded italic">at the right time?</span></>
                  ) : (
                    <>Cần một quyết định<br />pháp lý <span className="gilded italic">đúng lúc?</span></>
                  )}
                </>
              }
              sub={interpolate(t("contactSub"), { time: isEnglish ? "24 business hours" : FIRM.responseTime })}
            />
            <motion.div
              variants={stagger(0.08, 0.1)}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
              className="mt-10 grid gap-4 sm:grid-cols-2"
            >
              {cards.map((c) => {
                const inner = (
                  <>
                    <c.icon
                      className={`h-5 w-5 shrink-0 ${c.jade ? "text-jade-400" : "text-brass-400"}`}
                    />
                    <p className="label mt-4 text-[9.5px] text-fog-500">{c.label}</p>
                    <p className="mt-1.5 text-[14.5px] leading-[1.55] font-semibold text-snow transition-colors group-hover:text-brass-300">
                      {c.value}
                    </p>
                  </>
                );
                const cls = `spotlight ${
                  c.jade ? "spotlight-jade" : ""
                } group block border border-snow/12 bg-ink-850 p-5 transition-colors duration-300 ${
                  c.jade ? "hover:border-jade-500/60" : "hover:border-brass-500/60"
                }`;
                const motionProps = {
                  variants: cardIn,
                  whileHover: { y: -6 },
                  transition: { type: "spring" as const, ...SOFT },
                  onPointerMove: onMove,
                  className: cls,
                };
                return c.href ? (
                  <motion.a key={c.label} href={c.href} {...motionProps}>
                    {inner}
                  </motion.a>
                ) : (
                  <motion.div key={c.label} {...motionProps}>
                    {inner}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          <Reveal delay={140} className="lg:col-span-6">
            <form
              onSubmit={submit}
              className="relative border border-snow/12 bg-ink-850 p-7 shadow-[0_40px_100px_-45px_rgba(0,0,0,0.9)] sm:p-9"
            >
              <p className="label text-[10px] text-brass-400">{isEnglish ? "Consultation enquiry" : "Yêu cầu tư vấn"}</p>
              <GoldRule className="mt-3 w-14" />
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label mb-2 block text-[9.5px] text-fog-400" htmlFor="ct-name">
                    {t("name")}
                  </label>
                  <input
                    id="ct-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("namePlaceholder")}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="label mb-2 block text-[9.5px] text-fog-400" htmlFor="ct-phone">
                    {t("phoneEmail")}
                  </label>
                  <input
                    id="ct-phone"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder={t("phonePlaceholder")}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="mt-5">
                <label className="label mb-2 block text-[9.5px] text-fog-400" htmlFor="ct-area">
                  {isEnglish ? "Practice area" : "Lĩnh vực"}
                </label>
                <select
                  id="ct-area"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className={`${inputCls} appearance-none`}
                >
                  {areaOptions.map((o) => (
                    <option key={o.value} value={o.value} className="bg-ink-900">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-5">
                <label className="label mb-2 block text-[9.5px] text-fog-400" htmlFor="ct-msg">
                  {t("message")}
                </label>
                <textarea
                  id="ct-msg"
                  rows={4}
                  value={form.msg}
                  onChange={(e) => setForm({ ...form, msg: e.target.value })}
                  placeholder={t("messagePlaceholder")}
                  className={`${inputCls} resize-none`}
                />
              </div>
              {/*
                Bẫy mật ong. Đặt ngoài khung nhìn thay vì display:none, vì nhiều
                bot bỏ qua trường bị ẩn hoàn toàn nhưng vẫn điền trường có nhãn.
              */}
              <div
                className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
                aria-hidden="true"
              >
                <label htmlFor="ct-company-url">Company URL</label>
                <input
                  id="ct-company-url"
                  name="company_url"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={trap}
                  onChange={(e) => setTrap(e.target.value)}
                />
              </div>

              <motion.button
                type="submit"
                disabled={busy}
                whileHover={{ y: busy ? 0 : -2 }}
                whileTap={{ scale: busy ? 1 : 0.985 }}
                transition={{ type: "spring", ...SOFT }}
                className="sheen group mt-7 inline-flex w-full items-center justify-center gap-2.5 bg-brass-500 px-6 py-4 text-[14px] font-semibold text-ink-950 transition-colors duration-300 hover:bg-brass-400 hover:shadow-[0_15px_45px_-12px_rgba(201,164,76,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? t("loading") : t("sendRequest")}
                <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.button>
              <AnimatePresence>
                {sent && (
                  <motion.p
                    key="ok"
                    role="status"
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: EASE_LUXE }}
                    className="mt-4 flex items-start gap-2 overflow-hidden text-[12.5px] leading-[1.6] text-jade-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jade-500" />
                    {sent}
                  </motion.p>
                )}
                {error && (
                  <motion.p
                    key="err"
                    role="alert"
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: EASE_LUXE }}
                    className="mt-4 flex items-start gap-2 overflow-hidden text-[12.5px] leading-[1.6] text-[#f2a2a2]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e07070]" />
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
