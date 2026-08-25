/**
 * Kiểu dữ liệu của lược đồ Supabase.
 *
 * Viết tay, giới hạn ở phần mà giao diện thực sự chạm tới, thay vì chép nguyên
 * bản sinh tự động dài hơn nghìn dòng. Khi đổi lược đồ trong
 * supabase/migrations, sửa file này theo; đối chiếu bằng:
 *
 *   npx supabase gen types typescript --project-id <ref> --schema public
 */

export type AppRole = "client" | "staff" | "lawyer" | "admin";

export type PracticeArea =
  | "construction_realestate"
  | "litigation"
  | "energy"
  | "corporate"
  | "data_protection"
  | "retainer"
  | "other";

export type CaseStatus =
  | "new"
  | "intake"
  | "quoted"
  | "active"
  | "awaiting_client"
  | "in_litigation"
  | "on_hold"
  | "closed"
  | "cancelled";

export type CasePriority = "low" | "normal" | "high" | "urgent";

export type CaseEventType =
  | "status_change"
  | "note"
  | "document"
  | "hearing"
  | "deadline"
  | "meeting"
  | "payment";

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentMode = "office" | "online" | "phone";

export type SubscriptionStatus = "pending" | "active" | "expiring" | "expired" | "cancelled";

export type PlanTier = "basic" | "standard" | "premium";

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  tax_code: string | null;
  job_title: string | null;
  preferred_locale: string;
  role: AppRole;
  is_blocked: boolean;
  approved_comment_count: number;
  marketing_opt_in: boolean;
  created_at: string;
};

export type LawyerRow = {
  id: string;
  slug: string;
  full_name: string;
  full_name_en: string | null;
  role_title: string;
  role_title_en: string | null;
  email: string | null;
  years_of_practice: number | null;
  focus_areas: PracticeArea[];
  sort_order: number;
};

/** Một dòng của view my_cases: hồ sơ kèm luật sư phụ trách và gói dịch vụ. */
export type CaseRow = {
  id: string;
  case_number: string;
  title: string;
  description: string | null;
  practice_area: PracticeArea;
  status: CaseStatus;
  priority: CasePriority;
  progress_percent: number;
  tags: string[];
  opened_at: string;
  next_action_at: string | null;
  next_action_note: string | null;
  closed_at: string | null;
  updated_at: string;
  lead_lawyer_name: string | null;
  lead_lawyer_name_en: string | null;
  lead_lawyer_role: string | null;
  lead_lawyer_role_en: string | null;
  lead_lawyer_email: string | null;
  contract_number: string | null;
  plan_id: string | null;
  subscription_status: SubscriptionStatus | null;
  event_count: number;
};

export type CaseEventRow = {
  id: string;
  case_id: string;
  event_type: CaseEventType;
  title: string;
  body: string | null;
  status_from: CaseStatus | null;
  status_to: CaseStatus | null;
  occurred_at: string;
};

/** Một dòng của view my_subscriptions; số giờ và số ngày còn lại đã tính sẵn. */
export type SubscriptionRow = {
  id: string;
  contract_number: string;
  plan_id: string;
  plan_name: string;
  plan_name_en: string;
  tier: PlanTier;
  unit: string;
  unit_en: string;
  status: SubscriptionStatus;
  started_on: string | null;
  ends_on: string | null;
  discount_percent: number;
  amount_vnd: number | null;
  hours_included: number | null;
  hours_used: number;
  hours_remaining: number | null;
  days_remaining: number | null;
  notes: string | null;
};

export type AppointmentRow = {
  id: string;
  reference: string;
  case_id: string | null;
  lawyer_id: string | null;
  practice_area: PracticeArea;
  subject: string;
  notes: string | null;
  mode: AppointmentMode;
  requested_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  location: string | null;
  meeting_link: string | null;
  cancel_reason: string | null;
  created_at: string;
};

/** Một dòng của view public_comments — không có điểm spam hay email tác giả. */
export type CommentRow = {
  id: string;
  article_id: string;
  article_kind: "article" | "news";
  parent_id: string | null;
  author_id: string;
  author_name: string;
  body: string;
  locale: string;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
};

/** Bình luận của chính người dùng, gồm cả bản chờ duyệt. */
export type OwnCommentRow = CommentRow & {
  status: "pending" | "approved" | "rejected" | "spam";
  is_deleted: boolean;
};
