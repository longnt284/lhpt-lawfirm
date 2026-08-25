import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DocItem } from "./content/types";
import type { LegalDoc } from "./content/legalDocs";
import type { Lawyer, Plan, PolicyItem, Service } from "./firm";

export type Locale = "vi" | "en";

const STORAGE_KEY = "lhpt-locale";
type EnglishContent = typeof import("./content/english");
let englishContent: EnglishContent | null = null;

const DICTIONARY = {
  vi: {
    language: "English",
    languageLabel: "Đổi sang tiếng Anh",
    nav: ["Dịch vụ", "Bảng phí", "Tin tức", "Bài viết", "Văn bản", "Đội ngũ", "Chính sách"],
    book: "Đặt lịch tư vấn",
    explore: "Khám phá dịch vụ",
    legalFirm: "Hãng luật doanh nghiệp",
    scope: "TP. Hồ Chí Minh",
    heroTitle: "Nền pháp lý vững, cho mọi công trình.",
    focus: "Trọng tâm",
    heroBody: "LHPT đồng hành cùng doanh nghiệp từ giấy phép đầu tiên đến phiên tòa cuối cùng: xây dựng, bất động sản, điện mặt trời, doanh nghiệp, tuân thủ và bảo vệ dữ liệu cá nhân.",
    response: "Phản hồi trong 24 giờ",
    confidential: "Bảo mật tuyệt đối hồ sơ",
    live: "Hồ sơ năng lực",
    internal: "Số liệu nội bộ",
    matters: "Vụ việc & dự án đã xử lý",
    practiceYears: "Năm hành nghề",
    handled: "Vụ việc & dự án đã xử lý",
    responseMetric: "Cam kết phản hồi hồ sơ",
    returning: "Khách hàng quay lại",
    servicesKicker: "Lĩnh vực hành nghề",
    servicesTitle: "Pháp lý đi cùng vận hành.",
    servicesSub: "Không chỉ trả lời câu hỏi pháp lý. Chúng tôi giúp doanh nghiệp nhìn thấy rủi ro trước khi nó trở thành chi phí.",
    serviceLeads: "Luật sư phụ trách",
    viewDetails: "Xem chi tiết",
    pricingKicker: "Pháp chế thuê ngoài",
    pricingTitle: "Một khoản phí rõ ràng.",
    pricingSub: "Chọn mức độ đồng hành phù hợp với quy mô, nhịp vận hành và khẩu vị rủi ro của doanh nghiệp.",
    perYear: "/ year",
    firstTime: "Ưu đãi lần đầu sử dụng dịch vụ",
    firstTimeDetail: "Doanh nghiệp ký hợp đồng dịch vụ pháp lý với LHPT lần đầu được giảm 50% phí của kỳ hợp đồng đầu tiên.",
    mostComplete: "Đầy đủ nhất",
    choosePlan: "Nhận đề xuất gói",
    approachKicker: "Cách chúng tôi làm việc",
    approachTitle: "Rõ từ đầu. Chắc đến cuối.",
    approachSub: "Một quy trình tốt không làm hồ sơ trở nên nặng nề hơn. Nó khiến quyết định lớn trở nên dễ nhìn thấy và dễ hành động.",
    approachNote: "đầu mối tiếp nhận, một người phụ trách, một lộ trình có thể kiểm tra.",
    newsKicker: "Theo dõi pháp lý",
    newsTitle: "Những thay đổi cần biết.",
    newsSub: "Cập nhật ngắn gọn các chuyển động pháp lý có thể tác động trực tiếp tới doanh nghiệp.",
    featured: "Nổi bật",
    readMore: "Đọc bài",
    articlesKicker: "Góc nhìn chuyên sâu",
    articlesTitle: "Lập luận trước, hành động sau.",
    articlesSub: "Các bài viết đi từ hồ sơ, mốc thời gian và căn cứ pháp lý — không phải từ những lời khuyên chung chung.",
    searchArticles: "Tìm bài viết",
    searchArticlesPlaceholder: "Tìm theo tiêu đề hoặc số hiệu văn bản…",
    all: "Tất cả",
    loadMoreArticles: "Xem thêm {n} bài",
    docsKicker: "Tra cứu nhanh",
    docsTitle: "Văn bản pháp luật trọng yếu.",
    docsSub: "Một lớp tra cứu gọn để đội ngũ có thể bắt đầu đúng từ căn cứ đang có hiệu lực.",
    searchDocs: "Tìm văn bản",
    searchDocsPlaceholder: "Tìm theo tên hoặc số hiệu, ví dụ 31/2024, DPPA, đất đai…",
    loadMoreDocs: "Xem thêm {n} văn bản",
    docsFootnote: "Tổng hợp phục vụ tham khảo · Đối chiếu công báo trước khi áp dụng",
    teamKicker: "Đội ngũ",
    teamTitle: "Kinh nghiệm đủ sâu để đi vào việc.",
    teamSub: "Mỗi hồ sơ được đặt vào đúng người phụ trách — người hiểu cả luật, ngành và áp lực vận hành phía sau quyết định.",
    years: "năm",
    policiesKicker: "Minh bạch từ đầu",
    policiesTitle: "Một cách làm việc có thể kiểm tra.",
    servicePolicy: "Chính sách dịch vụ",
    privacyPolicy: "Bảo mật dữ liệu",
    contactKicker: "Liên hệ",
    contactTitle: "Cần một quyết định pháp lý đúng lúc?",
    contactSub: "Gửi yêu cầu, luật sư phụ trách mảng sẽ phản hồi trong {time}.",
    hotline: "Hotline",
    office: "Văn phòng",
    workHours: "Giờ làm việc",
    name: "Họ tên *",
    phoneEmail: "SĐT / Email *",
    message: "Nội dung cần tư vấn",
    namePlaceholder: "Nguyễn Văn A",
    phonePlaceholder: "0901 234 567",
    messagePlaceholder: "Mô tả ngắn vụ việc, chúng tôi giữ bảo mật tuyệt đối.",
    sendRequest: "Gửi yêu cầu · phản hồi trong 24h",
    contactFallback: "Kênh này đang được hoàn thiện — liên hệ LHPT qua form, hotline hoặc email.",
    socialComingSoon: "Sắp ra mắt",
    system: "Hệ thống",
    legalPrivacy: "Pháp lý & quyền riêng tư",
    legalInfo: "Thông tin pháp lý tham khảo, không thay thế ý kiến pháp lý",
    askLawyer: "Hỏi luật sư",
    close: "Đóng",
    read: "Đọc",
    legalBasis: "Cơ sở pháp lý",
    news: "Tin pháp lý",
    deepArticle: "Bài viết chuyên sâu",
    noResults: "Không tìm thấy kết quả phù hợp.",
    backTop: "Về đầu trang",
    consultation: "Tư vấn pháp lý",
    mobileResponse: "Phản hồi trong 24 giờ",
    footerDisclaimer: "Nội dung trên website là thông tin pháp lý tham khảo, không cấu thành ý kiến pháp lý cho bất kỳ vụ việc cụ thể nào.",
    rights: "Mọi quyền được bảo lưu",
    serviceFooter: "Dịch vụ",
    articleFooter: "Bài viết pháp lý",
    newsFooter: "Tin tức nổi bật",
    docsFooter: "Hệ thống văn bản",
    teamFooter: "Đội ngũ luật sư",
    pricingFooter: "Bảng phí dịch vụ",
    privacyFooter: "Chính sách bảo mật",
    cookieFooter: "Quyền riêng tư & cookie",
    conflictFooter: "Xung đột lợi ích",
  },
  en: {
    language: "Tiếng Việt",
    languageLabel: "Switch to Vietnamese",
    nav: ["Services", "Fee schedule", "News", "Insights", "Legal library", "Our team", "Policies"],
    book: "Book a consultation",
    explore: "Explore services",
    legalFirm: "Corporate law firm",
    scope: "Ho Chi Minh City",
    heroTitle: "Sound legal ground for every undertaking.",
    focus: "Focus",
    heroBody: "LHPT stands with businesses from their first permit to their final hearing: construction, real estate, solar energy, corporate matters, compliance, and personal data protection.",
    response: "Response within 24 hours",
    confidential: "Strictly confidential files",
    live: "Firm credentials",
    internal: "Internal figures",
    matters: "Matters and projects handled",
    practiceYears: "Years in practice",
    handled: "Matters and projects handled",
    responseMetric: "File response commitment",
    returning: "Returning clients",
    servicesKicker: "Practice areas",
    servicesTitle: "Law that moves with operations.",
    servicesSub: "We do more than answer legal questions. We help businesses see risk before it becomes cost.",
    serviceLeads: "Responsible counsel",
    viewDetails: "View details",
    pricingKicker: "Outsourced legal function",
    pricingTitle: "One clear fee.",
    pricingSub: "Choose the level of support that fits your scale, operating rhythm, and risk appetite.",
    perYear: "/ year",
    firstTime: "First-engagement offer",
    firstTimeDetail: "Businesses signing their first legal services agreement with LHPT receive 50% off the first contract term.",
    mostComplete: "Most comprehensive",
    choosePlan: "Request a proposal",
    approachKicker: "How we work",
    approachTitle: "Clear from day one. Certain through the finish.",
    approachSub: "A good process does not make a matter heavier. It makes significant decisions visible and actionable.",
    approachNote: "one intake point, one responsible counsel, one trackable path.",
    newsKicker: "Legal watch",
    newsTitle: "Changes worth knowing.",
    newsSub: "Concise updates on legal developments that may directly affect businesses.",
    featured: "Featured",
    readMore: "Read article",
    articlesKicker: "In-depth insights",
    articlesTitle: "Argument first. Action second.",
    articlesSub: "Each note starts with the record, the timeline, and the legal basis — not generic advice.",
    searchArticles: "Find an article",
    searchArticlesPlaceholder: "Search by title or legal instrument number…",
    all: "All",
    loadMoreArticles: "View {n} more articles",
    docsKicker: "Quick reference",
    docsTitle: "Key legal instruments.",
    docsSub: "A concise reference layer for starting from the provisions currently in force.",
    searchDocs: "Find a legal instrument",
    searchDocsPlaceholder: "Search by name or number, e.g. 31/2024, DPPA, land…",
    loadMoreDocs: "View {n} more instruments",
    docsFootnote: "For reference only · Check the official gazette before application",
    teamKicker: "Our team",
    teamTitle: "Experience deep enough to get to the point.",
    teamSub: "Each matter is placed with the right counsel — someone who understands the law, the industry, and the operating pressure behind the decision.",
    years: "years",
    policiesKicker: "Transparent from the outset",
    policiesTitle: "A working method you can inspect.",
    servicePolicy: "Service policy",
    privacyPolicy: "Data protection",
    contactKicker: "Contact",
    contactTitle: "Need the right legal decision at the right time?",
    contactSub: "Send an enquiry and the counsel responsible for the relevant practice will respond within {time}.",
    hotline: "Hotline",
    office: "Office",
    workHours: "Working hours",
    name: "Name *",
    phoneEmail: "Phone / Email *",
    message: "Matter details",
    namePlaceholder: "Nguyen Van A",
    phonePlaceholder: "+84 901 234 567",
    messagePlaceholder: "Briefly describe the matter. Strict confidentiality applies.",
    sendRequest: "Send enquiry · response within 24h",
    contactFallback: "This channel is being prepared — contact LHPT through the form, hotline, or email.",
    socialComingSoon: "Coming soon",
    system: "System",
    legalPrivacy: "Legal & privacy",
    legalInfo: "For reference only; not a substitute for legal advice",
    askLawyer: "Ask a lawyer",
    close: "Close",
    read: "Read",
    legalBasis: "Legal basis",
    news: "Legal news",
    deepArticle: "In-depth article",
    noResults: "No matching results found.",
    backTop: "Back to top",
    consultation: "Legal consultation",
    mobileResponse: "Response within 24 hours",
    footerDisclaimer: "Website content is provided for general legal information only and does not constitute legal advice for any specific matter.",
    rights: "All rights reserved",
    serviceFooter: "Services",
    articleFooter: "Legal insights",
    newsFooter: "Featured news",
    docsFooter: "Legal library",
    teamFooter: "Our lawyers",
    pricingFooter: "Fee schedule",
    privacyFooter: "Privacy policy",
    cookieFooter: "Privacy & cookies",
    conflictFooter: "Conflicts of interest",
  },
} as const;

