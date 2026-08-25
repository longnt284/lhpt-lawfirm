import { readingMinutes } from "../lib/text";
import type { DocItem, DocSeed } from "./types";

const SEEDS: DocSeed[] = [
  {
    category: "Dữ liệu",
    title:
      "Luật Bảo vệ dữ liệu cá nhân có hiệu lực: doanh nghiệp bước vào năm tuân thủ đầu tiên",
    excerpt:
      "Từ 01/01/2026, Luật số 91/2025/QH15 áp dụng trực tiếp. Mọi doanh nghiệp xử lý dữ liệu khách hàng và nhân sự phải rà lại toàn bộ cơ sở pháp lý của việc xử lý.",
    content: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 được Quốc hội thông qua ngày 26/6/2025 và có hiệu lực thi hành từ ngày 01/01/2026. Đây là lần đầu tiên Việt Nam có một đạo luật riêng ở cấp luật về dữ liệu cá nhân, thay vì chỉ điều chỉnh bằng nghị định như giai đoạn trước.",
      "Ba nhóm nghĩa vụ tạo áp lực lớn nhất trong năm đầu tiên. Thứ nhất, doanh nghiệp phải xác định rõ căn cứ pháp lý cho từng hoạt động xử lý, không còn dựa vào một bản đồng ý chung chung ký một lần. Thứ hai, chuỗi hợp đồng với bên xử lý dữ liệu thuê ngoài phải được viết lại để phân định trách nhiệm. Thứ ba, quy trình phát hiện và xử lý sự cố lộ dữ liệu phải chạy được trên thực tế, không chỉ tồn tại trên giấy.",
      "Luật cũng đặt ra giới hạn cứng với một số thực tiễn đang phổ biến. Hành vi mua bán dữ liệu cá nhân bị cấm tuyệt đối. Mạng xã hội không được yêu cầu người dùng cung cấp ảnh hoặc video giấy tờ tùy thân làm yếu tố xác thực. Tổ chức tín dụng không được dùng thông tin tín dụng cá nhân để chấm điểm hay đánh giá khả năng trả nợ nếu chưa có sự đồng ý của chủ thể dữ liệu.",
      "Nhóm rủi ro cao nhất là các nền tảng thương mại điện tử, công ty công nghệ tài chính và đơn vị vận hành tòa nhà có hệ thống nhận diện. Với những đơn vị này, việc rà soát nên bắt đầu từ bản đồ luồng dữ liệu chứ không phải từ bản chính sách quyền riêng tư đăng trên website.",
    ],
    basis: ["Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"],
    date: "05/01/2026",
    featured: true,
  },
  {
    category: "Thuế",
    title:
      "Luật Thuế thu nhập doanh nghiệp mới: ba bậc thuế suất theo doanh thu đã đi vào áp dụng",
    excerpt:
      "Luật số 67/2025/QH15 hiệu lực từ 01/10/2025 thay thế Luật Thuế thu nhập doanh nghiệp 2008, đưa doanh nghiệp nhỏ vào bậc thuế suất thấp hơn.",
    content: [
      "Luật Thuế thu nhập doanh nghiệp số 67/2025/QH15 được Quốc hội thông qua ngày 14/6/2025, có hiệu lực từ ngày 01/10/2025 và áp dụng từ kỳ tính thuế năm 2025. Luật thay thế Luật Thuế thu nhập doanh nghiệp số 14/2008/QH12 cùng các lần sửa đổi trước đó.",
      "Điểm thay đổi dễ nhận thấy nhất là cơ cấu thuế suất. Mức phổ thông vẫn là 20%. Bên cạnh đó, doanh nghiệp có tổng doanh thu năm không quá 3 tỷ đồng áp dụng thuế suất 15%, doanh nghiệp có tổng doanh thu năm trên 3 tỷ đồng đến không quá 50 tỷ đồng áp dụng thuế suất 17%.",
      "Với doanh nghiệp đang ở ngưỡng giáp ranh, cách xác định tổng doanh thu năm làm căn cứ phân bậc trở thành vấn đề cần chốt sớm với đơn vị kiểm toán. Sai lệch ở khâu này kéo theo rủi ro truy thu và tiền chậm nộp cho cả kỳ tính thuế.",
      "Luật cũng điều chỉnh danh mục ngành nghề ưu đãi và mở rộng một số trường hợp miễn thuế. Doanh nghiệp đang hưởng ưu đãi theo giấy chứng nhận đầu tư cũ cần đối chiếu lại điều kiện, vì ưu đãi gắn với ngành nghề chứ không gắn với giấy phép.",
    ],
    basis: [
      "Luật Thuế thu nhập doanh nghiệp số 67/2025/QH15",
      "Luật Thuế thu nhập doanh nghiệp số 14/2008/QH12 (đã hết hiệu lực)",
    ],
    date: "12/12/2025",
  },
  {
    category: "Xây dựng",
    title:
      "Nghị định 175/2024 thay thế Nghị định 15/2021: hồ sơ thủ tục xây dựng được chuẩn hóa lại",
    excerpt:
      "Chính phủ ban hành Nghị định số 175/2024/NĐ-CP ngày 30/12/2024, lược bỏ giấy tờ không cần thiết và làm rõ tiêu chí đánh giá khi thẩm định, cấp phép.",
    content: [
      "Nghị định số 175/2024/NĐ-CP ngày 30/12/2024 của Chính phủ quy định chi tiết một số điều và biện pháp thi hành Luật Xây dựng về quản lý hoạt động xây dựng, thay thế Nghị định số 15/2021/NĐ-CP ngày 03/3/2021.",
      "Hướng sửa đổi tập trung vào ba việc. Một, chuẩn hóa danh mục hồ sơ phải nộp gắn với từng thủ tục hành chính cụ thể, lược bỏ tối đa giấy tờ không cần thiết. Hai, quy định rõ danh mục và tiêu chí tuân thủ khi đánh giá tại các thủ tục thẩm định, cấp giấy phép xây dựng và cấp chứng chỉ hành nghề. Ba, mở rộng phạm vi điều chỉnh sang nhiều nhóm chủ thể tham gia hoạt động xây dựng.",
      "Với chủ đầu tư, thay đổi đáng chú ý nhất nằm ở khâu chuẩn bị hồ sơ. Khi tiêu chí đánh giá được công bố trước, phần lớn vòng bổ sung hồ sơ lặp lại có thể tránh được nếu tư vấn rà soát đúng danh mục ngay từ lần nộp đầu.",
      "Các dự án đang trong quá trình thẩm định tại thời điểm nghị định có hiệu lực cần đối chiếu điều khoản chuyển tiếp trước khi quyết định nộp lại hồ sơ theo mẫu mới.",
    ],
    basis: [
      "Nghị định số 175/2024/NĐ-CP ngày 30/12/2024",
      "Nghị định số 15/2021/NĐ-CP ngày 03/3/2021 (đã hết hiệu lực)",
      "Luật Xây dựng số 50/2014/QH13",
    ],
    date: "20/11/2025",
  },
  {
    category: "Doanh nghiệp",
    title:
      "Luật Doanh nghiệp sửa đổi 2025: siết minh bạch chủ sở hữu hưởng lợi, bỏ bớt thủ tục hành chính",
    excerpt:
      "Luật số 76/2025/QH15 không thay thế Luật Doanh nghiệp 2020 mà sửa đổi, bổ sung một số điều về hồ sơ đăng ký, phát hành trái phiếu và trách nhiệm người quản lý.",
    content: [
      "Luật Doanh nghiệp số 59/2020/QH14 có hiệu lực từ ngày 01/01/2021 vẫn là văn bản gốc đang áp dụng. Luật số 76/2025/QH15 sửa đổi, bổ sung một số điều của luật này chứ không thay thế toàn bộ.",
      "Nội dung sửa đổi đi theo hai hướng ngược chiều nhau nhưng bổ trợ cho nhau. Một mặt, luật bỏ một số thủ tục hành chính không còn phù hợp, đặc biệt là các thủ tục liên quan tới chữ ký số và tài khoản đăng ký kinh doanh. Mặt khác, luật tăng yêu cầu minh bạch về thông tin sở hữu và tăng trách nhiệm của người quản lý doanh nghiệp.",
      "Quy định về phân phối lợi nhuận và phát hành trái phiếu doanh nghiệp cũng được điều chỉnh. Doanh nghiệp có kế hoạch huy động vốn qua kênh trái phiếu cần rà lại điều kiện phát hành trước khi chốt phương án với đơn vị tư vấn.",
      "Với doanh nghiệp đang vận hành bình thường, việc cần làm sớm là đối chiếu điều lệ công ty với bản hợp nhất mới. Điều lệ soạn theo bản 2020 có thể chứa điều khoản đã không còn phù hợp sau sửa đổi.",
    ],
    basis: [
      "Luật Doanh nghiệp số 59/2020/QH14",
      "Luật sửa đổi, bổ sung một số điều của Luật Doanh nghiệp số 76/2025/QH15",
    ],
    date: "18/10/2025",
  },
  {
    category: "Năng lượng",
    title:
      "Một năm Luật Điện lực 2024: cơ chế mua bán điện trực tiếp bắt đầu có giao dịch thật",
    excerpt:
      "Luật số 61/2024/QH15 hiệu lực từ 01/02/2025 tạo nền cho DPPA. Nghị định số 80/2024/NĐ-CP và Nghị định số 58/2025/NĐ-CP cụ thể hóa cách vận hành.",
    content: [
      "Luật Điện lực số 61/2024/QH15 có hiệu lực từ ngày 01/02/2025, thay thế Luật Điện lực số 28/2004/QH11 và các lần sửa đổi trước đó. Đây là lần thay đổi khung pháp lý ngành điện lớn nhất trong hai thập kỷ.",
      "Cơ chế mua bán điện trực tiếp giữa đơn vị phát điện năng lượng tái tạo và khách hàng sử dụng điện lớn được quy định tại Nghị định số 80/2024/NĐ-CP, với hai hình thức: qua đường dây kết nối riêng và qua lưới điện quốc gia. Nghị định số 58/2025/NĐ-CP tiếp tục hướng dẫn thi hành Luật Điện lực, trong đó có nội dung về điện mặt trời mái nhà tự sản tự tiêu và giấy phép hoạt động điện lực.",
      "Với doanh nghiệp sản xuất trong khu công nghiệp, giá trị thực tế của DPPA nằm ở khả năng chứng minh nguồn gốc điện tái tạo cho chuỗi cung ứng xuất khẩu. Đây là yêu cầu ngày càng cứng từ phía đối tác châu Âu.",
      "Điểm cần lưu ý khi đàm phán là cấu trúc rủi ro sản lượng. Hợp đồng kỳ hạn và cơ chế thanh toán chênh lệch phân bổ rủi ro rất khác nhau giữa hai hình thức, và phần lớn tranh chấp về sau bắt nguồn từ chỗ này.",
    ],
    basis: [
      "Luật Điện lực số 61/2024/QH15",
      "Luật Điện lực số 28/2004/QH11 (đã hết hiệu lực)",
      "Nghị định số 80/2024/NĐ-CP",
      "Nghị định số 58/2025/NĐ-CP",
    ],
    date: "22/09/2025",
  },
  {
    category: "Bất động sản",
    title:
      "Bảng giá đất hằng năm: chi phí nghĩa vụ tài chính của dự án bước vào chu kỳ biến động",
    excerpt:
      "Luật Đất đai số 31/2024/QH15 chuyển bảng giá đất sang chu kỳ hằng năm, kéo theo thay đổi trong cách lập dự toán và đàm phán điều chỉnh giá hợp đồng.",
    content: [
      "Luật Đất đai số 31/2024/QH15 có hiệu lực từ ngày 01/08/2024 theo Luật số 43/2024/QH15 ngày 29/6/2024, sớm hơn mốc 01/01/2025 dự kiến ban đầu. Một trong những thay đổi có tác động tài chính rõ nhất là chuyển bảng giá đất từ chu kỳ 5 năm sang xây dựng hằng năm, bám sát nguyên tắc thị trường.",
      "Hệ quả trực tiếp với doanh nghiệp phát triển dự án nằm ở ba khoản: tiền sử dụng đất khi được giao đất hoặc chuyển mục đích sử dụng, chi phí bồi thường và hỗ trợ tái định cư, và nghĩa vụ tài chính bổ sung của dự án chậm tiến độ.",
      "Khi bảng giá thay đổi hằng năm, thời điểm xác định nghĩa vụ tài chính trở thành biến số quan trọng chứ không còn là chi tiết thủ tục. Hai dự án giống nhau nhưng lệch nhau vài tháng ở khâu giao đất có thể chênh lệch đáng kể về tổng mức đầu tư.",
      "Khuyến nghị thực tiễn là chốt bằng văn bản khung pháp lý của từng nghĩa vụ tài chính trước khi ký phụ lục hợp đồng, đồng thời đưa cơ chế điều chỉnh giá vào hợp đồng chuyển nhượng đang chờ ký thay vì để mở.",
    ],
    basis: [
      "Luật Đất đai số 31/2024/QH15",
      "Luật số 43/2024/QH15 ngày 29/6/2024",
      "Luật Đất đai số 45/2013/QH13 (đã hết hiệu lực)",
    ],
    date: "14/08/2025",
  },
  {
    category: "Tố tụng",
    title:
      "Tranh chấp hợp đồng xây dựng: chọn sai diễn đàn vẫn là lỗi tốn kém nhất",
    excerpt:
      "Điều khoản giải quyết tranh chấp viết mơ hồ khiến nhiều vụ việc mất cả năm chỉ để xác định thẩm quyền trước khi bàn tới nội dung.",
    content: [
      "Luật Trọng tài thương mại số 54/2010/QH12 cho phép các bên thỏa thuận đưa tranh chấp ra trọng tài, nhưng thỏa thuận đó phải xác định được. Một điều khoản ghi chung chung rằng tranh chấp sẽ được giải quyết tại trọng tài hoặc Tòa án có thẩm quyền thường không đủ rõ để loại trừ thẩm quyền của Tòa án.",
      "Hệ quả thực tế: bên khởi kiện nộp đơn ra trọng tài, bên bị kiện phản đối thẩm quyền, và vụ việc dừng lại ở giai đoạn tiền tố tụng trong nhiều tháng. Chi phí phát sinh ở giai đoạn này gần như không thu hồi được.",
      "Với hợp đồng xây dựng có giá trị lớn, cấu trúc nhiều tầng thường hiệu quả hơn: thương lượng có thời hạn, sau đó hòa giải, và chỉ khi hai bước này không thành mới chuyển sang trọng tài với tổ chức và quy tắc được nêu đích danh. Điều quan trọng là mỗi tầng phải có mốc thời gian cụ thể, nếu không cả cơ chế trở thành công cụ trì hoãn.",
      "Khi rà soát hợp đồng mẫu, nên kiểm tra ba yếu tố tối thiểu: tên tổ chức trọng tài, số lượng trọng tài viên, và ngôn ngữ tố tụng. Thiếu bất kỳ yếu tố nào cũng làm tăng rủi ro tranh chấp về thẩm quyền.",
    ],
    basis: [
      "Luật Trọng tài thương mại số 54/2010/QH12",
      "Bộ luật Tố tụng dân sự số 92/2015/QH13",
    ],
    date: "30/06/2025",
  },
];

export const NEWS: DocItem[] = SEEDS.map((seed, i) => ({
  ...seed,
  id: `n${i + 1}`,
  kind: "news" as const,
  readMinutes: readingMinutes(seed.content),
}));
