/* ================= DỮ LIỆU HỆ THỐNG ================= */

export type DocItem = {
  id: string;
  kind: "article" | "news";
  category: string;
  title: string;
  excerpt: string;
  content: string[];
  date: string;
  read: string;
  author?: string;
  featured?: boolean;
};

export const ARTICLES: DocItem[] = [
  {
    id: "a1",
    kind: "article",
    category: "Bất động sản",
    title: "Bảng giá đất 2026: 4 điểm doanh nghiệp cần rà soát trước khi lập dự toán",
    excerpt:
      "Bảng giá đất điều chỉnh tác động trực tiếp đến tiền sử dụng đất, chi phí giải phóng mặt bằng và hiệu quả tài chính của mọi dự án.",
    content: [
      "Từ chu kỳ bảng giá đất 2026, khoảng cách giữa giá nhà nước và giá thị trường được thu hẹp đáng kể. Với doanh nghiệp phát triển dự án, tiền sử dụng đất — khoản chi thường chiếm 20–40% tổng mức đầu tư — sẽ biến động mạnh theo từng vị trí.",
      "Bốn điểm cần rà soát: (1) đối chiếu thửa đất dự án với bảng giá mới trước khi lập dự toán; (2) đánh giá lại phương án bồi thường, hỗ trợ, tái định cư; (3) kiểm tra nghĩa vụ tài chính của các giai đoạn chưa nộp; (4) đàm phán lại điều chỉnh giá trong hợp đồng chuyển nhượng đang chờ ký.",
      "Khuyến nghị: doanh nghiệp nên chốt khung pháp lý của từng nghĩa vụ tài chính bằng văn bản trước khi ký phụ lục hợp đồng, tránh rủi ro hồi tố khi bảng giá thay đổi giữa chừng dự án.",
    ],
    date: "02/2026",
    read: "6 phút",
    author: "LS. Trần Kiến Văn",
  },
  {
    id: "a2",
    kind: "article",
    category: "Tố tụng",
    title: "Phạt vi phạm và bồi thường thiệt hại trong hợp đồng xây dựng: áp dụng song song?",
    excerpt:
      "Luật Thương mại và Bộ luật Dân sự cho cách tiếp cận khác nhau — chọn sai luật áp dụng có thể làm mất quyền đòi phạt.",
    content: [
      "Thực tiễn xét xử cho thấy nhiều nhà thầu mất quyền hưởng phạt vi phạm chỉ vì hợp đồng không xác định rõ luật áp dụng. Luật Thương mại 2005 giới hạn mức phạt 8% giá trị phần nghĩa vụ vi phạm, trong khi Bộ luật Dân sự tôn trọng thỏa thuận của các bên.",
      "Về nguyên tắc, phạt vi phạm và bồi thường thiệt hại được áp dụng song song nếu hợp đồng có thỏa thuận. Tuy nhiên, thiệt hại phải được chứng minh bằng hồ sơ: nhật ký công trình, biên bản nghiệm thu, chứng từ chi phí phát sinh.",
      "Với hợp đồng EPC/FIDIC, cần lưu ý cơ chế thông báo khiếu nại đúng thời hạn — bỏ lỡ mốc 28 ngày có thể đồng nghĩa mất toàn bộ quyền yêu cầu.",
    ],
    date: "01/2026",
    read: "7 phút",
    author: "LS. Phạm Minh Châu",
  },
  {
    id: "a3",
    kind: "article",
    category: "Năng lượng",
    title: "DPPA sau Nghị định 80: lộ trình cho nhà máy và khu công nghiệp",
    excerpt:
      "Mua bán điện trực tiếp mở ra lựa chọn giá cạnh tranh và chứng chỉ xanh cho doanh nghiệp sản xuất — nhưng đi kèm điều kiện kỹ thuật chặt.",
    content: [
      "Nghị định 80/2024/NĐ-CP chính thức mở cơ chế mua bán điện trực tiếp (DPPA) qua đường dây riêng và qua lưới quốc gia. Khách hàng lớn — đặc biệt trong khu công nghiệp — có thể ký PPA trực tiếp với đơn vị phát điện tái tạo.",
      "Với DPPA qua lưới quốc gia, sản lượng hợp đồng tối thiểu và cơ chế thanh toán chênh lệch (CfD) là hai điểm then chốt cần đàm phán. Rủi ro sản lượng thực phát thấp hơn cam kết cần được phân bổ rõ giữa ba bên: bên bán, bên mua và đơn vị vận hành.",
      "Lộ trình khuyến nghị: (1) thẩm định pháp lý dự án nguồn; (2) chốt cấu trúc PPA 10–15 năm; (3) đăng ký với cơ quan điện lực; (4) song hành chứng chỉ I-REC cho mục tiêu ESG.",
    ],
    date: "12/2025",
    read: "5 phút",
    author: "LS. Lê Nhật Hạ",
  },
  {
    id: "a4",
    kind: "article",
    category: "Thương mại",
    title: "Điều khoản hardship trong hợp đồng cung ứng: viết sao cho dùng được",
    excerpt:
      "Giá nguyên liệu biến động 30–40% khiến nhiều hợp đồng 'chết lâm sàng' — điều khoản hardship được soạn đúng là lối ra hợp pháp.",
    content: [
      "Hardship cho phép các bên đàm phán lại khi hoàn cảnh thay đổi cơ bản nằm ngoài dự liệu. Tuy nhiên, tòa án và trọng tài chỉ công nhận khi hợp đồng mô tả cụ thể: ngưỡng biến động, chỉ số tham chiếu, thời hạn thông báo và hệ quả khi đàm phán thất bại.",
      "Ba lỗi thường gặp: viện dẫn chung chung 'biến động thị trường', không gắn chỉ số giá cụ thể, và bỏ quên quyền chấm dứt sau một thời hạn đàm phán nhất định.",
      "Khuyến nghị mẫu: gắn hardship với chỉ số giá công bố chính thức, ngưỡng kích hoạt 15–20%, thời hạn đàm phán 30 ngày, và quyền đưa tranh chấp ra trọng tài nếu không đạt thỏa thuận.",
    ],
    date: "11/2025",
    read: "6 phút",
    author: "LS. Hoàng Đức Tín",
  },
  {
    id: "a5",
    kind: "article",
    category: "Bất động sản",
    title: "Chuyển nhượng dự án bất động sản: checklist pháp lý 12 bước",
    excerpt:
      "Một thương vụ chuyển nhượng dự án trung bình cần 12 mốc pháp lý — thiếu một mốc, hồ sơ có thể bị trả lại từ đầu.",
    content: [
      "Điều kiện chuyển nhượng toàn bộ hoặc một phần dự án được quy định chặt tại Luật Kinh doanh bất động sản 2023: dự án không tranh chấp, không bị kê biên, còn trong thời hạn thực hiện, và đã hoàn thành nghĩa vụ tài chính về đất đai.",
      "Checklist trọng yếu: (1) rà soát chủ trương đầu tư; (2) xác nhận hoàn thành nghĩa vụ tài chính; (3) thẩm tra quy hoạch 1/500; (4) rà soát hợp đồng với khách hàng hiện hữu; (5) chấp thuận chuyển nhượng của cơ quan có thẩm quyền; (6) bàn giao hồ sơ — công nợ — nhân sự.",
      "Kinh nghiệm thực tế: nên ký thỏa thuận nguyên tắc kèm điều kiện tiên quyết (conditions precedent) thay vì hợp đồng chuyển nhượng ngay, để khóa rủi ro trong giai đoạn chờ chấp thuận.",
    ],
    date: "10/2025",
    read: "8 phút",
    author: "LS. Trần Kiến Văn",
  },
  {
    id: "a6",
    kind: "article",
    category: "Tố tụng",
    title: "Án lệ về nghiệm thu khối lượng: nhà thầu cần chứng minh gì?",
    excerpt:
      "Khi chủ đầu tư từ chối ký nghiệm thu, hồ sơ thi công — không phải lời khai — mới là chứng cứ quyết định.",
    content: [
      "Xu hướng xét xử gần đây đặt trọng tâm vào hồ sơ nghiệm thu từng giai đoạn: biên bản nghiệm thu nội bộ, nhật ký thi công có chữ ký tư vấn giám sát, bản vẽ hoàn công và chứng từ thanh toán từng kỳ.",
      "Nhà thầu thường thua kiện vì ba lỗ hổng: thi công vượt khối lượng không có chỉ thị bằng văn bản, thiếu chữ ký tư vấn giám sát tại biên bản hiện trường, và không gửi thông báo khi chủ đầu tư chậm phản hồi nghiệm thu.",
      "Chiến lược khuyến nghị: gửi thông báo nghiệm thu bằng phương thức có chứng cứ nhận; sau thời hạn hợp đồng mà không bị từ chối bằng văn bản, khối lượng được coi là đã nghiệm thu theo nhiều phán quyết trọng tài.",
    ],
    date: "09/2025",
    read: "6 phút",
    author: "LS. Phạm Minh Châu",
  },
  {
    id: "a7",
    kind: "article",
    category: "Năng lượng",
    title: "Điện mặt trời mái nhà tự sản – tự tiêu: khung pháp lý hiện hành",
    excerpt:
      "Mô hình tự sản tự tiêu có dư bán lại đang được khuyến khích — doanh nghiệp cần nắm rõ thủ tục và giới hạn công suất.",
    content: [
      "Luật Điện lực 2024 và Nghị định 58/2025/NĐ-CP thiết lập khung cho điện mặt trời mái nhà tự sản xuất – tự tiêu thụ: khuyến khích lắp đặt không giới hạn công suất tự dùng, phần dư được bán lên lưới theo cơ chế riêng.",
      "Nghĩa vụ chính của bên lắp đặt: đăng ký/ thông báo với đơn vị điện lực địa phương, đảm bảo tiêu chuẩn đấu nối, an toàn chịu lực mái và phòng cháy. Với mô hình ESCO (thuê mái), hợp đồng cần xử lý rõ quyền sở hữu hệ thống và trách nhiệm bảo hiểm.",
      "Lưu ý thực tiễn: công trình trong khu công nghiệp phải đối chiếu quy hoạch ngành điện và thỏa thuận đấu nối trước khi ký EPC, tránh lắp đặt xong mới phát hiện vướng lưới.",
    ],
    date: "08/2025",
    read: "5 phút",
    author: "LS. Lê Nhật Hạ",
  },
  {
    id: "a8",
    kind: "article",
    category: "Thương mại",
    title: "Bảo lãnh ngân hàng trong hợp đồng EPC: những điểm hay bị bỏ sót",
    excerpt:
      "Một bảo lãnh 'có điều kiện' cài khéo có thể vô hiệu hóa toàn bộ quyền rút tiền của chủ đầu tư khi nhà thầu vi phạm.",
    content: [
      "Trong hợp đồng EPC, các loại bảo lãnh điển hình gồm: bảo lãnh dự thầu, bảo lãnh thực hiện hợp đồng, bảo lãnh tạm ứng và bảo lãnh bảo hành. Mỗi loại cần quy tắc rút tiền (demand rule) và thời hạn riêng.",
      "Điểm hay bị bỏ sót: (1) bảo lãnh phát hành 'có điều kiện' nhưng hợp đồng không liệt kê điều kiện; (2) thời hạn bảo lãnh kết thúc trước thời điểm phát sinh quyền yêu cầu; (3) thiếu điều khoản tự động gia hạn khi tranh chấp chưa giải quyết xong.",
      "Khuyến nghị: yêu cầu bảo lãnh theo mẫu 'vô điều kiện, không hủy ngang, thanh toán theo yêu cầu đầu tiên' và ràng buộc ngân hàng phát hành thuộc nhóm được chấp thuận trong hợp đồng.",
    ],
    date: "07/2025",
    read: "4 phút",
    author: "LS. Hoàng Đức Tín",
  },
];