type Dictionary = (typeof DICTIONARY)[Locale];
type TranslationKey = keyof Dictionary;

type LocaleContextValue = {
  locale: Locale;
  isEnglish: boolean;
  /*
   * Tăng lên một nấc khi kho nội dung tiếng Anh tải xong. Bản dịch bài viết, tin
   * và văn bản nằm trong một module nạp động, tức chúng tới SAU khi `locale` đã
   * đổi. Nơi nào bọc localizeDoc/localizeLegalDoc trong useMemo thì phải kê thêm
   * giá trị này vào deps, nếu không memo giữ nguyên kết quả tiếng Việt tính lúc
   * bản dịch chưa về và trang không bao giờ đổi sang tiếng Anh.
   */
  contentVersion: number;
  toggleLocale: () => void;
  t: <K extends TranslationKey>(key: K) => Dictionary[K];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "vi";
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "vi";
  });

  const [translationVersion, setTranslationVersion] = useState(0);

  useEffect(() => {
    let active = true;
    if (locale === "en" && !englishContent) {
      import("./content/english").then((module) => {
        if (!active) return;
        englishContent = module;
        setTranslationVersion((version) => version + 1);
      });
    }
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
    return () => {
      active = false;
    };
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      isEnglish: locale === "en",
      contentVersion: translationVersion,
      toggleLocale: () => setLocale((current) => (current === "vi" ? "en" : "vi")),
      t: (key) => DICTIONARY[locale][key],
    }),
    [locale, translationVersion]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}

