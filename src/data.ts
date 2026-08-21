/* ================= DỮ LIỆU HỆ THỐNG ================= */

export type { DocItem } from "./content/types";
export { ARTICLES, ARTICLE_CATEGORIES } from "./content/articles";
export { NEWS } from "./content/news";
export { LEGAL_DOCS, LEGAL_FIELDS, type LegalDoc } from "./content/legalDocs";

/* ================= HỒ SƠ HÃNG LUẬT ================= */

export const FIRM = {
  name: "LHPT Law Firm",
  short: "LHPT",
  tagline: "Hãng luật doanh nghiệp — TP. Hồ Chí Minh",
  scope: "TP. Hồ Chí Minh",
  hotline: "(+84) 941563789",
  hotlineHref: "tel:+84941563789",
  email: "contact@lhpt.law",
  dpoEmail: "dpo@lhpt.law",
  office: "Nguyễn Thị Minh Khai, phường Sài Gòn, Quận 1, TP. Hồ Chí Minh",
  officeShort: "Nguyễn Thị Minh Khai, phường Sài Gòn, Q.1",
  hours: "Thứ 2 – Thứ 6 · 08:00 – 18:00",
  responseTime: "24 giờ làm việc",
} as const;

/* ================= DỊCH VỤ ================= */

export type Service = {
  num: string;
  icon: "crane" | "scale" | "solar" | "deal" | "shield";
  title: string;
  tagline: string;
  items: string[];
  tags: string[];
  leads: string[];
};

export const SERVICES: Service[] = [
  {
    num: "01",
    icon: "crane",
    title: "Xây dựng · Bất động sản",
    tagline: "Pháp lý toàn vòng đời dự án, từ đất đến sổ.",
    items: [
      "Đấu thầu, hợp đồng EPC và FIDIC",
      "Giấy phép xây dựng, quy hoạch chi tiết 1/500",
      "Chuyển nhượng dự án, M&A đất đai",
      "Nghiệm thu, quyết toán, bảo hành công trình",
    ],
    tags: ["Dự án", "Đất đai", "FIDIC"],
    leads: ["LS. Trung Phạm", "LS. Long Nguyễn"],
  },
  {
    num: "02",
    icon: "scale",
    title: "Tố tụng · Giải quyết tranh chấp",
    tagline: "Chiến lược kiện và đàm phán dựa trên hồ sơ, không cảm tính.",
    items: [
      "Tranh chấp xây dựng, hợp đồng EPC",
      "Kinh doanh thương mại, tranh chấp cổ đông",
      "Hành chính: thu hồi đất, bồi thường",
      "Trọng tài thương mại và thi hành án",
    ],
    tags: ["Tòa án", "Trọng tài", "EPC"],
    leads: ["LS. Trung Phạm", "LS. Long Nguyễn", "LS. Huy Đặng", "LS. Phú Hoàng"],
  },
  {
    num: "03",
    icon: "solar",
    title: "Điện mặt trời · Năng lượng",
    tagline: "Đồng hành từ giấy phép điện lực đến hợp đồng mua bán điện dài hạn.",
    items: [
      "Hợp đồng mua bán điện, cơ chế DPPA",
      "Giấy phép hoạt động điện lực",
      "Điện mặt trời mái nhà tự sản, tự tiêu",
      "EPC và O&M, bảo lãnh, bảo hiểm dự án",
    ],
    tags: ["PPA", "DPPA", "ESG"],
    leads: ["LS. Trung Phạm", "LS. Long Nguyễn"],
  },
  {
    num: "04",
    icon: "deal",
    title: "Doanh nghiệp · Tuân thủ",
    tagline: "Hậu phương pháp lý cho vận hành doanh nghiệp mỗi ngày.",
    items: [
      "Quản trị doanh nghiệp, tái cấu trúc, M&A",
      "Tuân thủ thuế, hóa đơn và nghĩa vụ kê khai",
      "Lao động, bảo hiểm xã hội, nội quy công ty",
      "Pháp chế thường xuyên và kiểm soát rủi ro",
    ],
    tags: ["Doanh nghiệp", "Tuân thủ", "Thuế"],
    leads: ["LS. Huy Đặng", "LS. Phú Hoàng"],
  },
  {
    num: "05",
    icon: "shield",
    title: "Bảo mật dữ liệu · Công nghệ",
    tagline: "Tuân thủ dữ liệu cá nhân trước khi bị phạt, không phải sau.",
    items: [
      "Tuân thủ Luật Bảo vệ dữ liệu cá nhân 2025",
      "Đánh giá tác động xử lý dữ liệu cá nhân",
      "Chính sách quyền riêng tư, điều khoản nền tảng",
      "Ứng phó sự cố lộ, mất dữ liệu cá nhân",
    ],
    tags: ["Dữ liệu cá nhân", "DPIA", "Cyber"],
    leads: ["LS. Huy Đặng", "LS. Phú Hoàng"],
  },
];