export const NEWS: DocItem[] = [
  {
    id: "n1",
    kind: "news",
    category: "Năng lượng",
    title:
      "Luật Điện lực (sửa đổi) chính thức hiệu lực: mở đường cho DPPA và giá điện hai thành phần",
    excerpt:
      "Từ 01/02/2025, Luật Điện lực 2024 có hiệu lực với nhiều cơ chế mới: mua bán điện trực tiếp, giá điện hai thành phần và khung pháp lý cho điện gió ngoài khơi.",
    content: [
      "Luật Điện lực số 61/2024/QH15 được Quốc hội thông qua tháng 11/2024, hiệu lực từ 01/02/2025. Điểm nhấn lớn nhất là cơ sở pháp lý cho mua bán điện trực tiếp (DPPA) và lộ trình thị trường điện cạnh tranh đầy đủ.",
      "Với doanh nghiệp sản xuất, DPPA qua lưới quốc gia cho phép ký hợp đồng dài hạn với đơn vị phát điện tái tạo — yếu tố then chốt để đáp ứng cam kết RE100 và thuế carbon biên giới (CBAM).",
      "Kiến Pháp đánh giá: các nhà máy trong khu công nghiệp nên khởi động đàm phán PPA ngay trong 2026 để khóa giá trước khi nhu cầu DPPA tăng mạnh.",
    ],
    date: "03/02/2026",
    read: "4 phút",
    featured: true,
  },
  {
    id: "n2",
    kind: "news",
    category: "Đất đai",
    title: "Bảng giá đất 2026 tại các đô thị lớn: chi phí chuyển mục đích tăng mạnh",
    excerpt:
      "Nhiều địa phương công bố bảng giá đất mới tiệm cận giá thị trường; tiền sử dụng đất và chi phí giải phóng mặt bằng dự báo tăng 1,5–2 lần.",
    content: [
      "Theo Luật Đất đai 2024, bảng giá đất được xây dựng hàng năm thay vì 5 năm như trước, bám sát giá thị trường. Tại các đô thị lớn, mức điều chỉnh phổ biến từ 50% đến hơn 100% ở các vị trí trung tâm.",
      "Tác động trực tiếp: tiền sử dụng đất khi chuyển mục đích, chi phí bồi thường giải phóng mặt bằng và nghĩa vụ tài chính bổ sung của dự án chậm tiến độ.",
      "Doanh nghiệp có dự án dở dang cần rà soát ngay mốc thời điểm xác định nghĩa vụ tài chính để tối ưu chi phí hợp pháp.",
    ],
    date: "27/01/2026",
    read: "3 phút",
  },
  {
    id: "n3",
    kind: "news",
    category: "Xây dựng",
    title: "Đề xuất rút ngắn 30% thời gian thẩm định, cấp phép dự án xây dựng",
    excerpt:
      "Bộ Xây dựng lấy ý kiến dự thảo cắt giảm thủ tục liên thông: thẩm định báo cáo nghiên cứu khả thi, phòng cháy và cấp phép trong một đầu mối.",
    content: [
      "Dự thảo hướng tới cơ chế 'một hồ sơ — một đầu mối' cho nhóm dự án vốn ngoài ngân sách, rút tổng thời gian chuẩn bị đầu tư từ 9–12 tháng xuống còn 6–8 tháng.",
      "Điểm mới đáng chú ý: công nhận kết quả thẩm tra độc lập của tư vấn đủ điều kiện, giảm vòng thẩm định hành chính lặp lại.",
      "Nếu được thông qua, đây là cú hích lớn cho các dự án bất động sản và năng lượng đang xếp hàng chờ thủ tục.",
    ],
    date: "15/01/2026",
    read: "3 phút",
  },
  {
    id: "n4",
    kind: "news",
    category: "Tố tụng",
    title: "Hòa giải thương mại: kênh mới giảm tải tranh chấp hợp đồng EPC",
    excerpt:
      "Tòa án khuyến khích hòa giải trước tố tụng; nhiều tranh chấp xây dựng giá trị lớn được dàn xếp trong 60 ngày thay vì 2 năm kiện tụng.",
    content: [
      "Thống kê gần đây cho thấy tỷ lệ hòa giải thành trong tranh chấp xây dựng đạt trên 55% khi các bên có hồ sơ nghiệm thu đầy đủ và bên trung gian am hiểu FIDIC.",
      "Ưu thế của hòa giải: bảo mật tuyệt đối, giữ quan hệ hợp tác và chi phí chỉ bằng 10–15% kiện tụng.",
      "Khuyến nghị: đưa điều khoản hòa giải bắt buộc (multi-tier dispute clause) vào mọi hợp đồng EPC ký từ 2026.",
    ],
    date: "08/01/2026",
    read: "3 phút",
  },
  {
    id: "n5",
    kind: "news",
    category: "Bất động sản",
    title: "Siết phân lô bán nền: thị trường tỉnh bước vào chu kỳ sàng lọc",
    excerpt:
      "Quy định cấm phân lô bán nền tại đô thị loại đặc biệt, I, II, III buộc các chủ đầu tư nhỏ lẻ chuyển sang phát triển dự án bài bản.",
    content: [
      "Luật Kinh doanh bất động sản 2023 thu hẹp mạnh phạm vi được chuyển nhượng quyền sử dụng đất cho cá nhân tự xây dựng — chỉ còn áp dụng tại khu vực không thuộc đô thị loại đặc biệt đến loại III.",
      "Hệ quả: nguồn cung đất nền nhỏ lẻ giảm, dòng vốn dịch chuyển sang dự án có hạ tầng và nhà ở hoàn thiện; tranh chấp hợp đồng góp vốn cũ dự báo gia tăng.",
      "Nhà đầu tư cần thẩm định pháp lý nền đất kỹ hơn: quy hoạch, giấy phép hạ tầng và nghĩa vụ tài chính của chủ đầu tư.",
    ],
    date: "18/12/2025",
    read: "3 phút",
  },
];

