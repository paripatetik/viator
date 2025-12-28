// components/mission page/MobileSwiper.js
"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { garamond } from "@/lib/fonts";

const BRAND = "#94B4C1";

/** Fixed mobile swiper: shows exactly ONE slide.
 *  - Vertical scroll pages between slides.
 *  - Viewport uses w-full (not w-screen) so it fits inside .container.
 *  - Pass stickyTop (CSS value), and get current index via onIndexChange.
 */
export default function MobileSwiper({ slides, stickyTop, onIndexChange }) {
  const wrapRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end start"],
  });

  // current slide index
  const idxRef = useRef(0);

  useEffect(() => {
    const n = Math.max(slides.length, 1);
    const unsub = scrollYProgress.on("change", (p) => {
      const i = Math.round(Math.min(Math.max(p, 0), 1) * (n - 1));
      if (i !== idxRef.current) {
        idxRef.current = i;
        onIndexChange?.(i, n > 1 ? i / (n - 1) : 1);
      }
    });
    return () => unsub();
  }, [slides.length, onIndexChange, scrollYProgress]);

  const i = idxRef.current;
  const dir = i > 0 ? 1 : 1; // animate in from right on first appearance

  return (
    <section ref={wrapRef} className="relative">
      {/* Sticky viewport – fits container width */}
      <div className="sticky overflow-hidden w-full" style={{ top: stickyTop }}>
        <div className="w-full">
          <AnimatePresence initial={false} mode="popLayout" custom={dir}>
            <motion.div
              key={i}
              custom={dir}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="w-full"
            >
              <div
                className="mx-auto w-[92%] max-w-[680px] rounded-2xl px-5 py-7 text-center shadow-sm"
                style={{ background: BRAND, color: "#0f172a", minHeight: "36vh" }}
              >
                <p className={`${garamond.className} text-[18px] leading-relaxed`}>
                  {slides[i]}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll driver – one full viewport per slide */}
      {slides.map((_, k) => (
        <div key={k} style={{ height: "100vh" }} />
      ))}
    </section>
  );
}
