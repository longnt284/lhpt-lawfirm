import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth";
import { backendReady, describeError, sb } from "../lib/supabase";
import type { CommentRow, OwnCommentRow } from "../lib/database.types";
import { formatDateTime, useLocale } from "../i18n";
import { EASE_LUXE } from "../motion";

/*
 * Bình luận công khai đọc từ view public_comments (chỉ bản đã duyệt). Bình luận
 * đang chờ duyệt của chính người đang đăng nhập lấy riêng từ bảng gốc, để họ
 * thấy bài mình vừa gửi thay vì tưởng bị mất.
 */

type Entry = CommentRow & { pending?: boolean };

const MAX_LENGTH = 4000;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "LH";
  const last = parts[parts.length - 1][0] ?? "";
  const first = parts[0][0] ?? "";
  return (parts.length === 1 ? first + (parts[0][1] ?? "") : first + last).toUpperCase();
}

export function Comments({
  articleId,
  articleKind,
  onRequireAccount,
}: {
  articleId: string;
  articleKind: "article" | "news";
  onRequireAccount: () => void;
}) {
  const { locale, t } = useLocale();
  const { user, emailConfirmed } = useAuth();

  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [reported, setReported] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!backendReady) {
      setEntries([]);
      return;
    }
    /*
     * Bọc try/catch chứ không chỉ đọc trường `error` của kết quả: nạp động thư
     * viện hoặc chính lời gọi mạng đều có thể ném, và khi đó `entries` giữ
     * nguyên null nên khối thảo luận kẹt ở chữ "Đang tải…" mãi mãi. Hỏng mạng
     * thì hiển thị như chưa có bình luận, phần còn lại của bài vẫn đọc được.
     */
    try {
      const client = await sb();
      const approved = await client
        .from("public_comments")
        .select("id, article_id, article_kind, parent_id, author_id, author_name, body, locale, is_edited, edited_at, created_at")
        .eq("article_id", articleId)
        .order("created_at", { ascending: true });

      const list: Entry[] = ((approved.data as CommentRow[] | null) ?? []).map((c) => ({ ...c }));

      if (user) {
        const mine = await client
          .from("article_comments")
          .select("id, article_id, article_kind, parent_id, author_id, author_name, body, locale, is_edited, edited_at, created_at, status, is_deleted")
          .eq("article_id", articleId)
          .eq("author_id", user.id)
          .eq("status", "pending")
          .eq("is_deleted", false)
          .order("created_at", { ascending: true });

        for (const row of (mine.data as OwnCommentRow[] | null) ?? []) {
          list.push({ ...row, pending: true });
        }
        list.sort((a, b) => a.created_at.localeCompare(b.created_at));
      }

      setEntries(list);
    } catch {
      setEntries([]);
    }
  }, [articleId, user]);

  useEffect(() => {
    setEntries(null);
    setBody("");
    setReplyTo(null);
    setError("");
    setOk("");
    void load();
  }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAccount();
      return;
    }
    if (!emailConfirmed) {
      setError(t("confirmEmailNeeded"));
      return;
    }
    const text = body.trim();
    if (text.length < 2) return;

    setBusy(true);
    setError("");
    setOk("");
    try {
      const client = await sb();
      const { error: err } = await client.from("article_comments").insert({
        article_id: articleId,
        article_kind: articleKind,
        author_id: user.id,
        parent_id: replyTo,
        body: text,
        locale,
      });
      if (err) {
        setError(describeError(err, locale));
        return;
      }
      setBody("");
      setReplyTo(null);
      setOk(t("commentPending"));
      await load();
    } catch {
      setError(describeError({ message: "" }, locale));
    } finally {
      setBusy(false);
    }
  };

  const report = async (commentId: string) => {
    if (!user) {
      onRequireAccount();
      return;
    }
    try {
      const client = await sb();
      const { error: err } = await client
        .from("comment_reports")
        .insert({ comment_id: commentId, reporter_id: user.id, reason: "spam" });
      if (err) {
        setError(describeError(err, locale));
        return;
      }
      setReported((prev) => new Set(prev).add(commentId));
    } catch {
      setError(describeError({ message: "" }, locale));
    }
  };

  const remove = async (commentId: string) => {
    try {
      const client = await sb();
      await client.from("article_comments").update({ is_deleted: true }).eq("id", commentId);
      await load();
    } catch {
      setError(describeError({ message: "" }, locale));
    }
  };

  const roots = (entries ?? []).filter((c) => !c.parent_id);
  const childrenOf = (id: string) => (entries ?? []).filter((c) => c.parent_id === id);

  return (
    <div className="mt-10 border-t border-ink-900/10 pt-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="label text-[10px] text-ink-900/50">
          {t("comments")}
          {entries && entries.length > 0 ? ` · ${entries.length}` : ""}
        </p>
      </div>

      <p className="mt-3 text-[11.5px] leading-[1.65] text-ink-900/45">{t("commentRules")}</p>

      {/* ---- danh sách ---- */}
      <div className="mt-6 space-y-5">
        {entries === null ? (
          <p className="text-[12.5px] text-ink-900/45">{t("loading")}</p>
        ) : roots.length === 0 ? (
          <p className="text-[12.5px] text-ink-900/45">{t("commentEmpty")}</p>
        ) : (
          roots.map((c) => (
            <CommentItem
              key={c.id}
              entry={c}
              replies={childrenOf(c.id)}
              currentUserId={user?.id ?? null}
              reported={reported}
              onReply={setReplyTo}
              onReport={report}
              onDelete={remove}
            />
          ))
        )}
      </div>

      {/* ---- ô soạn ---- */}
      {!backendReady ? null : user ? (
        <form onSubmit={submit} className="mt-7">
          <AnimatePresence initial={false}>
            {replyTo && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE_LUXE }}
                className="label overflow-hidden text-[9.5px] text-brass-700"
              >
                {t("commentReply")} ·{" "}
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="underline underline-offset-2"
                >
                  {t("close")}
                </button>
              </motion.p>
            )}
          </AnimatePresence>
          <label className="sr-only" htmlFor="cm-body">
            {t("commentPlaceholder")}
          </label>
          <textarea
            id="cm-body"
            rows={3}
            maxLength={MAX_LENGTH}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("commentPlaceholder")}
            className="mt-2 w-full resize-none border border-ink-900/15 bg-paper px-3.5 py-3 text-[13.5px] text-ink-900 placeholder-ink-900/35 outline-none transition-colors focus:border-brass-500"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="code text-[10.5px] text-ink-900/35">
              {body.length}/{MAX_LENGTH}
            </span>
            <button
              type="submit"
              disabled={busy || body.trim().length < 2}
              className="sheen inline-flex items-center gap-2 bg-ink-900 px-4 py-2.5 text-[13px] font-semibold text-snow transition-colors hover:bg-brass-600 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {busy ? t("loading") : t("commentSubmit")}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-[12.5px] leading-[1.6] text-[#a03535]">
              {error}
            </p>
          )}
          {ok && (
            <p role="status" className="mt-3 text-[12.5px] leading-[1.6] text-jade-600">
              {ok}
            </p>
          )}
        </form>
      ) : (
        <button
          type="button"
          onClick={onRequireAccount}
          className="mt-7 inline-flex items-center gap-2 border border-ink-900/20 px-4 py-2.5 text-[13px] font-semibold text-ink-900 transition-colors hover:border-brass-600 hover:text-brass-700"
        >
          {t("commentSignInFirst")}
        </button>
      )}
    </div>
  );
}