/* ================= VĂN BẢN PHÁP LUẬT ================= */

export type LegalDoc = {
  id: string;
  code: string;
  name: string;
  type: "Luật" | "Nghị định";
  field: string;
  effective: string;
  status: "Còn hiệu lực" | "Hết hiệu lực một phần";
  summary: string;
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    id: "d1",
    code: "31/2024/QH15",
    name: "Luật Đất đai 2024",
    type: "Luật",
    field: "Đất đai",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Khung pháp lý nền về thu hồi, giao, cho thuê đất; bảng giá đất hàng năm; bồi thường — tái định cư và quyền của tổ chức kinh tế nhận chuyển nhượng đất thực hiện dự án.",
  },
  {
    id: "d2",
    code: "27/2023/QH15",
    name: "Luật Nhà ở 2023",
    type: "Luật",
    field: "Bất động sản",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Phát triển nhà ở thương mại, nhà ở xã hội; sở hữu nhà ở của tổ chức, cá nhân nước ngoài; quản lý, vận hành nhà chung cư.",
  },
  {
    id: "d3",
    code: "29/2023/QH15",
    name: "Luật Kinh doanh bất động sản 2023",
    type: "Luật",
    field: "Bất động sản",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Điều kiện đưa dự án vào kinh doanh; chuyển nhượng dự án; thanh toán trong mua bán nhà ở hình thành trong tương lai; siết phân lô bán nền.",
  },
  {
    id: "d4",
    code: "50/2014/QH13",
    name: "Luật Xây dựng 2014 (sửa đổi, bổ sung 2020)",
    type: "Luật",
    field: "Xây dựng",
    effective: "01/01/2015",
    status: "Còn hiệu lực",
    summary:
      "Quy hoạch xây dựng, thẩm định dự án, giấy phép xây dựng, quản lý chất lượng — tiến độ — chi phí và điều kiện năng lực của tổ chức, cá nhân hành nghề.",
  },
  {
    id: "d5",
    code: "61/2024/QH15",
    name: "Luật Điện lực 2024",
    type: "Luật",
    field: "Năng lượng",
    effective: "01/02/2025",
    status: "Còn hiệu lực",
    summary:
      "Cơ chế mua bán điện trực tiếp (DPPA), giá điện hai thành phần, phát triển điện tái tạo — điện gió ngoài khơi và an toàn hệ thống điện.",
  },
  {
    id: "d6",
    code: "22/2023/QH15",
    name: "Luật Đấu thầu 2023",
    type: "Luật",
    field: "Đấu thầu",
    effective: "01/01/2024",
    status: "Còn hiệu lực",
    summary:
      "Lựa chọn nhà thầu dự án đầu tư công và dự án có sử dụng đất; đấu thầu qua mạng; xử lý tình huống và kiến nghị trong đấu thầu.",
  },
  {
    id: "d7",
    code: "61/2020/QH14",
    name: "Luật Đầu tư 2020",
    type: "Luật",
    field: "Thương mại",
    effective: "01/01/2021",
    status: "Còn hiệu lực",
    summary:
      "Ngành nghề đầu tư kinh doanh có điều kiện; chấp thuận chủ trương đầu tư; ưu đãi — hỗ trợ đầu tư và thủ tục điều chỉnh dự án.",
  },
  {
    id: "d8",
    code: "54/2010/QH12",
    name: "Luật Trọng tài thương mại 2010",
    type: "Luật",
    field: "Tố tụng",
    effective: "01/01/2011",
    status: "Còn hiệu lực",
    summary:
      "Thỏa thuận trọng tài, thủ tục tố tụng trọng tài, hủy và công nhận phán quyết — nền tảng giải quyết tranh chấp hợp đồng thương mại, EPC.",
  },
  {
    id: "d9",
    code: "102/2024/NĐ-CP",
    name: "Nghị định hướng dẫn thi hành Luật Đất đai",
    type: "Nghị định",
    field: "Đất đai",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Chi tiết về điều tra, đánh giá đất đai; quy hoạch — kế hoạch sử dụng đất; thu hồi, bồi thường, tái định cư và thủ tục giao — thuê đất.",
  },
  {
    id: "d10",
    code: "96/2024/NĐ-CP",
    name: "Nghị định quy định chi tiết Luật Kinh doanh bất động sản",
    type: "Nghị định",
    field: "Bất động sản",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Điều kiện kinh doanh BĐS; chuyển nhượng toàn bộ/một phần dự án; hợp đồng mẫu trong mua bán, thuê mua nhà ở và công trình xây dựng.",
  },
  {
    id: "d11",
    code: "95/2024/NĐ-CP",
    name: "Nghị định quy định chi tiết Luật Nhà ở",
    type: "Nghị định",
    field: "Bất động sản",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Phát triển và quản lý nhà ở xã hội; cải tạo chung cư cũ; sở hữu nhà ở của tổ chức, cá nhân nước ngoài tại Việt Nam.",
  },
  {
    id: "d12",
    code: "58/2025/NĐ-CP",
    name: "Nghị định hướng dẫn thi hành Luật Điện lực",
    type: "Nghị định",
    field: "Năng lượng",
    effective: "03/03/2025",
    status: "Còn hiệu lực",
    summary:
      "Phát triển điện năng lượng tái tạo, điện mặt trời mái nhà tự sản — tự tiêu, giấy phép hoạt động điện lực và cơ chế giá điện.",
  },
  {
    id: "d13",
    code: "80/2024/NĐ-CP",
    name: "Nghị định về mua bán điện trực tiếp (DPPA)",
    type: "Nghị định",
    field: "Năng lượng",
    effective: "03/07/2024",
    status: "Còn hiệu lực",
    summary:
      "Cơ chế DPPA qua đường dây kết nối riêng và qua lưới điện quốc gia: điều kiện khách hàng lớn, hợp đồng kỳ hạn và thanh toán chênh lệch.",
  },
  {
    id: "d14",
    code: "06/2021/NĐ-CP",
    name: "Nghị định về quản lý chất lượng, thi công xây dựng và bảo trì công trình",
    type: "Nghị định",
    field: "Xây dựng",
    effective: "26/01/2021",
    status: "Còn hiệu lực",
    summary:
      "Nghiệm thu công trình, giám sát thi công, bảo hành — bảo trì và trách nhiệm các chủ thể trong sự cố công trình xây dựng.",
  },
];