/* ================= GÓI PHÁP CHẾ ================= */

export type Plan = {
  id: string;
  name: string;
  price: string;
  unit: string;
  approx: string;
  note: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
  tier: "basic" | "standard" | "premium";
};

export const FIRST_TIME_DISCOUNT = {
  percent: 50,
  label: "Giảm 50% cho lần đầu sử dụng dịch vụ",
  detail:
    "Doanh nghiệp ký hợp đồng dịch vụ pháp lý với LHPT lần đầu được giảm 50% phí của kỳ hợp đồng đầu tiên, áp dụng cho cả ba gói. Ưu đãi tính trên phí đã báo giá, không cộng dồn với chương trình khác.",
} as const;

export const PLANS: Plan[] = [
  {
    id: "basic",
    tier: "basic",
    name: "Pháp chế Thường",
    price: "180.000.000",
    unit: "₫ / năm",
    approx: "≈ 15 triệu đồng mỗi tháng",
    note: "Dành cho doanh nghiệp vừa và nhỏ cần một chỗ dựa pháp lý ổn định với chi phí kiểm soát được.",
    features: [
      "10 giờ tư vấn mỗi tháng",
      "Rà soát hợp đồng mẫu và hợp đồng lặp lại",
      "Giải đáp pháp lý qua email trong 48 giờ",
      "Bản tin pháp lý hàng tháng theo ngành",
      "Rà soát nội quy lao động và hồ sơ nhân sự",
    ],
  },
  {
    id: "standard",
    tier: "standard",
    name: "Pháp chế Thuê ngoài",
    price: "420.000.000",
    unit: "₫ / năm",
    approx: "≈ 35 triệu đồng mỗi tháng",
    note: "Phù hợp doanh nghiệp cần rà soát rủi ro định kỳ và hỗ trợ hợp đồng theo nhu cầu phát sinh.",
    features: [
      "40 giờ tư vấn chuyên sâu mỗi tháng",
      "Rà soát và soạn thảo hợp đồng không giới hạn số lượng",
      "Ý kiến pháp lý bằng văn bản có chữ ký luật sư",
      "Hotline trong giờ hành chính",
      "Báo cáo rủi ro pháp lý hàng quý",
      "Rà soát tuân thủ dữ liệu cá nhân mỗi năm một lần",
    ],
  },
  {
    id: "premium",
    tier: "premium",
    name: "Tổng cố vấn Pháp chế",
    price: "650 – 750",
    unit: "triệu ₫ / năm",
    approx: "Phí chốt theo quy mô và số pháp nhân trong nhóm",
    note: "Một phòng pháp chế đầy đủ: luật sư chuyên trách từng mảng, có mặt ngay khi tranh chấp phát sinh.",
    features: [
      "Không giới hạn giờ tư vấn",
      "Luật sư chuyên trách theo từng mảng nghiệp vụ",
      "Đại diện tố tụng tại Tòa án và trọng tài thương mại",
      "Đại diện làm việc với cơ quan nhà nước",
      "Thẩm định pháp lý dự án và giao dịch M&A",
      "Đào tạo pháp lý nội bộ mỗi quý",
      "Rà soát tuân thủ toàn diện 2 lần mỗi năm",
      "Hồ sơ đánh giá tác động xử lý dữ liệu cá nhân",
      "Hotline ưu tiên ngoài giờ và ngày nghỉ",
    ],
    highlight: true,
    badge: "Đầy đủ nhất",
  },
];

