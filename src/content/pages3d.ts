/*
 * Nội dung cho hai trang có cảnh 3D.
 *
 * Tách khỏi DICTIONARY trong i18n.tsx có chủ đích: từ điển đó là các nhãn giao
 * diện ngắn dùng khắp nơi, còn đây là văn bản dài của riêng hai trang. Nhồi
 * chúng vào cùng một chỗ sẽ khiến từ điển phình lên và mọi trang đều phải tải
 * phần chữ mà chúng không dùng tới.
 *
 * Về căn cứ pháp lý: các trang này là nội dung giới thiệu năng lực, không phải
 * ý kiến pháp lý, nên chỉ dẫn tên văn bản chứ không viện dẫn tới từng điều
 * khoản. Nêu đích danh một điều luật ở đây mà văn bản được sửa đổi về sau thì cả
 * trang lập tức sai, trong khi tên văn bản thì bền hơn nhiều.
 */

export type Bilingual = { vi: string; en: string };
export type BilingualList = { vi: string[]; en: string[] };

export const pick = (value: Bilingual, isEnglish: boolean) => (isEnglish ? value.en : value.vi);
export const pickList = (value: BilingualList, isEnglish: boolean) =>
  isEnglish ? value.en : value.vi;

/* ================= TRANG 1 — NỀN MÓNG PHÁP LÝ ================= */

export type FoundationStage = {
  id: string;
  /** Đợt mảnh tương ứng trong khối rubik ở cảnh 3D. */
  layer: Bilingual;
  title: Bilingual;
  lead: Bilingual;
  items: BilingualList;
  basis: Bilingual;
  /** Điều xảy ra khi bỏ qua tầng này — phần khách hàng nhớ lâu nhất. */
  risk: Bilingual;
};