/* ================= DỊCH VỤ ================= */

export type Service = {
  num: string;
  icon: "crane" | "scale" | "solar" | "deal";
  title: string;
  tagline: string;
  items: string[];
  tags: string[];
};

export const SERVICES: Service[] = [
  {
    num: "01",
    icon: "crane",
    title: "Xây dựng — Bất động sản",
    tagline: "Pháp lý toàn vòng đời dự án, từ đất đến sổ.",
    items: [
      "Đấu thầu, hợp đồng EPC / FIDIC",
      "Giấy phép xây dựng, quy hoạch 1/500",
      "Chuyển nhượng dự án, M&A đất đai",
      "Pháp lý sổ hồng, sở hữu công trình",
    ],
    tags: ["Dự án", "Đất đai", "FIDIC"],
  },
  {
    num: "02",
    icon: "scale",
    title: "Tố tụng & Giải quyết tranh chấp",
    tagline: "Chiến lược kiện — đàm phán dựa trên hồ sơ, không cảm tính.",
    items: [
      "Tranh chấp xây dựng, hợp đồng EPC",
      "Kinh doanh thương mại, tranh chấp cổ đông",
      "Hành chính: thu hồi đất, bồi thường",
      "Trọng tài thương mại & thi hành án",
    ],
    tags: ["Tòa án", "Trọng tài", "EPC"],
  },
  {
    num: "03",
    icon: "solar",
    title: "Điện mặt trời & Năng lượng",
    tagline: "Đồng hành từ giấy phép điện lực đến hợp đồng PPA 20 năm.",
    items: [
      "Hợp đồng PPA, cơ chế DPPA",
      "Giấy phép hoạt động điện lực",
      "Dự án mái nhà, trang trại, tự sản — tự tiêu",
      "EPC — O&M, bảo lãnh & bảo hiểm dự án",
    ],
    tags: ["PPA", "DPPA", "ESG"],
  },
  {
    num: "04",
    icon: "deal",
    title: "Thương mại — Dịch vụ",
    tagline: "Hậu phương pháp lý cho vận hành doanh nghiệp mỗi ngày.",
    items: [
      "Quản trị doanh nghiệp, M&A",
      "Hợp đồng thương mại — dịch vụ",
      "Lao động, bảo hiểm xã hội",
      "Tư vấn pháp lý thường xuyên",
    ],
    tags: ["Doanh nghiệp", "M&A", "Lao động"],
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
};

export const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Pháp chế thuê ngoài",
    price: "100.000.000",
    unit: "₫ / tháng",
    approx: "≈ 100 triệu đồng mỗi tháng",
    note: "Phù hợp doanh nghiệp cần rà soát rủi ro định kỳ và hỗ trợ hợp đồng theo nhu cầu.",
    features: [
      "40 giờ tư vấn chuyên sâu mỗi tháng",
      "Rà soát & soạn thảo hợp đồng",
      "Công văn, ý kiến pháp lý bằng văn bản",
      "Hotline trong giờ hành chính",
      "Báo cáo rủi ro pháp lý hàng tháng",
    ],
  },
  {
    id: "yearly",
    name: "Tổng cố vấn pháp chế",
    price: "1.000.000.000",
    unit: "₫ / năm",
    approx: "≈ 1 tỷ đồng mỗi năm — tiết kiệm ~17%",
    note: "Phòng pháp chế đầy đủ cho tập đoàn: luật sư chuyên trách, có mặt khi tranh chấp phát sinh.",
    features: [
      "Không giới hạn giờ tư vấn",
      "Luật sư chuyên trách theo từng mảng",
      "Đại diện tố tụng & làm việc với cơ quan nhà nước",
      "Đào tạo pháp lý nội bộ mỗi quý",
      "Rà soát tuân thủ toàn diện 2 lần/năm",
      "Hotline ưu tiên 24/7",
    ],
    highlight: true,
    badge: "TỐI ƯU NHẤT",
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
  img: string;
};

