/* ================= BÀI VIẾT PHÁP LÝ ================= */
/*
 * Mỗi bài nêu cơ sở pháp lý và vấn đề, không đi vào tư vấn cho vụ việc cụ thể.
 * Số hiệu văn bản trích dẫn trong tệp này thuộc bộ văn bản đã đối chiếu tại
 * src/content/legalDocs.ts. Thời gian đọc suy ra từ độ dài `content`.
 */

import { readingMinutes } from "../lib/text";
import type { DocItem, DocSeed } from "./types";

export const CAT_CONSTRUCTION = "Xây dựng · BĐS";
export const CAT_LITIGATION = "Tố tụng";
export const CAT_ENERGY = "Năng lượng";
export const CAT_CORPORATE = "Doanh nghiệp";
export const CAT_DATA = "Dữ liệu";

export const ARTICLE_CATEGORIES = [
  "Tất cả",
  CAT_CONSTRUCTION,
  CAT_LITIGATION,
  CAT_ENERGY,
  CAT_CORPORATE,
  CAT_DATA,
] as const;

const TRUNG = "LS. Trung Phạm";
const LONG = "LS. Long Nguyễn";
const HUY = "LS. Huy Đặng";
const PHU = "LS. Phú Hoàng";

const SEEDS: DocSeed[] = [
  /* ============ XÂY DỰNG · BẤT ĐỘNG SẢN ============ */
  {
    category: CAT_CONSTRUCTION,
    title: "Điều chỉnh giá hợp đồng xây dựng khi giá vật liệu biến động",
    excerpt:
      "Hợp đồng trọn gói không đương nhiên loại trừ mọi điều chỉnh giá, nhưng bên muốn điều chỉnh phải chứng minh được cơ sở trong chính hợp đồng.",
    content: [
      "Luật Xây dựng số 50/2014/QH13 và các nghị định hướng dẫn cho phép các bên thỏa thuận loại giá hợp đồng, trong đó hợp đồng theo đơn giá điều chỉnh cho phép thay đổi giá theo công thức đã thống nhất trước.",
      "Vướng mắc thực tế nằm ở hợp đồng trọn gói. Nhiều nhà thầu cho rằng giá vật liệu tăng mạnh là căn cứ đòi điều chỉnh, nhưng nếu hợp đồng không có điều khoản điều chỉnh và không thuộc trường hợp thay đổi phạm vi công việc, yêu cầu này rất khó được chấp nhận.",
      "Khi soạn hợp đồng, điều cần chốt không phải là có điều chỉnh giá hay không, mà là công thức điều chỉnh, nguồn chỉ số giá được dùng và mốc thời gian gốc. Thiếu ba yếu tố này, điều khoản điều chỉnh giá trở thành nguồn tranh chấp mới chứ không giải quyết được rủi ro.",
      "Với hợp đồng theo đơn giá điều chỉnh, ba tham số quyết định kết quả: rổ vật liệu được đưa vào công thức, nguồn công bố chỉ số giá và tỷ trọng của từng thành phần. Nhà thầu thi công kết cấu thép mà công thức lại lấy chỉ số giá xây dựng chung sẽ không được bù đắp phần biến động thật, dù trên giấy tờ vẫn có điều khoản điều chỉnh.",
      "Khi tranh chấp đã phát sinh, hướng lập luận khả thi nhất thường không phải viện dẫn sự biến động giá mà chứng minh phạm vi công việc đã thay đổi so với hồ sơ mời thầu, hoặc chứng minh chủ đầu tư chậm bàn giao mặt bằng khiến thời gian thi công kéo dài sang chu kỳ giá khác. Cả hai hướng đều dựa vào hồ sơ hiện trường chứ không dựa vào bảng giá thị trường.",
    ],
    basis: ["Luật Xây dựng số 50/2014/QH13", "Bộ luật Dân sự số 91/2015/QH13"],
    date: "08/2026",
    author: TRUNG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Nghiệm thu công việc xây dựng và điều kiện phát sinh quyền thanh toán",
    excerpt:
      "Biên bản nghiệm thu là mắt xích giữa công việc đã làm và tiền được nhận. Thiếu biên bản đúng trình tự, yêu cầu thanh toán mất chỗ đứng.",
    content: [
      "Nghị định số 06/2021/NĐ-CP quy định trình tự nghiệm thu gồm nghiệm thu công việc xây dựng, nghiệm thu giai đoạn và nghiệm thu hoàn thành hạng mục hoặc công trình để đưa vào sử dụng.",
      "Trong tranh chấp thanh toán, câu hỏi đầu tiên luôn là công việc đã được nghiệm thu chưa và ai ký biên bản. Nhà thầu thi công xong nhưng không có biên bản nghiệm thu hợp lệ thường rơi vào thế phải chứng minh khối lượng bằng chứng cứ gián tiếp, một con đường dài và tốn kém.",
      "Cách phòng ngừa hiệu quả nhất là quy định trong hợp đồng thời hạn chủ đầu tư phải nghiệm thu kể từ khi nhận thông báo, kèm hệ quả nếu quá hạn mà không nghiệm thu và cũng không nêu lý do từ chối bằng văn bản.",
    ],
    basis: ["Nghị định số 06/2021/NĐ-CP", "Luật Xây dựng số 50/2014/QH13"],
    date: "08/2026",
    author: LONG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Chậm tiến độ thi công: mức phạt vi phạm bị giới hạn tới đâu",
    excerpt:
      "Với công trình sử dụng vốn nhà nước, mức phạt vi phạm hợp đồng xây dựng bị khống chế trần. Với hợp đồng còn lại, giới hạn nằm ở chỗ khác.",
    content: [
      "Luật Xây dựng số 50/2014/QH13 đặt trần cho mức phạt vi phạm hợp đồng xây dựng thuộc dự án sử dụng vốn đầu tư công và vốn nhà nước ngoài đầu tư công. Vượt trần, phần vượt không được chấp nhận.",
      "Với hợp đồng giữa các chủ thể tư nhân, các bên tự do thỏa thuận mức phạt, nhưng vẫn phải qua cửa của Luật Thương mại số 36/2005/QH11 nếu tranh chấp được xác định là tranh chấp thương mại. Chọn sai luật áp dụng có thể làm mất quyền đòi phạt hoặc bị cắt giảm đáng kể.",
      "Điểm dễ bỏ sót là quan hệ giữa phạt vi phạm và bồi thường thiệt hại. Hai chế tài này được xử lý khác nhau giữa Bộ luật Dân sự số 91/2015/QH13 và Luật Thương mại, nên điều khoản hợp đồng cần nêu rõ ý chí của các bên thay vì để suy đoán.",
    ],
    basis: [
      "Luật Xây dựng số 50/2014/QH13",
      "Luật Thương mại số 36/2005/QH11",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "08/2026",
    author: TRUNG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Bảo lãnh tạm ứng và cơ chế thu hồi tiền tạm ứng",
    excerpt:
      "Tạm ứng là tiền của chủ đầu tư nằm trong tay nhà thầu. Cơ chế thu hồi viết lỏng lẻo là rủi ro của cả hai bên, không riêng bên nào.",
    content: [
      "Pháp luật xây dựng yêu cầu nhà thầu nộp bảo lãnh tạm ứng tương ứng với khoản tiền được tạm ứng, và khoản tạm ứng phải được thu hồi dần qua các lần thanh toán khối lượng hoàn thành.",
      "Tranh chấp thường phát sinh khi hợp đồng chấm dứt giữa chừng và tiền tạm ứng chưa thu hồi hết. Nếu bảo lãnh đã hết hiệu lực do hợp đồng kéo dài mà không gia hạn, chủ đầu tư mất công cụ thu hồi nhanh và phải đi đường tố tụng.",
      "Hai việc cần làm khi soạn hợp đồng: gắn nghĩa vụ gia hạn bảo lãnh với mọi lần gia hạn thời gian thực hiện hợp đồng, và quy định rõ tỷ lệ thu hồi tạm ứng trên từng đợt thanh toán thay vì để thỏa thuận sau.",
    ],
    basis: ["Luật Xây dựng số 50/2014/QH13", "Bộ luật Dân sự số 91/2015/QH13"],
    date: "08/2026",
    author: LONG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Khối lượng phát sinh ngoài hợp đồng: làm rồi mới bàn tiền là muộn",
    excerpt:
      "Phần lớn khối lượng phát sinh bị từ chối thanh toán không phải vì không có thật, mà vì thiếu văn bản chấp thuận trước khi thi công.",
    content: [
      "Hợp đồng xây dựng theo pháp luật Việt Nam và theo mẫu FIDIC đều đi theo một logic giống nhau: công việc nằm ngoài phạm vi ban đầu chỉ được thanh toán khi có lệnh thay đổi hoặc chấp thuận của chủ đầu tư, thể hiện bằng văn bản.",
      "Trên công trường, nhà thầu thường thi công trước theo chỉ đạo miệng của tư vấn giám sát để giữ tiến độ, rồi trình hồ sơ sau. Đến khi quyết toán, chủ đầu tư từ chối vì không có văn bản, và nhà thầu phải chứng minh bằng nhật ký thi công, biên bản hiện trường hoặc thư từ trao đổi.",
      "Nguyên tắc thực tiễn đáng giữ: mọi chỉ đạo thay đổi phải được xác nhận lại bằng văn bản trong thời hạn ngắn, ngay cả khi công việc đã bắt đầu. Một thư xác nhận gửi trong ngày có giá trị hơn nhiều so với hồ sơ dựng lại sau một năm.",
      "Về giá trị chứng minh, các loại tài liệu không ngang nhau. Lệnh thay đổi có chữ ký của người có thẩm quyền là mạnh nhất. Sau đó tới thư trao đổi giữa hai bên có tham chiếu công việc cụ thể, rồi tới nhật ký thi công có xác nhận của tư vấn giám sát. Ảnh chụp hiện trường không kèm mốc thời gian và không kèm xác nhận của bên còn lại nằm ở nhóm yếu nhất.",
      "Một cơ chế đáng đưa vào hợp đồng là thủ tục xác nhận im lặng: nhà thầu gửi thông báo về công việc phát sinh kèm ước tính chi phí, và nếu chủ đầu tư không phản hồi trong một số ngày nhất định thì công việc được coi là đã chấp thuận về nguyên tắc, phần giá trị chốt sau. Cơ chế này buộc cả hai bên phải xử lý vấn đề khi nó còn nhỏ.",
      "Cuối cùng, cần tách bạch hai câu hỏi mà các bên hay gộp lại: công việc có thuộc phạm vi hợp đồng ban đầu hay không, và nếu nằm ngoài thì đơn giá áp dụng là bao nhiêu. Trả lời được câu thứ nhất bằng hồ sơ thiết kế và bảng khối lượng mời thầu thường thu hẹp đáng kể tranh chấp, vì nhiều khoản gọi là phát sinh thực ra đã nằm trong phạm vi đã chào giá.",
    ],
    basis: [
      "Luật Xây dựng số 50/2014/QH13",
      "Nghị định số 06/2021/NĐ-CP",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "07/2026",
    author: TRUNG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Hợp đồng thầu phụ back-to-back: khi điều khoản không khớp nhau",
    excerpt:
      "Nhà thầu chính chịu rủi ro kẹt giữa khi hợp đồng thầu phụ không phản chiếu đúng nghĩa vụ trong hợp đồng chính.",
    content: [
      "Cấu trúc back-to-back nhằm chuyển nghĩa vụ và rủi ro từ hợp đồng chính xuống hợp đồng thầu phụ theo cùng điều kiện. Vấn đề nảy sinh khi hai hợp đồng lệch nhau ở thời hạn thông báo khiếu nại, cơ chế nghiệm thu hoặc điều kiện thanh toán.",
      "Tình huống điển hình: hợp đồng chính buộc nhà thầu chính thông báo khiếu nại trong 28 ngày, còn hợp đồng thầu phụ cho thầu phụ 45 ngày. Khi thầu phụ thông báo đúng hạn của mình, nhà thầu chính đã mất quyền khiếu nại lên chủ đầu tư và phải tự gánh phần chi phí.",
      "Khi rà soát, việc cần làm không phải đọc từng hợp đồng riêng mà đặt hai văn bản cạnh nhau và đối chiếu theo từng mốc thời hạn. Mọi chênh lệch đều phải là chênh lệch có chủ ý, chứ không phải hệ quả của việc dùng hai mẫu khác nhau.",
    ],
    basis: ["Luật Xây dựng số 50/2014/QH13", "Bộ luật Dân sự số 91/2015/QH13"],
    date: "07/2026",
    author: LONG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Quyết toán hợp đồng bị treo: gỡ từ hồ sơ hay từ tố tụng",
    excerpt:
      "Quyết toán treo nhiều năm hiếm khi là vấn đề pháp lý thuần túy. Thường là vấn đề hồ sơ, và cần xử lý bằng công cụ hồ sơ trước.",
    content: [
      "Hồ sơ quyết toán hợp đồng xây dựng phải phản ánh khối lượng đã nghiệm thu, các thay đổi đã được chấp thuận và các khoản khấu trừ. Khi một trong ba nhóm dữ liệu này không khớp giữa hai bên, quyết toán dừng lại.",
      "Trước khi tính đến khởi kiện, nên tách phần không tranh chấp ra để thanh toán riêng. Hợp đồng thường không cấm thanh toán từng phần, và việc chốt được phần đồng thuận làm giảm đáng kể giá trị tranh chấp còn lại.",
      "Nếu phải ra tố tụng, điều kiện cần là bộ hồ sơ nghiệm thu đầy đủ và một bảng đối chiếu chỉ rõ từng khoản chênh lệch kèm căn cứ. Thiếu bảng đối chiếu này, thời gian giám định và đối chất sẽ kéo dài vụ việc thêm nhiều tháng.",
      "Trước khi khởi kiện, nên gửi một văn bản chốt công nợ nêu rõ từng khoản, kèm thời hạn phản hồi. Văn bản này phục vụ hai mục đích: tạo cơ hội cuối cùng để giải quyết ngoài tố tụng, và tạo mốc rõ ràng cho việc tính lãi chậm trả cũng như cho việc xác định thời điểm quyền bị xâm phạm theo Bộ luật Dân sự số 91/2015/QH13.",
      "Nếu bên còn lại phản hồi bằng cách thừa nhận một phần và tranh chấp phần còn lại, văn bản đó trở thành chứng cứ có giá trị cao. Đây là lý do việc gửi văn bản chốt công nợ nên làm sớm, khi quan hệ hai bên còn đủ tốt để bên kia trả lời thay vì im lặng.",
    ],
    basis: [
      "Nghị định số 06/2021/NĐ-CP",
      "Luật Xây dựng số 50/2014/QH13",
      "Bộ luật Tố tụng dân sự số 92/2015/QH13",
    ],
    date: "07/2026",
    author: TRUNG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Bảo hành công trình: thời hạn, tiền giữ lại và trách nhiệm sau bàn giao",
    excerpt:
      "Hết thời hạn bảo hành không có nghĩa nhà thầu hết trách nhiệm. Hai chế định khác nhau thường bị gộp làm một.",
    content: [
      "Nghị định số 06/2021/NĐ-CP xác định thời hạn bảo hành theo loại và cấp công trình, tính từ khi nghiệm thu đưa vào sử dụng, kèm mức tiền bảo hành được giữ lại tương ứng.",
      "Điểm cần phân biệt: bảo hành là nghĩa vụ sửa chữa khiếm khuyết trong thời hạn nhất định, còn trách nhiệm bồi thường thiệt hại do công trình có khuyết tật vẫn phát sinh theo Bộ luật Dân sự số 91/2015/QH13 nếu có lỗi và có thiệt hại, kể cả sau khi hết bảo hành.",
      "Với chủ đầu tư, việc cần làm trước khi hoàn trả tiền bảo hành là lập biên bản kiểm tra hiện trạng có sự tham gia của nhà thầu. Hoàn trả xong rồi mới phát hiện khiếm khuyết là tình huống khó xử lý nhất.",
    ],
    basis: ["Nghị định số 06/2021/NĐ-CP", "Bộ luật Dân sự số 91/2015/QH13"],
    date: "07/2026",
    author: LONG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Giấy phép xây dựng: những trường hợp được miễn và bẫy thường gặp",
    excerpt:
      "Được miễn giấy phép không đồng nghĩa được miễn mọi thủ tục. Nhầm lẫn này dẫn tới công trình xây xong không hoàn công được.",
    content: [
      "Luật Xây dựng số 50/2014/QH13, sau khi được sửa đổi, bổ sung bởi Luật số 62/2020/QH14, mở rộng các trường hợp công trình được miễn giấy phép xây dựng, trong đó có nhóm công trình đã có thiết kế được thẩm định theo quy định.",
      "Bẫy nằm ở chỗ miễn giấy phép không miễn nghĩa vụ thông báo khởi công, không miễn yêu cầu phù hợp quy hoạch và không miễn quản lý chất lượng theo Nghị định số 06/2021/NĐ-CP. Công trình xây theo diện miễn nhưng thiếu các bước này vẫn có thể bị xử lý vi phạm.",
      "Trước khi khởi công theo diện miễn phép, nên có ý kiến bằng văn bản của cơ quan quản lý xây dựng địa phương xác nhận công trình thuộc trường hợp miễn. Chi phí cho bước này nhỏ hơn nhiều so với chi phí xử lý hậu quả.",
    ],
    basis: [
      "Luật Xây dựng số 50/2014/QH13",
      "Luật số 62/2020/QH14",
      "Nghị định số 175/2024/NĐ-CP",
      "Nghị định số 06/2021/NĐ-CP",
    ],
    date: "06/2026",
    author: TRUNG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Chuyển nhượng một phần dự án bất động sản: điều kiện và thời điểm",
    excerpt:
      "Luật Kinh doanh bất động sản 2023 cho phép chuyển nhượng một phần dự án, nhưng bộ điều kiện đi kèm chặt hơn nhiều so với luật cũ.",
    content: [
      "Luật Kinh doanh bất động sản số 29/2023/QH15, có hiệu lực từ ngày 01/08/2024, cùng Nghị định số 96/2024/NĐ-CP quy định điều kiện chuyển nhượng toàn bộ hoặc một phần dự án bất động sản, trong đó có yêu cầu về tình trạng pháp lý đất đai và nghĩa vụ tài chính đã hoàn thành.",
      "Vấn đề thường gặp là bên nhận chuyển nhượng ký hợp đồng khi dự án chưa đủ điều kiện, với thỏa thuận rằng bên chuyển nhượng sẽ hoàn tất thủ tục sau. Cấu trúc này đặt toàn bộ rủi ro lên bên nhận, và trong nhiều trường hợp làm hợp đồng có nguy cơ bị tuyên vô hiệu.",
      "Cách xử lý an toàn hơn là tách thành hợp đồng nguyên tắc có điều kiện tiên quyết rõ ràng, kèm cơ chế ký quỹ và lộ trình hoàn thiện pháp lý có mốc thời gian, thay vì ký thẳng hợp đồng chuyển nhượng khi điều kiện chưa đủ.",
    ],
    basis: [
      "Luật Kinh doanh bất động sản số 29/2023/QH15",
      "Nghị định số 96/2024/NĐ-CP",
      "Luật Đất đai số 31/2024/QH15",
    ],
    date: "06/2026",
    author: LONG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Nhà ở hình thành trong tương lai: tiến độ thanh toán bị siết như thế nào",
    excerpt:
      "Chủ đầu tư thu tiền vượt tỷ lệ cho phép là vi phạm, và người mua có quyền yêu cầu điều chỉnh dù đã ký hợp đồng.",
    content: [
      "Luật Kinh doanh bất động sản số 29/2023/QH15 giới hạn tỷ lệ thanh toán theo tiến độ đối với nhà ở hình thành trong tương lai, đồng thời đặt điều kiện về việc dự án phải đủ điều kiện đưa vào kinh doanh trước khi huy động vốn từ người mua.",
      "Trên thực tế, nhiều hợp đồng vẫn được thiết kế để thu tiền sớm hơn qua hình thức hợp đồng đặt cọc, hợp đồng góp vốn hoặc văn bản thỏa thuận giữ chỗ. Các cấu trúc này không làm thay đổi bản chất giao dịch nếu số tiền thu vào tương đương một phần đáng kể giá trị căn hộ.",
      "Với người mua, điều cần kiểm tra trước khi đặt bút ký là dự án đã có văn bản của cơ quan quản lý xác nhận đủ điều kiện bán chưa, và bảo lãnh của ngân hàng cho nghĩa vụ tài chính của chủ đầu tư đã được phát hành chưa.",
      "Với người mua đã lỡ ký hợp đồng có tiến độ thanh toán vượt giới hạn, việc cần làm không phải là dừng thanh toán ngay. Ngừng thanh toán đơn phương có thể bị coi là vi phạm hợp đồng và làm mất quyền của chính người mua. Trình tự hợp lý là gửi văn bản yêu cầu điều chỉnh tiến độ, viện dẫn quy định tương ứng, và chỉ dừng khi có cơ sở rõ ràng.",
      "Với chủ đầu tư, rủi ro không chỉ là chế tài hành chính. Khi thị trường xấu và dự án chậm tiến độ, các khoản đã thu vượt mức cho phép trở thành điểm tựa để người mua yêu cầu hủy hợp đồng và đòi lại tiền kèm lãi. Thiết kế tiến độ thanh toán đúng quy định ngay từ đầu là biện pháp bảo vệ chính chủ đầu tư.",
    ],
    basis: [
      "Luật Kinh doanh bất động sản số 29/2023/QH15",
      "Nghị định số 96/2024/NĐ-CP",
      "Luật Nhà ở số 27/2023/QH15",
    ],
    date: "06/2026",
    author: TRUNG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Bảo lãnh ngân hàng cho nhà ở hình thành trong tương lai",
    excerpt:
      "Thư bảo lãnh phát hành cho từng người mua khác hoàn toàn với hợp đồng bảo lãnh ký giữa ngân hàng và chủ đầu tư.",
    content: [
      "Luật Kinh doanh bất động sản số 29/2023/QH15 yêu cầu chủ đầu tư phải được ngân hàng bảo lãnh nghĩa vụ tài chính đối với người mua trước khi bán nhà ở hình thành trong tương lai.",
      "Người mua thường được chủ đầu tư cho xem hợp đồng bảo lãnh khung ký với ngân hàng và coi đó là đủ. Thực tế, quyền yêu cầu ngân hàng thanh toán chỉ phát sinh khi có thư bảo lãnh phát hành riêng cho giao dịch của mình, ghi rõ số tiền và điều kiện thực hiện nghĩa vụ.",
      "Trước khi thanh toán đợt đầu, nên yêu cầu chủ đầu tư cung cấp thư bảo lãnh mang tên mình và kiểm tra thời hạn hiệu lực của thư so với tiến độ bàn giao dự kiến. Thư hết hạn trước ngày bàn giao là rủi ro không nhỏ.",
    ],
    basis: [
      "Luật Kinh doanh bất động sản số 29/2023/QH15",
      "Luật Các tổ chức tín dụng số 32/2024/QH15",
    ],
    date: "06/2026",
    author: LONG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Phân lô bán nền sau Luật Kinh doanh bất động sản 2023",
    excerpt:
      "Phạm vi được chuyển nhượng quyền sử dụng đất cho cá nhân tự xây nhà đã thu hẹp đáng kể, kéo theo rủi ro cho giao dịch cũ.",
    content: [
      "Luật Kinh doanh bất động sản số 29/2023/QH15 thu hẹp mạnh phạm vi được chuyển nhượng quyền sử dụng đất đã có hạ tầng cho cá nhân tự xây dựng nhà ở, so với Luật Kinh doanh bất động sản số 66/2014/QH13 trước đây.",
      "Hệ quả trực tiếp là nguồn cung đất nền nhỏ lẻ giảm và dòng vốn dịch chuyển sang dự án có hạ tầng, nhà ở hoàn thiện. Đồng thời, các hợp đồng góp vốn và hợp đồng nguyên tắc ký trong giai đoạn trước bước vào giai đoạn dễ phát sinh tranh chấp khi chủ đầu tư không thể hoàn tất thủ tục như cam kết.",
      "Với nhà đầu tư cá nhân, ba điểm cần thẩm định trước khi xuống tiền: quy hoạch của thửa đất, tình trạng nghiệm thu hạ tầng của dự án và tình trạng hoàn thành nghĩa vụ tài chính về đất của chủ đầu tư.",
    ],
    basis: [
      "Luật Kinh doanh bất động sản số 29/2023/QH15",
      "Luật Kinh doanh bất động sản số 66/2014/QH13 (đã hết hiệu lực)",
      "Luật Đất đai số 31/2024/QH15",
    ],
    date: "05/2026",
    author: TRUNG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Hợp đồng đặt cọc bất động sản và nguy cơ bị tuyên vô hiệu",
    excerpt:
      "Đặt cọc để bảo đảm giao kết hợp đồng là hợp pháp. Đặt cọc thay cho việc bán khi chưa đủ điều kiện thì không.",
    content: [
      "Bộ luật Dân sự số 91/2015/QH13 ghi nhận đặt cọc là biện pháp bảo đảm việc giao kết hoặc thực hiện hợp đồng. Bản thân giao dịch đặt cọc không bị cấm và cũng không đòi hỏi bất động sản đã đủ điều kiện kinh doanh.",
      "Rủi ro phát sinh khi số tiền đặt cọc chiếm tỷ trọng lớn trong giá trị giao dịch và các bên thực chất đang mua bán một sản phẩm chưa đủ điều kiện đưa vào kinh doanh theo Luật Kinh doanh bất động sản số 29/2023/QH15. Khi đó, hợp đồng có thể bị xem xét lại về bản chất chứ không theo tên gọi.",
      "Với bên đặt cọc, cách kiểm soát rủi ro là giữ tỷ lệ đặt cọc ở mức hợp lý, ghi rõ trong hợp đồng thời hạn ký hợp đồng chính thức và điều kiện hoàn cọc nếu bên nhận cọc không hoàn tất được thủ tục pháp lý trong thời hạn đó.",
    ],
    basis: [
      "Bộ luật Dân sự số 91/2015/QH13",
      "Luật Kinh doanh bất động sản số 29/2023/QH15",
    ],
    date: "05/2026",
    author: LONG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Thu hồi đất và phương án bồi thường: đâu là điểm khiếu nại có cơ sở",
    excerpt:
      "Không phải mọi quyết định thu hồi đất đều khiếu nại được. Cơ hội nằm ở trình tự thủ tục và ở phương án bồi thường.",
    content: [
      "Luật Đất đai số 31/2024/QH15 và Nghị định số 102/2024/NĐ-CP quy định trình tự thu hồi đất, lập và phê duyệt phương án bồi thường, hỗ trợ, tái định cư, kèm các bước lấy ý kiến người có đất bị thu hồi.",
      "Trong thực tiễn khiếu nại, các lập luận có cơ sở nhất thường không nhắm vào quyền thu hồi đất của Nhà nước mà nhắm vào ba chỗ: dự án có thuộc trường hợp được thu hồi hay không, trình tự lấy ý kiến và niêm yết có được thực hiện đúng không, và đơn giá bồi thường có phản ánh đúng loại đất, vị trí và tài sản gắn liền với đất không.",
      "Mốc thời hiệu khiếu nại và khởi kiện hành chính rất ngắn. Người có đất bị thu hồi nên bắt đầu thu thập hồ sơ ngay từ khi nhận thông báo thu hồi đất, không đợi tới lúc có quyết định phê duyệt phương án bồi thường.",
      "Về chứng cứ, hồ sơ cần chuẩn bị gồm giấy tờ về quyền sử dụng đất, tài liệu chứng minh nguồn gốc và quá trình sử dụng, hồ sơ về tài sản gắn liền với đất, và toàn bộ văn bản đã nhận từ cơ quan nhà nước kèm ngày nhận. Ngày nhận từng văn bản quyết định việc còn hay hết thời hiệu, nên cần ghi nhận ngay chứ không dựng lại sau.",
      "Với hộ gia đình và cá nhân, giá trị thực tế thường nằm ở phần hỗ trợ và tái định cư hơn là ở đơn giá bồi thường đất. Các khoản hỗ trợ ổn định đời sống, hỗ trợ chuyển đổi nghề và điều kiện bố trí tái định cư có biên độ áp dụng rộng hơn, nên đây là nơi việc trao đổi với cơ quan lập phương án có khả năng tạo khác biệt.",
      "Về chiến lược, nên tách hai việc thường bị làm lẫn: phản đối chính quyết định thu hồi đất, và yêu cầu điều chỉnh phương án bồi thường. Việc thứ nhất có tỷ lệ thành công thấp và tốn nhiều thời gian. Việc thứ hai có biên độ thương lượng thật và có thể tiến hành song song mà không làm mất quyền khiếu nại đối với quyết định thu hồi.",
    ],
    basis: [
      "Luật Đất đai số 31/2024/QH15",
      "Nghị định số 102/2024/NĐ-CP",
    ],
    date: "05/2026",
    author: TRUNG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Tiền sử dụng đất khi chuyển mục đích sử dụng: chốt thời điểm là chốt chi phí",
    excerpt:
      "Từ khi bảng giá đất được xây dựng hằng năm, thời điểm xác định nghĩa vụ tài chính trở thành biến số tài chính lớn của dự án.",
    content: [
      "Luật Đất đai số 31/2024/QH15 chuyển bảng giá đất từ chu kỳ 5 năm sang xây dựng hằng năm. Với dự án phải nộp tiền sử dụng đất khi chuyển mục đích, mức phải nộp gắn với bảng giá và các thông số tại thời điểm xác định nghĩa vụ tài chính.",
      "Hệ quả là hai dự án tương đương nhưng lệch nhau vài tháng ở khâu giao đất hoặc cho phép chuyển mục đích có thể chênh lệch đáng kể về tổng mức đầu tư. Đây không còn là chi tiết thủ tục mà là yếu tố cần đưa vào mô hình tài chính ngay từ đầu.",
      "Với dự án đang dở dang, việc cần làm sớm là rà lại từng giai đoạn chưa hoàn thành nghĩa vụ tài chính, xác định thời điểm áp dụng và ghi nhận bằng văn bản với cơ quan có thẩm quyền thay vì để mở tới khi có thông báo nộp tiền.",
    ],
    basis: [
      "Luật Đất đai số 31/2024/QH15",
      "Nghị định số 102/2024/NĐ-CP",
      "Luật số 43/2024/QH15",
    ],
    date: "04/2026",
    author: LONG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Kiến nghị kết quả lựa chọn nhà thầu: cửa hẹp và thời hạn ngắn",
    excerpt:
      "Nhà thầu trượt có quyền kiến nghị, nhưng quyền này mất rất nhanh nếu không hành động trong thời hạn luật định.",
    content: [
      "Luật Đấu thầu số 22/2023/QH15 quy định trình tự kiến nghị trong đấu thầu, gồm kiến nghị về các vấn đề trong quá trình lựa chọn nhà thầu và kiến nghị về kết quả lựa chọn nhà thầu, với thời hạn và cấp giải quyết khác nhau.",
      "Sai lầm phổ biến là nhà thầu dành thời gian thu thập chứng cứ cho hoàn chỉnh rồi mới gửi kiến nghị, và khi gửi thì đã quá thời hạn. Trình tự đúng là gửi kiến nghị trong hạn với các căn cứ đã có, sau đó bổ sung tài liệu.",
      "Nội dung kiến nghị có sức nặng nhất thường là những điểm kiểm chứng được từ chính hồ sơ mời thầu và biên bản mở thầu, chẳng hạn tiêu chí đánh giá được áp dụng không thống nhất giữa các nhà thầu, chứ không phải nhận định chung về sự thiếu khách quan.",
    ],
    basis: [
      "Luật Đấu thầu số 22/2023/QH15",
      "Luật Đấu thầu số 43/2013/QH13 (đã hết hiệu lực)",
    ],
    date: "04/2026",
    author: TRUNG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Tính hợp lệ của hồ sơ dự thầu: loại vì hình thức nhiều hơn vì năng lực",
    excerpt:
      "Phần lớn hồ sơ bị loại ở bước đánh giá tính hợp lệ, trước khi bên mời thầu kịp xem tới đề xuất kỹ thuật.",
    content: [
      "Luật Đấu thầu số 22/2023/QH15 đặt ra các yêu cầu về tính hợp lệ của hồ sơ dự thầu, bao gồm hiệu lực hồ sơ, bảo đảm dự thầu, tư cách hợp lệ của nhà thầu và tính thống nhất của tài liệu nộp kèm.",
      "Những lỗi khiến hồ sơ bị loại thường rất cơ bản: bảo đảm dự thầu có thời hạn ngắn hơn yêu cầu, người ký đơn dự thầu không có ủy quyền hợp lệ, hoặc bản gốc và bản chụp không khớp nhau ở phần giá.",
      "Cách phòng ngừa hiệu quả là tách bước rà soát tính hợp lệ thành một vòng riêng do người không tham gia soạn hồ sơ thực hiện, dựa trên đúng danh mục yêu cầu của hồ sơ mời thầu chứ không dựa trên kinh nghiệm của các gói thầu trước.",
    ],
    basis: ["Luật Đấu thầu số 22/2023/QH15"],
    date: "04/2026",
    author: LONG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Sự cố công trình xây dựng: ai chịu trách nhiệm và chịu tới đâu",
    excerpt:
      "Trách nhiệm khi có sự cố được phân theo vai trò của từng chủ thể, không dồn hết cho nhà thầu thi công.",
    content: [
      "Nghị định số 06/2021/NĐ-CP quy định trình tự giải quyết sự cố công trình xây dựng, gồm việc dừng thi công, bảo vệ hiện trường, báo cáo cơ quan có thẩm quyền và giám định nguyên nhân sự cố.",
      "Kết quả giám định nguyên nhân là căn cứ quyết định trách nhiệm. Sự cố do lỗi thiết kế thuộc trách nhiệm của nhà thầu thiết kế, do lỗi thi công thuộc nhà thầu thi công, do lỗi giám sát thuộc tư vấn giám sát, và chủ đầu tư vẫn có thể liên đới nếu vi phạm nghĩa vụ quản lý chất lượng.",
      "Sai lầm hay gặp ngay sau khi sự cố xảy ra là thay đổi hiện trường để khắc phục nhanh. Việc này làm mất chứng cứ và đẩy bên có lỗi thật sự vào thế có lợi, vì giám định không còn cơ sở kết luận rõ ràng.",
    ],
    basis: [
      "Nghị định số 06/2021/NĐ-CP",
      "Luật Xây dựng số 50/2014/QH13",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "03/2026",
    author: TRUNG,
  },
  {
    category: CAT_CONSTRUCTION,
    title: "Điều kiện năng lực và chứng chỉ hành nghề: rủi ro nằm ở hợp đồng đã ký",
    excerpt:
      "Nhà thầu không đủ điều kiện năng lực khi ký hợp đồng có thể kéo theo hệ quả cho cả hợp đồng, không chỉ là xử phạt hành chính.",
    content: [
      "Luật Xây dựng số 50/2014/QH13 và Nghị định số 175/2024/NĐ-CP quy định điều kiện năng lực của tổ chức, cá nhân tham gia hoạt động xây dựng, gắn với hạng chứng chỉ và phạm vi hoạt động tương ứng.",
      "Vấn đề pháp lý đáng chú ý là hệ quả của việc ký hợp đồng khi không đủ điều kiện năng lực. Ngoài chế tài hành chính, bên còn lại có thể viện dẫn vi phạm này khi phát sinh tranh chấp về chất lượng hoặc khi muốn chấm dứt hợp đồng.",
      "Trước khi ký, chủ đầu tư nên kiểm tra chứng chỉ năng lực của tổ chức và chứng chỉ hành nghề của các cá nhân chủ chốt trên hệ thống công bố công khai, đồng thời đưa cam kết duy trì điều kiện năng lực suốt thời gian thực hiện hợp đồng vào điều khoản.",
    ],
    basis: [
      "Luật Xây dựng số 50/2014/QH13",
      "Nghị định số 175/2024/NĐ-CP",
    ],
    date: "03/2026",
    author: LONG,
  },

  /* ============ TỐ TỤNG · GIẢI QUYẾT TRANH CHẤP ============ */
  {
    category: CAT_LITIGATION,
    title: "Thời hiệu khởi kiện tranh chấp hợp đồng: đếm từ ngày nào",
    excerpt:
      "Thời hiệu không đếm từ ngày ký hợp đồng cũng không đếm từ ngày phát sinh mâu thuẫn, mà từ ngày quyền bị xâm phạm.",
    content: [
      "Bộ luật Dân sự số 91/2015/QH13 quy định thời hiệu khởi kiện để yêu cầu Tòa án giải quyết tranh chấp hợp đồng là ba năm, tính từ ngày người có quyền yêu cầu biết hoặc phải biết quyền và lợi ích hợp pháp của mình bị xâm phạm.",
      "Trong tranh chấp thanh toán, mốc này thường là ngày hết thời hạn thanh toán theo hợp đồng, chứ không phải ngày bên có nghĩa vụ chính thức từ chối trả tiền. Nhiều doanh nghiệp mất quyền khởi kiện vì đàm phán kéo dài nhiều năm mà không có văn bản nào làm gián đoạn thời hiệu.",
      "Cách giữ quyền đơn giản nhất là gửi văn bản yêu cầu thanh toán có xác nhận đã nhận, và ghi nhận mọi lần bên nợ thừa nhận nghĩa vụ bằng văn bản. Một biên bản đối chiếu công nợ có chữ ký hai bên có giá trị hơn nhiều cuộc họp không biên bản.",
      "Bộ luật Dân sự số 91/2015/QH13 cũng quy định các trường hợp bắt đầu lại thời hiệu, trong đó có việc bên có nghĩa vụ thừa nhận một phần hoặc toàn bộ nghĩa vụ đối với người khởi kiện. Đây là công cụ mà doanh nghiệp ít khi sử dụng có ý thức, dù nó rất dễ tạo lập trong quá trình đàm phán.",
      "Một điểm nữa cần lưu ý: nếu bên bị đơn không viện dẫn thời hiệu, Tòa án không tự áp dụng. Trên thực tế, luật sư của bên bị đơn hầu như luôn nêu vấn đề này ngay ở văn bản đầu tiên, nên không nên trông chờ vào khả năng bên kia bỏ sót.",
    ],
    basis: [
      "Bộ luật Dân sự số 91/2015/QH13",
      "Bộ luật Tố tụng dân sự số 92/2015/QH13",
    ],
    date: "08/2026",
    author: PHU,
  },
  {
    category: CAT_LITIGATION,
    title: "Phạt vi phạm và bồi thường thiệt hại: chọn sai luật là mất quyền",
    excerpt:
      "Bộ luật Dân sự và Luật Thương mại tiếp cận khác nhau về việc có được áp dụng song song hai chế tài hay không.",
    content: [
      "Bộ luật Dân sự số 91/2015/QH13 và Luật Thương mại số 36/2005/QH11 cùng ghi nhận phạt vi phạm và bồi thường thiệt hại, nhưng điều kiện áp dụng đồng thời hai chế tài không giống nhau giữa hai văn bản.",
      "Hệ quả thực tiễn: cùng một điều khoản hợp đồng, kết quả có thể khác nhau tùy vào việc quan hệ được xác định là quan hệ dân sự hay quan hệ thương mại. Với hợp đồng xây dựng giữa hai doanh nghiệp, câu trả lời không phải lúc nào cũng hiển nhiên.",
      "Khi soạn hợp đồng, nên viết rõ ý chí của các bên về việc áp dụng song song, thay vì chỉ ghi mức phạt và để phần bồi thường suy đoán. Một câu bổ sung ở khâu soạn thảo tiết kiệm được nhiều tháng tranh luận ở khâu tố tụng.",
    ],
    basis: [
      "Bộ luật Dân sự số 91/2015/QH13",
      "Luật Thương mại số 36/2005/QH11",
      "Luật Xây dựng số 50/2014/QH13",
    ],
    date: "08/2026",
    author: TRUNG,
  },
  {
    category: CAT_LITIGATION,
    title: "Thỏa thuận trọng tài không xác định được: hậu quả và cách vá",
    excerpt:
      "Điều khoản ghi chung chung rằng tranh chấp sẽ ra trọng tài hoặc Tòa án thường không đủ để loại trừ thẩm quyền của Tòa án.",
    content: [
      "Luật Trọng tài thương mại số 54/2010/QH12 cho phép các bên thỏa thuận đưa tranh chấp ra trọng tài, nhưng thỏa thuận phải xác định được tổ chức trọng tài hoặc phương thức chỉ định hội đồng trọng tài.",
      "Khi điều khoản mơ hồ, kịch bản quen thuộc là bên khởi kiện nộp đơn ra trọng tài, bên bị kiện phản đối thẩm quyền, và vụ việc dừng ở giai đoạn tiền tố tụng nhiều tháng. Chi phí phát sinh trong giai đoạn này gần như không thu hồi được.",
      "Nếu phát hiện điều khoản có vấn đề khi tranh chấp chưa phát sinh, các bên hoàn toàn có thể ký phụ lục sửa lại. Sau khi tranh chấp đã phát sinh, khả năng đạt được thỏa thuận sửa đổi gần như bằng không, nên đây là việc phải làm sớm.",
    ],
    basis: ["Luật Trọng tài thương mại số 54/2010/QH12"],
    date: "07/2026",
    author: LONG,
  },
  {
    category: CAT_LITIGATION,
    title: "Yêu cầu hủy phán quyết trọng tài: phạm vi hẹp hơn nhiều so với kỳ vọng",
    excerpt:
      "Tòa án không xét lại nội dung vụ tranh chấp khi giải quyết yêu cầu hủy phán quyết. Đây là điều bên thua kiện thường hiểu nhầm.",
    content: [
      "Luật Trọng tài thương mại số 54/2010/QH12 quy định các căn cứ hủy phán quyết trọng tài, tập trung vào những khiếm khuyết về thỏa thuận trọng tài, thành phần hội đồng, thủ tục tố tụng và trái nguyên tắc cơ bản của pháp luật Việt Nam.",
      "Điểm cốt lõi là Tòa án không xem xét lại nội dung tranh chấp, không đánh giá lại chứng cứ và không kết luận hội đồng trọng tài áp dụng pháp luật đúng hay sai. Đơn yêu cầu hủy chỉ nhằm vào nội dung phán quyết gần như chắc chắn không được chấp nhận.",
      "Với bên có nguy cơ thua kiện, thời điểm hiệu quả nhất để bảo vệ quyền lợi là trong quá trình tố tụng trọng tài, bằng việc phản đối kịp thời mọi vi phạm thủ tục và ghi nhận phản đối đó vào hồ sơ. Phản đối muộn thường bị coi là đã từ bỏ.",
    ],
    basis: ["Luật Trọng tài thương mại số 54/2010/QH12"],
    date: "07/2026",
    author: PHU,
  },
  {
    category: CAT_LITIGATION,
    title: "Biện pháp khẩn cấp tạm thời: công cụ quyết định trong tranh chấp có tài sản",
    excerpt:
      "Thắng kiện sau ba năm mà bên phải thi hành không còn tài sản là thắng trên giấy. Phong tỏa sớm thay đổi cục diện.",
    content: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13 cho phép đương sự yêu cầu Tòa án áp dụng biện pháp khẩn cấp tạm thời, trong đó có phong tỏa tài khoản, phong tỏa tài sản và cấm chuyển dịch quyền về tài sản.",
      "Điều kiện đi kèm là người yêu cầu phải thực hiện biện pháp bảo đảm, thường là gửi một khoản tiền tương ứng với thiệt hại có thể phát sinh nếu yêu cầu không đúng. Đây là rào cản thực tế khiến nhiều doanh nghiệp bỏ qua công cụ này.",
      "Cách cân nhắc hợp lý là so sánh chi phí bảo đảm với xác suất bên kia tẩu tán tài sản trong thời gian tố tụng. Với tranh chấp mà bên phải thi hành có dấu hiệu chuyển nhượng tài sản hoặc thay đổi cơ cấu sở hữu, chi phí này thường đáng bỏ ra.",
      "Về mặt chiến thuật, thời điểm nộp đơn quan trọng không kém nội dung đơn. Nộp cùng lúc với đơn khởi kiện giữ được yếu tố bất ngờ. Nộp sau khi vụ án đã được thụ lý và bên kia đã biết mình bị kiện thường muộn, vì quá trình chuyển dịch tài sản có thể đã bắt đầu.",
      "Cũng cần lường trước rủi ro ngược: nếu yêu cầu áp dụng biện pháp khẩn cấp tạm thời không đúng và gây thiệt hại cho bên bị áp dụng, người yêu cầu phải bồi thường. Vì vậy, phạm vi tài sản đề nghị phong tỏa nên tương xứng với giá trị tranh chấp, không nên yêu cầu rộng hơn mức cần thiết.",
      "Về hồ sơ, đơn yêu cầu có sức thuyết phục là đơn nêu được dấu hiệu cụ thể của việc tẩu tán: giao dịch chuyển nhượng tài sản gần đây, thay đổi người đại diện theo pháp luật, hoặc việc doanh nghiệp thông báo giải thể. Đơn chỉ nêu lo ngại chung chung rằng bên kia có thể tẩu tán tài sản hiếm khi được chấp nhận.",
    ],
    basis: ["Bộ luật Tố tụng dân sự số 92/2015/QH13"],
    date: "07/2026",
    author: HUY,
  },
  {
    category: CAT_LITIGATION,
    title: "Nghĩa vụ chứng minh thuộc về đương sự: hệ quả với cách lưu hồ sơ",
    excerpt:
      "Tòa án không đi thu thập chứng cứ thay cho doanh nghiệp. Chất lượng hồ sơ lưu trữ quyết định phần lớn kết quả vụ kiện.",
    content: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13 đặt nghĩa vụ chứng minh lên đương sự. Bên đưa ra yêu cầu phải có nghĩa vụ chứng minh yêu cầu đó có căn cứ và hợp pháp.",
      "Nguyên tắc này chi phối toàn bộ cách vận hành hợp đồng chứ không chỉ chi phối giai đoạn tố tụng. Một doanh nghiệp trao đổi công việc chủ yếu qua điện thoại và tin nhắn cá nhân sẽ ở thế yếu ngay từ đầu, dù trên thực tế họ đúng.",
      "Thói quen đáng xây dựng là xác nhận lại bằng văn bản mọi thỏa thuận quan trọng đạt được qua trao đổi miệng, và lưu trữ theo từng hợp đồng thay vì theo từng người phụ trách. Nhân sự nghỉ việc mang theo hồ sơ là tình huống thường gặp hơn nhiều người tưởng.",
    ],
    basis: ["Bộ luật Tố tụng dân sự số 92/2015/QH13"],
    date: "06/2026",
    author: HUY,
  },
  {
    category: CAT_LITIGATION,
    title: "Chứng cứ điện tử trong tranh chấp thương mại: email và tin nhắn dùng được tới đâu",
    excerpt:
      "Dữ liệu điện tử là nguồn chứng cứ hợp pháp, nhưng giá trị chứng minh phụ thuộc vào cách thu thập và trình bày.",
    content: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13 ghi nhận dữ liệu điện tử là một nguồn chứng cứ. Trên thực tế, email trao đổi và tin nhắn thường là chứng cứ quan trọng nhất trong tranh chấp về khối lượng phát sinh và về việc chấm dứt hợp đồng.",
      "Vấn đề nằm ở khâu chứng minh tính xác thực. Ảnh chụp màn hình tin nhắn dễ bị phản bác. Bản in email không có thông tin tiêu đề kỹ thuật cũng vậy. Trong khi đó, vi bằng do thừa phát lại lập ghi nhận nội dung tại thời điểm cụ thể có sức thuyết phục cao hơn hẳn.",
      "Nguyên tắc thực tiễn: khi nhận thấy tranh chấp sắp phát sinh, việc đầu tiên nên làm là cố định chứng cứ điện tử trước khi tài khoản bị khóa, nhân sự nghỉ việc hoặc nhóm chat bị xóa.",
    ],
    basis: ["Bộ luật Tố tụng dân sự số 92/2015/QH13"],
    date: "06/2026",
    author: PHU,
  },
  {
    category: CAT_LITIGATION,
    title: "Yêu cầu hủy nghị quyết đại hội đồng cổ đông: thời hạn rất ngắn",
    excerpt:
      "Cổ đông phát hiện nghị quyết có vi phạm nhưng chờ hết năm tài chính mới hành động thường đã mất quyền yêu cầu.",
    content: [
      "Luật Doanh nghiệp số 59/2020/QH14, được sửa đổi bổ sung bởi Luật số 76/2025/QH15, cho phép cổ đông hoặc nhóm cổ đông đáp ứng điều kiện về tỷ lệ sở hữu yêu cầu Tòa án hoặc trọng tài hủy bỏ nghị quyết đại hội đồng cổ đông khi trình tự, thủ tục triệu tập hoặc nội dung nghị quyết vi phạm quy định.",
      "Thời hạn yêu cầu tính từ ngày nhận được nghị quyết hoặc biên bản họp và ngắn hơn nhiều so với thời hiệu khởi kiện hợp đồng thông thường. Đây là lý do phần lớn yêu cầu hủy bị từ chối ngay ở khâu thụ lý.",
      "Với cổ đông thiểu số, việc cần làm ngay khi nhận tài liệu họp là kiểm tra thời hạn gửi thông báo mời họp và tài liệu kèm theo. Vi phạm về trình tự triệu tập là căn cứ dễ chứng minh hơn nhiều so với lập luận về nội dung nghị quyết.",
    ],
    basis: [
      "Luật Doanh nghiệp số 59/2020/QH14",
      "Luật số 76/2025/QH15",
    ],
    date: "06/2026",
    author: HUY,
  },
  {
    category: CAT_LITIGATION,
    title: "Thi hành án dân sự: bản án có hiệu lực không đồng nghĩa với thu được tiền",
    excerpt:
      "Giai đoạn thi hành án là nơi nhiều vụ thắng kiện dừng lại. Chuẩn bị cho giai đoạn này phải bắt đầu từ trước khi khởi kiện.",
    content: [
      "Sau khi bản án hoặc phán quyết trọng tài có hiệu lực, người được thi hành án phải làm đơn yêu cầu thi hành án và cung cấp thông tin về tài sản của người phải thi hành án nếu có.",
      "Thực tế cho thấy cơ quan thi hành án khó xác minh tài sản nhanh hơn chính chủ nợ. Doanh nghiệp nắm được thông tin về tài khoản, bất động sản hoặc phần vốn góp của bên nợ sẽ rút ngắn đáng kể thời gian cưỡng chế.",
      "Vì vậy, việc thu thập thông tin tài sản nên tiến hành song song với giai đoạn chuẩn bị khởi kiện, kết hợp với biện pháp khẩn cấp tạm thời theo Bộ luật Tố tụng dân sự số 92/2015/QH13 nếu có dấu hiệu tẩu tán.",
    ],
    basis: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "05/2026",
    author: PHU,
  },
  {
    category: CAT_LITIGATION,
    title: "Lãi chậm trả trong tranh chấp hợp đồng: tính theo cơ sở nào",
    excerpt:
      "Hợp đồng không quy định mức lãi chậm trả không có nghĩa là không được đòi lãi, nhưng cách tính sẽ khác đáng kể.",
    content: [
      "Bộ luật Dân sự số 91/2015/QH13 quy định về lãi suất trong trường hợp chậm thực hiện nghĩa vụ trả tiền, còn Luật Thương mại số 36/2005/QH11 có cách tiếp cận riêng cho quan hệ thương mại dựa trên lãi suất nợ quá hạn trung bình trên thị trường.",
      "Khi hợp đồng có thỏa thuận mức lãi, mức đó được ưu tiên áp dụng nhưng vẫn chịu giới hạn của pháp luật. Khi hợp đồng im lặng, việc xác định cơ sở tính lãi trở thành một tranh luận riêng, kéo dài thêm thời gian giải quyết.",
      "Với doanh nghiệp cho trả chậm, cách kiểm soát tốt nhất là ghi rõ trong hợp đồng mức lãi chậm trả, mốc bắt đầu tính lãi và cơ sở tham chiếu, thay vì dựa vào quy định mặc định của luật.",
    ],
    basis: [
      "Bộ luật Dân sự số 91/2015/QH13",
      "Luật Thương mại số 36/2005/QH11",
    ],
    date: "05/2026",
    author: LONG,
  },
  {
    category: CAT_LITIGATION,
    title: "Đơn phương chấm dứt và hủy bỏ hợp đồng: hai chế định, hai hệ quả",
    excerpt:
      "Dùng nhầm thuật ngữ trong thông báo chấm dứt có thể biến bên có quyền thành bên vi phạm.",
    content: [
      "Bộ luật Dân sự số 91/2015/QH13 phân biệt đơn phương chấm dứt thực hiện hợp đồng và hủy bỏ hợp đồng. Hai chế định có điều kiện áp dụng khác nhau và hệ quả pháp lý khác nhau, đặc biệt ở việc hợp đồng có hiệu lực từ đầu hay không.",
      "Trong tranh chấp xây dựng, tình huống thường gặp là chủ đầu tư gửi văn bản chấm dứt hợp đồng vì nhà thầu chậm tiến độ, nhưng không tuân thủ thủ tục cảnh báo và thời hạn khắc phục mà chính hợp đồng đặt ra. Khi đó, bên chấm dứt có thể bị coi là bên vi phạm.",
      "Trước khi gửi thông báo, cần kiểm tra ba việc: căn cứ chấm dứt có thuộc trường hợp hợp đồng cho phép không, thủ tục cảnh báo đã thực hiện đủ chưa, và thời hạn khắc phục đã hết chưa.",
      "Trong thư thông báo, nên nêu rõ ba nội dung: căn cứ hợp đồng và căn cứ pháp luật được viện dẫn, các sự kiện vi phạm cụ thể kèm mốc thời gian, và thời điểm chấm dứt có hiệu lực. Thư viết chung chung rằng bên kia đã vi phạm nghiêm trọng mà không chỉ ra vi phạm nào sẽ khó bảo vệ khi ra tố tụng.",
      "Một sai lầm khác là tiếp tục nhận công việc hoặc tiếp tục thanh toán sau khi đã gửi thông báo chấm dứt. Hành vi này có thể bị hiểu là đã từ bỏ quyền chấm dứt hoặc đã xác lập một thỏa thuận mới, làm vô hiệu hóa toàn bộ nỗ lực trước đó.",
    ],
    basis: [
      "Bộ luật Dân sự số 91/2015/QH13",
      "Luật Thương mại số 36/2005/QH11",
    ],
    date: "05/2026",
    author: TRUNG,
  },
  {
    category: CAT_LITIGATION,
    title: "Bất khả kháng và hoàn cảnh thay đổi cơ bản: hai lối thoát khác nhau",
    excerpt:
      "Chi phí tăng vọt không phải bất khả kháng. Nhưng trong một số điều kiện, đó có thể là hoàn cảnh thay đổi cơ bản.",
    content: [
      "Bộ luật Dân sự số 91/2015/QH13 định nghĩa sự kiện bất khả kháng là sự kiện xảy ra khách quan, không thể lường trước và không thể khắc phục dù đã áp dụng mọi biện pháp cần thiết. Bên cạnh đó, bộ luật cũng ghi nhận chế định thực hiện hợp đồng khi hoàn cảnh thay đổi cơ bản.",
      "Khác biệt cốt lõi: bất khả kháng làm cho việc thực hiện nghĩa vụ trở nên không thể, còn hoàn cảnh thay đổi cơ bản làm cho việc thực hiện vẫn khả thi nhưng gây thiệt hại nghiêm trọng cho một bên. Giá vật liệu tăng mạnh thường rơi vào nhóm thứ hai chứ không phải nhóm thứ nhất.",
      "Chế định hoàn cảnh thay đổi cơ bản trước hết dẫn tới nghĩa vụ đàm phán lại, không tự động cho phép ngừng thực hiện. Bên đơn phương dừng công việc rồi mới viện dẫn chế định này thường ở thế bất lợi.",
    ],
    basis: ["Bộ luật Dân sự số 91/2015/QH13"],
    date: "04/2026",
    author: TRUNG,
  },
  {
    category: CAT_LITIGATION,
    title: "Thẩm quyền của Tòa án theo lãnh thổ: nơi nộp đơn không phải lúc nào cũng tự chọn",
    excerpt:
      "Nộp đơn sai nơi có thẩm quyền dẫn tới trả lại đơn, và thời gian mất đi có thể chạm tới ngưỡng thời hiệu.",
    content: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13 xác định thẩm quyền của Tòa án theo cấp, theo lãnh thổ và theo sự lựa chọn của nguyên đơn trong một số trường hợp. Nguyên tắc chung với tranh chấp hợp đồng là Tòa án nơi bị đơn cư trú hoặc có trụ sở.",
      "Các bên có thể thỏa thuận chọn Tòa án nơi nguyên đơn có trụ sở, nhưng thỏa thuận phải rõ ràng và bằng văn bản. Điều khoản ghi chung chung rằng tranh chấp do Tòa án có thẩm quyền giải quyết không tạo ra sự lựa chọn nào.",
      "Với tranh chấp liên quan tới bất động sản, quy tắc riêng về thẩm quyền được áp dụng và các bên không thể thỏa thuận khác. Đây là điểm thường bị bỏ qua khi sao chép điều khoản giải quyết tranh chấp từ hợp đồng khác.",
    ],
    basis: ["Bộ luật Tố tụng dân sự số 92/2015/QH13"],
    date: "04/2026",
    author: PHU,
  },
  {
    category: CAT_LITIGATION,
    title: "Án phí và chi phí tố tụng: cấu phần thường bị bỏ quên khi tính toán khởi kiện",
    excerpt:
      "Ngoài án phí, chi phí giám định và định giá tài sản mới là khoản làm thay đổi phép tính chi phí lợi ích của vụ kiện.",
    content: [
      "Trong tranh chấp có giá ngạch, án phí được tính theo giá trị tranh chấp và nguyên đơn phải nộp tạm ứng khi nộp đơn. Bên thua kiện chịu án phí, nhưng việc thu hồi khoản đã tạm ứng phụ thuộc vào kết quả thi hành án.",
      "Khoản khó dự trù hơn là chi phí giám định và định giá tài sản. Với tranh chấp xây dựng, giám định khối lượng và chất lượng công trình có thể tốn kém và kéo dài nhiều tháng, đôi khi vượt cả án phí.",
      "Vì vậy, phép tính trước khi khởi kiện nên gồm cả xác suất phải giám định. Với tranh chấp giá trị vừa phải mà hồ sơ nghiệm thu không đầy đủ, phương án thương lượng có kiểm soát thường cho kết quả tài chính tốt hơn.",
    ],
    basis: ["Bộ luật Tố tụng dân sự số 92/2015/QH13"],
    date: "04/2026",
    author: LONG,
  },
  {
    category: CAT_LITIGATION,
    title: "Hòa giải trong tố tụng dân sự: bắt buộc về thủ tục, tự nguyện về nội dung",
    excerpt:
      "Phiên hòa giải không phải hình thức. Đây là thời điểm hiếm hoi hai bên ngồi cùng nhau với đầy đủ hồ sơ trên bàn.",
    content: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13 quy định Tòa án tiến hành hòa giải trong giai đoạn chuẩn bị xét xử, trừ những vụ việc không được hòa giải hoặc không tiến hành hòa giải được.",
      "Giá trị thực tế của phiên hòa giải nằm ở chỗ đây là lần đầu tiên hai bên nhìn thấy hồ sơ và lập luận của nhau một cách đầy đủ. Nhiều vụ việc chỉ tới thời điểm này các bên mới đánh giá lại xác suất thắng thua của mình.",
      "Chuẩn bị cho phiên hòa giải nên gồm một phương án thỏa thuận có sẵn với biên độ đàm phán đã được ban lãnh đạo phê duyệt trước. Đến phiên hòa giải mà chưa có thẩm quyền quyết định là bỏ lỡ cơ hội.",
    ],
    basis: ["Bộ luật Tố tụng dân sự số 92/2015/QH13"],
    date: "03/2026",
    author: HUY,
  },
  {
    category: CAT_LITIGATION,
    title: "Công nhận và cho thi hành phán quyết trọng tài nước ngoài tại Việt Nam",
    excerpt:
      "Phán quyết nước ngoài không tự động thi hành được. Thủ tục công nhận là một vụ việc riêng với căn cứ từ chối được quy định sẵn.",
    content: [
      "Việt Nam là thành viên Công ước New York năm 1958 về công nhận và cho thi hành phán quyết trọng tài nước ngoài. Bộ luật Tố tụng dân sự số 92/2015/QH13 quy định thủ tục xét đơn yêu cầu công nhận và cho thi hành tại Việt Nam.",
      "Tòa án không xét lại nội dung tranh chấp mà chỉ xem xét các căn cứ từ chối, tập trung vào hiệu lực của thỏa thuận trọng tài, việc thông báo và cơ hội trình bày của bên phải thi hành, phạm vi phán quyết và trật tự công cộng.",
      "Với bên được thi hành, khâu chuẩn bị hồ sơ có tính quyết định: bản chính hoặc bản sao có chứng thực của phán quyết và thỏa thuận trọng tài, kèm bản dịch được công chứng. Thiếu sót ở khâu hình thức là lý do phổ biến khiến đơn bị trả lại.",
    ],
    basis: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13",
      "Công ước New York năm 1958",
      "Luật Trọng tài thương mại số 54/2010/QH12",
    ],
    date: "03/2026",
    author: PHU,
  },
  {
    category: CAT_LITIGATION,
    title: "Khiếu nại hành chính và khởi kiện vụ án hành chính về đất đai",
    excerpt:
      "Hai con đường song song với thời hạn khác nhau. Chọn nhầm trình tự có thể làm mất luôn cả hai.",
    content: [
      "Với quyết định hành chính về đất đai, người sử dụng đất có thể khiếu nại tới người đã ban hành quyết định hoặc khởi kiện vụ án hành chính tại Tòa án. Luật Đất đai số 31/2024/QH15 dẫn chiếu tới pháp luật về khiếu nại và tố tụng hành chính cho trình tự cụ thể.",
      "Điểm cần lưu ý là thời hiệu của cả hai con đường đều ngắn và được tính từ ngày nhận được hoặc biết được quyết định. Việc gửi đơn kiến nghị tới nhiều cơ quan khác nhau không làm gián đoạn thời hiệu.",
      "Trong nhiều trường hợp, khiếu nại lần đầu có giá trị thu thập thông tin: văn bản trả lời của cơ quan nhà nước làm rõ căn cứ ban hành quyết định, tạo cơ sở cho lập luận nếu sau đó phải khởi kiện. Nhưng phải theo dõi sát thời hạn để không bỏ lỡ cửa tố tụng.",
    ],
    basis: [
      "Luật Đất đai số 31/2024/QH15",
      "Nghị định số 102/2024/NĐ-CP",
    ],
    date: "03/2026",
    author: TRUNG,
  },
  {
    category: CAT_LITIGATION,
    title: "Kháng cáo phúc thẩm: giới hạn của việc bổ sung chứng cứ mới",
    excerpt:
      "Phúc thẩm không phải cơ hội làm lại vụ kiện từ đầu. Chứng cứ đáng lẽ phải nộp ở sơ thẩm khó được chấp nhận muộn.",
    content: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13 quy định thời hạn kháng cáo bản án sơ thẩm và phạm vi xét xử phúc thẩm, giới hạn trong phần bản án bị kháng cáo, kháng nghị.",
      "Đương sự có thể cung cấp chứng cứ bổ sung ở giai đoạn phúc thẩm, nhưng nếu chứng cứ đó đã tồn tại và có thể thu thập được từ giai đoạn sơ thẩm mà không nộp, việc chấp nhận không hiển nhiên. Đây là lý do chiến lược chứng cứ phải hoàn chỉnh ngay từ sơ thẩm.",
      "Đơn kháng cáo hiệu quả tập trung vào những điểm bản án sơ thẩm áp dụng sai pháp luật hoặc đánh giá chứng cứ không phù hợp với tài liệu có trong hồ sơ, thay vì trình bày lại toàn bộ nội dung vụ việc.",
    ],
    basis: ["Bộ luật Tố tụng dân sự số 92/2015/QH13"],
    date: "02/2026",
    author: LONG,
  },
  {
    category: CAT_LITIGATION,
    title: "Giám đốc thẩm và tái thẩm: không phải cấp xét xử thứ ba",
    excerpt:
      "Đơn đề nghị giám đốc thẩm có tỷ lệ được kháng nghị rất thấp, vì căn cứ hoàn toàn khác với kháng cáo phúc thẩm.",
    content: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13 quy định giám đốc thẩm là thủ tục xét lại bản án đã có hiệu lực pháp luật khi có vi phạm nghiêm trọng pháp luật, còn tái thẩm áp dụng khi phát hiện tình tiết mới có thể làm thay đổi cơ bản nội dung bản án.",
      "Điểm khác biệt quan trọng: đây không phải cấp xét xử mà là thủ tục đặc biệt, và việc kháng nghị thuộc thẩm quyền của người có thẩm quyền chứ không phải quyền của đương sự. Đơn đề nghị chỉ là nguồn thông tin.",
      "Do đó, đơn đề nghị có cơ hội được xem xét thường là đơn chỉ ra được vi phạm tố tụng cụ thể hoặc việc áp dụng sai điều luật xác định, kèm dẫn chiếu chính xác tới tài liệu trong hồ sơ, chứ không phải đơn trình bày lại sự việc.",
    ],
    basis: ["Bộ luật Tố tụng dân sự số 92/2015/QH13"],
    date: "02/2026",
    author: HUY,
  },
  {
    category: CAT_LITIGATION,
    title: "Ủy quyền tham gia tố tụng: phạm vi ủy quyền quyết định điều gì làm được",
    excerpt:
      "Giấy ủy quyền viết chung chung khiến người đại diện không ký được biên bản hòa giải, và phiên họp phải hoãn.",
    content: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13 cho phép đương sự ủy quyền cho người khác tham gia tố tụng, trừ một số việc phải tự mình thực hiện. Phạm vi quyền của người đại diện được xác định theo nội dung văn bản ủy quyền.",
      "Trên thực tế, phần lớn sự cố xảy ra ở phiên hòa giải: người đại diện được ủy quyền tham gia tố tụng nhưng không được ủy quyền rõ ràng về việc thỏa thuận, rút yêu cầu hoặc thay đổi yêu cầu khởi kiện, nên không thể chốt được thỏa thuận ngay tại phiên họp.",
      "Khi soạn giấy ủy quyền, nên liệt kê cụ thể các quyền quan trọng thay vì dùng công thức chung. Đồng thời cần kiểm tra thẩm quyền của người ký giấy ủy quyền theo điều lệ công ty, tránh trường hợp giấy ủy quyền bị phản đối về hiệu lực.",
    ],
    basis: [
      "Bộ luật Tố tụng dân sự số 92/2015/QH13",
      "Luật Doanh nghiệp số 59/2020/QH14",
    ],
    date: "02/2026",
    author: PHU,
  },

  /* ============ ĐIỆN MẶT TRỜI · NĂNG LƯỢNG ============ */
  {
    category: CAT_ENERGY,
    title: "DPPA qua lưới quốc gia và qua đường dây riêng: hai cấu trúc rủi ro khác nhau",
    excerpt:
      "Cùng gọi là mua bán điện trực tiếp, nhưng ai chịu rủi ro sản lượng và rủi ro giá lại hoàn toàn khác nhau giữa hai hình thức.",
    content: [
      "Nghị định số 80/2024/NĐ-CP quy định cơ chế mua bán điện trực tiếp giữa đơn vị phát điện năng lượng tái tạo và khách hàng sử dụng điện lớn theo hai hình thức: qua đường dây kết nối riêng và qua lưới điện quốc gia.",
      "Với đường dây kết nối riêng, quan hệ gần với một hợp đồng mua bán điện song phương thuần túy, rủi ro tập trung vào khả năng vận hành của nhà máy và nhu cầu thực tế của khách hàng. Với hình thức qua lưới quốc gia, cấu trúc phức tạp hơn vì có hợp đồng kỳ hạn và cơ chế thanh toán chênh lệch so với giá thị trường điện.",
      "Điểm cần chốt sớm khi đàm phán là ai gánh phần chênh lệch khi sản lượng thực tế lệch khỏi sản lượng cam kết, và ngưỡng lệch nào thì kích hoạt điều chỉnh. Phần lớn tranh chấp DPPA về sau bắt nguồn từ chỗ này chứ không phải từ mức giá.",
      "Ngoài rủi ro sản lượng, cần chốt trước cơ chế xử lý khi một trong hai bên không còn đáp ứng điều kiện tham gia. Khách hàng sử dụng điện lớn thu hẹp sản xuất và tụt xuống dưới ngưỡng, hoặc đơn vị phát điện thay đổi cơ cấu sở hữu, đều là những tình huống có thật và cần có lối ra trong hợp đồng.",
      "Về thời hạn, hợp đồng DPPA thường ngắn hơn hợp đồng mua bán điện truyền thống nhưng vẫn đủ dài để chịu tác động của thay đổi chính sách. Điều khoản về thay đổi pháp luật, cơ chế đàm phán lại và điều kiện chấm dứt sớm nên được viết cụ thể thay vì dẫn chiếu chung tới quy định pháp luật.",
      "Về đàm phán, nên xây bảng phân bổ rủi ro trước khi bàn tới giá. Bảng này liệt kê từng sự kiện có thể xảy ra trong vòng đời hợp đồng, từ giảm phát theo yêu cầu điều độ tới thay đổi chính sách và tới việc một bên chấm dứt sớm, kèm bên chịu hậu quả tương ứng. Khi bảng phân bổ đã rõ, việc chốt giá trở nên đơn giản hơn nhiều.",
    ],
    basis: [
      "Nghị định số 80/2024/NĐ-CP",
      "Luật Điện lực số 61/2024/QH15",
    ],
    date: "08/2026",
    author: TRUNG,
  },
  {
    category: CAT_ENERGY,
    title: "Điện mặt trời mái nhà tự sản tự tiêu: ranh giới của mô hình",
    excerpt:
      "Tự sản tự tiêu được khuyến khích, nhưng khi lượng điện dư đưa lên lưới vượt ngưỡng, bản chất pháp lý của dự án thay đổi.",
    content: [
      "Luật Điện lực số 61/2024/QH15 và Nghị định số 58/2025/NĐ-CP quy định về phát triển điện mặt trời mái nhà tự sản tự tiêu, gồm điều kiện đầu tư, đấu nối và xử lý sản lượng dư phát lên lưới.",
      "Ranh giới quan trọng nằm ở mục đích sử dụng. Hệ thống lắp để phục vụ nhu cầu tại chỗ có thủ tục nhẹ hơn nhiều so với dự án nguồn điện. Khi tỷ trọng điện bán ra vượt quá mức phục vụ nội bộ, dự án có nguy cơ bị xem xét lại về tính chất và về nghĩa vụ giấy phép.",
      "Với doanh nghiệp sản xuất, việc cần làm trước khi đầu tư là tính toán phụ tải thực tế theo giờ chứ không theo tổng sản lượng năm. Nhà máy nghỉ cuối tuần trong khi hệ thống vẫn phát là tình huống dễ đẩy tỷ lệ điện dư lên cao ngoài dự kiến.",
    ],
    basis: [
      "Luật Điện lực số 61/2024/QH15",
      "Nghị định số 58/2025/NĐ-CP",
    ],
    date: "08/2026",
    author: LONG,
  },
  {
    category: CAT_ENERGY,
    title: "Hợp đồng thuê mái nhà lắp điện mặt trời: rủi ro dài hạn của bên cho thuê",
    excerpt:
      "Hợp đồng thuê mái 20 năm gắn với một tài sản có tuổi thọ hữu hạn. Điều khoản sửa chữa mái thường bị bỏ trống.",
    content: [
      "Hợp đồng thuê mái nhà để lắp đặt hệ thống điện mặt trời là hợp đồng thuê tài sản theo Bộ luật Dân sự số 91/2015/QH13, nhưng thời hạn thường kéo dài tương ứng với vòng đời dự án, phổ biến từ 15 đến 20 năm.",
      "Vấn đề thực tiễn lớn nhất là việc sửa chữa, cải tạo mái trong thời hạn thuê. Khi mái cần chống thấm hoặc thay tôn, hệ thống phải tháo dỡ tạm thời, kéo theo chi phí và mất sản lượng. Nếu hợp đồng không phân định trước ai chịu chi phí này, tranh chấp gần như chắc chắn xảy ra.",
      "Nhóm điều khoản cần viết kỹ gồm: trách nhiệm về kết cấu và chống thấm mái, quy trình và chi phí tháo lắp khi sửa chữa, xử lý khi bên cho thuê chuyển nhượng nhà xưởng, và việc hoàn trả hiện trạng khi kết thúc hợp đồng.",
    ],
    basis: [
      "Bộ luật Dân sự số 91/2015/QH13",
      "Nghị định số 58/2025/NĐ-CP",
    ],
    date: "07/2026",
    author: TRUNG,
  },
  {
    category: CAT_ENERGY,
    title: "Mô hình ESCO trong điện mặt trời: bản chất pháp lý không phải là mua bán điện",
    excerpt:
      "Doanh nghiệp không bỏ vốn nhưng cam kết mua điện dài hạn. Cấu trúc này chuyển rủi ro theo cách ít người đọc kỹ.",
    content: [
      "Trong mô hình ESCO, nhà đầu tư bỏ vốn lắp đặt hệ thống trên mái của doanh nghiệp và bán lại sản lượng cho chính doanh nghiệp đó với giá thấp hơn giá lưới, theo một hợp đồng dịch vụ năng lượng dài hạn.",
      "Điểm cần soi kỹ là cam kết sản lượng tối thiểu phải mua. Nhiều hợp đồng buộc doanh nghiệp thanh toán theo sản lượng hệ thống phát ra chứ không theo sản lượng thực dùng. Khi nhà máy giảm công suất hoặc ngừng sản xuất, nghĩa vụ thanh toán vẫn chạy.",
      "Nhóm điều khoản đáng đàm phán gồm: cơ chế xử lý khi phụ tải giảm, quyền mua lại hệ thống trước hạn và công thức tính giá mua lại, cùng hệ quả khi doanh nghiệp phải di dời nhà xưởng.",
    ],
    basis: [
      "Bộ luật Dân sự số 91/2015/QH13",
      "Luật Điện lực số 61/2024/QH15",
      "Nghị định số 58/2025/NĐ-CP",
    ],
    date: "07/2026",
    author: LONG,
  },
  {
    category: CAT_ENERGY,
    title: "Giấy phép hoạt động điện lực: khi nào bắt buộc, khi nào được miễn",
    excerpt:
      "Không phải mọi hoạt động phát điện đều cần giấy phép, nhưng xác định sai nhóm là rủi ro pháp lý kéo dài cả vòng đời dự án.",
    content: [
      "Luật Điện lực số 61/2024/QH15 và Nghị định số 58/2025/NĐ-CP quy định các lĩnh vực hoạt động điện lực phải có giấy phép, cùng các trường hợp được miễn trừ theo quy mô hoặc theo tính chất hoạt động.",
      "Vấn đề thường gặp là dự án khởi động theo diện được miễn, sau đó mở rộng công suất hoặc chuyển sang bán điện cho bên thứ ba mà không rà lại nghĩa vụ giấy phép. Tại thời điểm đó, hoạt động đã vượt phạm vi miễn trừ.",
      "Với dự án dự kiến mở rộng theo giai đoạn, nên xác định ngay từ đầu ngưỡng công suất và mô hình bán điện nào sẽ kích hoạt nghĩa vụ xin giấy phép, và đưa mốc đó vào kế hoạch triển khai thay vì xử lý khi đã vận hành.",
    ],
    basis: [
      "Luật Điện lực số 61/2024/QH15",
      "Nghị định số 58/2025/NĐ-CP",
    ],
    date: "07/2026",
    author: TRUNG,
  },
  {
    category: CAT_ENERGY,
    title: "Ngày vận hành thương mại và tranh chấp giá FIT: hồ sơ quyết định tất cả",
    excerpt:
      "Chênh lệch vài ngày trong việc công nhận ngày vận hành thương mại có thể làm thay đổi giá điện áp dụng suốt 20 năm.",
    content: [
      "Quyết định số 13/2020/QĐ-TTg ngày 06/4/2020 của Thủ tướng Chính phủ quy định cơ chế giá FIT 2 cho điện mặt trời, với thời hạn áp dụng kết thúc ngày 31/12/2020. Hợp đồng mua bán điện theo cơ chế này có thời hạn 20 năm kể từ ngày vận hành thương mại.",
      "Vì mốc thời hạn cứng, việc xác định dự án đã đạt ngày vận hành thương mại trước hay sau ngày 31/12/2020 trở thành vấn đề trung tâm của nhiều tranh chấp. Bên bán điện dựa vào biên bản nghiệm thu và số liệu đo đếm, bên mua điện thường viện dẫn các điều kiện chưa hoàn thành tại thời điểm đó.",
      "Với các dự án còn tranh chấp, chứng cứ có giá trị nhất là hồ sơ kỹ thuật lập tại thời điểm: biên bản nghiệm thu, biên bản thí nghiệm, số liệu công tơ và văn bản trao đổi với đơn vị điện lực. Tài liệu dựng lại sau này có sức thuyết phục thấp hơn nhiều.",
      "Cần phân biệt ba mốc thường bị dùng lẫn lộn: ngày hoàn thành lắp đặt, ngày phát điện lần đầu lên lưới và ngày vận hành thương mại theo định nghĩa trong hợp đồng mua bán điện. Chỉ mốc thứ ba có ý nghĩa với việc áp dụng giá, và định nghĩa của nó nằm trong chính hợp đồng chứ không nằm trong văn bản quy phạm pháp luật.",
      "Với dự án đang tranh chấp, nên rà lại xem hợp đồng đặt điều kiện gì cho việc công nhận ngày vận hành thương mại: nghiệm thu hoàn thành, thí nghiệm đạt yêu cầu, hay chỉ cần phát điện ổn định trong một khoảng thời gian. Nhiều tranh chấp được giải quyết chỉ bằng việc đọc kỹ định nghĩa này thay vì tranh luận về chính sách.",
      "Với dự án chưa phát sinh tranh chấp nhưng có hồ sơ chưa chặt, nên chủ động rà soát và bổ sung tài liệu ngay khi các bên còn hợp tác. Yêu cầu đơn vị điện lực xác nhận số liệu đo đếm lịch sử, hoặc xác nhận lại mốc công nhận vận hành thương mại, là việc dễ làm trong quan hệ bình thường và gần như không thể làm khi tranh chấp đã bắt đầu.",
    ],
    basis: [
      "Quyết định số 13/2020/QĐ-TTg ngày 06/4/2020 (đã hết thời hạn áp dụng)",
      "Luật Điện lực số 28/2004/QH11 (đã hết hiệu lực)",
    ],
    date: "06/2026",
    author: LONG,
  },
  {
    category: CAT_ENERGY,
    title: "Hợp đồng EPC điện mặt trời: nghiệm thu hiệu suất là mắt xích yếu nhất",
    excerpt:
      "Công trình lắp xong không có nghĩa là đạt yêu cầu. Thử nghiệm hiệu suất và điều kiện đo đếm cần định nghĩa từ khi ký.",
    content: [
      "Hợp đồng EPC cho dự án điện mặt trời thường gắn nghiệm thu với kết quả thử nghiệm hiệu suất, đo tỷ lệ giữa sản lượng thực tế và sản lượng lý thuyết trong điều kiện bức xạ nhất định.",
      "Tranh chấp phát sinh khi hợp đồng không định nghĩa rõ điều kiện thử nghiệm: khoảng bức xạ hợp lệ, nhiệt độ tham chiếu, thiết bị đo được chấp nhận và cách xử lý dữ liệu bất thường. Khi thiếu các định nghĩa này, hai bên đưa ra hai kết quả khác nhau từ cùng một hệ thống.",
      "Cùng với đó, cần quy định trước hệ quả khi hiệu suất không đạt: thời hạn khắc phục, mức khấu trừ theo từng bậc chênh lệch và ngưỡng cho phép từ chối nghiệm thu. Để mở phần này là để mở cả tranh chấp.",
      "Cùng với định nghĩa thử nghiệm, cần chốt bên nào cung cấp thiết bị đo và bên nào có quyền chứng kiến. Thử nghiệm do nhà thầu tự thực hiện rồi báo kết quả là cấu trúc bất lợi cho chủ đầu tư, đặc biệt khi phần lớn giá trị thanh toán cuối cùng phụ thuộc vào kết quả đó.",
      "Về tiền, nên gắn một tỷ lệ đáng kể của giá trị hợp đồng với việc nghiệm thu hiệu suất đạt yêu cầu, thay vì chỉ giữ lại khoản bảo hành thông thường. Nếu phần tiền còn lại quá nhỏ, nhà thầu không có động lực kinh tế để khắc phục và chủ đầu tư buộc phải đi đường tranh chấp.",
      "Ngoài hiệu suất tại thời điểm nghiệm thu, nên có một mốc kiểm tra lại sau một chu kỳ vận hành đủ dài, thường là một năm, để loại trừ ảnh hưởng của yếu tố thời tiết ngắn hạn. Kết quả của lần kiểm tra này nên gắn với việc hoàn trả khoản tiền giữ lại cuối cùng, tạo ràng buộc kéo dài qua giai đoạn dễ phát sinh khiếm khuyết nhất.",
    ],
    basis: [
      "Luật Xây dựng số 50/2014/QH13",
      "Nghị định số 06/2021/NĐ-CP",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "06/2026",
    author: TRUNG,
  },
  {
    category: CAT_ENERGY,
    title: "Suy giảm hiệu suất tấm pin và bảo hành thiết bị: hai loại cam kết dễ nhầm",
    excerpt:
      "Bảo hành sản phẩm và bảo hành hiệu suất là hai cam kết riêng biệt, thường do hai chủ thể khác nhau đưa ra.",
    content: [
      "Nhà sản xuất tấm pin thường đưa ra hai cam kết: bảo hành sản phẩm cho lỗi vật liệu và chế tạo, và bảo hành hiệu suất theo đường cong suy giảm công suất trong khoảng 25 năm. Hai cam kết có thời hạn và cơ chế xử lý khác nhau.",
      "Trong khi đó, nhà thầu EPC bảo hành phần công việc của mình theo Nghị định số 06/2021/NĐ-CP với thời hạn ngắn hơn nhiều. Khi hệ thống giảm sản lượng, câu hỏi đầu tiên là nguyên nhân thuộc thiết bị hay thuộc lắp đặt, và câu trả lời quyết định ai chịu trách nhiệm.",
      "Với chủ đầu tư, việc cần làm khi ký hợp đồng EPC là buộc nhà thầu chuyển giao đầy đủ chứng thư bảo hành của nhà sản xuất đứng tên chủ đầu tư, thay vì đứng tên nhà thầu. Nếu nhà thầu giải thể, cam kết đứng tên nhà thầu trở nên vô nghĩa.",
    ],
    basis: [
      "Nghị định số 06/2021/NĐ-CP",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "06/2026",
    author: LONG,
  },
  {
    category: CAT_ENERGY,
    title: "Hợp đồng O&M và cam kết sản lượng: đo bằng gì và trừ những gì",
    excerpt:
      "Cam kết tỷ lệ sẵn sàng vận hành nghe đơn giản, cho tới khi phải xác định giờ nào được loại trừ khỏi phép tính.",
    content: [
      "Hợp đồng vận hành và bảo dưỡng thường gắn phí dịch vụ với cam kết về tỷ lệ sẵn sàng của hệ thống, đôi khi kèm cam kết sản lượng tối thiểu sau khi hiệu chỉnh theo bức xạ thực tế.",
      "Điểm gây tranh chấp là danh mục sự kiện được loại trừ khỏi phép tính: sự cố lưới điện, yêu cầu giảm phát của đơn vị điều độ, thời tiết cực đoan và thời gian bảo dưỡng theo kế hoạch. Danh mục càng rộng, cam kết càng mất ý nghĩa.",
      "Khi đàm phán, nên đi từ dữ liệu vận hành thực tế của khu vực thay vì từ mẫu hợp đồng. Tỷ lệ giảm phát theo yêu cầu điều độ ở một số địa bàn cao tới mức làm thay đổi hoàn toàn hiệu quả tài chính của dự án.",
    ],
    basis: [
      "Bộ luật Dân sự số 91/2015/QH13",
      "Luật Điện lực số 61/2024/QH15",
    ],
    date: "05/2026",
    author: TRUNG,
  },
  {
    category: CAT_ENERGY,
    title: "Thỏa thuận đấu nối: điểm nghẽn thường xuất hiện muộn nhất trong tiến độ dự án",
    excerpt:
      "Thiết bị về kho, công trình lắp xong, nhưng chưa có thỏa thuận đấu nối thì dự án vẫn đứng yên.",
    content: [
      "Trước khi phát điện lên lưới, chủ đầu tư phải có thỏa thuận đấu nối với đơn vị điện lực, xác định điểm đấu nối, cấp điện áp, phương thức đo đếm và các yêu cầu kỹ thuật đối với hệ thống.",
      "Rủi ro tiến độ nằm ở chỗ khả năng tiếp nhận của lưới điện khu vực không do chủ đầu tư kiểm soát. Một dự án hoàn thiện về xây dựng vẫn có thể chờ nhiều tháng nếu đường dây khu vực đã đầy tải hoặc cần cải tạo trạm.",
      "Cách giảm rủi ro là làm việc về khả năng đấu nối trước khi chốt quyết định đầu tư, và gắn mốc có thỏa thuận đấu nối vào điều kiện tiên quyết của hợp đồng EPC, thay vì để nhà thầu bàn giao công trình rồi mới xử lý.",
    ],
    basis: [
      "Luật Điện lực số 61/2024/QH15",
      "Nghị định số 58/2025/NĐ-CP",
    ],
    date: "05/2026",
    author: LONG,
  },
  {
    category: CAT_ENERGY,
    title: "Phòng cháy chữa cháy cho hệ thống điện mặt trời mái nhà",
    excerpt:
      "Hệ thống lắp trên mái nhà xưởng làm thay đổi hồ sơ phòng cháy đã được thẩm duyệt trước đó.",
    content: [
      "Việc lắp đặt hệ thống điện mặt trời trên mái công trình hiện hữu bổ sung nguồn điện một chiều, tải trọng và vật liệu mới lên kết cấu mái, nên có thể làm thay đổi các điều kiện đã được thẩm duyệt về phòng cháy chữa cháy.",
      "Nhiều doanh nghiệp coi đây là hạng mục kỹ thuật thuần túy và bỏ qua bước rà soát hồ sơ phòng cháy. Hệ quả xuất hiện khi có kiểm tra hoặc khi xảy ra sự cố, lúc đó vấn đề không chỉ là xử phạt mà còn là khả năng từ chối bồi thường của công ty bảo hiểm.",
      "Trước khi khởi công, nên rà soát ba việc: hồ sơ thẩm duyệt phòng cháy hiện có của công trình, yêu cầu về ngắt nguồn một chiều khi có sự cố, và điều khoản của hợp đồng bảo hiểm tài sản đang có hiệu lực.",
    ],
    basis: [
      "Luật Xây dựng số 50/2014/QH13",
      "Nghị định số 06/2021/NĐ-CP",
      "Nghị định số 58/2025/NĐ-CP",
    ],
    date: "05/2026",
    author: TRUNG,
  },
  {
    category: CAT_ENERGY,
    title: "Bán điện dư lên lưới: quyền, giới hạn và thủ tục",
    excerpt:
      "Sản lượng dư của hệ thống tự sản tự tiêu không mặc nhiên được mua với giá do chủ đầu tư mong muốn.",
    content: [
      "Nghị định số 58/2025/NĐ-CP hướng dẫn Luật Điện lực số 61/2024/QH15 quy định về xử lý sản lượng dư của hệ thống điện mặt trời mái nhà tự sản tự tiêu phát lên lưới điện quốc gia.",
      "Với chủ đầu tư, hai vấn đề cần làm rõ trước khi lập phương án tài chính là tỷ lệ sản lượng dư được ghi nhận và cơ sở xác định giá. Mô hình tài chính giả định bán được toàn bộ sản lượng dư theo giá bán lẻ thường không phản ánh đúng khung pháp lý.",
      "Về thủ tục, cần thống nhất trước với đơn vị điện lực về phương thức đo đếm hai chiều và cách ghi nhận sản lượng, vì đây là dữ liệu gốc cho mọi tranh luận thanh toán về sau.",
    ],
    basis: [
      "Nghị định số 58/2025/NĐ-CP",
      "Luật Điện lực số 61/2024/QH15",
    ],
    date: "04/2026",
    author: LONG,
  },
  {
    category: CAT_ENERGY,
    title: "Chuyển nhượng dự án điện mặt trời: thẩm định pháp lý nên bắt đầu từ đâu",
    excerpt:
      "Giá trị của một dự án điện mặt trời nằm ở hợp đồng mua bán điện. Mọi rủi ro làm lung lay hợp đồng đó đều là rủi ro giá.",
    content: [
      "Khi mua lại dự án điện mặt trời đang vận hành, tài sản thực chất được mua là dòng tiền từ hợp đồng mua bán điện dài hạn. Vì vậy, thẩm định pháp lý nên bắt đầu từ hợp đồng này chứ không từ hồ sơ đất đai hay xây dựng.",
      "Ba nhóm rủi ro cần soi kỹ: tính vững chắc của cơ sở giá áp dụng, đặc biệt với dự án hưởng cơ chế FIT theo Quyết định số 13/2020/QĐ-TTg; lịch sử tranh chấp về sản lượng và thanh toán với đơn vị mua điện; và các điều kiện chuyển nhượng hoặc thay đổi cổ đông quy định trong chính hợp đồng.",
      "Chỉ sau khi ba nhóm này rõ ràng mới nên tiếp tục sang các lớp thẩm định về đất đai, xây dựng, môi trường và thuế. Thứ tự ngược lại làm tốn chi phí cho những dự án lẽ ra nên loại từ đầu.",
      "Trong định giá, nên xây kịch bản cho từng rủi ro pháp lý đã phát hiện thay vì đưa tất cả vào một khoản giảm giá chung. Rủi ro về cơ sở áp dụng giá tác động tới toàn bộ dòng tiền còn lại của hợp đồng, trong khi rủi ro về thủ tục đất đai thường chỉ tạo ra chi phí một lần. Hai loại này không nên quy về cùng một con số.",
      "Về cấu trúc giao dịch, cơ chế giữ lại một phần giá mua gắn với việc xử lý dứt điểm các vấn đề pháp lý tồn đọng thường hiệu quả hơn so với việc chỉ dựa vào cam kết và bảo đảm của bên bán. Cam kết chỉ có giá trị khi bên bán còn tài sản để thực hiện nghĩa vụ bồi hoàn.",
    ],
    basis: [
      "Quyết định số 13/2020/QĐ-TTg ngày 06/4/2020 (đã hết thời hạn áp dụng)",
      "Luật Điện lực số 61/2024/QH15",
      "Luật Đầu tư số 61/2020/QH14",
    ],
    date: "04/2026",
    author: TRUNG,
  },
  {
    category: CAT_ENERGY,
    title: "Hợp đồng mua bán điện 20 năm: quản trị rủi ro của một cam kết rất dài",
    excerpt:
      "Hợp đồng ký năm 2020 sẽ chạy tới thập niên 2040, qua nhiều lần thay đổi khung pháp lý. Điều khoản thay đổi luật là chỗ dựa duy nhất.",
    content: [
      "Phần lớn hợp đồng mua bán điện của dự án năng lượng tái tạo có thời hạn 20 năm kể từ ngày vận hành thương mại. Những hợp đồng ký trong giai đoạn trước tháng 02/2025 có luật nội dung là Luật Điện lực số 28/2004/QH11, nay đã hết hiệu lực và được thay bằng Luật Điện lực số 61/2024/QH15.",
      "Điều này không làm hợp đồng vô hiệu, nhưng đặt ra câu hỏi về cách xử lý khi quy định mới thay đổi điều kiện vận hành, đo đếm hoặc nghĩa vụ của các bên. Điều khoản về thay đổi pháp luật trở thành công cụ quan trọng nhất trong tình huống này.",
      "Với hợp đồng đang chuẩn bị ký, nên quy định cụ thể cơ chế xử lý khi có thay đổi pháp luật làm phát sinh chi phí đáng kể cho một bên, gồm nghĩa vụ thông báo, thời hạn đàm phán lại và hệ quả nếu đàm phán không thành.",
    ],
    basis: [
      "Luật Điện lực số 61/2024/QH15",
      "Luật Điện lực số 28/2004/QH11 (đã hết hiệu lực)",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "04/2026",
    author: LONG,
  },
  {
    category: CAT_ENERGY,
    title: "Chứng nhận nguồn gốc điện tái tạo cho chuỗi cung ứng xuất khẩu",
    excerpt:
      "Đối tác nhập khẩu yêu cầu chứng minh nguồn gốc điện. Lắp điện mặt trời mái nhà chưa chắc đủ để đáp ứng yêu cầu đó.",
    content: [
      "Doanh nghiệp xuất khẩu ngày càng chịu yêu cầu chứng minh tỷ lệ điện tái tạo trong quá trình sản xuất, xuất phát từ cam kết của khách hàng nước ngoài và từ các cơ chế điều chỉnh liên quan tới phát thải.",
      "Về pháp lý trong nước, cơ chế mua bán điện trực tiếp theo Nghị định số 80/2024/NĐ-CP là công cụ chính để gắn sản lượng điện tái tạo với một khách hàng cụ thể. Hệ thống điện mặt trời mái nhà tự sản tự tiêu đóng góp một phần, nhưng thường không đủ tỷ trọng cho nhà máy có phụ tải lớn.",
      "Khi làm việc với đối tác, điều cần thống nhất sớm là chuẩn chứng minh nào được chấp nhận và ai là bên phát hành. Đầu tư hạ tầng trước rồi mới phát hiện chuẩn chứng minh không phù hợp là tình huống đắt đỏ.",
    ],
    basis: [
      "Nghị định số 80/2024/NĐ-CP",
      "Luật Điện lực số 61/2024/QH15",
    ],
    date: "03/2026",
    author: TRUNG,
  },
  {
    category: CAT_ENERGY,
    title: "Quy hoạch phát triển điện lực và chấp thuận chủ trương đầu tư",
    excerpt:
      "Dự án nguồn điện phải nằm trong quy hoạch trước khi bàn tới chấp thuận chủ trương. Đây là cửa đầu tiên và hẹp nhất.",
    content: [
      "Với dự án nguồn điện có quy mô, việc dự án có nằm trong quy hoạch phát triển điện lực và kế hoạch thực hiện quy hoạch hay không là điều kiện tiên quyết, trước khi xét tới thủ tục chấp thuận chủ trương đầu tư theo Luật Đầu tư số 61/2020/QH14.",
      "Trên thực tế, nhiều nhà đầu tư ký thỏa thuận nguyên tắc, đặt cọc mua đất hoặc ký hợp đồng thuê đất trước khi dự án được đưa vào quy hoạch. Khi quy hoạch không bao gồm dự án, các cam kết đã ký trở thành nghĩa vụ không lối thoát.",
      "Cách kiểm soát là gắn toàn bộ cam kết tài chính vào điều kiện tiên quyết là dự án được đưa vào quy hoạch và kế hoạch thực hiện, với cơ chế hoàn trả rõ ràng nếu điều kiện không đạt trong thời hạn đã định.",
    ],
    basis: [
      "Luật Điện lực số 61/2024/QH15",
      "Luật Đầu tư số 61/2020/QH14",
    ],
    date: "03/2026",
    author: LONG,
  },
  {
    category: CAT_ENERGY,
    title: "Bảo hiểm dự án năng lượng: khoảng trống giữa các đơn bảo hiểm",
    excerpt:
      "Bảo hiểm lắp đặt kết thúc khi bàn giao, bảo hiểm tài sản bắt đầu khi vận hành. Khoảng giữa hai mốc là nơi rủi ro rơi xuống.",
    content: [
      "Dự án năng lượng thường có ít nhất ba đơn bảo hiểm: bảo hiểm mọi rủi ro lắp đặt trong giai đoạn thi công, bảo hiểm tài sản và gián đoạn kinh doanh khi vận hành, và bảo hiểm trách nhiệm với bên thứ ba.",
      "Khoảng trống phát sinh ở giai đoạn chuyển tiếp: công trình đã hoàn thành nhưng chưa nghiệm thu chính thức, hoặc đã phát điện thử nhưng chưa có ngày vận hành thương mại. Nếu định nghĩa thời điểm chuyển giao trong hợp đồng EPC không khớp với định nghĩa trong đơn bảo hiểm, sự cố xảy ra trong khoảng này có nguy cơ không được bồi thường.",
      "Cách xử lý là rà soát đồng thời hợp đồng EPC và các đơn bảo hiểm, đối chiếu định nghĩa về hoàn thành, bàn giao và vận hành thương mại, rồi điều chỉnh cho khớp trước khi công trình bước vào giai đoạn thử nghiệm.",
    ],
    basis: [
      "Bộ luật Dân sự số 91/2015/QH13",
      "Nghị định số 06/2021/NĐ-CP",
    ],
    date: "02/2026",
    author: TRUNG,
  },
  {
    category: CAT_ENERGY,
    title: "Tranh chấp sản lượng với đơn vị mua điện: dữ liệu đo đếm là chứng cứ gốc",
    excerpt:
      "Khi hai bên đưa ra hai con số sản lượng khác nhau, bên nào kiểm soát dữ liệu công tơ có lợi thế rất lớn.",
    content: [
      "Trong hợp đồng mua bán điện, sản lượng thanh toán được xác định theo số liệu công tơ đo đếm tại điểm giao nhận điện, với quy trình ghi chỉ số và chốt số liệu định kỳ.",
      "Tranh chấp thường bắt nguồn từ hai nguồn: sai lệch của thiết bị đo đếm và thời gian ngừng phát do yêu cầu của đơn vị điều độ. Với nhóm thứ hai, câu hỏi pháp lý là sản lượng bị cắt giảm có được bồi hoàn hay không, và câu trả lời nằm ở chính hợp đồng chứ không ở quy định chung.",
      "Chủ đầu tư nên lưu trữ độc lập dữ liệu từ hệ thống giám sát của mình song song với số liệu công tơ, và yêu cầu kiểm định thiết bị đo đếm định kỳ. Khi phát hiện chênh lệch, việc phản đối phải bằng văn bản trong kỳ thanh toán tương ứng, không để dồn nhiều kỳ.",
    ],
    basis: [
      "Luật Điện lực số 61/2024/QH15",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "02/2026",
    author: LONG,
  },
  {
    category: CAT_ENERGY,
    title: "Thay đổi cổ đông trong doanh nghiệp dự án điện: điều khoản ràng buộc dễ bị bỏ qua",
    excerpt:
      "Nhiều hợp đồng mua bán điện hạn chế thay đổi sở hữu của bên bán. Chuyển nhượng vốn không rà điều khoản này là rủi ro trực tiếp.",
    content: [
      "Hợp đồng mua bán điện dài hạn thường có điều khoản yêu cầu bên bán thông báo hoặc xin chấp thuận trước khi có thay đổi đáng kể về cơ cấu sở hữu, nhằm bảo đảm năng lực thực hiện hợp đồng.",
      "Khi giao dịch chuyển nhượng vốn được cấu trúc thuần túy theo Luật Doanh nghiệp số 59/2020/QH14 mà không rà lại hợp đồng mua bán điện, bên mua có thể nhận về một doanh nghiệp đang vi phạm cam kết hợp đồng ngay tại thời điểm hoàn tất giao dịch.",
      "Trong thẩm định pháp lý, nhóm điều khoản về thay đổi kiểm soát nên được rà cùng lúc trên toàn bộ hợp đồng trọng yếu: hợp đồng mua bán điện, hợp đồng tín dụng, hợp đồng thuê đất và hợp đồng O&M.",
    ],
    basis: [
      "Luật Doanh nghiệp số 59/2020/QH14",
      "Luật Điện lực số 61/2024/QH15",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "02/2026",
    author: TRUNG,
  },
  {
    category: CAT_ENERGY,
    title: "Đất cho dự án năng lượng tái tạo: hình thức sử dụng đất quyết định quyền thế chấp",
    excerpt:
      "Thuê đất trả tiền hằng năm và thuê đất trả tiền một lần cho quyền khác nhau, ảnh hưởng trực tiếp tới khả năng vay vốn.",
    content: [
      "Luật Đất đai số 31/2024/QH15 phân biệt các hình thức sử dụng đất và quyền tương ứng của người sử dụng đất, trong đó quyền thế chấp quyền sử dụng đất phụ thuộc vào hình thức và nghĩa vụ tài chính đã thực hiện.",
      "Với dự án năng lượng cần vốn vay lớn, đây không phải chi tiết thủ tục mà là yếu tố quyết định cấu trúc tài trợ. Doanh nghiệp thuê đất trả tiền hằng năm có phạm vi quyền hẹp hơn, và ngân hàng thường phải dựa vào tài sản bảo đảm khác.",
      "Vì vậy, hình thức sử dụng đất nên được chốt cùng lúc với việc thu xếp vốn, không tách rời. Thay đổi hình thức sử dụng đất sau khi dự án đã triển khai là thủ tục kéo dài và không phải lúc nào cũng khả thi.",
    ],
    basis: [
      "Luật Đất đai số 31/2024/QH15",
      "Nghị định số 102/2024/NĐ-CP",
    ],
    date: "01/2026",
    author: LONG,
  },

  /* ============ DOANH NGHIỆP · TUÂN THỦ ============ */
  {
    category: CAT_CORPORATE,
    title: "Điều lệ công ty sau sửa đổi Luật Doanh nghiệp 2025: rà lại những gì",
    excerpt:
      "Điều lệ soạn theo bản 2020 có thể chứa điều khoản không còn phù hợp. Phát hiện lúc họp đại hội đồng cổ đông là quá muộn.",
    content: [
      "Luật Doanh nghiệp số 59/2020/QH14 vẫn là văn bản gốc đang áp dụng, được sửa đổi và bổ sung bởi Luật số 76/2025/QH15. Doanh nghiệp hiện áp dụng theo bản hợp nhất chứ không theo bản 2020 nguyên gốc.",
      "Nội dung sửa đổi chạm tới hồ sơ đăng ký doanh nghiệp và thông tin sở hữu, quy định về phân phối lợi nhuận và điều kiện phát hành trái phiếu, cùng việc bỏ một số thủ tục hành chính liên quan tới chữ ký số và tài khoản đăng ký kinh doanh.",
      "Việc cần làm là đối chiếu điều lệ hiện hành với bản hợp nhất, tập trung vào các điều khoản sao chép nguyên văn quy định luật. Những điều khoản này không tự động cập nhật theo luật, và khi xung đột thì tranh chấp nội bộ có thêm một lớp phức tạp không cần thiết.",
    ],
    basis: [
      "Luật Doanh nghiệp số 59/2020/QH14",
      "Luật số 76/2025/QH15",
    ],
    date: "08/2026",
    author: HUY,
  },
  {
    category: CAT_CORPORATE,
    title: "Ba bậc thuế suất thu nhập doanh nghiệp: doanh nghiệp giáp ngưỡng cần chốt gì",
    excerpt:
      "Thuế suất 15%, 17% hay 20% phụ thuộc vào tổng doanh thu năm. Cách xác định tổng doanh thu vì thế trở thành vấn đề trọng yếu.",
    content: [
      "Luật Thuế thu nhập doanh nghiệp số 67/2025/QH15 có hiệu lực từ ngày 01/10/2025 và áp dụng từ kỳ tính thuế năm 2025. Thuế suất phổ thông là 20%; doanh nghiệp có tổng doanh thu năm không quá 3 tỷ đồng áp dụng 15%; doanh nghiệp có tổng doanh thu năm trên 3 tỷ đồng đến không quá 50 tỷ đồng áp dụng 17%.",
      "Với doanh nghiệp nằm sát ngưỡng, chênh lệch giữa các bậc có thể lớn hơn nhiều so với phần doanh thu vượt. Điều này khiến việc xác định đúng tổng doanh thu năm trở thành nội dung cần thống nhất sớm với đơn vị kiểm toán, không để tới kỳ quyết toán.",
      "Sai lệch ở khâu này kéo theo rủi ro truy thu và tiền chậm nộp cho cả kỳ tính thuế theo Luật Quản lý thuế số 38/2019/QH14. Doanh nghiệp có nhiều nguồn thu hoặc có hoạt động ghi nhận doanh thu theo tiến độ cần đặc biệt lưu ý.",
      "Với nhóm doanh nghiệp có nhiều pháp nhân liên kết, cần thận trọng với ý tưởng tách doanh thu ra nhiều pháp nhân để giữ từng đơn vị dưới ngưỡng. Cấu trúc không có mục đích kinh doanh thực chất là nội dung mà cơ quan thuế có công cụ để xem xét theo Luật Quản lý thuế số 38/2019/QH14.",
      "Việc cần làm sớm hơn là rà lại chính sách ghi nhận doanh thu: thời điểm ghi nhận với hợp đồng dịch vụ dài hạn, cách xử lý các khoản thu hộ chi hộ và cách phân bổ doanh thu của hợp đồng trọn gói nhiều hạng mục. Đây là những chỗ tạo ra chênh lệch lớn nhất so với số liệu doanh nghiệp tự ước tính.",
      "Cuối cùng, cần rà lại các ưu đãi thuế đang hưởng theo giấy chứng nhận đăng ký đầu tư cũ. Luật Thuế thu nhập doanh nghiệp số 67/2025/QH15 điều chỉnh danh mục ngành nghề được ưu đãi, và ưu đãi gắn với ngành nghề thực tế chứ không gắn với nội dung ghi trên giấy phép. Doanh nghiệp tiếp tục kê khai theo mức ưu đãi cũ mà không đối chiếu lại đang tích lũy rủi ro truy thu.",
    ],
    basis: [
      "Luật Thuế thu nhập doanh nghiệp số 67/2025/QH15",
      "Luật Quản lý thuế số 38/2019/QH14",
    ],
    date: "08/2026",
    author: PHU,
  },
  {
    category: CAT_CORPORATE,
    title: "Ngưỡng doanh thu không chịu thuế giá trị gia tăng của hộ kinh doanh tăng lên 200 triệu",
    excerpt:
      "Từ 01/01/2026, ngưỡng tăng gấp đôi. Thay đổi này ảnh hưởng tới cả doanh nghiệp mua hàng từ hộ kinh doanh.",
    content: [
      "Luật Thuế giá trị gia tăng số 48/2024/QH15 có hiệu lực từ ngày 01/07/2025. Trong đó, mức doanh thu hằng năm thuộc đối tượng không chịu thuế của hộ và cá nhân kinh doanh tăng từ 100 triệu lên 200 triệu đồng, áp dụng từ ngày 01/01/2026.",
      "Tác động không dừng ở hộ kinh doanh. Doanh nghiệp thường xuyên mua hàng hóa, dịch vụ từ hộ kinh doanh cần rà lại cách xử lý chứng từ đầu vào và điều kiện ghi nhận chi phí được trừ khi tính thuế thu nhập doanh nghiệp.",
      "Song song, luật cũng thu hẹp danh mục đối tượng không chịu thuế và siết điều kiện khấu trừ thuế giá trị gia tăng đầu vào. Đây là hai nội dung cần rà cùng lúc, vì cùng ảnh hưởng tới dòng tiền thuế của doanh nghiệp.",
    ],
    basis: [
      "Luật Thuế giá trị gia tăng số 48/2024/QH15",
      "Luật Thuế giá trị gia tăng số 13/2008/QH12 (đã hết hiệu lực)",
    ],
    date: "07/2026",
    author: HUY,
  },
  {
    category: CAT_CORPORATE,
    title: "Điều kiện khấu trừ thuế giá trị gia tăng đầu vào đã siết lại",
    excerpt:
      "Có hóa đơn hợp lệ chưa đủ. Chứng từ thanh toán và tính liên quan tới hoạt động sản xuất kinh doanh mới là điều kiện đầy đủ.",
    content: [
      "Luật Thuế giá trị gia tăng số 48/2024/QH15 điều chỉnh điều kiện khấu trừ thuế giá trị gia tăng đầu vào, trong đó có yêu cầu về chứng từ thanh toán không dùng tiền mặt đối với hàng hóa, dịch vụ mua vào.",
      "Sai sót thường gặp không nằm ở việc doanh nghiệp cố tình vi phạm, mà ở quy trình nội bộ: thanh toán bù trừ công nợ không có văn bản, thanh toán qua tài khoản cá nhân của người đại diện, hoặc chuyển khoản không khớp tên bên bán trên hóa đơn.",
      "Rà soát nên đi từ mẫu giao dịch lặp lại nhiều nhất trong năm, vì đây là nơi một lỗi quy trình nhân lên thành số tiền lớn khi bị loại khấu trừ trong đợt thanh tra thuế.",
    ],
    basis: [
      "Luật Thuế giá trị gia tăng số 48/2024/QH15",
      "Luật Quản lý thuế số 38/2019/QH14",
    ],
    date: "07/2026",
    author: PHU,
  },
  {
    category: CAT_CORPORATE,
    title: "Người đại diện theo pháp luật: nhiều người đại diện và bài toán phân quyền",
    excerpt:
      "Công ty có thể có nhiều người đại diện theo pháp luật, nhưng điều lệ phải phân định rõ quyền của từng người.",
    content: [
      "Luật Doanh nghiệp số 59/2020/QH14 cho phép công ty trách nhiệm hữu hạn và công ty cổ phần có một hoặc nhiều người đại diện theo pháp luật, với chức danh, quyền và nghĩa vụ được quy định trong điều lệ.",
      "Vấn đề phát sinh khi điều lệ chỉ ghi tên hai người đại diện mà không phân định phạm vi quyền. Khi đó, mỗi người đều được coi là có đủ thẩm quyền đại diện, và công ty vẫn phải chịu trách nhiệm với giao dịch do một người ký ngay cả khi nội bộ không đồng thuận.",
      "Đây là rủi ro thực tế trong công ty có nhiều nhóm cổ đông. Cách kiểm soát là ghi cụ thể trong điều lệ phạm vi giao dịch mà mỗi người đại diện được ký độc lập, và loại giao dịch nào bắt buộc phải có chữ ký của cả hai.",
    ],
    basis: [
      "Luật Doanh nghiệp số 59/2020/QH14",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "07/2026",
    author: HUY,
  },
  {
    category: CAT_CORPORATE,
    title: "Chuyển nhượng phần vốn góp trong công ty trách nhiệm hữu hạn",
    excerpt:
      "Quyền ưu tiên mua của thành viên còn lại là bước bắt buộc. Bỏ qua bước này khiến giao dịch có thể bị vô hiệu.",
    content: [
      "Luật Doanh nghiệp số 59/2020/QH14 quy định thành viên công ty trách nhiệm hữu hạn hai thành viên trở lên muốn chuyển nhượng phần vốn góp phải chào bán cho các thành viên còn lại theo tỷ lệ tương ứng với phần vốn góp của họ, với cùng điều kiện chào bán.",
      "Chỉ khi các thành viên còn lại không mua hoặc không mua hết trong thời hạn quy định, phần vốn góp mới được chuyển nhượng cho người ngoài với cùng điều kiện. Bỏ qua trình tự này là căn cứ để thành viên bị bỏ qua yêu cầu xử lý giao dịch.",
      "Trong thực tiễn M&A, đây là điểm cần kiểm tra ngay ở giai đoạn đầu, cùng với việc rà điều lệ xem có quy định chặt hơn luật hay không. Nhiều điều lệ bổ sung thêm điều kiện chấp thuận mà bên mua không biết cho tới khi làm thủ tục thay đổi đăng ký doanh nghiệp.",
    ],
    basis: ["Luật Doanh nghiệp số 59/2020/QH14"],
    date: "06/2026",
    author: PHU,
  },
  {
    category: CAT_CORPORATE,
    title: "Tăng và giảm vốn điều lệ: thủ tục dễ, hệ quả không dễ",
    excerpt:
      "Giảm vốn điều lệ đụng tới quyền của chủ nợ. Đây là lý do thủ tục có điều kiện chặt hơn nhiều so với tăng vốn.",
    content: [
      "Luật Doanh nghiệp số 59/2020/QH14 quy định các trường hợp và điều kiện tăng, giảm vốn điều lệ. Với việc giảm vốn, điều kiện cốt lõi là công ty phải bảo đảm thanh toán đủ các khoản nợ và nghĩa vụ tài sản khác sau khi giảm.",
      "Điều kiện này không phải hình thức. Nếu công ty giảm vốn rồi mất khả năng thanh toán, người quản lý có thể phải chịu trách nhiệm, và giao dịch giảm vốn có nguy cơ bị xem xét lại khi có thủ tục phá sản.",
      "Với việc tăng vốn, rủi ro nằm ở khâu khác: vốn đăng ký tăng nhưng không góp đủ trong thời hạn. Khi đó, doanh nghiệp phải điều chỉnh lại vốn điều lệ và có thể bị xử phạt, đồng thời tỷ lệ sở hữu giữa các thành viên bị ảnh hưởng.",
    ],
    basis: ["Luật Doanh nghiệp số 59/2020/QH14"],
    date: "06/2026",
    author: HUY,
  },
  {
    category: CAT_CORPORATE,
    title: "Phát hành trái phiếu doanh nghiệp riêng lẻ sau sửa đổi 2025",
    excerpt:
      "Điều kiện phát hành đã được điều chỉnh. Doanh nghiệp lên phương án huy động vốn cần rà lại trước khi chốt với đơn vị tư vấn.",
    content: [
      "Luật số 76/2025/QH15 sửa đổi, bổ sung một số điều của Luật Doanh nghiệp số 59/2020/QH14, trong đó có nội dung liên quan tới điều kiện phát hành trái phiếu doanh nghiệp và phân phối lợi nhuận.",
      "Với doanh nghiệp có kế hoạch huy động vốn qua kênh trái phiếu, điều cần làm trước tiên là đối chiếu tình hình tài chính hiện tại với bộ điều kiện theo bản hợp nhất, thay vì dựa vào phương án đã xây dựng theo quy định cũ.",
      "Song song, nghị quyết của cơ quan có thẩm quyền trong công ty về việc phát hành phải được ban hành đúng trình tự theo điều lệ. Khiếm khuyết ở khâu nội bộ này là rủi ro thường bị bỏ qua khi mọi chú ý dồn vào điều kiện tài chính.",
    ],
    basis: [
      "Luật Doanh nghiệp số 59/2020/QH14",
      "Luật số 76/2025/QH15",
    ],
    date: "06/2026",
    author: PHU,
  },
  {
    category: CAT_CORPORATE,
    title: "Nghị quyết hội đồng quản trị và đại hội đồng cổ đông: hiệu lực bắt đầu từ trình tự",
    excerpt:
      "Nội dung nghị quyết đúng nhưng trình tự triệu tập sai vẫn có thể dẫn tới việc nghị quyết bị hủy.",
    content: [
      "Luật Doanh nghiệp số 59/2020/QH14 quy định trình tự triệu tập họp, điều kiện tiến hành họp và tỷ lệ biểu quyết thông qua đối với đại hội đồng cổ đông và hội đồng quản trị, cùng với các trường hợp yêu cầu hủy bỏ nghị quyết.",
      "Thực tiễn cho thấy căn cứ hủy được chấp nhận nhiều nhất là vi phạm về trình tự và thủ tục triệu tập, chẳng hạn thời hạn gửi thông báo mời họp, tài liệu kèm theo hoặc cách xác định danh sách cổ đông có quyền dự họp. Đây là những chi tiết kiểm chứng được bằng giấy tờ.",
      "Với công ty có tranh chấp nội bộ tiềm ẩn, việc chuẩn hóa quy trình họp và lưu trữ đầy đủ bằng chứng gửi thông báo là biện pháp phòng ngừa rẻ nhất. Chi phí xử lý một nghị quyết bị hủy lớn hơn nhiều lần.",
    ],
    basis: ["Luật Doanh nghiệp số 59/2020/QH14"],
    date: "05/2026",
    author: HUY,
  },
  {
    category: CAT_CORPORATE,
    title: "Giao dịch với người có liên quan: nghĩa vụ công khai và phê duyệt",
    excerpt:
      "Giao dịch giữa công ty và bên liên quan không bị cấm, nhưng phải qua đúng cấp phê duyệt và phải được công khai.",
    content: [
      "Luật Doanh nghiệp số 59/2020/QH14 quy định về giao dịch giữa công ty với người có liên quan, gồm nghĩa vụ kê khai của người quản lý, thẩm quyền chấp thuận theo giá trị giao dịch và hệ quả khi giao dịch không được chấp thuận đúng thẩm quyền.",
      "Rủi ro không chỉ nằm ở khả năng giao dịch bị vô hiệu. Người quản lý phê duyệt sai thẩm quyền có thể phải chịu trách nhiệm bồi thường thiệt hại cho công ty, và đây là căn cứ thường được cổ đông thiểu số sử dụng khi phát sinh mâu thuẫn.",
      "Biện pháp kiểm soát cơ bản là duy trì danh sách người có liên quan được cập nhật định kỳ và đối chiếu trước mỗi giao dịch có giá trị đáng kể, thay vì rà soát khi đã ký hợp đồng.",
    ],
    basis: ["Luật Doanh nghiệp số 59/2020/QH14"],
    date: "05/2026",
    author: PHU,
  },
  {
    category: CAT_CORPORATE,
    title: "Chia, tách, hợp nhất, sáp nhập: chuyển giao nghĩa vụ đi kèm chuyển giao tài sản",
    excerpt:
      "Tái cấu trúc không xóa được nghĩa vụ với chủ nợ. Phương án chuyển giao phải trả lời được câu hỏi ai gánh khoản nợ nào.",
    content: [
      "Luật Doanh nghiệp số 59/2020/QH14 quy định các hình thức tổ chức lại doanh nghiệp gồm chia, tách, hợp nhất, sáp nhập và chuyển đổi loại hình, kèm nguyên tắc kế thừa quyền và nghĩa vụ.",
      "Điểm quan trọng là quyền của chủ nợ không bị ảnh hưởng bởi thỏa thuận nội bộ giữa các công ty tham gia tổ chức lại. Nếu phương án phân chia nghĩa vụ không rõ ràng, các công ty có thể cùng liên đới chịu trách nhiệm.",
      "Khi lập phương án, cần lập danh mục nghĩa vụ chi tiết kèm chỉ định công ty kế thừa cho từng khoản, đồng thời thông báo cho chủ nợ theo đúng trình tự. Với khoản vay có bảo đảm, phải làm việc trước với ngân hàng vì hợp đồng tín dụng thường có điều khoản về thay đổi cơ cấu.",
    ],
    basis: [
      "Luật Doanh nghiệp số 59/2020/QH14",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "05/2026",
    author: HUY,
  },
  {
    category: CAT_CORPORATE,
    title: "Giải thể doanh nghiệp: điều kiện thanh toán hết nợ là cửa ải thật sự",
    excerpt:
      "Doanh nghiệp muốn dừng hoạt động nhưng còn nợ thuế hoặc nợ bảo hiểm xã hội không giải thể được, phải đi con đường khác.",
    content: [
      "Luật Doanh nghiệp số 59/2020/QH14 quy định doanh nghiệp chỉ được giải thể khi bảo đảm thanh toán hết các khoản nợ và nghĩa vụ tài sản khác, đồng thời không trong quá trình giải quyết tranh chấp tại Tòa án hoặc trọng tài.",
      "Trên thực tế, phần lớn hồ sơ giải thể bị ách lại ở khâu quyết toán thuế và chốt sổ bảo hiểm xã hội. Doanh nghiệp đã ngừng hoạt động thực tế nhiều năm nhưng chưa hoàn tất nghĩa vụ vẫn tiếp tục phát sinh tiền chậm nộp.",
      "Khi doanh nghiệp mất khả năng thanh toán, con đường phù hợp là thủ tục phá sản chứ không phải giải thể. Kéo dài tình trạng lơ lửng làm tăng nghĩa vụ và đẩy rủi ro sang người quản lý doanh nghiệp.",
    ],
    basis: [
      "Luật Doanh nghiệp số 59/2020/QH14",
      "Luật Quản lý thuế số 38/2019/QH14",
    ],
    date: "04/2026",
    author: PHU,
  },
  {
    category: CAT_CORPORATE,
    title: "Nội quy lao động: hiệu lực gắn với việc đăng ký, không gắn với việc ban hành",
    excerpt:
      "Nội quy chưa đăng ký không dùng làm căn cứ xử lý kỷ luật được, và đây là lý do nhiều quyết định sa thải bị tuyên trái luật.",
    content: [
      "Bộ luật Lao động số 45/2019/QH14 yêu cầu người sử dụng lao động sử dụng từ 10 người lao động trở lên phải có nội quy lao động bằng văn bản và phải đăng ký tại cơ quan quản lý nhà nước về lao động.",
      "Hiệu lực của nội quy gắn với thủ tục đăng ký. Doanh nghiệp ban hành nội quy nội bộ, phổ biến cho người lao động nhưng không đăng ký sẽ gặp khó khi cần viện dẫn nội quy làm căn cứ xử lý kỷ luật.",
      "Nội dung cũng quan trọng không kém thủ tục: hành vi vi phạm và hình thức kỷ luật tương ứng phải được quy định cụ thể trong nội quy. Áp dụng hình thức kỷ luật cho hành vi không được liệt kê là căn cứ để người lao động khởi kiện.",
      "Về nội dung, nội quy nên mô tả hành vi vi phạm bằng ngôn ngữ cụ thể, kiểm chứng được. Quy định rằng người lao động không được có thái độ không phù hợp gần như không sử dụng được khi cần xử lý kỷ luật, vì không có cách xác định ranh giới. Ngược lại, quy định về số lần đi muộn trong một tháng thì áp dụng được ngay.",
      "Cùng với nội quy, doanh nghiệp cần quy trình ghi nhận vi phạm chạy hằng ngày: ai lập biên bản, biên bản gồm nội dung gì, và lưu ở đâu. Phần lớn vụ việc thất bại ở tố tụng không phải vì nội quy sai mà vì tới lúc cần thì không có biên bản nào được lập tại thời điểm vi phạm xảy ra.",
    ],
    basis: ["Bộ luật Lao động số 45/2019/QH14"],
    date: "04/2026",
    author: HUY,
  },
  {
    category: CAT_CORPORATE,
    title: "Thử việc và giao kết hợp đồng lao động: những giới hạn dễ vi phạm",
    excerpt:
      "Thời gian thử việc, số lần thử việc và mức lương thử việc đều có giới hạn luật định mà doanh nghiệp hay vượt qua.",
    content: [
      "Bộ luật Lao động số 45/2019/QH14 giới hạn thời gian thử việc theo tính chất và mức độ phức tạp của công việc, quy định chỉ được thử việc một lần đối với một công việc, và đặt mức lương thử việc tối thiểu theo tỷ lệ so với lương của công việc đó.",
      "Vi phạm phổ biến là ký liên tiếp nhiều hợp đồng thử việc cho cùng một vị trí, hoặc kéo dài thời gian thử việc bằng cách ký hợp đồng dịch vụ trước rồi mới ký hợp đồng lao động.",
      "Khi phát sinh tranh chấp, các thỏa thuận này thường bị đánh giá theo bản chất quan hệ chứ không theo tên gọi hợp đồng. Doanh nghiệp có thể phải trả phần chênh lệch tiền lương và đóng bảo hiểm xã hội truy thu cho toàn bộ thời gian.",
    ],
    basis: ["Bộ luật Lao động số 45/2019/QH14"],
    date: "04/2026",
    author: PHU,
  },
  {
    category: CAT_CORPORATE,
    title: "Sa thải người lao động: trình tự chặt hơn nhiều so với căn cứ",
    excerpt:
      "Doanh nghiệp thường có lý do chính đáng nhưng thua kiện vì thiếu một bước trong trình tự xử lý kỷ luật.",
    content: [
      "Bộ luật Lao động số 45/2019/QH14 quy định các trường hợp áp dụng hình thức kỷ luật sa thải cùng trình tự xử lý kỷ luật lao động, gồm việc chứng minh lỗi, sự tham gia của tổ chức đại diện người lao động và quyền tự bào chữa của người lao động.",
      "Phần lớn quyết định sa thải bị tuyên trái pháp luật không phải vì người lao động không vi phạm, mà vì doanh nghiệp bỏ qua một bước thủ tục: không lập biên bản vi phạm, không thông báo hợp lệ cho các thành phần bắt buộc, hoặc xử lý khi đã hết thời hiệu.",
      "Hệ quả của việc sa thải trái pháp luật gồm nhận lại người lao động, trả tiền lương cho những ngày không được làm việc và các khoản bồi thường theo luật. Chi phí này thường vượt xa chi phí thỏa thuận chấm dứt hợp đồng ngay từ đầu.",
      "Trước khi khởi động thủ tục kỷ luật, nên kiểm tra ba mốc thời gian: thời điểm phát hiện hành vi vi phạm, thời hiệu xử lý kỷ luật lao động, và các khoảng thời gian không được xử lý kỷ luật theo quy định, chẳng hạn khi người lao động đang nghỉ ốm hoặc nghỉ thai sản. Bỏ qua bước kiểm tra này khiến toàn bộ quy trình sau đó trở nên vô ích.",
      "Trong nhiều trường hợp, phương án thỏa thuận chấm dứt hợp đồng lao động cho kết quả tốt hơn cho cả hai bên. Chi phí thỏa thuận thường thấp hơn đáng kể so với rủi ro phải nhận lại người lao động và trả lương cho khoảng thời gian tranh chấp kéo dài.",
    ],
    basis: ["Bộ luật Lao động số 45/2019/QH14"],
    date: "03/2026",
    author: HUY,
  },
  {
    category: CAT_CORPORATE,
    title: "Bảo hiểm xã hội bắt buộc: rủi ro từ cách cấu trúc thu nhập",
    excerpt:
      "Chia nhỏ thu nhập thành nhiều khoản phụ cấp để giảm mức đóng là cách làm phổ biến và cũng là rủi ro thường trực.",
    content: [
      "Tiền lương làm căn cứ đóng bảo hiểm xã hội bắt buộc gồm mức lương, phụ cấp lương và các khoản bổ sung khác theo quy định của pháp luật lao động, chứ không chỉ là mức lương ghi trong hợp đồng.",
      "Cách làm phổ biến là giữ lương cơ bản thấp và chuyển phần lớn thu nhập sang các khoản hỗ trợ. Vấn đề là không phải khoản nào cũng được loại trừ khỏi căn cứ đóng, và cơ quan bảo hiểm đánh giá theo bản chất khoản chi.",
      "Khi bị truy thu, doanh nghiệp phải nộp cả phần của người sử dụng lao động và phần của người lao động cho giai đoạn trước, kèm tiền lãi. Với doanh nghiệp đông nhân sự, con số này đủ lớn để ảnh hưởng tới kết quả kinh doanh của năm.",
    ],
    basis: ["Bộ luật Lao động số 45/2019/QH14"],
    date: "03/2026",
    author: PHU,
  },
  {
    category: CAT_CORPORATE,
    title: "Thời hiệu truy thu thuế và ấn định thuế: doanh nghiệp cần lưu hồ sơ bao lâu",
    excerpt:
      "Hồ sơ đã hủy nhưng thời hiệu chưa hết là tình huống bất lợi nhất khi bị thanh tra thuế.",
    content: [
      "Luật Quản lý thuế số 38/2019/QH14 quy định thời hiệu xử phạt vi phạm hành chính về thuế và thời hạn truy thu tiền thuế, cùng các trường hợp cơ quan thuế được ấn định thuế khi người nộp thuế không cung cấp được hồ sơ, tài liệu.",
      "Điểm cần lưu ý là cơ chế ấn định. Khi doanh nghiệp không xuất trình được chứng từ cho một giao dịch, số thuế phải nộp có thể được xác định theo phương pháp ấn định, thường bất lợi hơn so với số liệu thực tế.",
      "Vì vậy, chính sách lưu trữ chứng từ nên đặt theo thời hạn truy thu chứ không theo thời hạn lưu trữ kế toán thông thường, và cần bao gồm cả tài liệu điện tử như hợp đồng ký số, chứng từ thanh toán và trao đổi xác nhận công nợ.",
    ],
    basis: ["Luật Quản lý thuế số 38/2019/QH14"],
    date: "03/2026",
    author: HUY,
  },
  {
    category: CAT_CORPORATE,
    title: "Ngành nghề đầu tư kinh doanh có điều kiện: đăng ký được không đồng nghĩa hoạt động được",
    excerpt:
      "Ghi ngành nghề vào giấy chứng nhận đăng ký doanh nghiệp chỉ là bước đầu. Điều kiện kinh doanh mới là cửa thật.",
    content: [
      "Luật Đầu tư số 61/2020/QH14 quy định danh mục ngành nghề đầu tư kinh doanh có điều kiện, kèm nguyên tắc doanh nghiệp chỉ được kinh doanh khi đáp ứng đủ điều kiện và duy trì điều kiện trong suốt quá trình hoạt động.",
      "Nhầm lẫn phổ biến là coi việc đăng ký ngành nghề trên hệ thống đăng ký doanh nghiệp là đã đủ điều kiện. Thực tế, nhiều ngành nghề còn cần giấy phép con, chứng chỉ hành nghề của nhân sự chủ chốt hoặc điều kiện về cơ sở vật chất.",
      "Với doanh nghiệp mở rộng sang lĩnh vực mới, việc cần làm trước khi ký hợp đồng đầu tiên là xác định ngành nghề đó có điều kiện hay không và điều kiện gồm những gì. Ký hợp đồng trước rồi mới xin phép là rủi ro cho cả hiệu lực hợp đồng.",
    ],
    basis: ["Luật Đầu tư số 61/2020/QH14"],
    date: "02/2026",
    author: PHU,
  },
  {
    category: CAT_CORPORATE,
    title: "Thẩm định pháp lý trước giao dịch M&A: thứ tự công việc quyết định chi phí",
    excerpt:
      "Thẩm định toàn diện ngay từ đầu là cách tốn kém nhất. Nên bắt đầu từ nhóm rủi ro có thể làm đổ giao dịch.",
    content: [
      "Thẩm định pháp lý doanh nghiệp mục tiêu thường trải qua nhiều lớp: tư cách pháp lý và cơ cấu sở hữu, tài sản và quyền sử dụng đất, hợp đồng trọng yếu, lao động, thuế, sở hữu trí tuệ, tranh chấp và tuân thủ.",
      "Cách tổ chức hiệu quả là chia thành hai vòng. Vòng đầu tập trung vào nhóm vấn đề có thể làm đổ giao dịch: tính hợp lệ của quyền sở hữu phần vốn góp, tình trạng pháp lý của tài sản cốt lõi, và các nghĩa vụ tiềm tàng có giá trị lớn. Chỉ khi vòng đầu qua được mới mở rộng sang các lớp còn lại.",
      "Với doanh nghiệp có hoạt động xử lý dữ liệu khách hàng quy mô lớn, cần bổ sung một lớp riêng về tuân thủ Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, vì nghĩa vụ này chuyển sang bên mua cùng với doanh nghiệp.",
      "Kết quả thẩm định nên được chuyển thẳng thành ba nhóm hành động cụ thể chứ không dừng ở một báo cáo mô tả. Nhóm một là các vấn đề bên bán phải xử lý xong trước khi hoàn tất giao dịch. Nhóm hai là các vấn đề được phản ánh vào giá. Nhóm ba là các vấn đề chuyển thành cam kết, bảo đảm và cơ chế bồi hoàn trong hợp đồng.",
      "Với vấn đề thuộc nhóm ba, cần gắn với công cụ bảo đảm thực tế: giữ lại một phần giá mua trong thời hạn nhất định, hoặc ký quỹ tại bên thứ ba. Cam kết không kèm công cụ bảo đảm thường trở nên vô giá trị đúng vào lúc cần dùng tới.",
      "Về thời điểm, nên bắt đầu thẩm định sơ bộ trước khi ký thỏa thuận nguyên tắc chứ không sau. Một số vấn đề như tình trạng pháp lý của tài sản cốt lõi hay tranh chấp đang diễn ra có thể phát hiện được chỉ bằng việc tra cứu thông tin công khai, và phát hiện sớm giúp bên mua tránh chi phí cho một giao dịch lẽ ra không nên theo đuổi.",
    ],
    basis: [
      "Luật Doanh nghiệp số 59/2020/QH14",
      "Luật Đầu tư số 61/2020/QH14",
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
    ],
    date: "02/2026",
    author: HUY,
  },
  {
    category: CAT_CORPORATE,
    title: "Bảo lãnh và thế chấp trong nhóm công ty: khi công ty con bảo lãnh cho công ty mẹ",
    excerpt:
      "Giao dịch bảo lãnh nội bộ nhóm đụng tới quy định về giao dịch với người có liên quan và tới lợi ích của cổ đông thiểu số.",
    content: [
      "Việc công ty con dùng tài sản của mình bảo đảm cho nghĩa vụ của công ty mẹ hoặc công ty cùng nhóm là giao dịch với người có liên quan theo Luật Doanh nghiệp số 59/2020/QH14, và phải qua đúng cấp phê duyệt tương ứng với giá trị.",
      "Vấn đề sâu hơn nằm ở lợi ích. Công ty con gánh rủi ro mà không nhận đối ứng tương xứng có thể bị cổ đông thiểu số hoặc chủ nợ của chính công ty đó phản đối, đặc biệt khi công ty rơi vào khó khăn tài chính sau đó.",
      "Cách xử lý an toàn hơn là ghi nhận rõ đối ứng mà công ty con nhận được, thực hiện đầy đủ trình tự phê duyệt nội bộ, và lưu giữ tài liệu đánh giá khả năng thực hiện nghĩa vụ tại thời điểm quyết định.",
    ],
    basis: [
      "Luật Doanh nghiệp số 59/2020/QH14",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "01/2026",
    author: PHU,
  },

  /* ============ BẢO MẬT DỮ LIỆU · CÔNG NGHỆ ============ */
  {
    category: CAT_DATA,
    title: "Căn cứ pháp lý cho việc xử lý dữ liệu cá nhân: đồng ý không phải căn cứ duy nhất",
    excerpt:
      "Doanh nghiệp dựa toàn bộ vào một bản đồng ý ký một lần đang đứng trên nền yếu nhất trong các phương án.",
    content: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, có hiệu lực từ ngày 01/01/2026, xác lập quyền của chủ thể dữ liệu và nghĩa vụ của bên kiểm soát, bên xử lý dữ liệu cá nhân.",
      "Điểm cần hiểu đúng là mỗi hoạt động xử lý phải có căn cứ riêng, gắn với mục đích cụ thể. Một bản đồng ý chung chung ký khi đăng ký tài khoản không tự động bao phủ mọi mục đích phát sinh sau đó, đặc biệt là các mục đích tiếp thị hoặc phân tích hành vi.",
      "Việc cần làm trước tiên không phải viết lại chính sách quyền riêng tư, mà lập bản đồ luồng dữ liệu: thu thập gì, từ ai, cho mục đích nào, lưu ở đâu, chia sẻ cho bên nào. Không có bản đồ này, mọi tài liệu tuân thủ đều là suy đoán.",
      "Bản đồ luồng dữ liệu nên lập theo quy trình nghiệp vụ chứ không theo phòng ban. Một khách hàng đi qua nhiều bộ phận từ lúc để lại thông tin liên hệ tới lúc kết thúc hợp đồng, và dữ liệu của họ được sao chép sang nhiều hệ thống trên đường đi. Lập theo phòng ban sẽ bỏ sót chính các điểm chuyển giao này.",
      "Sau khi có bản đồ, việc tiếp theo là loại bỏ những hoạt động thu thập không còn phục vụ mục đích nào. Trong hầu hết doanh nghiệp, luôn có những trường dữ liệu được thu thập theo thói quen từ nhiều năm trước mà không ai còn sử dụng. Ngừng thu thập là cách giảm rủi ro rẻ nhất và nhanh nhất.",
      "Về tài liệu, kết quả của giai đoạn này nên là một bảng ghi nhận hoạt động xử lý, mỗi dòng tương ứng một hoạt động kèm mục đích, loại dữ liệu, căn cứ pháp lý, thời hạn lưu trữ và bên nhận dữ liệu. Bảng này là nền cho mọi tài liệu tuân thủ về sau, từ chính sách quyền riêng tư tới hồ sơ đánh giá tác động, và là thứ được hỏi tới đầu tiên khi có kiểm tra.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Nghị định số 13/2023/NĐ-CP",
    ],
    date: "08/2026",
    author: HUY,
  },
  {
    category: CAT_DATA,
    title: "Sự đồng ý của chủ thể dữ liệu: điều kiện để một bản đồng ý có giá trị",
    excerpt:
      "Đồng ý phải cụ thể, tự nguyện và có thể rút lại. Ô tích sẵn hoặc gộp nhiều mục đích vào một dòng đều là điểm yếu.",
    content: [
      "Theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, sự đồng ý của chủ thể dữ liệu chỉ có giá trị khi được đưa ra một cách tự nguyện và chủ thể biết rõ loại dữ liệu, mục đích xử lý, bên được chia sẻ và các quyền của mình.",
      "Ba thiết kế giao diện thường gây rủi ro: ô đồng ý được tích sẵn, gộp nhiều mục đích khác nhau vào một tuyên bố duy nhất, và điều kiện buộc phải đồng ý nhận tiếp thị mới được sử dụng dịch vụ cơ bản.",
      "Đi kèm với quyền đồng ý là quyền rút lại đồng ý. Hệ thống phải xử lý được việc rút lại trên thực tế, gồm cả việc dừng chia sẻ dữ liệu cho các đối tác đã nhận trước đó. Cơ chế rút lại chỉ tồn tại trên chính sách là điểm dễ bị phát hiện nhất khi kiểm tra.",
    ],
    basis: ["Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"],
    date: "08/2026",
    author: PHU,
  },
  {
    category: CAT_DATA,
    title: "Dữ liệu cá nhân nhạy cảm: nhóm dữ liệu đòi hỏi mức bảo vệ cao hơn",
    excerpt:
      "Phân loại sai một trường dữ liệu kéo theo sai toàn bộ quy trình xử lý áp dụng cho trường đó.",
    content: [
      "Nghị định số 13/2023/NĐ-CP đưa ra cách phân loại dữ liệu cá nhân thành dữ liệu cơ bản và dữ liệu nhạy cảm, cách tiếp cận được Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 kế thừa và nâng lên cấp luật.",
      "Sự phân biệt này không mang tính học thuật. Dữ liệu nhạy cảm đòi hỏi yêu cầu chặt hơn về căn cứ xử lý, về thông báo cho chủ thể dữ liệu và về biện pháp bảo vệ kỹ thuật.",
      "Trong doanh nghiệp, các trường dữ liệu hay bị phân loại sai gồm thông tin sức khỏe trong hồ sơ nhân sự, dữ liệu sinh trắc học từ hệ thống chấm công, và thông tin về tình trạng tài chính của khách hàng. Rà soát nên bắt đầu từ chính các hệ thống nội bộ này.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Nghị định số 13/2023/NĐ-CP",
    ],
    date: "07/2026",
    author: HUY,
  },
  {
    category: CAT_DATA,
    title: "Hồ sơ đánh giá tác động xử lý dữ liệu cá nhân: tài liệu sống, không phải thủ tục một lần",
    excerpt:
      "Hồ sơ lập xong rồi cất tủ mất giá trị ngay khi doanh nghiệp thêm một tính năng mới có thu thập dữ liệu.",
    content: [
      "Nghị định số 13/2023/NĐ-CP đặt ra yêu cầu lập hồ sơ đánh giá tác động xử lý dữ liệu cá nhân, và Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 tiếp tục duy trì cơ chế đánh giá tác động ở cấp luật.",
      "Doanh nghiệp đã lập hồ sơ theo nghị định cần rà lại theo chuẩn của luật mới, thay vì giả định hồ sơ cũ vẫn còn phù hợp. Đồng thời, hồ sơ phải được cập nhật khi có thay đổi đáng kể về mục đích xử lý, loại dữ liệu hoặc bên nhận dữ liệu.",
      "Cách duy trì thực tế là gắn việc cập nhật hồ sơ vào quy trình phát triển sản phẩm: mọi tính năng mới có thu thập hoặc chia sẻ dữ liệu đều phải qua một bước rà soát trước khi phát hành, thay vì rà soát định kỳ mỗi năm một lần.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Nghị định số 13/2023/NĐ-CP",
    ],
    date: "07/2026",
    author: PHU,
  },
  {
    category: CAT_DATA,
    title: "Hợp đồng với bên xử lý dữ liệu thuê ngoài: phân định trách nhiệm bằng văn bản",
    excerpt:
      "Thuê ngoài việc xử lý dữ liệu không chuyển được trách nhiệm của bên kiểm soát dữ liệu sang bên nhận thầu.",
    content: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 phân biệt bên kiểm soát dữ liệu và bên xử lý dữ liệu, với nghĩa vụ khác nhau. Doanh nghiệp quyết định mục đích và phương tiện xử lý vẫn là bên kiểm soát, kể cả khi việc xử lý thực tế do đối tác thực hiện.",
      "Vì vậy, hợp đồng với nhà cung cấp dịch vụ điện toán đám mây, đơn vị chăm sóc khách hàng thuê ngoài hay công ty tiếp thị cần có nhóm điều khoản riêng về dữ liệu: phạm vi xử lý được phép, cấm sử dụng cho mục đích riêng, nghĩa vụ bảo mật, nghĩa vụ thông báo sự cố và xử lý dữ liệu khi hợp đồng chấm dứt.",
      "Trên thực tế, phần lớn hợp đồng dịch vụ đang có hiệu lực được ký trước khi luật có hiệu lực và không chứa nhóm điều khoản này. Rà soát nên ưu tiên các đối tác nắm giữ khối lượng dữ liệu lớn nhất.",
      "Một nội dung hay bị bỏ trống là việc bên xử lý thuê lại bên thứ ba. Nhà cung cấp dịch vụ thường sử dụng hạ tầng của một bên khác nữa, và dữ liệu đi xa hơn phạm vi mà doanh nghiệp hình dung. Hợp đồng nên yêu cầu thông báo và chấp thuận trước khi thuê lại, kèm nghĩa vụ ràng buộc bên thứ ba theo cùng điều kiện.",
      "Nội dung thứ hai là xử lý dữ liệu khi hợp đồng chấm dứt. Cần quy định rõ dữ liệu được trả về ở định dạng nào, trong thời hạn bao lâu, và bên xử lý phải xóa bản sao đến mức nào, kể cả bản sao lưu. Thiếu điều khoản này, doanh nghiệp mất quyền kiểm soát dữ liệu của chính mình ngay khi quan hệ hợp tác kết thúc.",
      "Về thứ tự xử lý, nên phân loại nhà cung cấp theo khối lượng và mức nhạy cảm của dữ liệu mà họ tiếp cận, rồi đàm phán lại theo thứ tự đó. Với nhà cung cấp dịch vụ quốc tế áp dụng hợp đồng mẫu không thương lượng được, cần đánh giá riêng xem điều khoản sẵn có của họ đã đáp ứng yêu cầu chưa, và ghi nhận kết quả đánh giá đó thành tài liệu nội bộ.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "07/2026",
    author: HUY,
  },
  {
    category: CAT_DATA,
    title: "Chuyển dữ liệu cá nhân ra nước ngoài: nghĩa vụ đi cùng dữ liệu",
    excerpt:
      "Dùng phần mềm quản trị có máy chủ đặt ở nước ngoài đã là chuyển dữ liệu xuyên biên giới, dù doanh nghiệp không nghĩ vậy.",
    content: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 điều chỉnh việc chuyển dữ liệu cá nhân của công dân Việt Nam ra nước ngoài, kèm nghĩa vụ tương ứng của bên chuyển dữ liệu.",
      "Điểm doanh nghiệp hay bỏ sót là phạm vi của khái niệm chuyển dữ liệu. Việc sử dụng nền tảng quản trị nhân sự, hệ thống quản lý khách hàng hoặc dịch vụ lưu trữ có hạ tầng đặt ở nước ngoài đều thuộc phạm vi này, ngay cả khi doanh nghiệp chỉ mua dịch vụ chứ không chủ động gửi dữ liệu đi.",
      "Rà soát nên bắt đầu bằng danh mục toàn bộ phần mềm và dịch vụ đang dùng, xác định nơi đặt hạ tầng và loại dữ liệu được xử lý trên đó. Nhiều doanh nghiệp phát hiện số lượng luồng chuyển dữ liệu lớn hơn nhiều so với ước tính ban đầu.",
    ],
    basis: ["Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"],
    date: "06/2026",
    author: PHU,
  },
  {
    category: CAT_DATA,
    title: "Sự cố lộ dữ liệu cá nhân: quy trình phải chạy được trong ngày đầu tiên",
    excerpt:
      "Thời gian phản ứng tính bằng giờ, trong khi phần lớn doanh nghiệp mất vài ngày chỉ để xác định ai chịu trách nhiệm.",
    content: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 đặt ra nghĩa vụ của bên kiểm soát dữ liệu khi xảy ra vi phạm quy định về bảo vệ dữ liệu cá nhân, gồm việc thông báo cho cơ quan có thẩm quyền và cho chủ thể dữ liệu trong các trường hợp luật định.",
      "Điều làm khó doanh nghiệp không phải nội dung nghĩa vụ mà là tốc độ. Khi phát hiện dấu hiệu lộ dữ liệu, cần đồng thời làm ba việc: ngăn chặn để hạn chế phạm vi, xác định loại và khối lượng dữ liệu bị ảnh hưởng, và chuẩn bị nội dung thông báo.",
      "Quy trình ứng phó chỉ có giá trị nếu đã được diễn tập. Tối thiểu, doanh nghiệp cần có sẵn danh sách người chịu trách nhiệm kèm phương thức liên hệ ngoài giờ, và mẫu thông báo được rà soát trước, thay vì soạn từ đầu trong lúc khủng hoảng.",
      "Một quyết định cần chuẩn bị trước là ai có thẩm quyền tuyên bố sự cố. Nếu quyền này thuộc về người phải chờ họp mới quyết được, đồng hồ vẫn chạy trong lúc doanh nghiệp còn đang bàn. Nên giao quyền tuyên bố cho một vị trí cụ thể, kèm người thay thế khi vắng mặt.",
      "Cần phân biệt việc ghi nhận nội bộ và việc thông báo ra bên ngoài. Mọi sự cố đều phải được ghi nhận vào sổ theo dõi, kể cả sự cố nhỏ không tới ngưỡng phải thông báo. Sổ này là bằng chứng cho thấy doanh nghiệp có hệ thống kiểm soát vận hành thật, và là tài liệu đầu tiên được yêu cầu khi có kiểm tra.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Nghị định số 85/2016/NĐ-CP",
    ],
    date: "06/2026",
    author: HUY,
  },
  {
    category: CAT_DATA,
    title: "Quyền truy cập và quyền yêu cầu xóa dữ liệu: hệ thống có đáp ứng được không",
    excerpt:
      "Chủ thể dữ liệu yêu cầu xóa toàn bộ dữ liệu của mình. Doanh nghiệp có tìm được hết dữ liệu đó trong các hệ thống không.",
    content: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 ghi nhận các quyền cơ bản của chủ thể dữ liệu, gồm quyền được biết, quyền đồng ý, quyền truy cập, quyền chỉnh sửa và quyền yêu cầu xóa dữ liệu.",
      "Thách thức lớn nhất khi thực hiện các quyền này là kỹ thuật chứ không phải pháp lý. Dữ liệu của một cá nhân thường nằm rải rác ở nhiều hệ thống: cơ sở dữ liệu chính, bản sao lưu, hệ thống phân tích, công cụ tiếp thị và cả bảng tính lưu trên máy nhân viên.",
      "Doanh nghiệp cần xác định trước phạm vi có thể thực hiện được và các trường hợp được phép từ chối hoặc trì hoãn theo quy định, chẳng hạn khi dữ liệu phải được lưu giữ để thực hiện nghĩa vụ pháp lý khác. Trả lời chậm hoặc trả lời sai đều là rủi ro.",
    ],
    basis: ["Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"],
    date: "06/2026",
    author: PHU,
  },
  {
    category: CAT_DATA,
    title: "Cấm mua bán dữ liệu cá nhân: ranh giới với hoạt động chia sẻ dữ liệu hợp pháp",
    excerpt:
      "Luật cấm tuyệt đối việc mua bán dữ liệu cá nhân. Câu hỏi thực tiễn là chia sẻ dữ liệu với đối tác có rơi vào phạm vi cấm không.",
    content: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 cấm hành vi mua bán dữ liệu cá nhân. Đây là một trong những nội dung được nhấn mạnh nhất khi luật được ban hành.",
      "Câu hỏi khó nằm ở các mô hình kinh doanh trung gian: sàn thương mại điện tử chia sẻ thông tin người mua cho người bán, công ty tiếp thị liên kết chuyển thông tin khách hàng tiềm năng, hoặc doanh nghiệp trao đổi danh sách khách hàng với đối tác cùng ngành.",
      "Cách tiếp cận an toàn là đánh giá theo bản chất giao dịch chứ theo cách gọi tên trong hợp đồng. Nếu dữ liệu cá nhân là đối tượng chính của giao dịch và có đối ứng bằng tiền hoặc lợi ích tương đương, rủi ro rất cao dù hợp đồng đặt tên là hợp đồng dịch vụ.",
    ],
    basis: ["Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"],
    date: "05/2026",
    author: HUY,
  },
  {
    category: CAT_DATA,
    title: "Dữ liệu nhân sự: nhóm dữ liệu bị bỏ quên nhiều nhất trong chương trình tuân thủ",
    excerpt:
      "Doanh nghiệp tập trung bảo vệ dữ liệu khách hàng, trong khi hồ sơ nhân sự chứa nhiều dữ liệu nhạy cảm hơn.",
    content: [
      "Hồ sơ nhân sự chứa đầy đủ các nhóm dữ liệu mà Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 điều chỉnh: thông tin định danh, thông tin về sức khỏe, thông tin tài chính và trong nhiều trường hợp là cả dữ liệu sinh trắc học từ hệ thống chấm công.",
      "Đặc thù của quan hệ lao động khiến việc dựa vào sự đồng ý trở nên yếu: người lao động ở vị thế phụ thuộc, nên sự đồng ý khó được coi là hoàn toàn tự nguyện. Doanh nghiệp cần xác định căn cứ xử lý phù hợp cho từng mục đích thay vì gộp tất cả vào một điều khoản trong hợp đồng lao động.",
      "Ba điểm nên rà trước: cơ sở lưu giữ hồ sơ ứng viên không trúng tuyển, việc chia sẻ dữ liệu nhân sự cho công ty mẹ ở nước ngoài, và quyền truy cập của cấp quản lý vào dữ liệu sức khỏe của nhân viên.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Bộ luật Lao động số 45/2019/QH14",
    ],
    date: "05/2026",
    author: PHU,
  },
  {
    category: CAT_DATA,
    title: "Camera giám sát tại nơi làm việc: giữa an ninh và quyền riêng tư",
    excerpt:
      "Lắp camera trong khu vực sản xuất khác hoàn toàn với lắp camera ở khu vực nghỉ ngơi, cả về mục đích lẫn về pháp lý.",
    content: [
      "Hình ảnh của người lao động ghi nhận qua hệ thống camera là dữ liệu cá nhân, chịu sự điều chỉnh của Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15. Việc lắp đặt vì mục đích an ninh không tự động miễn trừ các nghĩa vụ về thông báo và về giới hạn phạm vi.",
      "Ba nguyên tắc thực tiễn nên áp dụng: thông báo rõ ràng bằng biển hiệu tại khu vực có camera, giới hạn khu vực giám sát ở nơi cần thiết cho mục đích an ninh, và đặt thời hạn lưu trữ hình ảnh cụ thể thay vì lưu vô thời hạn.",
      "Việc sử dụng hình ảnh camera làm căn cứ xử lý kỷ luật lao động cần được quy định trước trong nội quy lao động đã đăng ký theo Bộ luật Lao động số 45/2019/QH14. Dùng dữ liệu thu thập cho mục đích an ninh sang mục đích quản lý kỷ luật mà không thông báo trước là điểm dễ bị phản đối.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Bộ luật Lao động số 45/2019/QH14",
    ],
    date: "05/2026",
    author: HUY,
  },
  {
    category: CAT_DATA,
    title: "Tiếp thị trực tiếp qua email và tin nhắn: cơ sở pháp lý và cơ chế từ chối",
    excerpt:
      "Danh sách khách hàng có sẵn không đồng nghĩa với quyền gửi thông tin tiếp thị cho danh sách đó.",
    content: [
      "Việc sử dụng thông tin liên hệ của khách hàng để gửi nội dung tiếp thị là một hoạt động xử lý dữ liệu cá nhân riêng biệt, cần căn cứ pháp lý riêng theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15.",
      "Sai lầm phổ biến là suy diễn từ việc khách hàng đã mua hàng sang quyền gửi tiếp thị cho mọi sản phẩm khác, kể cả sản phẩm của công ty liên kết. Phạm vi mục đích ban đầu quyết định giới hạn này.",
      "Về vận hành, cơ chế từ chối nhận tiếp thị phải hoạt động thật: liên kết hủy đăng ký phải xử lý được trong thời gian ngắn và phải đồng bộ trên mọi kênh. Khách hàng đã hủy đăng ký email nhưng vẫn nhận tin nhắn là dấu hiệu hệ thống chưa liên thông.",
    ],
    basis: ["Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"],
    date: "04/2026",
    author: PHU,
  },
  {
    category: CAT_DATA,
    title: "Cookie và công cụ theo dõi trên website: phần bị bỏ qua khi rà soát tuân thủ",
    excerpt:
      "Website doanh nghiệp thường gắn nhiều công cụ đo lường của bên thứ ba hơn mức bộ phận pháp chế biết tới.",
    content: [
      "Dữ liệu thu thập qua cookie và các công cụ theo dõi hành vi người dùng có thể là dữ liệu cá nhân khi cho phép nhận diện một cá nhân cụ thể, và khi đó thuộc phạm vi điều chỉnh của Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15.",
      "Thực tế phổ biến: website được xây dựng qua nhiều đợt, mỗi đợt bộ phận tiếp thị gắn thêm một công cụ đo lường hoặc mã theo dõi quảng cáo. Sau vài năm, không ai nắm được danh sách đầy đủ các bên thứ ba đang nhận dữ liệu từ website.",
      "Bước đầu tiên của việc rà soát là kiểm kê kỹ thuật toàn bộ mã theo dõi đang chạy, đối chiếu với chính sách quyền riêng tư đang công bố. Chênh lệch giữa hai danh sách này là khoảng cách tuân thủ cần xử lý.",
    ],
    basis: ["Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"],
    date: "04/2026",
    author: HUY,
  },
  {
    category: CAT_DATA,
    title: "Dữ liệu sinh trắc học trong hệ thống chấm công và kiểm soát ra vào",
    excerpt:
      "Vân tay và khuôn mặt không thay đổi được khi bị lộ. Đây là lý do nhóm dữ liệu này đòi hỏi mức bảo vệ cao hơn.",
    content: [
      "Dữ liệu sinh trắc học thuộc nhóm dữ liệu cá nhân cần mức bảo vệ cao theo cách phân loại tại Nghị định số 13/2023/NĐ-CP và Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15.",
      "Đặc điểm khiến nhóm dữ liệu này rủi ro hơn là tính không thể thay thế. Mật khẩu bị lộ có thể đổi, còn vân tay hoặc dữ liệu khuôn mặt thì không. Do đó, việc lựa chọn giải pháp kỹ thuật, chẳng hạn lưu trữ đặc trưng đã mã hóa thay vì ảnh gốc, có ý nghĩa pháp lý chứ không chỉ là vấn đề kỹ thuật.",
      "Trước khi triển khai hệ thống chấm công sinh trắc học, doanh nghiệp nên cân nhắc phương án thay thế ít xâm phạm hơn và ghi nhận lý do lựa chọn. Khi có khiếu nại, khả năng chứng minh đã cân nhắc phương án khác là lập luận quan trọng.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Nghị định số 13/2023/NĐ-CP",
    ],
    date: "04/2026",
    author: PHU,
  },
  {
    category: CAT_DATA,
    title: "Giới hạn mới về xác thực danh tính trên nền tảng số",
    excerpt:
      "Yêu cầu người dùng chụp ảnh giấy tờ tùy thân để xác thực đã bị giới hạn với mạng xã hội.",
    content: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 quy định mạng xã hội không được yêu cầu người dùng cung cấp ảnh hoặc video giấy tờ tùy thân làm yếu tố xác thực tài khoản.",
      "Quy định này phản ánh một thực tế: ảnh giấy tờ tùy thân là gói dữ liệu đậm đặc nhất mà một cá nhân có thể giao đi, và một khi bị lộ thì gần như không có cách khắc phục. Nhiều vụ chiếm đoạt danh tính bắt nguồn từ kho ảnh giấy tờ mà nền tảng thu thập rồi bảo vệ không đủ.",
      "Với doanh nghiệp vận hành nền tảng số, việc cần rà là quy trình xác thực hiện tại có thuộc phạm vi bị giới hạn không, và nếu có thì phương án thay thế nào đáp ứng được nhu cầu chống gian lận mà không thu thập ảnh giấy tờ.",
    ],
    basis: ["Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15"],
    date: "03/2026",
    author: HUY,
  },
  {
    category: CAT_DATA,
    title: "Chấm điểm tín dụng và sử dụng thông tin tín dụng cá nhân",
    excerpt:
      "Tổ chức tín dụng không được dùng thông tin tín dụng cá nhân để chấm điểm nếu chưa có sự đồng ý của chủ thể dữ liệu.",
    content: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 quy định tổ chức tín dụng và ngân hàng không được sử dụng thông tin tín dụng cá nhân để chấm điểm, xếp hạng hoặc đánh giá khả năng trả nợ khi chưa có sự đồng ý của chủ thể dữ liệu.",
      "Quy định này chạm trực tiếp vào mô hình vận hành của các sản phẩm cho vay tự động và của các nền tảng công nghệ tài chính hợp tác với tổ chức tín dụng. Quy trình phê duyệt dựa trên mô hình chấm điểm cần được rà lại từ khâu thu thập sự đồng ý.",
      "Với doanh nghiệp không phải tổ chức tín dụng nhưng có sử dụng dữ liệu để đánh giá khách hàng, chẳng hạn khi xét duyệt bán hàng trả chậm, nguyên tắc chung về mục đích xử lý và về sự đồng ý vẫn áp dụng.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Luật Các tổ chức tín dụng số 32/2024/QH15",
    ],
    date: "03/2026",
    author: PHU,
  },
  {
    category: CAT_DATA,
    title: "Bảo đảm an toàn hệ thống thông tin theo cấp độ: nghĩa vụ chạy song song",
    excerpt:
      "Tuân thủ dữ liệu cá nhân không thay thế nghĩa vụ về an toàn hệ thống thông tin. Nhiều doanh nghiệp chỉ làm một nửa.",
    content: [
      "Nghị định số 85/2016/NĐ-CP quy định việc phân loại và bảo vệ hệ thống thông tin theo năm cấp độ, kèm hồ sơ đề xuất cấp độ và phương án bảo đảm an toàn tương ứng.",
      "Đây là nghĩa vụ độc lập với nghĩa vụ bảo vệ dữ liệu cá nhân theo Luật số 91/2025/QH15, nhưng hai nhóm nghĩa vụ liên hệ chặt chẽ. Khi xảy ra sự cố lộ dữ liệu, việc doanh nghiệp có hồ sơ cấp độ và đã triển khai biện pháp tương ứng hay chưa là nội dung được xem xét.",
      "Rà soát nên làm đồng thời cho cả hai nhóm nghĩa vụ, vì phần lớn công việc kỹ thuật trùng nhau: kiểm kê hệ thống, phân loại dữ liệu, phân quyền truy cập và cơ chế ghi nhật ký. Tách rời hai chương trình làm tăng chi phí mà không tăng mức bảo vệ.",
    ],
    basis: [
      "Nghị định số 85/2016/NĐ-CP",
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
    ],
    date: "02/2026",
    author: HUY,
  },
  {
    category: CAT_DATA,
    title: "Điều khoản sử dụng dịch vụ của nền tảng số: soạn để dùng được, không phải để dài",
    excerpt:
      "Điều khoản dài nhưng không phân định rõ quyền xử lý dữ liệu là loại tài liệu tệ nhất khi có tranh chấp.",
    content: [
      "Điều khoản sử dụng dịch vụ và chính sách quyền riêng tư là hai tài liệu khác nhau với chức năng khác nhau. Tài liệu thứ nhất điều chỉnh quan hệ hợp đồng theo Bộ luật Dân sự số 91/2015/QH13, tài liệu thứ hai thực hiện nghĩa vụ thông báo theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15.",
      "Gộp hai tài liệu làm một gây ra hai hệ quả: nghĩa vụ thông báo về dữ liệu bị chìm trong các điều khoản thương mại, và điều khoản về dữ liệu bị ràng buộc vào cơ chế sửa đổi hợp đồng.",
      "Nguyên tắc nên giữ khi soạn thảo: tách riêng hai tài liệu, viết phần dữ liệu bằng ngôn ngữ mà người dùng phổ thông đọc hiểu được, và ghi rõ cách thức thông báo khi có thay đổi thay vì chỉ nói rằng nền tảng có quyền sửa đổi bất kỳ lúc nào.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Bộ luật Dân sự số 91/2015/QH13",
    ],
    date: "02/2026",
    author: PHU,
  },
  {
    category: CAT_DATA,
    title: "Dữ liệu cá nhân trong giao dịch M&A: nghĩa vụ chuyển giao cùng doanh nghiệp",
    excerpt:
      "Mua lại một doanh nghiệp có tệp khách hàng lớn là mua luôn cả rủi ro tuân thủ dữ liệu tích tụ nhiều năm.",
    content: [
      "Khi doanh nghiệp mục tiêu được mua lại, nghĩa vụ của bên kiểm soát dữ liệu theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 không biến mất mà tiếp tục gắn với pháp nhân đó, kể cả khi chủ sở hữu thay đổi.",
      "Vì vậy, với doanh nghiệp mục tiêu có hoạt động xử lý dữ liệu quy mô lớn, thẩm định pháp lý cần một lớp riêng: căn cứ xử lý cho tệp dữ liệu hiện có, lịch sử sự cố lộ dữ liệu, các luồng chuyển dữ liệu ra nước ngoài và tình trạng hợp đồng với bên xử lý thuê ngoài.",
      "Việc chia sẻ dữ liệu trong chính quá trình thẩm định cũng cần kiểm soát: dữ liệu cá nhân của khách hàng và nhân sự không nên đưa vào phòng dữ liệu ở dạng định danh khi chưa cần thiết cho việc đánh giá.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Luật Doanh nghiệp số 59/2020/QH14",
    ],
    date: "01/2026",
    author: HUY,
  },
  {
    category: CAT_DATA,
    title: "Xây dựng chương trình tuân thủ dữ liệu: thứ tự sáu bước cho năm đầu tiên",
    excerpt:
      "Bắt đầu bằng việc viết chính sách là cách làm ngược. Bản đồ dữ liệu phải có trước, mọi thứ khác đến sau.",
    content: [
      "Với doanh nghiệp bắt đầu từ con số không sau khi Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 có hiệu lực, thứ tự công việc quan trọng không kém nội dung công việc.",
      "Trình tự hợp lý gồm sáu bước. Thứ nhất, lập bản đồ luồng dữ liệu trên toàn bộ hệ thống và quy trình. Thứ hai, xác định căn cứ pháp lý cho từng hoạt động xử lý. Thứ ba, phân loại dữ liệu và xác định nhóm cần bảo vệ ở mức cao. Thứ tư, rà soát và bổ sung điều khoản dữ liệu trong hợp đồng với bên xử lý thuê ngoài. Thứ năm, lập hồ sơ đánh giá tác động. Thứ sáu, xây dựng và diễn tập quy trình ứng phó sự cố.",
      "Chính sách quyền riêng tư công bố ra bên ngoài là sản phẩm cuối, không phải bước đầu. Viết chính sách trước khi biết dữ liệu thực sự chạy thế nào chỉ tạo ra một cam kết mà doanh nghiệp không thực hiện được.",
      "Về nguồn lực, không phải doanh nghiệp nào cũng cần một bộ phận chuyên trách. Điều bắt buộc phải có là một người chịu trách nhiệm rõ ràng, có thẩm quyền yêu cầu các bộ phận cung cấp thông tin và có đường báo cáo trực tiếp tới ban lãnh đạo. Giao việc này cho bộ phận công nghệ thông tin mà không kèm thẩm quyền thường dẫn tới bế tắc ở bước lập bản đồ dữ liệu.",
      "Về thứ tự ưu tiên trong năm đầu, nên tập trung vào các hoạt động xử lý có quy mô lớn nhất và nhóm dữ liệu nhạy cảm nhất, thay vì cố hoàn thiện đồng đều mọi mặt. Một chương trình xử lý tốt 80% khối lượng dữ liệu có giá trị hơn nhiều so với một bộ tài liệu đầy đủ nhưng không phản ánh vận hành thật.",
    ],
    basis: [
      "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15",
      "Nghị định số 13/2023/NĐ-CP",
      "Nghị định số 85/2016/NĐ-CP",
    ],
    date: "01/2026",
    author: PHU,
  },
];

export const ARTICLES: DocItem[] = SEEDS.map((seed, i) => ({
  ...seed,
  id: `a${i + 1}`,
  kind: "article" as const,
  readMinutes: readingMinutes(seed.content),
}));
