/*
 * Trang "Bản đồ năng lực".
 *
 * Luận điểm của trang: một vụ việc hiếm khi nằm gọn trong một lĩnh vực, và
 * khách hàng thường chỉ nhận ra điều đó khi đã muộn. Bản đồ 3D nói điều đó bằng
 * hình — các lĩnh vực nối với nhau, và mỗi đường nối là một tình huống có thật.
 *
 * Cảnh 3D là lớp tăng cường, không phải lớp mang thông tin. Toàn bộ nội dung
 * đều có mặt dưới dạng chữ ở nửa dưới trang, và danh sách nút bấm bên cạnh bản
 * đồ điều khiển được bằng bàn phím — người không dùng chuột, hoặc máy không chạy
 * được WebGL, vẫn đọc và dùng trang bình thường.
 */
import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PRACTICE_LINKS,
  PRACTICE_NODES,
  pick,
  pickList,
  type PracticeNode,
} from "../content/pages3d";
import { useLocale } from "../i18n";
import { usePageMeta } from "../lib/pageMeta";
import { EASE_LUXE, VIEWPORT, cardIn, fadeUp, fadeUpSmall, stagger } from "../motion";
import { Kicker, SectionHead } from "../components/Chrome";
import { GoldRule, Magnetic } from "../components/Motion";
import { IconArrowRight, IconArrowUpRight, IconCheck } from "../components/Icons";
import PracticeMapScene from "../components/three/PracticeMapScene";

