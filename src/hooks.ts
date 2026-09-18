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

/**
 * Mục nào trong danh sách `ids` đang là khối người dùng đọc tới.
 *
 * Trang chủ cao hơn mười ba nghìn điểm ảnh và có bảy khối mang neo riêng, nhưng
 * thanh điều hướng trước đây chỉ sáng lên khi rê chuột. Ai cuộn tới giữa trang
 * cũng không có cách nào biết mình đang ở đâu trong tài liệu, và cũng không thấy
 * được còn những gì phía dưới.
 *
 * Dùng IntersectionObserver chứ không đo `getBoundingClientRect` theo từng nhịp
 * cuộn: phép đo kích thước giữa lúc cuộn buộc trình duyệt tính lại bố cục đồng
 * bộ, đúng nguyên nhân kinh điển làm cuộn bị giật — chính điều mà `threeStage`
 * đã tránh cho các cảnh 3D. Trình duyệt tự theo dõi giao cắt ngoài luồng chính,
 * nên đổi bố cục giữa chừng cũng không cần đo lại bằng tay.
 *
 * `rootMargin` co khung quan sát thành một vạch ngang mảnh ở giữa màn hình:
 * khối nào cắt qua vạch đó là khối đang đọc. Nếu để nguyên cả khung nhìn thì ba
 * bốn khối cùng giao cắt một lúc và mục sáng sẽ nhảy loạn.
 */
export function useActiveSection(ids: readonly string[], enabled = true): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -55% 0px", threshold: 0 }
    );

    /*
     * Năm trong bảy khối nằm trong phần nội dung nạp muộn, nên lúc hook này chạy
     * lần đầu chúng chưa có trong cây DOM. Thử lại theo từng khung hình cho tới
     * khi đủ mặt, y như cách ScrollManager trong App.tsx xử lý neo trỏ vào một
     * chunk chưa về. Mốc thời gian chặn trên để không có vòng lặp nào sống mãi
     * trên một trang không bao giờ có đủ các khối đó.
     */
    const attached = new Set<string>();
    let frame = 0;
    const deadline = performance.now() + 5000;

    const attach = () => {
      for (const id of ids) {
        if (attached.has(id)) continue;
        const el = document.getElementById(id);
        if (!el) continue;
        observer.observe(el);
        attached.add(id);
      }
      if (attached.size < ids.length && performance.now() < deadline) {
        frame = requestAnimationFrame(attach);
      }
    };
    attach();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [ids, enabled]);

  return active;
}
