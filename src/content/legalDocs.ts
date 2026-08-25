/* ================= VĂN BẢN PHÁP LUẬT ================= */

export type LegalStatus = "Còn hiệu lực" | "Hết hiệu lực một phần" | "Hết hiệu lực";

export type LegalDoc = {
  id: string;
  code: string;
  name: string;
  type: "Luật" | "Nghị định" | "Quyết định";
  field: string;
  effective: string;
  /** Ngày hết hiệu lực, chỉ có với văn bản đã bị thay thế hoặc bãi bỏ. */
  expired?: string;
  status: LegalStatus;
  summary: string;
  /** Tóm lược điểm mới, điểm đáng chú ý của quy định. */
  highlights: string[];
  /** Văn bản thay thế, dùng cho văn bản đã hết hiệu lực. */
  replacedBy?: string;
};

export const LEGAL_DOCS: LegalDoc[] = [
  /* ---------- ĐẤT ĐAI ---------- */
  {
    id: "d1",
    code: "31/2024/QH15",
    name: "Luật Đất đai 2024",
    type: "Luật",
    field: "Đất đai",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Khung pháp lý nền về thu hồi, giao và cho thuê đất; bảng giá đất; bồi thường, hỗ trợ, tái định cư và quyền của tổ chức kinh tế nhận chuyển nhượng đất để thực hiện dự án.",
    highlights: [
      "Bảng giá đất chuyển từ chu kỳ 5 năm sang xây dựng hằng năm, bám nguyên tắc thị trường.",
      "Hiệu lực được đẩy sớm từ 01/01/2025 lên 01/08/2024 theo Luật số 43/2024/QH15.",
      "Mở rộng quyền của tổ chức kinh tế nhận chuyển nhượng quyền sử dụng đất để thực hiện dự án.",
      "Thời điểm xác định nghĩa vụ tài chính trở thành biến số ảnh hưởng trực tiếp tới tổng mức đầu tư.",
    ],
  },
  {
    id: "d2",
    code: "45/2013/QH13",
    name: "Luật Đất đai 2013",
    type: "Luật",
    field: "Đất đai",
    effective: "01/07/2014",
    expired: "01/08/2024",
    status: "Hết hiệu lực",
    replacedBy: "Luật Đất đai số 31/2024/QH15",
    summary:
      "Đạo luật đất đai áp dụng trong giai đoạn 2014 đến 2024. Vẫn cần tra cứu khi xử lý hồ sơ, giao dịch và tranh chấp phát sinh trước ngày 01/08/2024.",
    highlights: [
      "Bảng giá đất theo chu kỳ 5 năm, khoảng cách với giá thị trường ngày càng lớn về cuối chu kỳ.",
      "Là luật nội dung áp dụng cho giao dịch và quyết định hành chính ban hành trước 01/08/2024.",
      "Nhiều tranh chấp thu hồi đất, bồi thường đang được giải quyết vẫn phải viện dẫn văn bản này.",
    ],
  },
  {
    id: "d3",
    code: "102/2024/NĐ-CP",
    name: "Nghị định quy định chi tiết thi hành một số điều của Luật Đất đai",
    type: "Nghị định",
    field: "Đất đai",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Chi tiết về điều tra, đánh giá đất đai; quy hoạch và kế hoạch sử dụng đất; thu hồi, bồi thường, tái định cư và thủ tục giao đất, cho thuê đất.",
    highlights: [
      "Cụ thể hóa trình tự thu hồi đất và phương án bồi thường, hỗ trợ, tái định cư.",
      "Làm rõ hồ sơ và thẩm quyền trong thủ tục giao đất, cho thuê đất, chuyển mục đích sử dụng.",
    ],
  },

  /* ---------- BẤT ĐỘNG SẢN ---------- */
  {
    id: "d4",
    code: "29/2023/QH15",
    name: "Luật Kinh doanh bất động sản 2023",
    type: "Luật",
    field: "Bất động sản",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Điều kiện đưa dự án vào kinh doanh; chuyển nhượng dự án; thanh toán trong mua bán nhà ở hình thành trong tương lai và giới hạn phân lô bán nền.",
    highlights: [
      "Thu hẹp mạnh phạm vi được chuyển nhượng quyền sử dụng đất cho cá nhân tự xây nhà ở.",
      "Siết điều kiện và tiến độ thanh toán với nhà ở hình thành trong tương lai.",
      "Chuẩn hóa hợp đồng mẫu trong mua bán, thuê mua nhà ở và công trình xây dựng.",
    ],
  },
  {
    id: "d5",
    code: "66/2014/QH13",
    name: "Luật Kinh doanh bất động sản 2014",
    type: "Luật",
    field: "Bất động sản",
    effective: "01/07/2015",
    expired: "01/08/2024",
    status: "Hết hiệu lực",
    replacedBy: "Luật Kinh doanh bất động sản số 29/2023/QH15",
    summary:
      "Khung pháp lý kinh doanh bất động sản giai đoạn 2015 đến 2024, áp dụng cho hợp đồng mua bán và chuyển nhượng dự án ký trước ngày 01/08/2024.",
    highlights: [
      "Điều kiện phân lô bán nền rộng hơn đáng kể so với luật hiện hành.",
      "Là căn cứ nội dung cho tranh chấp hợp đồng mua bán nhà ở hình thành trong tương lai ký trước 2024.",
    ],
  },
  {
    id: "d6",
    code: "27/2023/QH15",
    name: "Luật Nhà ở 2023",
    type: "Luật",
    field: "Bất động sản",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Phát triển nhà ở thương mại và nhà ở xã hội; sở hữu nhà ở của tổ chức, cá nhân nước ngoài; quản lý và vận hành nhà chung cư.",
    highlights: [
      "Bỏ quy định thời hạn sở hữu nhà chung cư từng được đề xuất trong quá trình soạn thảo.",
      "Làm rõ cơ chế cải tạo, xây dựng lại nhà chung cư cũ và quyền của chủ sở hữu.",
      "Chi tiết hóa điều kiện và trình tự phát triển nhà ở xã hội.",
    ],
  },
  {
    id: "d7",
    code: "96/2024/NĐ-CP",
    name: "Nghị định quy định chi tiết Luật Kinh doanh bất động sản",
    type: "Nghị định",
    field: "Bất động sản",
    effective: "01/08/2024",
    status: "Còn hiệu lực",
    summary:
      "Điều kiện kinh doanh bất động sản; chuyển nhượng toàn bộ hoặc một phần dự án; hợp đồng mẫu trong mua bán và thuê mua nhà ở, công trình xây dựng.",
    highlights: [
      "Ban hành bộ hợp đồng mẫu bắt buộc áp dụng cho giao dịch nhà ở và công trình xây dựng.",
      "Cụ thể hóa điều kiện chuyển nhượng một phần dự án bất động sản.",
    ],
  },

  /* ---------- XÂY DỰNG ---------- */
  {
    id: "d8",
    code: "50/2014/QH13",
    name: "Luật Xây dựng 2014 (sửa đổi, bổ sung năm 2020)",
    type: "Luật",
    field: "Xây dựng",
    effective: "01/01/2015",
    status: "Hết hiệu lực một phần",
    summary:
      "Quy hoạch xây dựng, thẩm định dự án, giấy phép xây dựng, quản lý chất lượng, tiến độ, chi phí và điều kiện năng lực của tổ chức, cá nhân hành nghề.",
    highlights: [
      "Được sửa đổi, bổ sung bởi Luật số 62/2020/QH14, trong đó có nội dung miễn giấy phép xây dựng.",
      "Phân định rõ trách nhiệm quản lý chất lượng giữa chủ đầu tư, nhà thầu và tư vấn giám sát.",
      "Là luật gốc cho toàn bộ hệ thống nghị định về quản lý dự án đầu tư xây dựng.",
    ],
  },
  {
    id: "d9",
    code: "175/2024/NĐ-CP",
    name: "Nghị định về quản lý hoạt động xây dựng",
    type: "Nghị định",
    field: "Xây dựng",
    effective: "30/12/2024",
    status: "Còn hiệu lực",
    summary:
      "Quy định chi tiết một số điều và biện pháp thi hành Luật Xây dựng về quản lý hoạt động xây dựng, thay thế Nghị định số 15/2021/NĐ-CP.",
    highlights: [
      "Chuẩn hóa danh mục hồ sơ gắn với từng thủ tục hành chính, lược bỏ tối đa giấy tờ không cần thiết.",
      "Công bố trước danh mục và tiêu chí tuân thủ khi thẩm định, cấp giấy phép xây dựng, cấp chứng chỉ hành nghề.",
      "Phạm vi điều chỉnh rộng, chạm tới nhiều nhóm chủ thể tham gia hoạt động xây dựng.",
    ],
  },
  {
    id: "d10",
    code: "15/2021/NĐ-CP",
    name: "Nghị định về quản lý dự án đầu tư xây dựng",
    type: "Nghị định",
    field: "Xây dựng",
    effective: "03/03/2021",
    expired: "30/12/2024",
    status: "Hết hiệu lực",
    replacedBy: "Nghị định số 175/2024/NĐ-CP",
    summary:
      "Nghị định chủ đạo về quản lý dự án đầu tư xây dựng giai đoạn 2021 đến 2024. Vẫn cần đối chiếu khi xử lý hồ sơ thẩm định nộp trước ngày 30/12/2024.",
    highlights: [
      "Quy định trình tự thẩm định báo cáo nghiên cứu khả thi và thiết kế xây dựng triển khai sau thiết kế cơ sở.",
      "Là căn cứ cho các quyết định hành chính đã ban hành trong giai đoạn hiệu lực, kể cả khi tranh chấp phát sinh sau này.",
    ],
  },
  {
    id: "d11",
    code: "06/2021/NĐ-CP",
    name: "Nghị định về quản lý chất lượng, thi công xây dựng và bảo trì công trình",
    type: "Nghị định",
    field: "Xây dựng",
    effective: "26/01/2021",
    status: "Còn hiệu lực",
    summary:
      "Nghiệm thu công trình, giám sát thi công, bảo hành và bảo trì, trách nhiệm của các chủ thể khi xảy ra sự cố công trình xây dựng.",
    highlights: [
      "Quy định trình tự nghiệm thu công việc, giai đoạn và nghiệm thu hoàn thành hạng mục.",
      "Xác định trách nhiệm và thời hạn bảo hành theo loại và cấp công trình.",
      "Là căn cứ kỹ thuật thường được viện dẫn trong tranh chấp về chất lượng và quyết toán.",
    ],
  },
  {
    id: "d12",
    code: "22/2023/QH15",
    name: "Luật Đấu thầu 2023",
    type: "Luật",
    field: "Đấu thầu",
    effective: "01/01/2024",
    status: "Còn hiệu lực",
    summary:
      "Lựa chọn nhà thầu cho dự án đầu tư công và dự án có sử dụng đất; đấu thầu qua mạng; xử lý tình huống và kiến nghị trong đấu thầu.",
    highlights: [
      "Mở rộng đấu thầu qua mạng và rút ngắn thời gian trong nhiều hình thức lựa chọn nhà thầu.",
      "Làm rõ trình tự kiến nghị và giải quyết kiến nghị trong đấu thầu.",
      "Bổ sung quy định về ưu đãi trong lựa chọn nhà thầu, nhà đầu tư.",
    ],
  },
  {
    id: "d13",
    code: "43/2013/QH13",
    name: "Luật Đấu thầu 2013",
    type: "Luật",
    field: "Đấu thầu",
    effective: "01/07/2014",
    expired: "01/01/2024",
    status: "Hết hiệu lực",
    replacedBy: "Luật Đấu thầu số 22/2023/QH15",
    summary:
      "Khung pháp lý đấu thầu giai đoạn 2014 đến 2023, áp dụng cho gói thầu đã phát hành hồ sơ mời thầu trước ngày 01/01/2024.",
    highlights: [
      "Là căn cứ đánh giá tính hợp lệ của hồ sơ dự thầu phát hành trong giai đoạn hiệu lực.",
      "Thường được viện dẫn trong tranh chấp và khiếu nại kết quả lựa chọn nhà thầu của giai đoạn trước.",
    ],
  },

  /* ---------- NĂNG LƯỢNG ---------- */
  {
    id: "d14",
    code: "61/2024/QH15",
    name: "Luật Điện lực 2024",
    type: "Luật",
    field: "Năng lượng",
    effective: "01/02/2025",
    status: "Còn hiệu lực",
    summary:
      "Cơ chế mua bán điện trực tiếp, giá điện hai thành phần, phát triển điện tái tạo và điện gió ngoài khơi, an toàn hệ thống điện.",
    highlights: [
      "Lần thay đổi khung pháp lý ngành điện lớn nhất kể từ Luật Điện lực năm 2004.",
      "Tạo cơ sở luật cho cơ chế mua bán điện trực tiếp giữa đơn vị phát điện tái tạo và khách hàng lớn.",
      "Đặt nền cho lộ trình thị trường điện cạnh tranh và khung pháp lý điện gió ngoài khơi.",
    ],
  },
  {
    id: "d15",
    code: "28/2004/QH11",
    name: "Luật Điện lực 2004",
    type: "Luật",
    field: "Năng lượng",
    effective: "01/07/2005",
    expired: "01/02/2025",
    status: "Hết hiệu lực",
    replacedBy: "Luật Điện lực số 61/2024/QH15",
    summary:
      "Luật điện lực áp dụng suốt hai thập kỷ trước năm 2025, nền pháp lý của phần lớn hợp đồng mua bán điện dài hạn đang còn hiệu lực.",
    highlights: [
      "Là luật nội dung của hầu hết hợp đồng mua bán điện ký trước ngày 01/02/2025, kể cả hợp đồng 20 năm còn đang chạy.",
      "Không có quy định về mua bán điện trực tiếp, đây là khoảng trống mà Luật Điện lực 2024 lấp vào.",
      "Vẫn cần tra cứu khi xử lý tranh chấp phát sinh từ giai đoạn hiệu lực.",
    ],
  },
  {
    id: "d16",
    code: "57/2025/NĐ-CP",
    name: "Nghị định về cơ chế mua bán điện trực tiếp (DPPA)",
    type: "Nghị định",
    field: "Năng lượng",
    effective: "03/03/2025",
    status: "Còn hiệu lực",
    summary:
      "Cơ chế mua bán điện trực tiếp giữa đơn vị phát điện năng lượng tái tạo và khách hàng sử dụng điện lớn, qua đường dây kết nối riêng và qua lưới điện quốc gia: điều kiện tham gia, hợp đồng kỳ hạn và thanh toán chênh lệch.",
    highlights: [
      "Thay thế Nghị định số 80/2024/NĐ-CP kể từ ngày ký ban hành 03/3/2025.",
      "Phân định hai hình thức DPPA với cấu trúc rủi ro sản lượng rất khác nhau.",
      "Đã được sửa đổi, bổ sung bởi Nghị định số 243/2026/NĐ-CP ngày 26/6/2026.",
      "Hợp đồng ký trước ngày 03/3/2025 và phù hợp quy định được thực hiện tiếp đến hết thời hạn hoặc đàm phán sửa đổi theo quy định mới.",
    ],
  },
  {
    id: "d33",
    code: "80/2024/NĐ-CP",
    name: "Nghị định về cơ chế mua bán điện trực tiếp (bản 2024)",
    type: "Nghị định",
    field: "Năng lượng",
    effective: "03/07/2024",
    expired: "03/03/2025",
    status: "Hết hiệu lực",
    replacedBy: "Nghị định số 57/2025/NĐ-CP",
    summary:
      "Văn bản đầu tiên đặt nền cho cơ chế mua bán điện trực tiếp tại Việt Nam, áp dụng từ tháng 7/2024 đến đầu tháng 3/2025.",
    highlights: [
      "Bị bãi bỏ bởi Nghị định số 57/2025/NĐ-CP ngày 03/3/2025.",
      "Vẫn là căn cứ pháp lý của các hợp đồng DPPA ký trong giai đoạn hiệu lực và đang được thực hiện tiếp.",
      "Cần đối chiếu khi xử lý tranh chấp phát sinh từ giai đoạn 07/2024 đến 03/2025.",
    ],
  },
  {
    id: "d17",
    code: "58/2025/NĐ-CP",
    name: "Nghị định hướng dẫn thi hành Luật Điện lực",
    type: "Nghị định",
    field: "Năng lượng",
    effective: "03/03/2025",
    status: "Còn hiệu lực",
    summary:
      "Quy định chi tiết một số điều của Luật Điện lực về phát triển điện năng lượng tái tạo và điện năng lượng mới, trong đó có điện mặt trời mái nhà tự sản xuất, tự tiêu thụ.",
    highlights: [
      "Thay thế Nghị định số 135/2024/NĐ-CP về điện mặt trời mái nhà tự sản tự tiêu.",
      "Cụ thể hóa điều kiện, công suất, trình tự phát triển nguồn điện tự sản tự tiêu và cách xử lý sản lượng dư.",
      "Đã được sửa đổi, bổ sung bởi Nghị định số 243/2026/NĐ-CP ngày 26/6/2026: nâng tỷ lệ sản lượng dư được bán lên lưới từ 20% lên tối đa 50%.",
      "Không điều chỉnh giấy phép hoạt động điện lực — nội dung đó thuộc Nghị định số 61/2025/NĐ-CP.",
    ],
  },
  {
    id: "d34",
    code: "61/2025/NĐ-CP",
    name: "Nghị định về giấy phép hoạt động điện lực",
    type: "Nghị định",
    field: "Năng lượng",
    effective: "04/03/2025",
    status: "Còn hiệu lực",
    summary:
      "Quy định chi tiết một số điều của Luật Điện lực về giấy phép hoạt động điện lực: điều kiện theo từng lĩnh vực, hồ sơ và trình tự cấp phép, mức công suất được miễn trừ, thời hạn và thu hồi giấy phép.",
    highlights: [
      "Gồm 5 chương, 28 điều; áp dụng cho phát điện, truyền tải, phân phối, bán buôn và bán lẻ điện.",
      "Xác định rõ ngưỡng công suất được miễn giấy phép hoạt động điện lực.",
      "Là văn bản phải tra khi dự án tự sản tự tiêu mở rộng quy mô hoặc chuyển sang bán điện cho bên thứ ba.",
    ],
  },
  {
    id: "d35",
    code: "243/2026/NĐ-CP",
    name: "Nghị định sửa đổi, bổ sung Nghị định số 57/2025/NĐ-CP và Nghị định số 58/2025/NĐ-CP",
    type: "Nghị định",
    field: "Năng lượng",
    effective: "26/06/2026",
    status: "Còn hiệu lực",
    summary:
      "Sửa đổi, bổ sung cơ chế mua bán điện trực tiếp và quy định về phát triển điện năng lượng tái tạo, điện năng lượng mới; nới đáng kể giới hạn bán sản lượng dư của điện mặt trời mái nhà tự sản tự tiêu.",
    highlights: [
      "Nâng tỷ lệ sản lượng dư được bán lên lưới của điện mặt trời mái nhà tự sản tự tiêu từ 20% lên tối đa 50% sản lượng tại đầu ra inverter.",
      "Đến hết ngày 31/12/2030, các bên được thỏa thuận tỷ lệ cao hơn 50% nếu lưới điện khu vực đấu nối còn khả năng tiếp nhận và đáp ứng các điều kiện kèm theo.",
      "Không giới hạn sản lượng dư được bán với hệ thống tại khu vực miền núi, biên giới, hải đảo chưa được cấp điện từ lưới quốc gia.",
      "Doanh nghiệp đã lập mô hình tài chính theo trần 20% cần tính lại phương án đầu tư.",
    ],
  },
  {
    id: "d18",
    code: "13/2020/QĐ-TTg",
    name: "Quyết định về cơ chế khuyến khích phát triển điện mặt trời (giá FIT 2)",
    type: "Quyết định",
    field: "Năng lượng",
    effective: "22/05/2020",
    expired: "31/12/2020",
    status: "Hết hiệu lực",
    summary:
      "Quyết định số 13/2020/QĐ-TTg ngày 06/4/2020 của Thủ tướng Chính phủ, khung giá FIT 2 cho điện mặt trời. Thời hạn áp dụng giá kết thúc ngày 31/12/2020.",
    highlights: [
      "Giá mua điện mặt trời mặt đất ở mức 7,09 UScents/kWh; các loại hình dao động khoảng 1.644 đến 1.943 đồng/kWh.",
      "Hợp đồng mua bán điện theo cơ chế này có thời hạn 20 năm kể từ ngày vận hành thương mại.",
      "Đã hết thời hạn áp dụng nhưng vẫn là căn cứ giá cho hàng nghìn hợp đồng còn hiệu lực tới thập niên 2040.",
      "Là văn bản trung tâm của phần lớn tranh chấp về công nhận ngày vận hành thương mại và sản lượng.",
    ],
  },

  /* ---------- DOANH NGHIỆP ---------- */
  {
    id: "d19",
    code: "59/2020/QH14",
    name: "Luật Doanh nghiệp 2020",
    type: "Luật",
    field: "Doanh nghiệp",
    effective: "01/01/2021",
    status: "Hết hiệu lực một phần",
    summary:
      "Thành lập, tổ chức quản lý và tổ chức lại doanh nghiệp; quyền của cổ đông và thành viên; trách nhiệm của người quản lý doanh nghiệp.",
    highlights: [
      "Được sửa đổi, bổ sung bởi Luật số 76/2025/QH15, hiện áp dụng theo bản hợp nhất.",
      "Sửa đổi 2025 bỏ một số thủ tục hành chính về chữ ký số và tài khoản đăng ký kinh doanh.",
      "Sửa đổi 2025 tăng yêu cầu minh bạch thông tin sở hữu và trách nhiệm của người quản lý.",
      "Điều lệ soạn theo bản 2020 cần rà lại để loại bỏ điều khoản không còn phù hợp.",
    ],
  },
  {
    id: "d20",
    code: "76/2025/QH15",
    name: "Luật sửa đổi, bổ sung một số điều của Luật Doanh nghiệp",
    type: "Luật",
    field: "Doanh nghiệp",
    effective: "01/07/2025",
    status: "Còn hiệu lực",
    summary:
      "Sửa đổi, bổ sung một số điều của Luật Doanh nghiệp số 59/2020/QH14, không thay thế toàn bộ luật gốc.",
    highlights: [
      "Điều chỉnh quy định về hồ sơ đăng ký doanh nghiệp và thông tin sở hữu.",
      "Điều chỉnh quy định về phân phối lợi nhuận và điều kiện phát hành trái phiếu doanh nghiệp.",
      "Bỏ một số thủ tục hành chính không còn phù hợp trong đăng ký kinh doanh.",
    ],
  },
  {
    id: "d21",
    code: "68/2014/QH13",
    name: "Luật Doanh nghiệp 2014",
    type: "Luật",
    field: "Doanh nghiệp",
    effective: "01/07/2015",
    expired: "01/01/2021",
    status: "Hết hiệu lực",
    replacedBy: "Luật Doanh nghiệp số 59/2020/QH14",
    summary:
      "Luật doanh nghiệp giai đoạn 2015 đến 2020. Vẫn được viện dẫn khi xử lý tranh chấp nội bộ công ty phát sinh từ giai đoạn này.",
    highlights: [
      "Là căn cứ đánh giá hiệu lực của nghị quyết đại hội đồng cổ đông ban hành trước ngày 01/01/2021.",
      "Nhiều điều lệ công ty hiện hành vẫn sao chép nguyên văn cấu trúc của luật này.",
    ],
  },
  {
    id: "d22",
    code: "61/2020/QH14",
    name: "Luật Đầu tư 2020",
    type: "Luật",
    field: "Doanh nghiệp",
    effective: "01/01/2021",
    status: "Còn hiệu lực",
    summary:
      "Ngành nghề đầu tư kinh doanh có điều kiện; chấp thuận chủ trương đầu tư; ưu đãi, hỗ trợ đầu tư và thủ tục điều chỉnh dự án.",
    highlights: [
      "Chuẩn hóa danh mục ngành nghề đầu tư kinh doanh có điều kiện.",
      "Phân định thẩm quyền chấp thuận chủ trương đầu tư theo quy mô và tính chất dự án.",
      "Là văn bản chạy song song với Luật Đất đai và Luật Xây dựng trong mọi dự án có sử dụng đất.",
    ],
  },

  /* ---------- THUẾ ---------- */
  {
    id: "d23",
    code: "67/2025/QH15",
    name: "Luật Thuế thu nhập doanh nghiệp 2025",
    type: "Luật",
    field: "Thuế",
    effective: "01/10/2025",
    status: "Còn hiệu lực",
    summary:
      "Người nộp thuế, thu nhập chịu thuế và được miễn thuế, căn cứ và phương pháp tính thuế, ưu đãi thuế thu nhập doanh nghiệp.",
    highlights: [
      "Thuế suất phổ thông 20%; áp dụng 15% với doanh thu năm không quá 3 tỷ đồng và 17% với doanh thu trên 3 tỷ đến không quá 50 tỷ đồng.",
      "Áp dụng từ kỳ tính thuế năm 2025, thay thế Luật Thuế thu nhập doanh nghiệp số 14/2008/QH12.",
      "Mở rộng đối tượng miễn thuế và điều chỉnh danh mục ngành nghề được ưu đãi.",
      "Doanh nghiệp giáp ranh ngưỡng doanh thu cần chốt sớm cách xác định tổng doanh thu năm.",
    ],
  },
  {
    id: "d24",
    code: "48/2024/QH15",
    name: "Luật Thuế giá trị gia tăng 2024",
    type: "Luật",
    field: "Thuế",
    effective: "01/07/2025",
    status: "Còn hiệu lực",
    summary:
      "Đối tượng chịu thuế và không chịu thuế, giá tính thuế, thuế suất, khấu trừ và hoàn thuế giá trị gia tăng. Gồm 4 chương, 18 điều.",
    highlights: [
      "Ngưỡng doanh thu không chịu thuế của hộ và cá nhân kinh doanh tăng từ 100 triệu lên 200 triệu đồng, áp dụng từ 01/01/2026.",
      "Thu hẹp danh mục đối tượng không chịu thuế, đồng thời bổ sung một số trường hợp mới.",
      "Bổ sung quy định về giá tính thuế với hàng hóa, dịch vụ dùng để khuyến mại.",
      "Siết điều kiện khấu trừ thuế giá trị gia tăng đầu vào.",
    ],
  },
  {
    id: "d25",
    code: "13/2008/QH12",
    name: "Luật Thuế giá trị gia tăng 2008",
    type: "Luật",
    field: "Thuế",
    effective: "01/01/2009",
    expired: "01/07/2025",
    status: "Hết hiệu lực",
    replacedBy: "Luật Thuế giá trị gia tăng số 48/2024/QH15",
    summary:
      "Luật thuế giá trị gia tăng áp dụng từ năm 2009 đến giữa năm 2025, qua nhiều lần sửa đổi, bổ sung.",
    highlights: [
      "Là căn cứ xác định nghĩa vụ thuế cho các kỳ tính thuế kết thúc trước ngày 01/07/2025.",
      "Vẫn cần đối chiếu khi doanh nghiệp bị thanh tra, kiểm tra thuế cho giai đoạn trước.",
    ],
  },
  {
    id: "d26",
    code: "38/2019/QH14",
    name: "Luật Quản lý thuế 2019",
    type: "Luật",
    field: "Thuế",
    effective: "01/07/2020",
    status: "Còn hiệu lực",
    summary:
      "Đăng ký thuế, khai và nộp thuế, hoàn thuế, thanh tra và kiểm tra thuế, cưỡng chế thi hành quyết định hành chính về quản lý thuế.",
    highlights: [
      "Quy định thời hiệu truy thu thuế và tiền chậm nộp, nội dung quyết định phần lớn tranh chấp thuế.",
      "Đặt nền cho hóa đơn điện tử và quản lý thuế với hoạt động thương mại điện tử.",
    ],
  },

  /* ---------- DỮ LIỆU ---------- */
  {
    id: "d27",
    code: "91/2025/QH15",
    name: "Luật Bảo vệ dữ liệu cá nhân 2025",
    type: "Luật",
    field: "Dữ liệu",
    effective: "01/01/2026",
    status: "Còn hiệu lực",
    summary:
      "Quyền của chủ thể dữ liệu; nghĩa vụ của bên kiểm soát và bên xử lý dữ liệu; đánh giá tác động; chuyển dữ liệu ra nước ngoài và chế tài với hành vi mua bán dữ liệu.",
    highlights: [
      "Lần đầu tiên dữ liệu cá nhân được điều chỉnh ở cấp luật, thay vì chỉ bằng nghị định.",
      "Cấm tuyệt đối hành vi mua bán dữ liệu cá nhân.",
      "Mạng xã hội không được yêu cầu ảnh hoặc video giấy tờ tùy thân làm yếu tố xác thực.",
      "Tổ chức tín dụng không được dùng thông tin tín dụng cá nhân để chấm điểm nếu chưa có sự đồng ý của chủ thể dữ liệu.",
    ],
  },
  {
    id: "d28",
    code: "13/2023/NĐ-CP",
    name: "Nghị định về bảo vệ dữ liệu cá nhân",
    type: "Nghị định",
    field: "Dữ liệu",
    effective: "01/07/2023",
    expired: "01/01/2026",
    status: "Hết hiệu lực",
    replacedBy: "Nghị định số 356/2025/NĐ-CP",
    summary:
      "Nền tảng pháp lý đầu tiên về dữ liệu cá nhân tại Việt Nam: phân loại dữ liệu cơ bản và nhạy cảm, sự đồng ý của chủ thể, thông báo xử lý và hồ sơ đánh giá tác động.",
    highlights: [
      "Hết hiệu lực từ ngày 01/01/2026, được thay thế bởi Nghị định số 356/2025/NĐ-CP.",
      "Đưa ra bộ khái niệm nền mà Luật số 91/2025/QH15 kế thừa và nâng lên cấp luật.",
      "Là căn cứ đánh giá hành vi xử lý dữ liệu diễn ra trong giai đoạn 07/2023 đến hết 2025.",
      "Doanh nghiệp đã lập hồ sơ đánh giá tác động theo nghị định này cần lập lại theo chuẩn của luật và nghị định mới.",
    ],
  },
  {
    id: "d36",
    code: "356/2025/NĐ-CP",
    name: "Nghị định quy định chi tiết và biện pháp thi hành Luật Bảo vệ dữ liệu cá nhân",
    type: "Nghị định",
    field: "Dữ liệu",
    effective: "01/01/2026",
    status: "Còn hiệu lực",
    summary:
      "Quy định chi tiết một số điều và biện pháp thi hành Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15: phân loại dữ liệu cơ bản và nhạy cảm, quy trình, thủ tục và biểu mẫu tuân thủ.",
    highlights: [
      "Ban hành ngày 31/12/2025, có hiệu lực cùng ngày với Luật số 91/2025/QH15 là 01/01/2026.",
      "Thay thế Nghị định số 13/2023/NĐ-CP ngày 17/4/2023.",
      "Gồm 5 chương, 42 điều và một phụ lục với 10 biểu mẫu, trong đó có hồ sơ đánh giá tác động xử lý dữ liệu cá nhân.",
      "Áp dụng cả với tổ chức, cá nhân nước ngoài có hoạt động xử lý dữ liệu cá nhân tại Việt Nam.",
    ],
  },
  {
    id: "d29",
    code: "85/2016/NĐ-CP",
    name: "Nghị định về bảo đảm an toàn hệ thống thông tin theo cấp độ",
    type: "Nghị định",
    field: "Dữ liệu",
    effective: "01/07/2016",
    status: "Còn hiệu lực",
    summary:
      "Phân loại và bảo vệ hệ thống thông tin theo 5 cấp độ; phương án bảo đảm an toàn và ứng cứu sự cố.",
    highlights: [
      "Nghĩa vụ chạy song song với bảo vệ dữ liệu cá nhân, nhiều doanh nghiệp bỏ sót vế này.",
      "Hồ sơ đề xuất cấp độ là điều kiện thường bị kiểm tra khi có sự cố lộ dữ liệu.",
    ],
  },

  /* ---------- TỐ TỤNG ---------- */
  {
    id: "d30",
    code: "54/2010/QH12",
    name: "Luật Trọng tài thương mại 2010",
    type: "Luật",
    field: "Tố tụng",
    effective: "01/01/2011",
    status: "Còn hiệu lực",
    summary:
      "Thỏa thuận trọng tài, thủ tục tố tụng trọng tài, hủy và công nhận phán quyết. Nền tảng giải quyết tranh chấp hợp đồng thương mại và EPC.",
    highlights: [
      "Thỏa thuận trọng tài không xác định được là nguyên nhân phổ biến nhất của tranh chấp về thẩm quyền.",
      "Quy định các căn cứ hủy phán quyết trọng tài, phạm vi hẹp hơn nhiều so với kỳ vọng của bên thua kiện.",
    ],
  },
  {
    id: "d31",
    code: "92/2015/QH13",
    name: "Bộ luật Tố tụng dân sự 2015",
    type: "Luật",
    field: "Tố tụng",
    effective: "01/07/2016",
    status: "Còn hiệu lực",
    summary:
      "Thẩm quyền của Tòa án, thủ tục khởi kiện và thụ lý, chứng cứ và chứng minh, xét xử sơ thẩm, phúc thẩm, giám đốc thẩm.",
    highlights: [
      "Nghĩa vụ chứng minh thuộc về đương sự, chi phối toàn bộ chiến lược thu thập chứng cứ từ giai đoạn tiền tố tụng.",
      "Quy định thủ tục áp dụng biện pháp khẩn cấp tạm thời, công cụ quyết định trong tranh chấp có tài sản dễ tẩu tán.",
    ],
  },
  {
    id: "d32",
    code: "91/2015/QH13",
    name: "Bộ luật Dân sự 2015",
    type: "Luật",
    field: "Tố tụng",
    effective: "01/01/2017",
    status: "Còn hiệu lực",
    summary:
      "Giao dịch dân sự, hợp đồng, đại diện, thời hiệu, trách nhiệm bồi thường thiệt hại ngoài hợp đồng và biện pháp bảo đảm nghĩa vụ.",
    highlights: [
      "Là luật chung, được áp dụng khi luật chuyên ngành không quy định hoặc quy định không đầy đủ.",
      "Quy định về thời hiệu khởi kiện, nội dung thường bị bỏ qua cho tới khi đã quá muộn.",
      "Cách tiếp cận về phạt vi phạm và bồi thường thiệt hại khác với Luật Thương mại 2005.",
    ],
  },
];

export const LEGAL_FIELDS = [
  "Tất cả",
  ...Array.from(new Set(LEGAL_DOCS.map((d) => d.field))),
];