export const LAWYERS: Lawyer[] = [
  {
    id: "l1",
    name: "LS. Trần Kiến Văn",
    role: "Luật sư sáng lập — Điều hành",
    years: "18 năm",
    focus: ["Dự án xây dựng", "M&A bất động sản"],
    email: "van.tran@kienphap.law",
    img: "https://image.qwenlm.ai/generated-images/fc83b875-7e91-42ad-93ba-bfc160182bed/_result.png",
  },
  {
    id: "l2",
    name: "LS. Phạm Minh Châu",
    role: "Trưởng bộ phận Tố tụng",
    years: "15 năm",
    focus: ["Tranh chấp EPC", "Trọng tài thương mại"],
    email: "chau.pham@kienphap.law",
    img: "https://image.qwenlm.ai/generated-images/3c41f737-4fcc-4446-97df-195124e93314/_result.png",
  },
  {
    id: "l3",
    name: "LS. Lê Nhật Hạ",
    role: "Trưởng bộ phận Năng lượng",
    years: "12 năm",
    focus: ["PPA / DPPA", "Điện tái tạo"],
    email: "ha.le@kienphap.law",
    img: "https://image.qwenlm.ai/generated-images/58dccf45-0bd4-41c1-bcb8-1ac6fc62e729/_result.png",
  },
  {
    id: "l4",
    name: "LS. Hoàng Đức Tín",
    role: "Trưởng bộ phận Thương mại",
    years: "14 năm",
    focus: ["Quản trị doanh nghiệp", "Hợp đồng — M&A"],
    email: "tin.hoang@kienphap.law",
    img: "https://image.qwenlm.ai/generated-images/51bf88d8-6b96-48b7-92e0-a31a173e83ed/_result.png",
  },
];