const LEGAL_NAME_EN: Record<string, string> = {
  d1: "Land Law 2024",
  d2: "Land Law 2013",
  d3: "Decree detailing certain provisions of the Land Law",
  d4: "Law on Real Estate Business 2023",
  d5: "Law on Real Estate Business 2014",
  d6: "Housing Law 2023",
  d7: "Decree detailing the Law on Real Estate Business",
  d8: "Construction Law 2014 (as amended in 2020)",
  d9: "Decree on Construction Activity Management",
  d10: "Decree on Management of Construction Investment Projects",
  d11: "Decree on Quality Management, Construction Execution and Maintenance of Works",
  d12: "Law on Bidding 2023",
  d13: "Law on Bidding 2013",
  d14: "Electricity Law 2024",
  d15: "Electricity Law 2004",
  d16: "Decree on the Direct Power Purchase Mechanism (DPPA)",
  d17: "Decree guiding the implementation of the Electricity Law",
  d18: "Decision on Incentives for Solar Power Development (FIT 2)",
  d19: "Law on Enterprises 2020",
  d20: "Law amending and supplementing certain provisions of the Law on Enterprises",
  d21: "Law on Enterprises 2014",
  d22: "Law on Investment 2020",
  d23: "Law on Corporate Income Tax 2025",
  d24: "Law on Value-Added Tax 2024",
  d25: "Law on Value-Added Tax 2008",
  d26: "Law on Tax Administration 2019",
  d27: "Law on Personal Data Protection 2025",
  d28: "Decree on Personal Data Protection",
  d29: "Decree on Assurance of Information System Security by Level",
  d30: "Law on Commercial Arbitration 2010",
  d31: "Civil Procedure Code 2015",
  d32: "Civil Code 2015",
};