export const FOUNDATION_STAGES: FoundationStage[] = [
  {
    id: "dat-dai",
    layer: { vi: "Nền móng", en: "Foundation" },
    title: {
      vi: "Trước khi đổ mẻ bê tông đầu tiên",
      en: "Before the first pour of concrete",
    },
    lead: {
      vi: "Phần lớn tranh chấp mà chúng tôi nhận vào ở giai đoạn thi công thật ra đã hình thành từ hồ sơ đất đai và chấp thuận đầu tư, lúc công trường còn chưa có gì để nhìn.",
      en: "Most disputes that reach us during construction were in fact created in the land and investment file, back when there was still nothing on site to look at.",
    },
    items: {
      vi: [
        "Chấp thuận chủ trương đầu tư và lựa chọn nhà đầu tư",
        "Giao đất, cho thuê đất, chuyển mục đích sử dụng đất",
        "Quy hoạch chi tiết 1/500 và các chỉ tiêu kiến trúc",
        "Nghĩa vụ tài chính về đất và giấy chứng nhận",
      ],
      en: [
        "In-principle investment approval and investor selection",
        "Land allocation, land lease and change of land use purpose",
        "1/500 detailed planning and architectural parameters",
        "Land financial obligations and title certificates",
      ],
    },
    basis: {
      vi: "Luật Đất đai 2024 · Luật Đầu tư 2020 · Luật Nhà ở 2023 · Luật Kinh doanh bất động sản 2023",
      en: "Land Law 2024 · Investment Law 2020 · Housing Law 2023 · Law on Real Estate Business 2023",
    },
    risk: {
      vi: "Sai một chỉ tiêu quy hoạch ở bước này thì cả toà nhà phải xin điều chỉnh giấy phép về sau.",
      en: "One wrong planning parameter here means the whole building goes back for a permit amendment later.",
    },
  },
  {
    id: "hop-dong",
    layer: { vi: "Cột trụ", en: "Columns" },
    title: {
      vi: "Bộ hợp đồng chịu lực cho cả dự án",
      en: "The contract set that carries the load",
    },
    lead: {
      vi: "Hợp đồng là thứ duy nhất còn đứng vững khi tiến độ trượt, giá vật liệu nhảy và các bên bắt đầu đổ lỗi cho nhau. Chúng tôi soạn nó theo đúng hướng đó ngay từ đầu.",
      en: "The contract is the only thing still standing when the schedule slips, material prices jump and the parties start assigning blame. We draft it for that moment from day one.",
    },
    items: {
      vi: [
        "Hợp đồng EPC và hợp đồng thi công theo điều kiện FIDIC",
        "Chuỗi thầu phụ và cơ chế back-to-back",
        "Bảo lãnh thực hiện, tạm ứng và bảo hành",
        "Điều chỉnh giá, khối lượng phát sinh, gia hạn thời gian",
      ],
      en: [
        "EPC and construction contracts on FIDIC conditions",
        "Subcontract chains and back-to-back mechanics",
        "Performance, advance payment and warranty guarantees",
        "Price adjustment, variations and extensions of time",
      ],
    },
    basis: {
      vi: "Luật Xây dựng · Luật Đấu thầu 2023 · Nghị định 175/2024 · Bộ điều kiện hợp đồng FIDIC",
      en: "Construction Law · Law on Bidding 2023 · Decree 175/2024 · FIDIC conditions of contract",
    },
    risk: {
      vi: "Điều khoản back-to-back viết lỏng là cách nhanh nhất để tổng thầu ôm trọn rủi ro của thầu phụ.",
      en: "A loosely drafted back-to-back clause is the fastest way for a main contractor to absorb every subcontractor risk.",
    },
  },
  {
    id: "thi-cong",
    layer: { vi: "Sàn và dầm", en: "Slabs and beams" },
    title: {
      vi: "Giữ hồ sơ sạch trong lúc công trường đang chạy",
      en: "Keeping the record clean while the site runs",
    },
    lead: {
      vi: "Giai đoạn này ít ai gọi luật sư, cho tới lúc cần chứng minh rằng một mốc thời gian đã thực sự xảy ra. Hồ sơ tuân thủ chính là bằng chứng đó.",
      en: "Few clients call a lawyer at this stage, until they need to prove that a date actually happened. The compliance record is that proof.",
    },
    items: {
      vi: [
        "Giấy phép xây dựng và thủ tục điều chỉnh giấy phép",
        "Quản lý chất lượng, nhật ký thi công, biên bản hiện trường",
        "An toàn lao động và phân định trách nhiệm giữa các bên",
        "Nghiệm thu giai đoạn và xác nhận khối lượng",
      ],
      en: [
        "Construction permits and permit amendments",
        "Quality management, site diaries and field minutes",
        "Occupational safety and allocation of responsibility",
        "Stage acceptance and confirmation of quantities",
      ],
    },
    basis: {
      vi: "Luật Xây dựng · Nghị định 175/2024 · pháp luật về an toàn, vệ sinh lao động",
      en: "Construction Law · Decree 175/2024 · occupational safety and health legislation",
    },
    risk: {
      vi: "Không có biên bản đúng thời điểm thì khiếu nại chậm tiến độ về sau gần như không đứng được.",
      en: "Without minutes taken at the right moment, a later delay claim has almost nothing to stand on.",
    },
  },
  {
    id: "quyet-toan",
    layer: { vi: "Mái", en: "Roof" },
    title: {
      vi: "Chốt sổ, không để treo",
      en: "Close the books, leave nothing hanging",
    },
    lead: {
      vi: "Quyết toán treo là khoản phải thu nằm im trên bảng cân đối kế toán nhiều năm liền. Phần lớn trường hợp, nó treo vì hồ sơ nghiệm thu thiếu đúng một chữ ký.",
      en: "An unsettled final account is a receivable that sits on the balance sheet for years. Most of the time it sits there because the acceptance file is missing exactly one signature.",
    },
    items: {
      vi: [
        "Nghiệm thu hoàn thành và bàn giao đưa vào sử dụng",
        "Quyết toán khối lượng và xử lý phát sinh cuối kỳ",
        "Bảo hành công trình và tiền giữ lại bảo hành",
        "Hoàn công và cập nhật tài sản trên giấy chứng nhận",
      ],
      en: [
        "Completion acceptance and handover into use",
        "Final account settlement and end-of-project variations",
        "Construction warranty and retention money",
        "As-built registration and updating assets on the title",
      ],
    },
    basis: {
      vi: "Luật Xây dựng · Nghị định 175/2024 · Bộ luật Dân sự 2015",
      en: "Construction Law · Decree 175/2024 · Civil Code 2015",
    },
    risk: {
      vi: "Chậm hoàn công thì tài sản trên đất chưa được ghi nhận, và cả dự án khó thế chấp hay chuyển nhượng.",
      en: "Delayed as-built registration leaves the asset unrecorded on the title, and the project becomes hard to mortgage or transfer.",
    },
  },
  {
    id: "tranh-chap",
    layer: { vi: "Mảnh khoá", en: "Keystone" },
    title: {
      vi: "Khi mọi thứ vẫn đi chệch",
      en: "When it goes wrong anyway",
    },
    lead: {
      vi: "Không bộ hồ sơ nào miễn nhiễm với tranh chấp. Khác biệt nằm ở chỗ bên nào bước vào phiên xử với chứng cứ đã sẵn sàng từ trước đó rất lâu.",
      en: "No file is immune to a dispute. The difference is which side walks into the hearing with evidence that was ready long beforehand.",
    },
    items: {
      vi: [
        "Thư thông báo khiếu nại và giữ quyền theo hợp đồng",
        "Thương lượng, hoà giải và ban xử lý tranh chấp",
        "Trọng tài thương mại và tố tụng tại toà án",
        "Thi hành án và thu hồi công nợ sau phán quyết",
      ],
      en: [
        "Notices of claim and preservation of contractual rights",
        "Negotiation, mediation and dispute boards",
        "Commercial arbitration and court litigation",
        "Enforcement and post-award debt recovery",
      ],
    },
    basis: {
      vi: "Luật Trọng tài thương mại 2010 · Bộ luật Tố tụng dân sự 2015 · Quy tắc tố tụng trọng tài VIAC",
      en: "Law on Commercial Arbitration 2010 · Civil Procedure Code 2015 · VIAC Arbitration Rules",
    },
    risk: {
      vi: "Bỏ lỡ thời hạn thông báo khiếu nại ghi trong hợp đồng có thể làm mất quyền đòi bồi thường, dù trên thực tế bên kia sai.",
      en: "Missing a contractual notice deadline can extinguish the right to claim, even where the other side is plainly at fault.",
    },
  },
];