/* ================= CHÍNH SÁCH ================= */

export type PolicyItem = { q: string; a: string };

export const POLICIES_SERVICE: PolicyItem[] = [
  {
    q: "Phạm vi dịch vụ",
    a: "Kiến Pháp cung cấp tư vấn pháp lý, soạn thảo — rà soát văn bản, đại diện đàm phán và tranh tụng trong các lĩnh vực xây dựng, bất động sản, năng lượng và thương mại trên phạm vi toàn quốc.",
  },
  {
    q: "Quy trình tiếp nhận",
    a: "Mọi vụ việc được tiếp nhận qua một đầu mối: đánh giá sơ bộ trong 24 giờ, đề xuất phương án và báo phí trong 3 ngày làm việc. Không phát sinh phí ngoài báo giá đã xác nhận bằng văn bản.",
  },
  {
    q: "Phí & thanh toán",
    a: "Phí theo giờ, theo vụ việc hoặc theo gói pháp chế tháng/năm. Gói tháng 100.000.000₫ và gói năm 1.000.000.000₫ chưa gồm VAT, án phí, phí trọng tài và chi phí nhà nước.",
  },
  {
    q: "Xung đột lợi ích",
    a: "Trước khi nhận vụ việc, chúng tôi kiểm tra xung đột lợi ích trên toàn hệ thống. Nếu phát sinh xung đột, khách hàng được thông báo và chuyển hồ sơ kèm hoàn phí phần chưa thực hiện.",
  },
];