const CATEGORY_MAP: Record<string, [string, string]> = {
  "Xây dựng · BĐS": ["Xây dựng · BĐS", "Construction · Real Estate"],
  "Tố tụng": ["Tố tụng", "Litigation"],
  "Năng lượng": ["Năng lượng", "Energy"],
  "Doanh nghiệp": ["Doanh nghiệp", "Corporate"],
  "Dữ liệu": ["Dữ liệu", "Data Protection"],
  "Đất đai": ["Đất đai", "Land"],
  "Bất động sản": ["Bất động sản", "Real Estate"],
  "Xây dựng": ["Xây dựng", "Construction"],
  "Đấu thầu": ["Đấu thầu", "Bidding"],
  "Thuế": ["Thuế", "Tax"],
};

export function localizeCategory(value: string, locale: Locale) {
  if (value === "Tất cả") return locale === "en" ? "All" : value;
  return CATEGORY_MAP[value]?.[locale === "en" ? 1 : 0] ?? value;
}

export function localizeStatus(value: string, locale: Locale) {
  if (locale === "vi") return value;
  return { "Còn hiệu lực": "In force", "Hết hiệu lực một phần": "Partially in force", "Hết hiệu lực": "Repealed" }[value] ?? value;
}

export function localizeType(value: string, locale: Locale) {
  if (locale === "vi") return value;
  return { Luật: "Law", "Nghị định": "Decree", "Quyết định": "Decision" }[value] ?? value;
}

