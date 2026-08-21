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

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return { progress, scrolled };
}

/**
 * Gán toạ độ con trỏ vào biến CSS --mx/--my của thẻ để lớp .spotlight vẽ vệt sáng.
 * Trả về no-op khi người dùng chọn giảm chuyển động.
 */
export function useSpotlight<T extends HTMLElement>() {
  const reduced = usePrefersReducedMotion();
  return useCallback(
    (e: PointerEvent<T>) => {
      if (reduced) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    },
    [reduced]
  );
}
