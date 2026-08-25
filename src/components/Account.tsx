import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useAuth } from "../auth";
import { AREA_LABELS, backendReady, describeError, sb } from "../lib/supabase";
import type {
  AppointmentRow,
  CaseEventRow,
  CaseRow,
  LawyerRow,
  PracticeArea,
  SubscriptionRow,
} from "../lib/database.types";
import {
  CASE_STATUS_KEYS,
  appointmentStatusLabel,
  caseStatusLabel,
  caseStatusLabel as caseStatus,
  formatDate,
  formatDateTime,
  subscriptionStatusLabel,
  useLocale,
  type StatusTone,
} from "../i18n";
import { EASE_LUXE, SOFT } from "../motion";
import { IconArrowUpRight, IconClose } from "./Icons";

/* ================= NGUYÊN LIỆU DÙNG CHUNG ================= */

const inputCls =
  "w-full border border-snow/12 bg-ink-900 px-3.5 py-3 text-[14px] text-snow placeholder-fog-500 outline-none transition-colors focus:border-brass-500";

const labelCls = "label mb-2 block text-[9.5px] text-fog-400";

const TONE_CLS: Record<StatusTone, string> = {
  jade: "border-jade-500/45 text-jade-300",
  brass: "border-brass-500/45 text-brass-300",
  muted: "border-snow/15 text-fog-400",
};