function CommentItem({
  entry,
  replies,
  currentUserId,
  reported,
  onReply,
  onReport,
  onDelete,
}: {
  entry: Entry;
  replies: Entry[];
  currentUserId: string | null;
  reported: Set<string>;
  onReply: (id: string) => void;
  onReport: (id: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}) {
  const { locale, t } = useLocale();
  const mine = currentUserId !== null && entry.author_id === currentUserId;

  return (
    <div>
      <article className="flex gap-3.5">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-ink-900/12 bg-mist-100 text-[11px] font-semibold text-ink-900/60"
        >
          {initials(entry.author_name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[13px] font-semibold text-ink-900">{entry.author_name}</span>
            <span className="code text-[10.5px] text-ink-900/40">
              {formatDateTime(entry.created_at, locale)}
            </span>
            {entry.is_edited && (
              <span className="text-[10.5px] text-ink-900/35">({t("commentEdited")})</span>
            )}
            {entry.pending && (
              <span className="label border border-brass-600/40 px-2 py-0.5 text-[8.5px] text-brass-700">
                {t("yourPending")}
              </span>
            )}
          </div>
          <p className="mt-2 text-[13.5px] leading-[1.75] whitespace-pre-wrap text-ink-900/78">
            {entry.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[11.5px]">
            {!entry.pending && (
              <button
                type="button"
                onClick={() => onReply(entry.id)}
                className="text-ink-900/45 transition-colors hover:text-brass-700"
              >
                {t("commentReply")}
              </button>
            )}
            {mine ? (
              <button
                type="button"
                onClick={() => void onDelete(entry.id)}
                className="text-ink-900/45 transition-colors hover:text-[#a03535]"
              >
                {t("commentDelete")}
              </button>
            ) : (
              !entry.pending && (
                <button
                  type="button"
                  disabled={reported.has(entry.id)}
                  onClick={() => void onReport(entry.id)}
                  className="text-ink-900/45 transition-colors hover:text-[#a03535] disabled:text-jade-600"
                >
                  {reported.has(entry.id) ? t("commentReported") : t("commentReport")}
                </button>
              )
            )}
          </div>
        </div>
      </article>

      {replies.length > 0 && (
        <div className="mt-4 space-y-4 border-l border-ink-900/10 pl-5 sm:ml-[3.1rem]">
          {replies.map((r) => (
            <CommentItem
              key={r.id}
              entry={r}
              replies={[]}
              currentUserId={currentUserId}
              reported={reported}
              onReply={onReply}
              onReport={onReport}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