type TranslatedDoc = {
  category?: string;
  title?: string;
  excerpt?: string;
  content?: readonly string[];
  basis?: readonly string[];
  author?: string;
};

type TranslatedLegalDoc = {
  name?: string;
  type?: string;
  field?: string;
  summary?: string;
  highlights?: readonly string[];
  replacedBy?: string;
};

export function localizeDoc(item: DocItem, locale: Locale): DocItem {
  if (locale === "vi") return item;
  const source = (item.kind === "news" ? englishContent?.EN_NEWS : englishContent?.EN_ARTICLES) as unknown as Record<string, TranslatedDoc> | undefined;
  const translated = source?.[item.id];
  return translated
    ? {
        ...item,
        ...translated,
        content: translated.content ? [...translated.content] : item.content,
        basis: translated.basis ? [...translated.basis] : item.basis,
        date: item.date,
        readMinutes: item.readMinutes,
        kind: item.kind,
      }
    : item;
}

export function localizeLegalDoc(item: LegalDoc, locale: Locale): LegalDoc {
  if (locale === "vi") return item;
  const translated = (englishContent?.EN_LEGAL_DOCS as unknown as Record<string, TranslatedLegalDoc> | undefined)?.[item.id];
  return translated
    ? {
        ...item,
        ...translated,
        name: LEGAL_NAME_EN[item.id] ?? translated.name ?? item.name,
        type: item.type,
        status: item.status,
        effective: item.effective,
        expired: item.expired,
        highlights: translated.highlights ? [...translated.highlights] : item.highlights,
        replacedBy: item.replacedBy,
      }
    : item;
}