/* ================= TRANG 2 — BẢN ĐỒ NĂNG LỰC ================= */

export type PracticeNode = {
  id: string;
  num: string;
  title: Bilingual;
  tagline: Bilingual;
  items: BilingualList;
  accent: "brass" | "jade";
  /** Vị trí trong cảnh 3D, đơn vị theo không gian scene. */
  position: [number, number, number];
};

export const PRACTICE_NODES: PracticeNode[] = [
  {
    id: "xay-dung",
    num: "01",
    title: { vi: "Xây dựng · Bất động sản", en: "Construction · Real estate" },
    tagline: {
      vi: "Pháp lý toàn vòng đời dự án, từ đất đến sổ.",
      en: "Legal cover for the whole project life cycle, from land to title.",
    },
    items: {
      vi: [
        "Đấu thầu, hợp đồng EPC và FIDIC",
        "Giấy phép xây dựng, quy hoạch chi tiết 1/500",
        "Chuyển nhượng dự án, M&A đất đai",
        "Nghiệm thu, quyết toán, bảo hành công trình",
      ],
      en: [
        "Bidding, EPC contracts and FIDIC",
        "Construction permits, 1/500 detailed planning",
        "Project transfers and land M&A",
        "Acceptance, final accounts and warranties",
      ],
    },
    accent: "brass",
    position: [-3.4, 1.5, 0.6],
  },
  {
    id: "to-tung",
    num: "02",
    title: { vi: "Tố tụng · Giải quyết tranh chấp", en: "Litigation · Dispute resolution" },
    tagline: {
      vi: "Chiến lược kiện và đàm phán dựa trên hồ sơ, không dựa vào cảm tính.",
      en: "Litigation and settlement strategy built on the file, not on instinct.",
    },
    items: {
      vi: [
        "Tranh chấp xây dựng và hợp đồng EPC",
        "Kinh doanh thương mại, tranh chấp cổ đông",
        "Hành chính: thu hồi đất, bồi thường",
        "Trọng tài thương mại và thi hành án",
      ],
      en: [
        "Construction and EPC contract disputes",
        "Commercial and shareholder disputes",
        "Administrative: land recovery and compensation",
        "Commercial arbitration and enforcement",
      ],
    },
    accent: "brass",
    position: [3.3, 2.0, -0.8],
  },
  {
    id: "nang-luong",
    num: "03",
    title: { vi: "Điện mặt trời · Năng lượng", en: "Solar · Energy" },
    tagline: {
      vi: "Đồng hành từ giấy phép điện lực đến hợp đồng mua bán điện dài hạn.",
      en: "From the electricity licence through to long-term power purchase agreements.",
    },
    items: {
      vi: [
        "Hợp đồng mua bán điện và cơ chế DPPA",
        "Giấy phép hoạt động điện lực",
        "Điện mặt trời mái nhà tự sản, tự tiêu",
        "EPC và O&M, bảo lãnh, bảo hiểm dự án",
      ],
      en: [
        "Power purchase agreements and the DPPA mechanism",
        "Electricity operation licences",
        "Self-produced, self-consumed rooftop solar",
        "EPC and O&M, guarantees and project insurance",
      ],
    },
    accent: "jade",
    position: [-2.6, -1.9, -1.4],
  },
  {
    id: "doanh-nghiep",
    num: "04",
    title: { vi: "Doanh nghiệp · Tuân thủ", en: "Corporate · Compliance" },
    tagline: {
      vi: "Hậu phương pháp lý cho vận hành doanh nghiệp mỗi ngày.",
      en: "The legal back office behind day-to-day operations.",
    },
    items: {
      vi: [
        "Quản trị doanh nghiệp, tái cấu trúc, M&A",
        "Tuân thủ thuế, hoá đơn và nghĩa vụ kê khai",
        "Lao động, bảo hiểm xã hội, nội quy công ty",
        "Pháp chế thường xuyên và kiểm soát rủi ro",
      ],
      en: [
        "Corporate governance, restructuring and M&A",
        "Tax, invoicing and filing compliance",
        "Labour, social insurance and internal rules",
        "Retained counsel and risk control",
      ],
    },
    accent: "brass",
    position: [3.0, -2.2, 1.0],
  },
  {
    id: "du-lieu",
    num: "05",
    title: { vi: "Bảo mật dữ liệu · Công nghệ", en: "Data protection · Technology" },
    tagline: {
      vi: "Tuân thủ dữ liệu cá nhân trước khi bị phạt, không phải sau.",
      en: "Personal data compliance before the penalty, not after it.",
    },
    items: {
      vi: [
        "Tuân thủ Luật Bảo vệ dữ liệu cá nhân 2025",
        "Đánh giá tác động xử lý dữ liệu cá nhân",
        "Chính sách quyền riêng tư, điều khoản nền tảng",
        "Ứng phó sự cố lộ, mất dữ liệu cá nhân",
      ],
      en: [
        "Compliance with the Law on Personal Data Protection 2025",
        "Personal data processing impact assessments",
        "Privacy policies and platform terms",
        "Response to personal data breaches",
      ],
    },
    accent: "jade",
    position: [0.2, 3.1, 1.6],
  },
];