/* ================= ĐỘI NGŨ ================= */

export type Lawyer = {
  id: string;
  name: string;
  role: string;
  years: string;
  focus: string[];
  email: string;
  /** Để trống có chủ đích: ảnh chân dung sẽ được bổ sung sau. */
  img: string;
};

export const LAWYERS: Lawyer[] = [
  {
    id: "l1",
    name: "LS. Trung Phạm",
    role: "Luật sư Điều hành",
    years: "18 năm",
    focus: ["Xây dựng · BĐS", "Tố tụng", "Điện mặt trời"],
    email: "trung.pham@lhpt.law",
    img: "",
  },
  {
    id: "l2",
    name: "LS. Long Nguyễn",
    role: "Luật sư Thành viên",
    years: "15 năm",
    focus: ["Xây dựng · BĐS", "Tố tụng", "Điện mặt trời"],
    email: "long.nguyen@lhpt.law",
    img: "",
  },
  {
    id: "l3",
    name: "LS. Huy Đặng",
    role: "Luật sư Thành viên",
    years: "14 năm",
    focus: ["Bảo mật dữ liệu", "Tố tụng", "Doanh nghiệp"],
    email: "huy.dang@lhpt.law",
    img: "",
  },
  {
    id: "l4",
    name: "LS. Phú Hoàng",
    role: "Luật sư Thành viên",
    years: "12 năm",
    focus: ["Bảo mật dữ liệu", "Tố tụng", "Doanh nghiệp"],
    email: "phu.hoang@lhpt.law",
    img: "",
  },
];

/* ================= CHÍNH SÁCH ================= */

export type PolicyItem = { q: string; a: string };

export const POLICIES_SERVICE: PolicyItem[] = [
  {
    q: "Phạm vi dịch vụ",
    a: "LHPT cung cấp tư vấn pháp lý, soạn thảo và rà soát văn bản, đại diện đàm phán và tranh tụng trong các lĩnh vực xây dựng, bất động sản, điện mặt trời, doanh nghiệp, tuân thủ và bảo vệ dữ liệu cá nhân. Địa bàn hoạt động của hãng là TP. Hồ Chí Minh.",
  },
  {
    q: "Quy trình tiếp nhận",
    a: "Mọi vụ việc được tiếp nhận qua một đầu mối: đánh giá sơ bộ trong 24 giờ làm việc, đề xuất phương án và báo phí trong 3 ngày làm việc. Không phát sinh phí ngoài báo giá đã xác nhận bằng văn bản.",
  },
  {
    q: "Phí và thanh toán",
    a: "Phí tính theo giờ, theo vụ việc hoặc theo gói pháp chế năm. Ba gói hiện hành là 180 triệu đồng, 420 triệu đồng và 650 đến 750 triệu đồng mỗi năm, chưa gồm thuế giá trị gia tăng, án phí, phí trọng tài và các khoản nộp ngân sách nhà nước.",
  },
  {
    q: "Ưu đãi lần đầu sử dụng dịch vụ",
    a: "Doanh nghiệp ký hợp đồng dịch vụ pháp lý với LHPT lần đầu được giảm 50% phí của kỳ hợp đồng đầu tiên. Ưu đãi áp dụng cho cả ba gói pháp chế, tính trên phí đã báo giá và không cộng dồn với chương trình ưu đãi khác.",
  },
  {
    q: "Xung đột lợi ích",
    a: "Trước khi nhận vụ việc, chúng tôi kiểm tra xung đột lợi ích trên toàn hệ thống hồ sơ. Nếu phát sinh xung đột, khách hàng được thông báo và nhận lại hồ sơ kèm hoàn phí phần công việc chưa thực hiện.",
  },
];