const SERVICE_EN: Record<string, Partial<Service>> = {
  "01": { title: "Construction · Real Estate", tagline: "Full-lifecycle project counsel, from land to title.", items: ["Tendering, EPC and FIDIC contracts", "Construction permits and 1/500 detailed planning", "Project transfers and land M&A", "Acceptance, final accounts and defects liability"], tags: ["Projects", "Land", "FIDIC"], leads: ["Lawyer Trung Pham", "Lawyer Long Nguyen"] },
  "02": { title: "Litigation · Dispute Resolution", tagline: "Litigation and negotiation strategy grounded in the record, not instinct.", items: ["Construction and EPC disputes", "Commercial, shareholder and corporate disputes", "Administrative matters: land recovery and compensation", "Commercial arbitration and judgment enforcement"], tags: ["Courts", "Arbitration", "EPC"], leads: ["Lawyer Trung Pham", "Lawyer Long Nguyen", "Lawyer Huy Dang", "Lawyer Phu Hoang"] },
  "03": { title: "Solar · Energy", tagline: "From power permits to long-term power purchase arrangements.", items: ["Power purchase agreements and DPPA mechanism", "Electricity activity licences", "Rooftop solar for self-generation and self-consumption", "EPC and O&M, guarantees and project insurance"], tags: ["PPA", "DPPA", "ESG"], leads: ["Lawyer Trung Pham", "Lawyer Long Nguyen"] },
  "04": { title: "Corporate · Compliance", tagline: "A legal back office for the daily operation of a business.", items: ["Corporate governance, restructuring and M&A", "Tax, invoices and filing compliance", "Employment, social insurance and workplace rules", "Retained legal support and risk control"], tags: ["Governance", "Compliance", "M&A"], leads: ["Lawyer Huy Dang", "Lawyer Phu Hoang"] },
  "05": { title: "Data Protection · Technology", tagline: "Turn personal data obligations into a working control system.", items: ["Personal data compliance and impact assessments", "Privacy policies and data processing agreements", "Incident response and regulator engagement", "Technology transactions and cybersecurity"], tags: ["DPO", "Privacy", "Tech"], leads: ["Lawyer Huy Dang", "Lawyer Phu Hoang"] },
};

export function localizeService(service: Service, locale: Locale): Service {
  return locale === "en" ? { ...service, ...SERVICE_EN[service.num] } : service;
}

const PLAN_EN: Record<string, Partial<Plan>> = {
  basic: { name: "Regular Counsel", unit: "₫ / year", approx: "≈ VND 15 million per month", note: "For small and medium-sized businesses seeking stable legal support with controlled costs.", features: ["10 advisory hours per month", "Review of template and recurring contracts", "Legal queries answered by email within 48 hours", "Monthly industry legal bulletin", "Review of workplace rules and personnel files"] },
  standard: { name: "Outsourced Legal Counsel", unit: "₫ / year", approx: "≈ VND 35 million per month", note: "For businesses requiring periodic risk reviews and contract support as needs arise.", features: ["40 hours of in-depth advice per month", "Unlimited contract review and drafting", "Written legal opinions signed by counsel", "Business-hours hotline", "Quarterly legal risk report", "Annual personal data compliance review"] },
  premium: { name: "General Counsel Office", unit: "million ₫ / year", approx: "Fee agreed by group scale and number of legal entities", note: "A full legal function: dedicated counsel by practice, ready when a dispute emerges.", features: ["Unlimited advisory hours", "Dedicated counsel by practice", "Representation in courts and commercial arbitration", "Representation before state authorities", "Legal due diligence for projects and M&A", "Quarterly in-house legal training", "Comprehensive compliance review twice a year", "Personal data processing impact assessment file", "Priority hotline outside business hours and on holidays"], badge: "Most comprehensive" },
};

export function localizePlan(plan: Plan, locale: Locale): Plan {
  return locale === "en" ? { ...plan, ...PLAN_EN[plan.id] } : plan;
}

const LAWYER_EN: Record<string, Partial<Lawyer>> = {
  l1: { name: "Lawyer Trung Pham", role: "Managing Partner", years: "18 years", focus: ["Construction · Real Estate", "Litigation", "Solar Energy"] },
  l2: { name: "Lawyer Long Nguyen", role: "Partner", years: "15 years", focus: ["Construction · Real Estate", "Litigation", "Solar Energy"] },
  l3: { name: "Lawyer Huy Dang", role: "Partner", years: "14 years", focus: ["Data Protection", "Litigation", "Corporate"] },
  l4: { name: "Lawyer Phu Hoang", role: "Partner", years: "12 years", focus: ["Data Protection", "Litigation", "Corporate"] },
};

