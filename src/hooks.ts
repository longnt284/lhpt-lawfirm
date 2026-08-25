import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function useCountUp(target: number, start: boolean, duration = 1600, decimals = 0) {
  const reduced = usePrefersReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setVal(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(parseFloat((target * e).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration, decimals, reduced]);
  return val;
}

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789§#¶";

export function useScrambleCycle(words: string[], interval = 3200) {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(words[0] ?? "");

  useEffect(() => {
    const t = window.setInterval(() => setIdx((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(t);
  }, [words.length, interval]);

  useEffect(() => {
    const target = words[idx] ?? "";
    if (reduced) {
      setText(target);
      return;
    }
    let frame = 0;
    let raf = 0;
    const totalFrames = Math.max(18, target.length * 2 + 8);
    const step = () => {
      frame++;
      if (frame % 2 === 0) {
        const progress = frame / totalFrames;
        const locked = Math.floor(progress * target.length);
        let out = "";
        for (let i = 0; i < target.length; i++) {
          const c = target[i];
          if (i < locked || c === " ") out += c;
          else out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        setText(out);
      }
      if (frame < totalFrames) {
        raf = requestAnimationFrame(step);
      } else {
        setText(target);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [idx, words, reduced]);

  return text;
}

/**
 * Hoãn giá trị lại một nhịp ngắn. Ô tìm kiếm bài viết và văn bản lọc trên toàn
 * bộ kho nội dung rồi chạy layout animation cho từng thẻ; nếu lọc ngay theo mỗi
 * phím gõ thì việc đó lặp lại 5-6 lần mỗi giây và ô nhập bị khựng.
 */
export function useDebounced<T>(value: T, delay = 180): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/**
 * Gán toạ độ con trỏ vào biến CSS --mx/--my của thẻ để lớp .spotlight vẽ vệt sáng.
 * Trả về no-op khi người dùng chọn giảm chuyển động.
 */
export function useSpotlight<T extends HTMLElement>() {
  const reduced = usePrefersReducedMotion();
  const frame = useRef<number | null>(null);
  const latest = useRef<{ el: T; x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return useCallback(
    (e: PointerEvent<T>) => {
      if (reduced) return;
      latest.current = { el: e.currentTarget, x: e.clientX, y: e.clientY };
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const current = latest.current;
        if (!current) return;
        const r = current.el.getBoundingClientRect();
        current.el.style.setProperty("--mx", `${current.x - r.left}px`);
        current.el.style.setProperty("--my", `${current.y - r.top}px`);
      });
    },
    [reduced]
  );
}