export const POLICIES_PRIVACY: PolicyItem[] = [
  {
    q: "Dữ liệu chúng tôi thu thập",
    a: "Chỉ thu thập dữ liệu cần thiết cho vụ việc: thông tin liên hệ, hồ sơ pháp lý do khách hàng cung cấp và lịch sử trao đổi. Không thu thập dữ liệu ngoài phạm vi ủy quyền.",
  },
  {
    q: "Mục đích sử dụng",
    a: "Dữ liệu chỉ dùng để thực hiện dịch vụ pháp lý theo hợp đồng: chuẩn bị hồ sơ, làm việc với cơ quan nhà nước, tham gia tố tụng và báo cáo cho khách hàng.",
  },
  {
    q: "Lưu trữ và bảo vệ",
    a: "Hồ sơ được mã hóa khi lưu trữ, phân quyền truy cập theo nguyên tắc cần biết, sao lưu định kỳ và kiểm tra bảo mật hai lần mỗi năm. Thời hạn lưu trữ theo quy định của Luật Luật sư và yêu cầu của khách hàng.",
  },
  {
    q: "Quyền của chủ thể dữ liệu",
    a: "Theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, khách hàng có quyền được biết, quyền đồng ý và rút lại đồng ý, quyền truy cập, chỉnh sửa và yêu cầu xóa dữ liệu. Yêu cầu gửi bằng văn bản tới dpo@lhpt.law.",
  },
  {
    q: "Cookie và theo dõi",
    a: "Website chỉ dùng cookie kỹ thuật để duy trì phiên làm việc và đo lường ẩn danh. Chúng tôi không bán và không chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích quảng cáo.",
  },
];

/* ================= TICKER ================= */

export const TICKER: string[] = [
  "LUẬT BẢO VỆ DỮ LIỆU CÁ NHÂN 2025 · HIỆU LỰC 01.01.2026",
  "LUẬT THUẾ THU NHẬP DOANH NGHIỆP 2025 · HIỆU LỰC 01.10.2025",
  "LUẬT THUẾ GIÁ TRỊ GIA TĂNG 2024 · HIỆU LỰC 01.07.2025",
  "LUẬT ĐIỆN LỰC 2024 · HIỆU LỰC 01.02.2025",
  "LUẬT ĐẤT ĐAI 2024 · HIỆU LỰC 01.08.2024",
  "LUẬT KINH DOANH BĐS 2023 · HIỆU LỰC 01.08.2024",
  "LUẬT NHÀ Ở 2023 · HIỆU LỰC 01.08.2024",
  "LUẬT ĐẤU THẦU 2023 · HIỆU LỰC 01.01.2024",
  "NGHỊ ĐỊNH 175/2024 · QUẢN LÝ HOẠT ĐỘNG XÂY DỰNG",
  "NGHỊ ĐỊNH 80/2024 · MUA BÁN ĐIỆN TRỰC TIẾP (DPPA)",
  "NGHỊ ĐỊNH 58/2025 · HƯỚNG DẪN LUẬT ĐIỆN LỰC",
  "LUẬT DOANH NGHIỆP SỬA ĐỔI 2025 · SỐ 76/2025/QH15",
];

export const NAV_LINKS = [
  { href: "#dich-vu", label: "Dịch vụ" },
  { href: "#bang-phi", label: "Bảng phí" },
  { href: "#tin-tuc", label: "Tin tức" },
  { href: "#bai-viet", label: "Bài viết" },
  { href: "#van-ban", label: "Văn bản" },
  { href: "#doi-ngu", label: "Đội ngũ" },
  { href: "#chinh-sach", label: "Chính sách" },
];