export default function PracticeMapPage() {
  const { isEnglish } = useLocale();
  const [selectedId, setSelectedId] = useState<string>(PRACTICE_NODES[0].id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  usePageMeta({
    title: isEnglish
      ? "Practice Map — LHPT Law Firm"
      : "Bản đồ năng lực — LHPT Law Firm",
    description: isEnglish
      ? "Five practice areas and the real situations that connect them: how one matter crosses from construction into arbitration, from energy into disputes, from operations into data protection."
      : "Năm lĩnh vực hành nghề và những tình huống có thật nối chúng lại: một vụ việc đi từ xây dựng sang trọng tài, từ năng lượng sang tranh chấp, từ vận hành sang bảo vệ dữ liệu.",
    path: "/ban-do-nang-luc",
  });

  /*
   * Rê chuột chỉ xem trước, bấm mới thực sự chọn. Nhờ vậy người dùng lướt qua
   * bản đồ là thấy được từng lĩnh vực, nhưng khi đã chọn một lĩnh vực để đọc kỹ
   * thì nội dung không bị đổi mất chỉ vì con trỏ vô tình đi ngang.
   */
  const displayedId = hoveredId ?? selectedId;
  const displayed = useMemo(
    () => PRACTICE_NODES.find((node) => node.id === displayedId) ?? PRACTICE_NODES[0],
    [displayedId]
  );

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const handleHover = useCallback((id: string | null) => setHoveredId(id), []);

  return (
    <>
      {/* ---------- mở đầu ---------- */}
      <section className="relative z-10 px-5 pt-[128px] pb-14 lg:px-8 lg:pt-[150px]">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={stagger(0.12, 0.1)}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            <motion.div variants={fadeUpSmall}>
              <Kicker>{isEnglish ? "Practice map" : "Bản đồ năng lực"}</Kicker>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display mt-6 text-[clamp(2.2rem,5.2vw,3.9rem)] leading-[1.14] font-semibold tracking-[-0.012em] text-snow"
            >
              {isEnglish ? (
                <>
                  No matter stays in <span className="gilded italic">one lane.</span>
                </>
              ) : (
                <>
                  Không vụ việc nào chịu nằm yên <span className="gilded italic">một chỗ.</span>
                </>
              )}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-2xl text-[15.5px] leading-[1.8] text-fog-400"
            >
              {isEnglish
                ? "A delayed handover becomes an arbitration. A rooftop solar deal becomes a construction dispute on someone else's building. Below is how our five practice areas actually connect — every line is a situation that has come through this firm."
                : "Một lần bàn giao chậm thành vụ trọng tài. Một hợp đồng điện mặt trời áp mái thành tranh chấp xây dựng trên tài sản của người khác. Dưới đây là cách năm lĩnh vực của chúng tôi nối với nhau trên thực tế — mỗi đường nối là một tình huống đã đi qua hãng."}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ---------- bản đồ tương tác ---------- */}
      <section className="relative z-10 h-[100svh] max-h-[54rem] min-h-[38rem] overflow-hidden border-y border-snow/10 bg-ink-950/40">
        <PracticeMapScene
          activeId={displayedId}
          onSelect={handleSelect}
          onHover={handleHover}
        />

        {/*
          Lớp phủ chỉ bắt sự kiện ở đúng những khối con cần bấm; phần còn lại để
          xuyên qua, nếu không thì cả bản đồ 3D bên dưới sẽ không rê hay bấm được.
        */}
        {/*
          pb lớn trên màn hẹp để dải nút không nằm khuất dưới thanh gọi/đặt lịch
          cố định ở chân màn hình.
        */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between gap-4 px-5 pt-5 pb-28 sm:px-6 sm:pt-6 sm:pb-6 lg:px-10 lg:pt-10 lg:pb-10">
          <PracticePanel node={displayed} isEnglish={isEnglish} />

          <div className="pointer-events-auto w-full self-start">
            <p className="label mb-3 text-[9px] text-fog-500">
              {isEnglish ? "Choose a practice area" : "Chọn một lĩnh vực"}
            </p>
            {/*
              Màn hẹp cuộn ngang một hàng thay vì xuống dòng thành năm hàng: xuống
              dòng thì dải nút ăn gần nửa màn hình và chòm sao chẳng còn chỗ nào.
              Phần lề âm cho hàng nút chạy sát mép, đúng kiểu dải cuộn ngang.
            */}
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
              {PRACTICE_NODES.map((node) => {
                const active = node.id === displayedId;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedId(node.id)}
                    onPointerEnter={() => setHoveredId(node.id)}
                    onPointerLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(node.id)}
                    onBlur={() => setHoveredId(null)}
                    aria-pressed={active}
                    className={`label shrink-0 border px-3 py-2 text-[9.5px] whitespace-nowrap transition-colors duration-300 ${
                      active
                        ? node.accent === "jade"
                          ? "border-jade-500 bg-jade-500/15 text-jade-300"
                          : "border-brass-500 bg-brass-500/15 text-brass-300"
                        : "border-snow/15 bg-ink-950/70 text-fog-400 hover:border-brass-500/50 hover:text-brass-300"
                    }`}
                  >
                    <span className="code mr-2 opacity-70">{node.num}</span>
                    {pick(node.title, isEnglish)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- các đường nối, dạng chữ ---------- */}
      <section className="relative z-10 px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHead
            kicker={isEnglish ? "Where practices meet" : "Nơi các lĩnh vực gặp nhau"}
            title={
              isEnglish ? (
                <>
                  Seven crossings we see
                  <br />
                  <span className="gilded italic">again and again.</span>
                </>
              ) : (
                <>
                  Bảy điểm giao
                  <br />
                  <span className="gilded italic">chúng tôi gặp đi gặp lại.</span>
                </>
              )
            }
            sub={
              isEnglish
                ? "Each one starts as a question in a single practice area and ends up needing two."
                : "Mỗi tình huống bắt đầu bằng một câu hỏi thuộc một lĩnh vực, rồi kết thúc bằng việc cần tới hai."
            }
          />

          <motion.ul
            variants={stagger(0.07, 0.15)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mt-12 grid gap-px border border-snow/10 bg-snow/10 sm:grid-cols-2"
          >
            {PRACTICE_LINKS.map((link) => {
              const from = PRACTICE_NODES.find((n) => n.id === link.from);
              const to = PRACTICE_NODES.find((n) => n.id === link.to);
              if (!from || !to) return null;
              return (
                <motion.li
                  key={`${link.from}-${link.to}`}
                  variants={fadeUpSmall}
                  className="group bg-ink-950 p-6 transition-colors duration-500 hover:bg-ink-900 sm:p-8"
                >
                  <p className="label flex flex-wrap items-center gap-2 text-[9px] text-fog-500">
                    <span className="text-brass-400">{from.num}</span>
                    {pick(from.title, isEnglish)}
                    <span className="text-brass-500">→</span>
                    <span className="text-brass-400">{to.num}</span>
                    {pick(to.title, isEnglish)}
                  </p>
                  <p className="mt-4 text-[15px] leading-[1.75] text-fog-300 transition-colors duration-500 group-hover:text-snow">
                    {pick(link.note, isEnglish)}
                  </p>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      </section>

      {/* ---------- năm lĩnh vực, dạng chữ đầy đủ ---------- */}
      <section className="relative z-10 border-t border-snow/10 bg-ink-900/45 px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHead
            kicker={isEnglish ? "The five areas" : "Năm lĩnh vực"}
            title={
              isEnglish ? (
                <>
                  Five pillars.<br />
                  <span className="gilded italic">One standard.</span>
                </>
              ) : (
                <>
                  Năm trụ cột.<br />
                  <span className="gilded italic">Một chuẩn mực.</span>
                </>
              )
            }
          />
          <motion.div
            variants={stagger(0.09, 0.15)}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mt-12 grid gap-6 lg:grid-cols-2"
          >
            {PRACTICE_NODES.map((node) => (
              <motion.article
                key={node.id}
                variants={cardIn}
                id={node.id}
                className={`scroll-mt-28 border bg-ink-850/80 p-7 transition-[border-color,box-shadow] duration-500 sm:p-8 ${
                  node.accent === "jade"
                    ? "border-jade-500/30 hover:border-jade-400/70 hover:shadow-[0_25px_70px_-30px_rgba(34,196,156,0.4)]"
                    : "border-snow/10 hover:border-brass-500/60 hover:shadow-[0_25px_70px_-30px_rgba(201,164,76,0.35)]"
                }`}
              >
                <div className="flex items-baseline gap-4">
                  <span className="code text-[11px] text-brass-500">{node.num}</span>
                  <h3 className="font-display text-[1.2rem] leading-[1.25] font-semibold text-snow sm:text-[1.35rem]">
                    {pick(node.title, isEnglish)}
                  </h3>
                </div>
                <p className="mt-3 text-[13.5px] leading-[1.7] text-fog-400">
                  {pick(node.tagline, isEnglish)}
                </p>
                <GoldRule className="mt-6 w-12" />
                <ul className="mt-6 space-y-3">
                  {pickList(node.items, isEnglish).map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[14px] leading-[1.6] text-fog-300"
                    >
                      <IconCheck
                        className={`mt-1 h-4 w-4 shrink-0 ${
                          node.accent === "jade" ? "text-jade-500" : "text-brass-400"
                        }`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="mt-14 flex flex-wrap items-center gap-4"
          >
            <Magnetic strength={8}>
              <Link
                to="/#lien-he"
                className="sheen group inline-flex items-center gap-2.5 bg-brass-500 px-6 py-3.5 text-[14px] font-semibold text-ink-950 transition-all duration-300 hover:bg-brass-400 hover:shadow-[0_14px_44px_-10px_rgba(201,164,76,0.6)]"
              >
                {isEnglish ? "Talk to a lawyer" : "Trao đổi với luật sư"}
                <IconArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Magnetic>
            <Magnetic strength={6}>
              <Link
                to="/nen-mong-phap-ly"
                className="group inline-flex items-center gap-2.5 border border-snow/20 px-6 py-3.5 text-[14px] font-medium text-snow transition-all duration-300 hover:border-jade-500 hover:text-jade-300"
              >
                {isEnglish ? "See legal foundations" : "Xem nền móng pháp lý"}
                <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </motion.div>
        </div>
      </section>
    </>
  );
}

/*
 * Bảng chi tiết nổi trên bản đồ. Đổi nội dung theo lĩnh vực đang chọn, và đổi
 * bằng cách trượt nhẹ chứ không nhảy phắt sang — mắt cần một tín hiệu rằng đây
 * vẫn là cùng một bảng, chỉ khác nội dung.
 */
function PracticePanel({ node, isEnglish }: { node: PracticeNode; isEnglish: boolean }) {
  const related = PRACTICE_LINKS.filter((l) => l.from === node.id || l.to === node.id);

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_LUXE }}
      className="pointer-events-auto w-full max-w-md border border-snow/12 bg-ink-950/85 p-4 backdrop-blur-md sm:p-6"
    >
      <div className="flex items-baseline gap-3">
        <span className="code text-[11px] text-brass-500">{node.num}</span>
        <h2 className="font-display text-[1.15rem] leading-[1.3] font-semibold text-snow">
          {pick(node.title, isEnglish)}
        </h2>
      </div>
      <p className="mt-3 text-[13px] leading-[1.7] text-fog-400">
        {pick(node.tagline, isEnglish)}
      </p>

      {related.length > 0 && (
        <div className="mt-5 hidden border-t border-snow/10 pt-4 sm:block">
          <p className="label text-[9px] text-brass-400">
            {isEnglish ? "Pulls in" : "Thường kéo theo"}
          </p>
          <ul className="mt-3 space-y-2.5">
            {related.slice(0, 3).map((link) => (
              <li
                key={`${link.from}-${link.to}`}
                className="flex gap-2.5 text-[12.5px] leading-[1.6] text-fog-300"
              >
                <span className="text-brass-500">◆</span>
                {pick(link.note, isEnglish)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
