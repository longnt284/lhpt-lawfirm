import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { backendReady, sb } from "./lib/supabase";
import type { Profile } from "./lib/database.types";

type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  companyName?: string;
  locale: "vi" | "en";
};

type AuthContextValue = {
  ready: boolean;
  /** Đang khôi phục phiên từ localStorage; chưa biết đã đăng nhập hay chưa. */
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** Email đã xác thực chưa — điều kiện để bình luận. */
  emailConfirmed: boolean;
  signUp: (input: SignUpInput) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (patch: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(backendReady);

  const loadProfile = useCallback(async (userId: string) => {
    const client = await sb();
    const { data } = await client
      .from("profiles")
      .select(
        "id, full_name, email, phone, company_name, tax_code, job_title, preferred_locale, role, is_blocked, approved_comment_count, marketing_opt_in, created_at"
      )
      .eq("id", userId)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    if (!backendReady) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void sb()
      .then(async (client) => {
        if (!active) return;
        const { data } = await client.auth.getSession();
        if (!active) return;
        setSession(data.session);
        setLoading(false);

        /*
         * onAuthStateChange bắn cả khi token tự làm mới. Chỉ đặt lại session ở
         * đây; việc nạp hồ sơ do effect theo `userId` bên dưới lo, nên một lượt
         * làm mới token mỗi giờ không kéo theo truy vấn thừa.
         */
        const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
          setSession(next);
          setLoading(false);
        });
        unsubscribe = () => sub.subscription.unsubscribe();
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    void loadProfile(userId);
  }, [userId, loadProfile]);

  const signUp = useCallback<AuthContextValue["signUp"]>(async (input) => {
    const client = await sb();
    const { data, error } = await client.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        // handle_new_user() đọc các trường này để dựng sẵn hồ sơ.
        data: {
          full_name: input.fullName.trim(),
          phone: input.phone?.trim() || null,
          company_name: input.companyName?.trim() || null,
          preferred_locale: input.locale,
        },
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) return { error: error.message, needsConfirmation: false };
    // Không có session ngay nghĩa là dự án đang bật xác thực email.
    return { error: null, needsConfirmation: data.session === null };
  }, []);

  const signIn = useCallback<AuthContextValue["signIn"]>(async (email, password) => {
    const client = await sb();
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const client = await sb();
    await client.auth.signOut();
    setProfile(null);
  }, []);

  const resetPassword = useCallback<AuthContextValue["resetPassword"]>(async (email) => {
    const client = await sb();
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    });
    return { error: error?.message ?? null };
  }, []);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (patch) => {
      if (!userId) return { error: "Chưa đăng nhập." };
      /*
       * Chỉ gửi các trường người dùng được sửa. guard_profile_update() ở phía
       * cơ sở dữ liệu vẫn chặn role và is_blocked, nhưng lọc sẵn ở đây giúp
       * PostgREST không trả về lỗi khó hiểu khi ai đó thêm nhầm trường.
       */
      const allowed: Partial<Profile> = {
        full_name: patch.full_name,
        phone: patch.phone,
        company_name: patch.company_name,
        tax_code: patch.tax_code,
        job_title: patch.job_title,
        preferred_locale: patch.preferred_locale,
        marketing_opt_in: patch.marketing_opt_in,
      };
      for (const k of Object.keys(allowed) as (keyof Profile)[]) {
        if (allowed[k] === undefined) delete allowed[k];
      }

      const client = await sb();
      const { error } = await client.from("profiles").update(allowed).eq("id", userId);
      if (error) return { error: error.message };
      await loadProfile(userId);
      return { error: null };
    },
    [userId, loadProfile]
  );

  const refreshProfile = useCallback(async () => {
    if (userId) await loadProfile(userId);
  }, [userId, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready: backendReady,
      loading,
      session,
      user: session?.user ?? null,
      profile,
      emailConfirmed: Boolean(session?.user?.email_confirmed_at),
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfile,
      refreshProfile,
    }),
    [loading, session, profile, signUp, signIn, signOut, resetPassword, updateProfile, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
