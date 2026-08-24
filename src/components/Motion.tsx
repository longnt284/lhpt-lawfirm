/*
 * Các khối chuyển động dùng lại: reveal khi cuộn, chữ hiện theo từ, thẻ nghiêng
 * theo con trỏ, nút hút chuột và vạch kẻ vàng. Tất cả đều tự tắt khi người dùng
 * bật "giảm chuyển động" nhờ MotionConfig ở App, nên không cần kiểm tra lại.
 */
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { useCallback, type ReactNode } from "react";
import {
  cardIn,
  EASE_LUXE,
  fadeUp,
  ruleDraw,
  SOFT,
  stagger,
  toWords,
  VIEWPORT,
} from "../motion";

/* ---------- reveal khi cuộn tới ---------- */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variants = fadeUp,
  as,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  /** Độ trễ tính bằng mili-giây, giữ nguyên đơn vị của bản CSS cũ. */
  delay?: number;
  variants?: Variants;
  as?: "div" | "li" | "article";
} & Omit<HTMLMotionProps<"div">, "variants" | "children">) {
  const Tag = as === "li" ? motion.li : as === "article" ? motion.article : motion.div;
  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      transition={{ delay: delay / 1000 }}
      {...(rest as object)}
    >
      {children}
    </Tag>
  );
}

/** Khối cha điều phối nhịp cho các <RevealItem> bên trong. */
export function RevealGroup({
  children,
  className = "",
  gap = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className = "",
  variants = cardIn,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/* ---------- chữ hiện theo từng từ ---------- */
/*
 * Chỉ cắt ở khoảng trắng nên mọi tổ hợp dấu tiếng Việt vẫn nằm nguyên trong một
 * từ. Mỗi từ là inline-block để trượt được theo trục Y mà không phá dòng.
 */
export function WordReveal({
  text,
  className = "",
  wordClassName = "",
  delay = 0,
  gap = 0.055,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  gap?: number;
}) {
  const reduced = useReducedMotion();
  const words = toWords(text);
  if (reduced) return <span className={className}>{text}</span>;
  return (
    <motion.span
      className={className}
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      aria-label={text}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          aria-hidden="true"
          className={`inline-block ${wordClassName}`}
          variants={{
            hidden: { opacity: 0, y: "0.42em", filter: "blur(7px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.75, ease: EASE_LUXE },
            },
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ---------- vạch kẻ mảnh kéo từ trái ---------- */
export function GoldRule({ className = "" }: { className?: string }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px origin-left bg-gradient-to-r from-brass-500 via-brass-500/50 to-transparent ${className}`}
      variants={ruleDraw}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    />
  );
}

/* ---------- thẻ nghiêng theo con trỏ ---------- */
/*
 * Độ nghiêng cố ý giữ dưới 6 độ: đủ để thấy chiều sâu, không tới mức làm chữ
 * biến dạng. Kết hợp với lớp .spotlight sẵn có để vệt sáng đi cùng góc nghiêng.
 */
export function TiltCard({
  children,
  className = "",
  max = 5.5,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const reduced = useReducedMotion();
  const rx = useSpring(useMotionValue(0), SOFT);
  const ry = useSpring(useMotionValue(0), SOFT);
  const gx = useSpring(useMotionValue(50), SOFT);
  const gy = useSpring(useMotionValue(50), SOFT);
  const glareBg = useMotionTemplate`radial-gradient(28rem circle at ${gx}% ${gy}%, rgba(236,215,160,0.13), transparent 62%)`;

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduced) return;
      const r = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry.set((px - 0.5) * max * 2);
      rx.set((0.5 - py) * max * 2);
      gx.set(px * 100);
      gy.set(py * 100);
    },
    [reduced, max, rx, ry, gx, gy]
  );

  const onLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
  }, [rx, ry, gx, gy]);

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        rotateX: reduced ? 0 : rx,
        rotateY: reduced ? 0 : ry,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className}`}
    >
      {children}
      {glare && !reduced && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 mix-blend-screen"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}

/* ---------- nút hút theo con trỏ ---------- */
/*
 * Biên độ 6px: nút vẫn nằm đúng chỗ người dùng nhắm tới nhưng có phản hồi tinh
 * tế khi rê chuột — chi tiết nhỏ tạo cảm giác giao diện "đắt tiền".
 */
export function Magnetic({
  children,
  className = "",
  strength = 6,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), SOFT);
  const y = useSpring(useMotionValue(0), SOFT);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      if (reduced) return;
      const r = e.currentTarget.getBoundingClientRect();
      x.set(((e.clientX - r.left) / r.width - 0.5) * strength * 2);
      y.set(((e.clientY - r.top) / r.height - 0.5) * strength * 2);
    },
    [reduced, strength, x, y]
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.span
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: reduced ? 0 : x, y: reduced ? 0 : y }}
      /*
       * Lớp bọc mặc định là inline-flex, nhưng khi nơi gọi tự khai báo lớp
       * display (ví dụ "hidden sm:inline-flex") thì phải nhường hẳn, nếu không
       * hai utility cùng thuộc tính display sẽ tranh nhau và nút ẩn không ẩn.
       */
      className={className || "inline-flex"}
    >
      {children}
    </motion.span>
  );
}