export const POLICIES_PRIVACY: PolicyItem[] = [
  {
    q: "Dữ liệu chúng tôi thu thập",
    a: "Chỉ thu thập dữ liệu cần thiết cho vụ việc: thông tin liên hệ, hồ sơ pháp lý khách hàng cung cấp và lịch sử trao đổi. Không thu thập dữ liệu ngoài phạm vi ủy quyền.",
  },
  {
    q: "Mục đích sử dụng",
    a: "Dữ liệu chỉ dùng để thực hiện dịch vụ pháp lý theo hợp đồng: chuẩn bị hồ sơ, làm việc với cơ quan nhà nước, đối tụng và báo cáo cho khách hàng.",
  },
  {
    q: "Lưu trữ & bảo vệ",
    a: "Hồ sơ được mã hóa khi lưu trữ, phân quyền truy cập theo nguyên tắc cần-biết, sao lưu định kỳ và kiểm tra bảo mật 2 lần/năm. Thời hạn lưu trữ theo quy định Luật Luật sư và yêu cầu của khách hàng.",
  },
  {
    q: "Quyền của khách hàng",
    a: "Khách hàng có quyền truy cập, yêu cầu chỉnh sửa, xóa dữ liệu hoặc rút lại ủy quyền bất kỳ lúc nào bằng văn bản gửi tới dpo@kienphap.law.",
  },
  {
    q: "Cookie & theo dõi",
    a: "Website chỉ dùng cookie kỹ thuật để duy trì phiên và đo lường ẩn danh. Chúng tôi không bán, không chia sẻ dữ liệu cá nhân cho bên thứ ba vì mục đích quảng cáo.",
  },
];

/* ================= TICKER ================= */

export const TICKER: string[] = [
  "LUẬT ĐẤT ĐAI 2024 · HIỆU LỰC 01.08.2024",
  "LUẬT ĐIỆN LỰC 2024 · HIỆU LỰC 01.02.2025",
  "LUẬT KINH DOANH BĐS 2023 · HIỆU LỰC 01.08.2024",
  "LUẬT NHÀ Ở 2023 · HIỆU LỰC 01.08.2024",
  "LUẬT ĐẤU THẦU 2023 · HIỆU LỰC 01.01.2024",
  "NGHỊ ĐỊNH 80/2024 · MUA BÁN ĐIỆN TRỰC TIẾP (DPPA)",
  "NGHỊ ĐỊNH 58/2025 · HƯỚNG DẪN LUẬT ĐIỆN LỰC",
  "NGHỊ ĐỊNH 102/2024 · HƯỚNG DẪN LUẬT ĐẤT ĐAI",
  "NGHỊ ĐỊNH 96/2024 · KINH DOANH BẤT ĐỘNG SẢN",
  "LUẬT XÂY DỰNG 2014 · SỬA ĐỔI 2020",
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

export const IMG = {
  logoK: "KP",
};
