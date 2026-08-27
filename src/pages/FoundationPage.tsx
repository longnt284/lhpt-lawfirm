/*
 * Trang "Nền móng pháp lý".
 *
 * Trang kể một câu chuyện tuyến tính: vòng đời pháp lý của một dự án xây dựng,
 * từ hồ sơ đất đai tới lúc tranh chấp được xử lý xong. Khối hồ sơ 3D ở lớp nền
 * ghép lại đúng theo nhịp người đọc cuộn — mỗi giai đoạn là một đợt mảnh bay về
 * đúng ô của nó — nên hình và chữ luôn nói cùng một điều tại mọi thời điểm.
 *
 * Phần chữ là nội dung thật trong DOM chứ không vẽ vào canvas: công cụ tìm kiếm
 * đọc được, trình đọc màn hình đọc được, và trang vẫn dùng được nguyên vẹn nếu
 * máy người dùng không chạy nổi WebGL.
 */
import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FOUNDATION_STAGES, pick, pickList } from "../content/pages3d";
import { useLocale } from "../i18n";
import { usePageMeta } from "../lib/pageMeta";
import { EASE_LUXE, VIEWPORT, fadeUp, fadeUpSmall, stagger } from "../motion";
import { Kicker } from "../components/Chrome";
import { GoldRule, Magnetic } from "../components/Motion";
import { IconArrowRight, IconArrowUpRight, IconCheck } from "../components/Icons";
import FoundationScene from "../components/three/FoundationScene";