export function localizeLawyer(lawyer: Lawyer, locale: Locale): Lawyer {
  return locale === "en" ? { ...lawyer, ...LAWYER_EN[lawyer.id] } : lawyer;
}

const POLICY_EN: Record<string, PolicyItem> = {
  "Phạm vi dịch vụ": { q: "Scope of services", a: "LHPT provides legal advice, drafting and review of documents, negotiation representation and litigation in construction, real estate, solar energy, corporate, compliance and personal data protection matters. The firm operates in Ho Chi Minh City." },
  "Quy trình tiếp nhận": { q: "Intake process", a: "Every matter is received through one intake point: an initial assessment within 24 business hours, a proposed approach and fee quote within three business days. No fee arises beyond a written quote confirmed by the client." },
  "Phí và thanh toán": { q: "Fees and payment", a: "Fees are charged by the hour, by matter, or under an annual legal support plan. The three current plans are VND 180 million, VND 420 million, and VND 650–750 million per year, excluding VAT, court fees, arbitration fees and state charges." },
  "Ưu đãi lần đầu sử dụng dịch vụ": { q: "First-engagement offer", a: "A business signing its first legal services agreement with LHPT receives 50% off the first contract term. The offer applies to all three plans, is calculated on the quoted fee, and cannot be combined with another promotion." },
  "Xung đột lợi ích": { q: "Conflicts of interest", a: "Before accepting a matter, we conduct a system-wide conflict check. If a conflict arises, the client is notified and receives the file back together with a refund for work not performed." },
  "Dữ liệu chúng tôi thu thập": { q: "Data we collect", a: "We collect only data necessary for the matter: contact details, legal records supplied by the client, and communication history. We do not collect data beyond the scope of the authorization." },
  "Mục đích sử dụng": { q: "Purpose of use", a: "Data is used only to perform the legal services under the engagement: preparing files, working with state authorities, conducting proceedings, and reporting to the client." },
  "Lưu trữ và bảo vệ": { q: "Storage and protection", a: "Files are encrypted at rest, access is permissioned on a need-to-know basis, backups are made periodically, and security is reviewed twice a year. Retention follows the Law on Lawyers and the client's requirements." },
  "Quyền của chủ thể dữ liệu": { q: "Data subject rights", a: "Under the Law on Personal Data Protection No. 91/2025/QH15, clients have the right to be informed, to consent and withdraw consent, to access, correct and request deletion of data. Requests must be sent in writing to dpo@lhpt.law." },
  "Cookie và theo dõi": { q: "Cookies and tracking", a: "The website uses technical cookies to maintain the session and measure anonymous usage. We do not sell or share personal data with third parties for advertising purposes." },
};

export function localizePolicy(item: PolicyItem, locale: Locale): PolicyItem {
  return locale === "en" ? POLICY_EN[item.q] ?? item : item;
}

export const APPROACH_EN = {
  "01": { title: "Start with the operating reality", body: "We begin with how the business actually runs, not with a standard consultation template." },
  "02": { title: "Close with the record", body: "Every recommendation resolves into a legal basis, a timeline, and one clearly responsible person." },
  "03": { title: "Stay through the finish", body: "From permits and contracts to disputes, the team keeps one consistent standard across the file." },
};

/** Ghép số phút đọc với đơn vị theo ngôn ngữ đang hiển thị. */
export function formatReadingTime(minutes: number, locale: Locale) {
  return locale === "en" ? `${minutes} min` : `${minutes} phút`;
}

export function interpolate(value: string, vars: Record<string, string>) {
  return Object.entries(vars).reduce((result, [key, replacement]) => result.replace(`{${key}}`, replacement), value);
}