function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span className={`label border px-2.5 py-1 text-[9px] ${TONE_CLS[tone]}`}>{label}</span>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelCls} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Notice({ tone, children }: { tone: "error" | "ok"; children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`mt-4 flex items-start gap-2 text-[12.5px] leading-[1.6] ${
        tone === "error" ? "text-[#f2a2a2]" : "text-jade-300"
      }`}
    >
      <span
        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
          tone === "error" ? "bg-[#e07070]" : "bg-jade-500"
        }`}
      />
      {children}
    </p>
  );
}

/* ================= HỘP THOẠI ================= */

function Shell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: EASE_LUXE }}
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink-950/88 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.42, ease: EASE_LUXE }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[92vh] w-full overflow-y-auto border border-snow/12 bg-ink-850 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.85)] ${
          wide ? "max-w-4xl" : "max-w-md"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-snow/10 bg-ink-850/95 px-6 py-4 backdrop-blur-xl sm:px-8">
          <p className="label text-[10px] text-brass-400">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border border-snow/15 p-2 text-fog-300 transition-colors hover:border-brass-500 hover:text-brass-300"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-7 sm:px-8">{children}</div>
      </motion.div>
    </motion.div>
  );
}

/* ================= ĐĂNG NHẬP / ĐĂNG KÝ ================= */

type AuthMode = "signin" | "signup" | "reset";

function AuthForms({ onDone }: { onDone: () => void }) {
  const { locale, t } = useLocale();
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    companyName: "",
  });
  // Bẫy mật ong: trường ẩn với người dùng, chỉ trình gửi rác tự động mới điền.
  const [trap, setTrap] = useState("");

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    if (trap) return; // im lặng bỏ qua, không cho biết vì sao
    setBusy(true);
    try {
      if (mode === "reset") {
        const { error: err } = await resetPassword(form.email);
        if (err) setError(err);
        else setOk(t("resetSent"));
        return;
      }
      if (mode === "signin") {
        const { error: err } = await signIn(form.email, form.password);
        if (err) setError(err);
        else onDone();
        return;
      }
      if (form.password.length < 8) {
        setError(t("passwordHint"));
        return;
      }
      const { error: err, needsConfirmation } = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
        companyName: form.companyName,
        locale,
      });
      if (err) setError(err);
      else if (needsConfirmation) setOk(t("confirmEmailSent"));
      else onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <p className="text-[13.5px] leading-[1.7] text-fog-300">
        {mode === "signup" ? t("signUpIntro") : t("signInIntro")}
      </p>

      <div className="mt-6 grid gap-4">
        {mode === "signup" && (
          <>
            <Field id="ac-name" label={t("fullName")}>
              <input
                id="ac-name"
                required
                autoComplete="name"
                value={form.fullName}
                onChange={set("fullName")}
                className={inputCls}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="ac-phone" label={t("phone")}>
                <input
                  id="ac-phone"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  className={inputCls}
                />
              </Field>
              <Field id="ac-company" label={t("company")}>
                <input
                  id="ac-company"
                  autoComplete="organization"
                  value={form.companyName}
                  onChange={set("companyName")}
                  className={inputCls}
                />
              </Field>
            </div>
          </>
        )}

        <Field id="ac-email" label={t("email")}>
          <input
            id="ac-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            className={inputCls}
          />
        </Field>

        {mode !== "reset" && (
          <Field id="ac-password" label={t("password")}>
            <input
              id="ac-password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={form.password}
              onChange={set("password")}
              className={inputCls}
            />
            {mode === "signup" && (
              <p className="mt-1.5 text-[11.5px] text-fog-500">{t("passwordHint")}</p>
            )}
          </Field>
        )}

        {/*
          Bẫy mật ong. aria-hidden và tabIndex -1 để trình đọc màn hình và phím
          Tab bỏ qua; ẩn bằng vị trí tuyệt đối ngoài khung nhìn chứ không dùng
          display:none, vì nhiều bot bỏ qua trường bị ẩn hoàn toàn.
        */}
        <div className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="ac-website">Website</label>
          <input
            id="ac-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </div>
      </div>

      {mode === "signup" && (
        <p className="mt-5 text-[11.5px] leading-[1.65] text-fog-500">{t("consentNote")}</p>
      )}

      <Notice tone="error">{error}</Notice>
      <Notice tone="ok">{ok}</Notice>

      <motion.button
        type="submit"
        disabled={busy}
        whileHover={{ y: busy ? 0 : -2 }}
        whileTap={{ scale: busy ? 1 : 0.985 }}
        transition={{ type: "spring", ...SOFT }}
        className="sheen mt-6 inline-flex w-full items-center justify-center gap-2 bg-brass-500 px-6 py-3.5 text-[14px] font-semibold text-ink-950 transition-colors hover:bg-brass-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy
          ? t("loading")
          : mode === "signin"
            ? t("signIn")
            : mode === "signup"
              ? t("signUp")
              : t("sendResetLink")}
      </motion.button>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[12.5px]">
        {mode === "signin" ? (
          <>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="link-underline text-fog-300 transition-colors hover:text-brass-300"
            >
              {t("noAccount")} {t("signUp")}
            </button>
            <button
              type="button"
              onClick={() => setMode("reset")}
              className="text-fog-500 transition-colors hover:text-brass-300"
            >
              {t("forgotPassword")}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="link-underline text-fog-300 transition-colors hover:text-brass-300"
          >
            {t("haveAccount")} {t("signIn")}
          </button>
        )}
      </div>
    </form>
  );
}

/* ================= ĐẶT LỊCH ================= */

/** Mặc định gợi ý khung giờ làm việc kế tiếp thay vì để trống. */
function defaultSlot(): string {
  const next = new Date(Date.now() + 24 * 60 * 60 * 1000);
  next.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`;
}