export default function FoundationPage() {
  const { isEnglish } = useLocale();
  const scrollRef = useRef<HTMLElement | null>(null);
  /*
   * Tầng đang dựng do chính cảnh 3D báo về, vì cảnh mới là nơi giữ tiến trình
   * cuộn thật. Để mỗi khối chữ tự dò bằng bộ quan sát khung nhìn riêng thì có hai
   * nguồn số chạy song song, và chúng lệch nhau ngay khi người dùng nhảy cóc
   * trong trang thay vì cuộn đều.
   */
  const [activeStage, setActiveStage] = useState(0);
  const handleLayerChange = useCallback((index: number) => setActiveStage(index), []);

  usePageMeta({
    title: isEnglish
      ? "Legal Foundations — LHPT Law Firm"
      : "Nền móng pháp lý — LHPT Law Firm",
    description: isEnglish
      ? "The legal life cycle of a construction and real estate project, from land file to dispute resolution, assembled one layer at a time."
      : "Vòng đời pháp lý của một dự án xây dựng và bất động sản, từ hồ sơ đất đai tới xử lý tranh chấp, ghép lại từng lớp một.",
    path: "/nen-mong-phap-ly",
  });

  return (
    <>
      {/* ---------- mở đầu ---------- */}
      <section className="relative z-10 px-5 pt-[128px] pb-16 lg:px-8 lg:pt-[150px]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={stagger(0.12, 0.1)}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            <motion.div variants={fadeUpSmall}>
              <Kicker>{isEnglish ? "Project life cycle" : "Vòng đời dự án"}</Kicker>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display mt-6 text-[clamp(2.2rem,5.2vw,3.9rem)] leading-[1.14] font-semibold tracking-[-0.012em] text-snow"
            >
              {isEnglish ? (
                <>
                  A building stands on its <span className="gilded italic">foundation.</span>
                </>
              ) : (
                <>
                  Công trình đứng được là nhờ <span className="gilded italic">nền móng.</span>
                </>
              )}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-2xl text-[15.5px] leading-[1.8] text-fog-400"
            >
              {isEnglish
                ? "So does a project's legal position. Below is the same file we build for every construction and real estate client — five layers of it, and the block stays open until the last piece lands. Scroll, and watch the pieces find their place."
                : "Vị thế pháp lý của một dự án cũng vậy. Dưới đây là đúng bộ hồ sơ mà chúng tôi dựng cho mọi khách hàng xây dựng và bất động sản — năm lớp, thiếu một lớp thì cả khối vẫn còn hở. Cuộn xuống để xem từng mảnh về đúng chỗ."}
            </motion.p>
            <motion.p
              variants={fadeUpSmall}
              className="label mt-9 flex items-center gap-3 text-[10px] text-fog-500"
            >
              <GoldRule className="w-8 shrink-0" />
              {isEnglish ? "Scroll to assemble" : "Cuộn để ghép khối"}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ---------- câu chuyện cuộn ---------- */}
      <section ref={scrollRef} className="relative z-10">
        {/*
          Lớp dính giữ cảnh 3D đứng yên giữa khung nhìn trong suốt lúc người đọc
          đi qua năm khối chữ bên dưới.
        */}
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <FoundationScene scrollRef={scrollRef} onLayerChange={handleLayerChange} />
          {/*
            Lớp phủ giữ độ tương phản cho chữ. Màn hẹp: chữ đậu xuống đáy nên phủ
            đậm ở đáy và để trống phần trên cho công trình. Từ lg trở lên: chữ dồn
            về trái nên chỉ phủ nửa trái, nửa phải để nhìn rõ công trình.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/72 to-ink-950/10 lg:bg-gradient-to-r lg:from-ink-950 lg:via-ink-950/60 lg:to-transparent"
          />
          <StageIndicator active={activeStage} isEnglish={isEnglish} />
        </div>

        {/*
          Màn hẹp: thẻ chữ đậu xuống đáy mỗi khối để nhường phần trên khung cho
          công trình, và chừa chỗ cho thanh gọi/đặt lịch cố định ở chân màn hình.
          Từ lg trở lên thì chữ và hình đứng cạnh nhau nên thẻ về lại giữa khung.
        */}
        <div className="relative -mt-[100svh]">
          {FOUNDATION_STAGES.map((stage, index) => (
            <motion.article
              key={stage.id}
              className="flex min-h-[100svh] items-end px-5 pt-20 pb-20 lg:items-center lg:px-8 lg:py-24"
            >
              <div className="mx-auto w-full max-w-7xl">
                <motion.div
                  variants={stagger(0.08)}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  className="max-w-xl border border-snow/10 bg-ink-950/62 p-5 backdrop-blur-md sm:p-7 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
                >
                  <motion.div
                    variants={fadeUpSmall}
                    className="flex items-baseline gap-4"
                  >
                    <span className="code text-[11px] text-brass-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="label text-[10px] text-brass-400">
                      {pick(stage.layer, isEnglish)}
                    </span>
                  </motion.div>

                  <motion.h2
                    variants={fadeUp}
                    className="font-display mt-3 text-[clamp(1.35rem,3.2vw,2.35rem)] leading-[1.22] font-semibold text-snow"
                  >
                    {pick(stage.title, isEnglish)}
                  </motion.h2>

                  <motion.p
                    variants={fadeUp}
                    className="mt-3 text-[13.5px] leading-[1.7] text-fog-300 sm:mt-4 sm:text-[15px] sm:leading-[1.8]"
                  >
                    {pick(stage.lead, isEnglish)}
                  </motion.p>

                  <motion.ul variants={fadeUpSmall} className="mt-4 space-y-1.5 sm:mt-7 sm:space-y-2.5">
                    {pickList(stage.items, isEnglish).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[13px] leading-[1.55] text-fog-400 sm:text-[13.5px] sm:leading-[1.6]"
                      >
                        <IconCheck className="mt-1 h-4 w-4 shrink-0 text-jade-500" />
                        {item}
                      </li>
                    ))}
                  </motion.ul>

                  {/*
                    Dòng rủi ro là phần khách hàng nhớ lâu nhất, nên nó được tách
                    hẳn ra sau một vạch đứng thay vì trộn vào danh sách đầu việc.
                  */}
                  <motion.p
                    variants={fadeUpSmall}
                    className="mt-4 border-l-2 border-brass-500 pl-4 text-[12.5px] leading-[1.6] text-brass-300 sm:mt-7 sm:text-[13.5px] sm:leading-[1.7]"
                  >
                    {pick(stage.risk, isEnglish)}
                  </motion.p>

                  <motion.p
                    variants={fadeUpSmall}
                    className="label mt-4 text-[8.5px] leading-[1.8] text-fog-500 sm:mt-6 sm:text-[9.5px]"
                  >
                    {pick(stage.basis, isEnglish)}
                  </motion.p>
                </motion.div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ---------- kết ---------- */}
      <section className="relative z-10 border-t border-snow/10 bg-ink-900/55 px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="grid gap-12 lg:grid-cols-12 lg:items-end"
          >
            <div className="lg:col-span-7">
              <motion.div variants={fadeUpSmall}>
                <Kicker>{isEnglish ? "Where you are now" : "Dự án của bạn đang ở đâu"}</Kicker>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="font-display mt-5 max-w-xl text-[clamp(1.7rem,3.5vw,2.7rem)] leading-[1.18] font-semibold text-snow"
              >
                {isEnglish ? (
                  <>
                    Most clients reach us at the fourth layer.
                    <br />
                    <span className="gilded italic">The good ones call at the first.</span>
                  </>
                ) : (
                  <>
                    Phần lớn khách hàng tìm tới ở lớp thứ tư.
                    <br />
                    <span className="gilded italic">Người khôn ngoan gọi từ lớp đầu tiên.</span>
                  </>
                )}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-xl text-[15px] leading-[1.8] text-fog-400"
              >
                {isEnglish
                  ? "Wherever your project stands today, the first conversation is about the same thing: which layers are already in place, and which ones are still missing pieces."
                  : "Dự án đang ở lớp nào cũng được. Buổi trao đổi đầu tiên luôn xoay quanh đúng một câu hỏi: lớp nào đã kín, và lớp nào còn thiếu mảnh."}
              </motion.p>
            </div>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
              <Magnetic strength={8}>
                <Link
                  to="/#lien-he"
                  className="sheen group inline-flex items-center gap-2.5 bg-brass-500 px-6 py-3.5 text-[14px] font-semibold text-ink-950 transition-all duration-300 hover:bg-brass-400 hover:shadow-[0_14px_44px_-10px_rgba(201,164,76,0.6)]"
                >
                  {isEnglish ? "Book a consultation" : "Đặt lịch tư vấn"}
                  <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnetic>
              <Magnetic strength={6}>
                <Link
                  to="/ban-do-nang-luc"
                  className="group inline-flex items-center gap-2.5 border border-snow/20 px-6 py-3.5 text-[14px] font-medium text-snow transition-all duration-300 hover:border-jade-500 hover:text-jade-300"
                >
                  {isEnglish ? "See the practice map" : "Xem bản đồ năng lực"}
                  <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/*
 * Thước đo tiến độ ở mép phải: cho người đọc biết đang ở lớp mấy trên năm, và
 * còn bao nhiêu nữa. Không có nó, một khối cuộn dài năm màn hình dễ khiến người
 * đọc mất phương hướng.
 */
function StageIndicator({ active, isEnglish }: { active: number; isEnglish: boolean }) {
  return (
    <div className="pointer-events-none absolute right-5 bottom-8 z-10 hidden sm:block lg:right-10 lg:bottom-12">
      <p className="label mb-3 text-right text-[9px] text-fog-500">
        {isEnglish ? "Layer" : "Lớp"} {String(active + 1).padStart(2, "0")} / 05
      </p>
      <div className="flex flex-col items-end gap-2">
        {FOUNDATION_STAGES.map((stage, index) => (
          <div key={stage.id} className="flex items-center gap-3">
            <span
              className={`label text-[9px] transition-colors duration-500 ${
                index === active ? "text-brass-300" : "text-transparent"
              }`}
            >
              {pick(stage.layer, isEnglish)}
            </span>
            <motion.span
              animate={{
                width: index === active ? 34 : 14,
                opacity: index <= active ? 1 : 0.28,
              }}
              transition={{ duration: 0.55, ease: EASE_LUXE }}
              className={`block h-px ${index <= active ? "bg-brass-400" : "bg-fog-500"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
