import { useMemo, useState, type FormEvent } from "react";
import {
  ARTICLES,
  LAWYERS,
  LEGAL_DOCS,
  NEWS,
  POLICIES_PRIVACY,
  POLICIES_SERVICE,
  type DocItem,
  type PolicyItem,
} from "../data";
import { Reveal, SectionHead } from "./Chrome";
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

/* ================= TIN TỨC PHÁP LÝ ================= */
export function News({ onOpen }: { onOpen: (d: DocItem) => void }) {
  const featured = NEWS[0];
  const rest = NEWS.slice(1);
  return (
    <section id="tin-tuc" className="relative z-10 scroll-mt-24 bg-mist-100 py-24 text-ink-900">
      <div className="bg-grid-light absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            tone="light"
            kicker="Tin pháp lý nổi bật"
            title={
              <>
                Chuyển động chính sách,
                <br />
                <span className="text-brass-600">cập nhật trước khi bạn hỏi.</span>
              </>
            }
          />
          <Reveal delay={150}>
            <p className="font-mono text-[10px] tracking-[0.25em] text-ink-900/50 uppercase">
              {NEWS.length} tin · Cập nhật tuần này
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <button
              onClick={() => onOpen(featured)}
              className="group relative flex h-full w-full flex-col overflow-hidden bg-ink-900 p-8 text-left text-snow transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_80px_-30px_rgba(10,20,32,0.6)] sm:p-10"
            >
              <div
                className="font-display pointer-events-none absolute -top-8 -right-2 text-[11rem] leading-none font-black text-snow/[0.04] select-none"
                aria-hidden="true"
              >
                §
              </div>
              <span className="font-mono w-fit border border-jade-500/50 px-2.5 py-1 text-[10px] tracking-[0.22em] text-jade-300 uppercase">
                Nổi bật · {featured.category}
              </span>
              <h3 className="font-display mt-6 max-w-lg text-2xl leading-tight font-black tracking-tight sm:text-[1.8rem]">
                {featured.title}
              </h3>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-fog-300">
                {featured.excerpt}
              </p>
              <div className="mt-auto flex items-center justify-between pt-8">
                <span className="font-mono text-[11px] tracking-widest text-fog-500 uppercase">
                  {featured.date} · Đọc {featured.read}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-brass-400 transition-all group-hover:gap-3.5 group-hover:text-brass-300">
                  Đọc tin
                  <IconArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          </Reveal>
          <div className="lg:col-span-5">
            {rest.map((n, i) => (
              <Reveal key={n.id} delay={i * 80}>
                <button
                  onClick={() => onOpen(n)}
                  className="group flex w-full items-start justify-between gap-5 border-b border-ink-900/10 py-5 text-left transition-colors first:border-t"
                >
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.22em] text-brass-600 uppercase">
                      {n.date} · {n.category}
                    </p>
                    <h4 className="mt-2 text-[15px] leading-snug font-semibold text-ink-900 transition-colors group-hover:text-brass-700">
                      {n.title}
                    </h4>
                  </div>
                  <IconArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-900/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brass-600" />
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= BÀI VIẾT PHÁP LÝ ================= */
const CATEGORIES = ["Tất cả", "Bất động sản", "Tố tụng", "Năng lượng", "Thương mại"];

export function Articles({ onOpen }: { onOpen: (d: DocItem) => void }) {
  const [cat, setCat] = useState("Tất cả");
  const list = useMemo(
    () => (cat === "Tất cả" ? ARTICLES : ARTICLES.filter((a) => a.category === cat)),
    [cat]
  );
  return (
    <section id="bai-viet" className="relative z-10 scroll-mt-24 bg-mist-50 py-24 text-ink-900">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead
          tone="light"
          kicker="Bài viết chuyên sâu"
          title={
            <>
              Phân tích ngắn,
              <br />
              <span className="text-brass-600">quyết định nhanh.</span>
            </>
          }
          sub="Mỗi bài viết dưới 8 phút đọc — đúng phần doanh nghiệp cần trước khi ký."
        />
        <Reveal delay={120}>
          <div className="mt-10 flex flex-wrap items-center gap-2.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`font-mono px-4 py-2 text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-300 ${
                  cat === c
                    ? "bg-ink-900 text-snow shadow-[0_10px_30px_-12px_rgba(10,20,32,0.5)]"
                    : "border border-ink-900/15 text-ink-900/60 hover:border-brass-500 hover:text-brass-700"
                }`}
              >
                {c}
              </button>
            ))}
            <span className="font-mono ml-auto text-[10px] tracking-[0.22em] text-ink-900/45 uppercase">
              {String(list.length).padStart(2, "0")} bài viết
            </span>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {list.map((a, i) => (
            <Reveal key={a.id} delay={(i % 4) * 80} className="h-full">
              <button
                onClick={() => onOpen(a)}
                className="group flex h-full w-full flex-col border border-mist-300 bg-paper p-6 text-left transition-all duration-500 hover:-translate-y-1.5 hover:border-ink-900 hover:shadow-[0_25px_60px_-25px_rgba(10,20,32,0.35)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-brass-600 uppercase">
                    {a.category}
                  </span>
                  <span className="font-mono text-[10px] text-ink-900/40">{a.read}</span>
                </div>
                <h3 className="font-display mt-4 text-[16px] leading-snug font-bold tracking-tight text-ink-900 transition-colors group-hover:text-brass-700">
                  {a.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-900/60">
                  {a.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-ink-900/10 pt-4 text-[11px]">
                  <span className="font-mono text-ink-900/45">{a.date} · {a.author}</span>
                  <IconArrowUpRight className="h-4 w-4 text-ink-900/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brass-600" />
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= VĂN BẢN PHÁP LUẬT ================= */
export function Documents() {
  const fields = useMemo(
    () => ["Tất cả", ...Array.from(new Set(LEGAL_DOCS.map((d) => d.field)))],
    []
  );
  const [q, setQ] = useState("");
  const [field, setField] = useState("Tất cả");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(
    () =>
      LEGAL_DOCS.filter(
        (d) =>
          (field === "Tất cả" || d.field === field) &&
          `${d.code} ${d.name}`.toLowerCase().includes(q.trim().toLowerCase())
      ),
    [q, field]
  );

  return (
    <section id="van-ban" className="relative z-10 scroll-mt-24 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            kicker="Hệ thống văn bản"
            title={
              <>
                Pháp luật hiện hành,
                <br />
                <span className="text-jade-400">tra cứu trong 3 giây.</span>
              </>
            }
            sub="Các văn bản trụ cột cho xây dựng — bất động sản, năng lượng và thương mại, kèm hiệu lực và tóm tắt phạm vi."
          />
          <Reveal delay={150}>
            <p className="font-mono text-[10px] tracking-[0.25em] text-fog-500 uppercase">
              {String(list.length).padStart(2, "0")} / {LEGAL_DOCS.length} văn bản
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <IconSearch className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-fog-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên hoặc số hiệu — vd: 31/2024, DPPA, đất đai…"
                className="w-full border border-snow/12 bg-ink-850 py-3.5 pr-4 pl-11 text-sm text-snow placeholder-fog-500 transition-colors outline-none focus:border-jade-500"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {fields.map((f) => (
                <button
                  key={f}
                  onClick={() => setField(f)}
                  className={`font-mono px-3.5 py-2 text-[10px] font-medium tracking-[0.15em] uppercase transition-all duration-300 ${
                    field === f
                      ? "bg-jade-500 text-ink-950"
                      : "border border-snow/15 text-fog-400 hover:border-jade-500/60 hover:text-jade-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-8 border border-snow/10 bg-ink-900/60">
            {/* header desktop */}
            <div className="font-mono hidden grid-cols-12 gap-3 border-b border-snow/10 px-6 py-3.5 text-[10px] tracking-[0.2em] text-fog-500 uppercase md:grid">
              <span className="col-span-2">Số hiệu</span>
              <span className="col-span-4">Văn bản</span>
              <span className="col-span-1">Loại</span>
              <span className="col-span-2">Lĩnh vực</span>
              <span className="col-span-2">Hiệu lực</span>
              <span className="col-span-1 text-right">Mở</span>
            </div>

            {list.length === 0 && (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <IconDoc className="h-8 w-8 text-fog-500" />
                <p className="text-sm text-fog-400">
                  Không tìm thấy văn bản phù hợp — thử từ khóa hoặc lĩnh vực khác.
                </p>
              </div>
            )}

            {list.map((d) => {
              const open = openId === d.id;
              return (
                <div
                  key={d.id}
                  className={`border-b border-snow/8 transition-colors last:border-b-0 ${
                    open ? "border-l-2 border-l-jade-500 bg-ink-850" : "hover:bg-ink-850/60"
                  }`}
                >
                  <button
                    onClick={() => setOpenId(open ? null : d.id)}
                    className="relative grid w-full grid-cols-1 items-start gap-1 px-5 py-4 text-left md:grid-cols-12 md:items-center md:gap-3 md:px-6"
                  >
                    <span className="font-mono text-xs font-bold text-jade-400 md:col-span-2">
                      {d.code}
                    </span>
                    <span className="mt-0.5 text-sm font-semibold text-snow md:col-span-4 md:mt-0">
                      {d.name}
                    </span>
                    <span className="mt-2 md:col-span-1 md:mt-0">
                      <span className="font-mono border border-snow/15 px-2 py-0.5 text-[9px] tracking-[0.15em] text-fog-300 uppercase">
                        {d.type}
                      </span>
                    </span>
                    <span className="font-mono mt-2 text-[11px] text-fog-400 md:col-span-2 md:mt-0">
                      {d.field}
                    </span>
                    <span className="font-mono mt-1 text-[11px] text-fog-400 md:col-span-2 md:mt-0">
                      {d.effective}
                    </span>
                    <span className="absolute right-5 hidden md:col-span-1 md:block">
                      <IconChevron
                        className={`ml-auto h-4 w-4 text-fog-500 transition-transform duration-300 ${
                          open ? "rotate-180 text-jade-400" : ""
                        }`}
                      />
                    </span>
                    <IconChevron
                      className={`mt-1 h-4 w-4 text-fog-500 transition-transform duration-300 md:hidden ${
                        open ? "rotate-180 text-jade-400" : ""
                      }`}
                    />
                  </button>
                  <div className={`acc-body ${open ? "open" : ""}`}>
                    <div className="acc-inner">
                      <div className="px-5 pb-5 md:px-6">
                        <p className="max-w-3xl text-[13.5px] leading-relaxed text-fog-300">
                          {d.summary}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className={`font-mono flex items-center gap-2 border px-2.5 py-1 text-[9px] tracking-[0.18em] uppercase ${
                              d.status === "Còn hiệu lực"
                                ? "border-jade-500/40 text-jade-300"
                                : "border-brass-500/50 text-brass-300"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                d.status === "Còn hiệu lực" ? "bg-jade-500" : "bg-brass-400"
                              }`}
                            />
                            {d.status}
                          </span>
                          <span className="font-mono border border-snow/12 px-2.5 py-1 text-[9px] tracking-[0.18em] text-fog-400 uppercase">
                            Hiệu lực {d.effective}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
        <Reveal delay={220}>
          <p className="font-mono mt-5 text-[10px] tracking-[0.18em] text-fog-500 uppercase">
            * Tổng hợp phục vụ tham khảo · Đối chiếu công báo trước khi áp dụng
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= ĐỘI NGŨ ================= */
export function Team() {
  return (
    <section id="doi-ngu" className="relative z-10 scroll-mt-24 bg-ink-900/70 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead
          kicker="Đội ngũ luật sư"
          title={
            <>
              Người chịu trách nhiệm
              <br />
              <span className="text-brass-400">trên từng hồ sơ.</span>
            </>
          }
          sub="Bốn luật sư trưởng — bốn chuyên ngành. Hồ sơ của bạn luôn có một cái tên chịu trách nhiệm đến cùng."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LAWYERS.map((l, i) => (
            <Reveal key={l.id} delay={i * 90}>
              <article className="group relative overflow-hidden border border-snow/10 bg-ink-850 transition-all duration-500 hover:-translate-y-1.5 hover:border-brass-500/50 hover:shadow-[0_30px_70px_-30px_rgba(201,164,76,0.4)]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={l.img}
                    alt={l.name}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale-[55%] contrast-105 transition-all duration-700 group-hover:scale-[1.05] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950 via-ink-950/55 to-transparent" />
                  <span className="font-mono absolute top-4 left-4 border border-snow/20 bg-ink-950/60 px-2 py-1 text-[9px] tracking-[0.2em] text-fog-300 uppercase backdrop-blur-sm">
                    {l.years}
                  </span>
                </div>
                <div className="relative -mt-16 px-5 pb-6">
                  <h3 className="font-display text-lg font-black tracking-tight text-snow">
                    {l.name}
                  </h3>
                  <p className="font-mono mt-1.5 text-[10px] tracking-[0.18em] text-brass-400 uppercase">
                    {l.role}
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {l.focus.map((f) => (
                      <span
                        key={f}
                        className="font-mono border border-snow/12 px-2 py-0.5 text-[9px] tracking-[0.12em] text-fog-300 uppercase"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`mailto:${l.email}`}
                    className="mt-4 inline-flex items-center gap-2 text-[12px] text-fog-400 transition-colors hover:text-jade-300"
                  >
                    <IconMail className="h-3.5 w-3.5" />
                    {l.email}
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <p className="font-mono mt-10 text-center text-[11px] tracking-[0.22em] text-fog-500 uppercase">
            + 20 luật sư &amp; chuyên viên tại hai văn phòng
          </p>
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
            className="group flex w-full items-center justify-between gap-4 py-4.5 text-left"
          >
            <span className="font-display text-[15px] font-bold tracking-wide text-ink-900 transition-colors group-hover:text-brass-700">
              {it.q}
            </span>
            <span
              className={`shrink-0 border border-ink-900/20 p-1.5 transition-all duration-300 ${
                open === i ? "rotate-45 border-brass-600 text-brass-600" : "text-ink-900/50"
              }`}
            >
              <IconPlus className="h-3.5 w-3.5" />
            </span>
          </button>
          <div className={`acc-body ${open === i ? "open" : ""}`}>
            <div className="acc-inner">
              <p className="pr-10 pb-5 text-sm leading-relaxed text-ink-900/65">{it.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Policies() {
  return (
    <section id="chinh-sach" className="relative z-10 scroll-mt-24 bg-mist-100 py-24 text-ink-900">
      <div className="bg-grid-light absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHead
          tone="light"
          kicker="Cam kết & quyền riêng tư"
          title={
            <>
              Minh bạch như cách
              <br />
              <span className="text-brass-600">chúng tôi tính phí.</span>
            </>
          }
          sub="Chính sách dịch vụ, bảo mật và quyền riêng tư — viết để khách hàng đọc, không phải để luật sư né trách nhiệm."
        />
        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="border-t-2 border-brass-500 pt-6">
              <div className="flex items-center gap-3">
                <IconDoc className="h-5 w-5 text-brass-600" />
                <h3 className="font-display text-lg font-black tracking-tight uppercase">
                  Chính sách dịch vụ
                </h3>
              </div>
              <div className="mt-5">
                <Accordion items={POLICIES_SERVICE} />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="border-t-2 border-jade-500 pt-6">
              <div className="flex items-center gap-3">
                <IconShield className="h-5 w-5 text-jade-600" />
                <h3 className="font-display text-lg font-black tracking-tight uppercase">
                  Bảo mật &amp; riêng tư
                </h3>
              </div>
              <div className="mt-5">
                <Accordion items={POLICIES_PRIVACY} />
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal delay={160}>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            {["Bảo mật hồ sơ tuyệt đối", "Không chia sẻ dữ liệu", "Tuân thủ Luật An ninh mạng", "DPO: dpo@kienphap.law"].map(
              (t) => (
                <span
                  key={t}
                  className="font-mono border border-ink-900/15 px-3.5 py-2 text-[10px] tracking-[0.18em] text-ink-900/60 uppercase"
                >
                  {t}
                </span>
              )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= LIÊN HỆ ================= */
export function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", area: "Xây dựng — Bất động sản", msg: "" });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Kiến Pháp] ${form.area} — ${form.name || "Khách hàng"}`);
    const body = encodeURIComponent(
      `Liên hệ: ${form.name}\nSĐT/Email: ${form.phone}\nLĩnh vực: ${form.area}\n\nNội dung:\n${form.msg}`
    );
    window.location.href = `mailto:contact@kienphap.law?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const inputCls =
    "w-full border border-snow/12 bg-ink-900 px-3.5 py-3 text-sm text-snow placeholder-fog-500 outline-none transition-colors focus:border-brass-500";

  return (
    <section id="lien-he" className="relative z-10 scroll-mt-24 overflow-hidden py-24">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-jade-500/8 blur-[130px]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <SectionHead
              kicker="Liên hệ"
              title={
                <>
                  Cần một quyết định
                  <br />
                  pháp lý <span className="text-jade-400">đúng lúc?</span>
                </>
              }
              sub="Gửi yêu cầu — luật sư phụ trách mảng sẽ phản hồi trong 24 giờ làm việc."
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: IconPhone,
                  label: "Hotline 24/7",
                  value: "(+84) 28 3910 6688",
                  href: "tel:+842839106688",
                },
                {
                  icon: IconMail,
                  label: "Email",
                  value: "contact@kienphap.law",
                  href: "mailto:contact@kienphap.law",
                },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="group border border-snow/12 bg-ink-850 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brass-500/60"
                >
                  <c.icon className="h-5 w-5 text-brass-400" />
                  <p className="font-mono mt-4 text-[10px] tracking-[0.22em] text-fog-500 uppercase">
                    {c.label}
                  </p>
                  <p className="mt-1.5 text-[15px] font-semibold text-snow transition-colors group-hover:text-brass-300">
                    {c.value}
                  </p>
                </a>
              ))}
              {[
                {
                  icon: IconPin,
                  label: "Văn phòng TP.HCM",
                  value: "Tầng 15, Vincom Center, 72 Lê Thánh Tôn, Q.1",
                },
                {
                  icon: IconClock,
                  label: "Giờ làm việc",
                  value: "T2 – T6 · 08:00 – 18:00 (T7: 08:00 – 12:00)",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="group border border-snow/12 bg-ink-850 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-jade-500/60"
                >
                  <c.icon className="h-5 w-5 text-jade-400" />
                  <p className="font-mono mt-4 text-[10px] tracking-[0.22em] text-fog-500 uppercase">
                    {c.label}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-snug font-semibold text-snow">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Reveal delay={140} className="lg:col-span-6">
            <form
              onSubmit={submit}
              className="border border-snow/12 bg-ink-850 p-7 sm:p-9"
            >
              <p className="font-mono text-[10px] tracking-[0.28em] text-brass-400 uppercase">
                Yêu cầu tư vấn — KP/2026
              </p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="font-mono mb-2 block text-[10px] tracking-[0.2em] text-fog-400 uppercase">
                    Họ tên *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="font-mono mb-2 block text-[10px] tracking-[0.2em] text-fog-400 uppercase">
                    SĐT / Email *
                  </label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0901 234 567"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="mt-5">
                <label className="font-mono mb-2 block text-[10px] tracking-[0.2em] text-fog-400 uppercase">
                  Lĩnh vực
                </label>
                <select
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className={`${inputCls} appearance-none`}
                >
                  {[
                    "Xây dựng — Bất động sản",
                    "Tố tụng & tranh chấp",
                    "Điện mặt trời & năng lượng",
                    "Thương mại — dịch vụ",
                    "Gói pháp chế 100tr/tháng",
                    "Gói pháp chế 1 tỷ/năm",
                  ].map((o) => (
                    <option key={o} value={o} className="bg-ink-900">
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-5">
                <label className="font-mono mb-2 block text-[10px] tracking-[0.2em] text-fog-400 uppercase">
                  Nội dung vụ việc
                </label>
                <textarea
                  rows={4}
                  value={form.msg}
                  onChange={(e) => setForm({ ...form, msg: e.target.value })}
                  placeholder="Mô tả ngắn vụ việc — chúng tôi giữ bảo mật tuyệt đối."
                  className={`${inputCls} resize-none`}
                />
              </div>
              <button
                type="submit"
                className="group mt-7 inline-flex w-full items-center justify-center gap-2.5 bg-brass-500 px-6 py-4 text-sm font-bold text-ink-950 transition-all duration-300 hover:bg-brass-400 hover:shadow-[0_15px_45px_-12px_rgba(201,164,76,0.6)]"
              >
                Gửi yêu cầu — phản hồi 24h
                <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              {sent && (
                <p className="font-mono mt-4 flex items-center gap-2 text-[11px] tracking-wider text-jade-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-jade-500" />
                  ĐÃ MỞ TRÌNH SOẠN EMAIL — CHÚNG TÔI PHẢN HỒI TRONG 24 GIỜ
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