function BookingForm({
  lawyers,
  cases,
  onBooked,
}: {
  lawyers: LawyerRow[];
  cases: CaseRow[];
  onBooked: () => void;
}) {
  const { locale, isEnglish, t } = useLocale();
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState({
    subject: "",
    notes: "",
    area: "other" as PracticeArea,
    lawyerId: "",
    caseId: "",
    mode: "office" as "office" | "online" | "phone",
    when: defaultSlot(),
    duration: 45,
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setOk("");
    setBusy(true);
    try {
      const client = await sb();
      const { error: err } = await client
        .from("appointments")
        .insert({
          client_id: user.id,
          case_id: form.caseId || null,
          lawyer_id: form.lawyerId || null,
          practice_area: form.area,
          subject: form.subject.trim(),
          notes: form.notes.trim() || null,
          mode: form.mode,
          // datetime-local cho chuỗi không có múi giờ; Date() diễn giải theo
          // múi giờ trình duyệt, đúng với ý người đặt.
          requested_at: new Date(form.when).toISOString(),
          duration_minutes: form.duration,
          locale,
        });
      if (err) {
        setError(describeError(err, locale));
        return;
      }
      setOk(t("bookDone"));
      setForm((prev) => ({ ...prev, subject: "", notes: "" }));
      onBooked();
    } catch {
      setError(describeError({ message: "" }, locale));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4">
        <Field id="bk-subject" label={t("bookSubject")}>
          <input
            id="bk-subject"
            required
            maxLength={200}
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder={profile?.company_name ?? ""}
            className={inputCls}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="bk-area" label={isEnglish ? "Practice area" : "Lĩnh vực"}>
            <select
              id="bk-area"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value as PracticeArea })}
              className={`${inputCls} appearance-none`}
            >
              {(Object.keys(AREA_LABELS) as PracticeArea[]).map((area) => (
                <option key={area} value={area} className="bg-ink-900">
                  {AREA_LABELS[area][locale]}
                </option>
              ))}
            </select>
          </Field>

          <Field id="bk-lawyer" label={t("bookLawyer")}>
            <select
              id="bk-lawyer"
              value={form.lawyerId}
              onChange={(e) => setForm({ ...form, lawyerId: e.target.value })}
              className={`${inputCls} appearance-none`}
            >
              <option value="" className="bg-ink-900">
                {t("anyLawyer")}
              </option>
              {lawyers.map((l) => (
                <option key={l.id} value={l.id} className="bg-ink-900">
                  {isEnglish ? (l.full_name_en ?? l.full_name) : l.full_name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="bk-when" label={t("bookWhen")}>
            <input
              id="bk-when"
              type="datetime-local"
              required
              value={form.when}
              onChange={(e) => setForm({ ...form, when: e.target.value })}
              className={`${inputCls} [color-scheme:dark]`}
            />
          </Field>
          <Field id="bk-duration" label={t("bookDuration")}>
            <select
              id="bk-duration"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              className={`${inputCls} appearance-none`}
            >
              {[30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m} className="bg-ink-900">
                  {m} {t("minutes")}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="bk-mode" label={t("bookMode")}>
            <select
              id="bk-mode"
              value={form.mode}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value as "office" | "online" | "phone" })
              }
              className={`${inputCls} appearance-none`}
            >
              <option value="office" className="bg-ink-900">{t("modeOffice")}</option>
              <option value="online" className="bg-ink-900">{t("modeOnline")}</option>
              <option value="phone" className="bg-ink-900">{t("modePhone")}</option>
            </select>
          </Field>
          {cases.length > 0 && (
            <Field id="bk-case" label={t("caseNumber")}>
              <select
                id="bk-case"
                value={form.caseId}
                onChange={(e) => setForm({ ...form, caseId: e.target.value })}
                className={`${inputCls} appearance-none`}
              >
                <option value="" className="bg-ink-900">—</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id} className="bg-ink-900">
                    {c.case_number}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <Field id="bk-notes" label={t("message")}>
          <textarea
            id="bk-notes"
            rows={3}
            maxLength={2000}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder={t("messagePlaceholder")}
            className={`${inputCls} resize-none`}
          />
        </Field>
      </div>

      <Notice tone="error">{error}</Notice>
      <Notice tone="ok">{ok}</Notice>

      <button
        type="submit"
        disabled={busy}
        className="sheen mt-6 inline-flex w-full items-center justify-center gap-2 bg-brass-500 px-6 py-3.5 text-[14px] font-semibold text-ink-950 transition-colors hover:bg-brass-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? t("loading") : t("bookSubmit")}
        <IconArrowUpRight className="h-4 w-4" />
      </button>
    </form>
  );
}

/* ================= HỒ SƠ ================= */

function CaseCard({
  item,
  expanded,
  events,
  onToggle,
}: {
  item: CaseRow;
  expanded: boolean;
  events: CaseEventRow[] | undefined;
  onToggle: () => void;
}) {
  const { locale, isEnglish, t } = useLocale();
  const status = caseStatus(item.status, locale);
  const lawyerName = isEnglish ? (item.lead_lawyer_name_en ?? item.lead_lawyer_name) : item.lead_lawyer_name;

  return (
    <div className="border border-snow/12 bg-ink-900">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-col gap-3 p-5 text-left transition-colors hover:bg-ink-850"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="code text-[12px] tracking-wide text-brass-300">{item.case_number}</span>
          <StatusPill label={status.label} tone={status.tone} />
        </div>
        <p className="text-[14.5px] leading-[1.5] font-semibold text-snow">{item.title}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-fog-500">
          <span>{AREA_LABELS[item.practice_area][locale]}</span>
          {lawyerName && <span>{t("caseLead")}: {lawyerName}</span>}
          <span>{formatDate(item.opened_at, locale)}</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <div className="h-1 flex-1 bg-ink-700">
            <div
              className="h-full bg-gradient-to-r from-brass-600 to-jade-400 transition-[width] duration-500"
              style={{ width: `${item.progress_percent}%` }}
            />
          </div>
          <span className="code text-[11px] text-fog-400">{item.progress_percent}%</span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: EASE_LUXE }}
            className="overflow-hidden border-t border-snow/10"
          >
            <div className="space-y-5 p-5">
              {item.description && (
                <p className="text-[13px] leading-[1.7] text-fog-300">{item.description}</p>
              )}

              {item.next_action_at && (
                <div className="border border-brass-500/25 bg-brass-500/[0.06] p-4">
                  <p className="label text-[9px] text-brass-400">{t("nextAction")}</p>
                  <p className="mt-2 text-[13px] leading-[1.6] text-snow">
                    {formatDateTime(item.next_action_at, locale)}
                    {item.next_action_note ? ` · ${item.next_action_note}` : ""}
                  </p>
                </div>
              )}

              <div>
                <p className="label text-[9px] text-fog-500">{t("caseTimeline")}</p>
                {events === undefined ? (
                  <p className="mt-3 text-[12.5px] text-fog-500">{t("loading")}</p>
                ) : events.length === 0 ? (
                  <p className="mt-3 text-[12.5px] text-fog-500">—</p>
                ) : (
                  <ol className="mt-3 space-y-3 border-l border-snow/12 pl-4">
                    {events.map((ev) => (
                      <li key={ev.id} className="relative">
                        <span className="absolute top-1.5 -left-[1.32rem] h-1.5 w-1.5 rounded-full bg-brass-500" />
                        <p className="text-[13px] leading-[1.5] text-snow">
                          {ev.event_type === "status_change" && ev.status_to
                            ? `${t("caseStatus")}: ${caseStatusLabel(ev.status_to, locale).label}`
                            : ev.title}
                        </p>
                        {ev.body && (
                          <p className="mt-1 text-[12.5px] leading-[1.6] text-fog-400">{ev.body}</p>
                        )}
                        <p className="code mt-1 text-[10.5px] text-fog-500">
                          {formatDateTime(ev.occurred_at, locale)}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {item.contract_number && (
                <p className="text-[12px] text-fog-500">
                  {t("contractNumber")}: <span className="code text-fog-300">{item.contract_number}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= CỔNG KHÁCH HÀNG ================= */

type Tab = "cases" | "plan" | "appointments" | "book" | "profile";

function Portal({ onClose }: { onClose: () => void }) {
  const { locale, isEnglish, t } = useLocale();
  const { user, profile, signOut, updateProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("cases");

  const [cases, setCases] = useState<CaseRow[] | null>(null);
  const [subs, setSubs] = useState<SubscriptionRow[] | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRow[] | null>(null);
  const [lawyers, setLawyers] = useState<LawyerRow[]>([]);
  const [eventsByCase, setEventsByCase] = useState<Record<string, CaseEventRow[]>>({});
  const [openCase, setOpenCase] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  /*
   * Mọi hàm nạp đều nuốt lỗi và trả về danh sách rỗng. Nạp động thư viện hay
   * chính lời gọi mạng đều có thể ném; nếu để trạng thái nằm nguyên ở null thì
   * mỗi tab của cổng khách hàng kẹt ở chữ "Đang tải…" mà không nói được gì.
   */
  const loadCases = useCallback(async () => {
    try {
      const client = await sb();
      const { data } = await client
        .from("my_cases")
        .select("*")
        .order("opened_at", { ascending: false });
      setCases((data as CaseRow[] | null) ?? []);
    } catch {
      setCases([]);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      const client = await sb();
      const { data } = await client
        .from("appointments")
        .select(
          "id, reference, case_id, lawyer_id, practice_area, subject, notes, mode, requested_at, duration_minutes, status, location, meeting_link, cancel_reason, created_at"
        )
        .order("requested_at", { ascending: false });
      setAppointments((data as AppointmentRow[] | null) ?? []);
    } catch {
      setAppointments([]);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void loadCases();
    void loadAppointments();
    void sb()
      .then(async (client) => {
        /*
         * Gói dịch vụ và danh bạ luật sư chỉ đọc một lần khi mở cổng, nên gọi
         * song song thay vì chờ nhau: chúng không phụ thuộc kết quả của nhau.
         */
        const [subsResult, lawyersResult] = await Promise.all([
          client.from("my_subscriptions").select("*").order("created_at", { ascending: false }),
          client
            .from("lawyers")
            .select(
              "id, slug, full_name, full_name_en, role_title, role_title_en, email, years_of_practice, focus_areas, sort_order"
            )
            .order("sort_order"),
        ]);
        if (!active) return;
        setSubs((subsResult.data as SubscriptionRow[] | null) ?? []);
        setLawyers((lawyersResult.data as LawyerRow[] | null) ?? []);
      })
      .catch(() => {
        if (active) setSubs([]);
      });
    return () => {
      active = false;
    };
  }, [user, loadCases, loadAppointments]);

  // Nạp dòng thời gian theo yêu cầu, chỉ khi khách mở hồ sơ đó ra.
  const toggleCase = useCallback(
    async (id: string) => {
      const next = openCase === id ? null : id;
      setOpenCase(next);
      if (!next || eventsByCase[next]) return;
      try {
        const client = await sb();
        const { data } = await client
          .from("case_events")
          .select("id, case_id, event_type, title, body, status_from, status_to, occurred_at")
          .eq("case_id", next)
          .order("occurred_at", { ascending: false });
        setEventsByCase((prev) => ({ ...prev, [next]: (data as CaseEventRow[] | null) ?? [] }));
      } catch {
        setEventsByCase((prev) => ({ ...prev, [next]: [] }));
      }
    },
    [openCase, eventsByCase]
  );

  const visibleCases = useMemo(() => {
    if (!cases) return [];
    const needle = query.trim().toLowerCase();
    return cases.filter(
      (c) =>
        (statusFilter === "" || c.status === statusFilter) &&
        (areaFilter === "" || c.practice_area === areaFilter) &&
        (needle === "" ||
          c.case_number.toLowerCase().includes(needle) ||
          c.title.toLowerCase().includes(needle) ||
          c.tags.some((tag) => tag.toLowerCase().includes(needle)))
    );
  }, [cases, query, statusFilter, areaFilter]);

  const cancelAppointment = async (id: string) => {
    try {
      const client = await sb();
      await client.from("appointments").update({ status: "cancelled" }).eq("id", id);
      await loadAppointments();
    } catch {
      /* Hỏng mạng: giữ nguyên danh sách, khách bấm lại được. */
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "cases", label: t("myCases") },
    { id: "plan", label: t("myPlan") },
    { id: "appointments", label: t("myAppointments") },
    { id: "book", label: t("bookTitle") },
    { id: "profile", label: t("myProfile") },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-snow/10 pb-5">
        <div>
          <p className="font-display text-[1.15rem] leading-tight font-semibold text-snow">
            {profile?.full_name || user?.email}
          </p>
          <p className="mt-1 text-[12px] text-fog-500">
            {profile?.company_name || user?.email}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void signOut();
            onClose();
          }}
          className="label border border-snow/15 px-3 py-2 text-[9px] text-fog-300 transition-colors hover:border-brass-500 hover:text-brass-300"
        >
          {t("signOut")}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={`label relative px-3.5 py-2 text-[9px] transition-colors ${
              tab === item.id ? "text-ink-950" : "border border-snow/15 text-fog-400 hover:text-brass-300"
            }`}
          >
            {tab === item.id && (
              <motion.span layoutId="portal-tab" className="absolute inset-0 -z-10 bg-brass-500" />
            )}
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "cases" && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("filterByNumber")}
                aria-label={t("filterByNumber")}
                className={inputCls}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label={t("caseStatus")}
                className={`${inputCls} appearance-none`}
              >
                <option value="" className="bg-ink-900">{t("allStatuses")}</option>
                {CASE_STATUS_KEYS.map((key) => (
                  <option key={key} value={key} className="bg-ink-900">
                    {caseStatusLabel(key, locale).label}
                  </option>
                ))}
              </select>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                aria-label={isEnglish ? "Practice area" : "Lĩnh vực"}
                className={`${inputCls} appearance-none`}
              >
                <option value="" className="bg-ink-900">{t("allAreas")}</option>
                {(Object.keys(AREA_LABELS) as PracticeArea[]).map((area) => (
                  <option key={area} value={area} className="bg-ink-900">
                    {AREA_LABELS[area][locale]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {cases === null ? (
                <p className="text-[13px] text-fog-500">{t("loading")}</p>
              ) : visibleCases.length === 0 ? (
                <p className="border border-snow/10 bg-ink-900 p-6 text-[13px] leading-[1.7] text-fog-400">
                  {cases.length === 0 ? t("noCases") : t("noResults")}
                </p>
              ) : (
                visibleCases.map((item) => (
                  <CaseCard
                    key={item.id}
                    item={item}
                    expanded={openCase === item.id}
                    events={eventsByCase[item.id]}
                    onToggle={() => void toggleCase(item.id)}
                  />
                ))
              )}
            </div>
          </>
        )}

        {tab === "plan" && (
          <div className="space-y-3">
            {subs === null ? (
              <p className="text-[13px] text-fog-500">{t("loading")}</p>
            ) : subs.length === 0 ? (
              <p className="border border-snow/10 bg-ink-900 p-6 text-[13px] leading-[1.7] text-fog-400">
                {t("noPlan")}
              </p>
            ) : (
              subs.map((s) => {
                const status = subscriptionStatusLabel(s.status, locale);
                return (
                  <div key={s.id} className="border border-snow/12 bg-ink-900 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-display text-[1.05rem] font-semibold text-snow">
                        {isEnglish ? s.plan_name_en : s.plan_name}
                      </p>
                      <StatusPill label={status.label} tone={status.tone} />
                    </div>
                    <p className="code mt-2 text-[11.5px] text-brass-300">{s.contract_number}</p>
                    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="label text-[9px] text-fog-500">{t("planPeriod")}</dt>
                        <dd className="mt-1 text-[13px] text-snow">
                          {formatDate(s.started_on, locale)} — {formatDate(s.ends_on, locale)}
                        </dd>
                      </div>
                      {s.days_remaining !== null && (
                        <div>
                          <dt className="label text-[9px] text-fog-500">{t("daysLeft")}</dt>
                          <dd className="mt-1 text-[13px] text-snow">{s.days_remaining}</dd>
                        </div>
                      )}
                      {s.hours_remaining !== null && (
                        <div>
                          <dt className="label text-[9px] text-fog-500">{t("hoursLeft")}</dt>
                          <dd className="mt-1 text-[13px] text-snow">
                            {s.hours_remaining} / {s.hours_included}
                          </dd>
                        </div>
                      )}
                      {s.discount_percent > 0 && (
                        <div>
                          <dt className="label text-[9px] text-fog-500">{t("discountApplied")}</dt>
                          <dd className="mt-1 text-[13px] text-jade-300">−{s.discount_percent}%</dd>
                        </div>
                      )}
                    </dl>
                    {s.notes && (
                      <p className="mt-4 border-t border-snow/10 pt-4 text-[12.5px] leading-[1.65] text-fog-400">
                        {s.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "appointments" && (
          <div className="space-y-3">
            {appointments === null ? (
              <p className="text-[13px] text-fog-500">{t("loading")}</p>
            ) : appointments.length === 0 ? (
              <p className="border border-snow/10 bg-ink-900 p-6 text-[13px] leading-[1.7] text-fog-400">
                {t("noAppointments")}
              </p>
            ) : (
              appointments.map((a) => {
                const status = appointmentStatusLabel(a.status, locale);
                const cancellable = a.status === "requested" || a.status === "confirmed";
                return (
                  <div key={a.id} className="border border-snow/12 bg-ink-900 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="code text-[11.5px] text-brass-300">{a.reference}</span>
                      <StatusPill label={status.label} tone={status.tone} />
                    </div>
                    <p className="mt-2 text-[14px] leading-[1.5] font-semibold text-snow">{a.subject}</p>
                    <p className="mt-2 text-[12.5px] text-fog-400">
                      {formatDateTime(a.requested_at, locale)} · {a.duration_minutes} {t("minutes")} ·{" "}
                      {a.mode === "office" ? t("modeOffice") : a.mode === "online" ? t("modeOnline") : t("modePhone")}
                    </p>
                    {a.meeting_link && (
                      <a
                        href={a.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="link-underline mt-2 inline-block text-[12.5px] text-jade-300"
                      >
                        {a.meeting_link}
                      </a>
                    )}
                    {cancellable && (
                      <button
                        type="button"
                        onClick={() => void cancelAppointment(a.id)}
                        className="label mt-4 border border-snow/15 px-3 py-1.5 text-[9px] text-fog-400 transition-colors hover:border-[#e07070]/60 hover:text-[#f2a2a2]"
                      >
                        {t("cancelAppointment")}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "book" && (
          <BookingForm
            lawyers={lawyers}
            cases={cases ?? []}
            onBooked={() => void loadAppointments()}
          />
        )}

        {tab === "profile" && <ProfileForm onSaved={updateProfile} />}
      </div>
    </>
  );
}

function ProfileForm({
  onSaved,
}: {
  onSaved: ReturnType<typeof useAuth>["updateProfile"];
}) {
  const { t } = useLocale();
  const { profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    company_name: profile?.company_name ?? "",
    tax_code: profile?.tax_code ?? "",
    job_title: profile?.job_title ?? "",
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setOk("");
    setError("");
    const { error: err } = await onSaved(form);
    setBusy(false);
    if (err) setError(err);
    else setOk(t("profileSaved"));
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field id="pf-name" label={t("fullName")}>
        <input
          id="pf-name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className={inputCls}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="pf-phone" label={t("phone")}>
          <input
            id="pf-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field id="pf-job" label={t("myProfile")}>
          <input
            id="pf-job"
            value={form.job_title}
            onChange={(e) => setForm({ ...form, job_title: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="pf-company" label={t("company")}>
          <input
            id="pf-company"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field id="pf-tax" label="MST">
          <input
            id="pf-tax"
            value={form.tax_code}
            onChange={(e) => setForm({ ...form, tax_code: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>

      <Notice tone="error">{error}</Notice>
      <Notice tone="ok">{ok}</Notice>

      <button
        type="submit"
        disabled={busy}
        className="sheen mt-2 inline-flex w-full items-center justify-center bg-brass-500 px-6 py-3.5 text-[14px] font-semibold text-ink-950 transition-colors hover:bg-brass-400 disabled:opacity-60"
      >
        {busy ? t("loading") : t("saveProfile")}
      </button>
    </form>
  );
}

/* ================= ĐIỂM VÀO ================= */

export function AccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLocale();
  const { user, loading } = useAuth();

  return (
    <AnimatePresence>
      {open && (
        <Shell
          key="account"
          title={user ? t("portal") : t("account")}
          onClose={onClose}
          wide={Boolean(user)}
        >
          {!backendReady ? (
            <p className="text-[13px] leading-[1.7] text-fog-300">{t("backendOffline")}</p>
          ) : loading ? (
            <p className="text-[13px] text-fog-500">{t("loading")}</p>
          ) : user ? (
            <Portal onClose={onClose} />
          ) : (
            <AuthForms onDone={onClose} />
          )}
        </Shell>
      )}
    </AnimatePresence>
  );
}
