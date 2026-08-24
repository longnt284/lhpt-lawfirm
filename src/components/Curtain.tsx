/*
 * Màn mở đầu. Chỉ chạy một lần khi tải trang, dài chưa tới một giây, và tự bỏ
 * qua hoàn toàn nếu người dùng bật "giảm chuyển động" — mở màn là điểm nhấn
 * sang trọng, không phải rào cản đứng giữa khách hàng và nội dung.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE_LUXE } from "../motion";
import { LogoMark } from "./Icons";

export function Curtain() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) {
      setDone(true);
      return;
    }
    const t = window.setTimeout(() => setDone(true), 880);
    return () => window.clearTimeout(t);
  }, [reduced]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="curtain"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-ink-950"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.65, ease: EASE_LUXE } }}
          aria-hidden="true"
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14, transition: { duration: 0.45, ease: EASE_LUXE } }}
            transition={{ duration: 0.6, ease: EASE_LUXE }}
          >
            <LogoMark className="h-11 w-11 text-brass-400" />
            <span className="font-display mt-4 text-[15px] font-bold tracking-[0.3em] text-snow">
              LHPT
            </span>
            <motion.span
              className="mt-4 block h-px w-24 origin-left bg-gradient-to-r from-transparent via-brass-400 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, ease: EASE_LUXE }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