export type PracticeLink = {
  from: string;
  to: string;
  note: Bilingual;
};

/*
 * Mỗi đường nối là một tình huống có thật đã đi qua hãng, không phải một mũi tên
 * trang trí. Đây là điểm chính của cả trang: một vụ việc hiếm khi nằm gọn trong
 * một lĩnh vực, và khách hàng thường chỉ nhận ra điều đó khi đã muộn.
 */
export const PRACTICE_LINKS: PracticeLink[] = [
  {
    from: "xay-dung",
    to: "to-tung",
    note: {
      vi: "Chậm tiến độ hôm nay là hồ sơ trọng tài của năm sau.",
      en: "Today's delay is next year's arbitration file.",
    },
  },
  {
    from: "xay-dung",
    to: "doanh-nghiep",
    note: {
      vi: "Chuyển nhượng dự án là một thương vụ M&A, không chỉ là thủ tục đất đai.",
      en: "A project transfer is an M&A deal, not just a land procedure.",
    },
  },
  {
    from: "nang-luong",
    to: "xay-dung",
    note: {
      vi: "Điện mặt trời áp mái là một dự án xây dựng gắn trên tài sản của người khác.",
      en: "Rooftop solar is a construction project mounted on someone else's asset.",
    },
  },
  {
    from: "nang-luong",
    to: "to-tung",
    note: {
      vi: "Sản lượng không đạt cam kết: đọc lại hợp đồng mua bán điện trước khi đọc lại đồng hồ đo.",
      en: "Output below commitment: read the power purchase agreement before you read the meter.",
    },
  },
  {
    from: "doanh-nghiep",
    to: "du-lieu",
    note: {
      vi: "Số hoá vận hành kéo theo nghĩa vụ bảo vệ dữ liệu cá nhân.",
      en: "Digitising operations brings personal data obligations with it.",
    },
  },
  {
    from: "xay-dung",
    to: "du-lieu",
    note: {
      vi: "Dữ liệu khách hàng mua nhà vẫn là dữ liệu cá nhân, kể cả khi nằm trong tệp bảng tính của sàn.",
      en: "Home-buyer records are still personal data, even inside a broker's spreadsheet.",
    },
  },
  {
    from: "to-tung",
    to: "doanh-nghiep",
    note: {
      vi: "Tranh chấp cổ đông bắt đầu từ điều lệ, không bắt đầu từ đơn khởi kiện.",
      en: "A shareholder dispute starts in the charter, not in the statement of claim.",
    },
  },
];
