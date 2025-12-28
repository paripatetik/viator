// components/mission/MissionHero.js
"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { inter, playfair, garamond } from "@/lib/fonts";

export default function MissionHero({
  headerHeight = 0,
  title = "Майстерня мислення Viator",
  subtitle = "Вічне повернення до філософії",
  icons = ["/imgs/icons/V.png","/imgs/icons/I.png","/imgs/icons/A.png","/imgs/icons/T.png","/imgs/icons/O.png","/imgs/icons/R.png"],
  maxVisible = 2,
  tickMs = 1100,
  fadeMs = 420,
  // allow overriding if your file is png/webp; default assumes .jpg
  bgSrc = "/imgs/banner 4.png",
}) {
  const prefersReducedMotion = useReducedMotion();

  const STAGE_CSS = "clamp(300px, 74vmin, 600px)";
  const IMG_FRAC_SM = 0.78;
  const IMG_FRAC_MD = 0.66;
  const ICON_FRAC = 0.18;
  const GAP_FRAC  = 0.11;
  const EDGE_PAD  = 0.02;

  const ANGLES = useMemo(() => [-90, -30, 30, 90, 150, -150], []);

  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState(0);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const s = Math.round(Math.min(el.clientWidth, el.clientHeight));
    setStageSize(s);
    setReady(s > 0);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const s = Math.round(Math.min(el.clientWidth, el.clientHeight));
      setStageSize(s);
      if (!ready && s > 0) setReady(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ready]);

  const imgFrac = stageSize && stageSize < 420 ? IMG_FRAC_SM : IMG_FRAC_MD;

  const imgW   = stageSize * imgFrac;
  const iconW  = stageSize * ICON_FRAC;
  const gapPx  = stageSize * GAP_FRAC;
  const padPx  = stageSize * EDGE_PAD;

  const maxCenterR = Math.max(0, stageSize / 2 - iconW / 2 - padPx);
  const minCenterR = Math.max(0, imgW / 2 + gapPx);
  const R = stageSize
    ? Math.max(minCenterR, Math.min(maxCenterR, (minCenterR + maxCenterR) / 2))
    : 0;

  const keyCounter = useRef(0);
  const angleIdxRef = useRef(0);
  const [active, setActive] = useState([]);

  useEffect(() => {
    if (prefersReducedMotion || !ready || R <= 0) return;
    const id = setInterval(() => {
      const nextKey = keyCounter.current++;
      const angleIdx = angleIdxRef.current % ANGLES.length;
      const iconIdx  = angleIdx % icons.length;
      angleIdxRef.current = (angleIdxRef.current + 1) % ANGLES.length;

      setActive((prev) => {
        const next = [...prev, { key: nextKey, iconIdx, angleIdx }];
        if (next.length > maxVisible) next.shift();
        return next;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [prefersReducedMotion, ready, R, ANGLES.length, icons.length, maxVisible, tickMs]);

  const toXY = (angleIdx) => {
    const a = (ANGLES[angleIdx] * Math.PI) / 180;
    return { dx: Math.cos(a) * R, dy: Math.sin(a) * R };
  };

  const easeOut = [0.22, 0.61, 0.36, 1];

  return (
    <section
      className={`relative w-full ${inter.className} mb-9`}
      style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
      aria-label="Mission hero"
    >
      {/* Background image layer */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Soft overlay for contrast; tweak opacity as needed */}
        <div className="absolute inset-0 bg-slate-900/40" />
        {/* Optional vertical gradient to lift text area */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/35" />
      </div>

      <div
        className="relative mx-auto flex min-h-[calc(100vh-var(--hh))] w-full flex-col text-white"
        style={{ ["--hh"]: `${headerHeight}px` }}
      >
        {/* Title */}
        <div className="flex items-end justify-center px-6 pt-6 pb-10">
          <h1 className={`${playfair.className} text-center text-4xl font-extrabold tracking-wider uppercase md:text-6xl drop-shadow text-white`}>
            {title}
          </h1>
        </div>

        {/* Stage */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div ref={stageRef} className="relative isolate" style={{ width: STAGE_CSS, height: STAGE_CSS }}>
            {/* Central image (responsive fraction) */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: `calc(${imgFrac} * ${STAGE_CSS})` }}
            >
              <div className="relative w-full">
                <Image
                  src="/imgs/logo_owl.png"
                  alt="Homo Viator"
                  width={560}
                  height={560}
                  priority
                  className="h-auto w-full"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full"
                  style={{
                    boxShadow:
                      "0 0 140px 40px rgba(255,255,255,0.35), 0 0 220px 120px rgba(221,243,226,0.35)",
                  }}
                />
              </div>
            </div>

            {/* Icon ring */}
            {!prefersReducedMotion && ready && R > 0 && (
              <div className="pointer-events-none absolute inset-0">
                <AnimatePresence initial={false}>
                  {active.map(({ key, iconIdx, angleIdx }) => {
                    const { dx, dy } = toXY(angleIdx);
                    return (
                      <div
                        key={key}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      >
                        <motion.div
                          style={{ x: dx, y: dy, willChange: "transform, opacity" }}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: fadeMs / 1000, ease: easeOut }}
                        >
                          <CircleIcon sizePx={stageSize * ICON_FRAC} src={icons[iconIdx]} />
                        </motion.div>
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <div className="flex items-start justify-center px-6 pb-10 md:pb-12">
          <p className={`${garamond.className} text-lg sm:text-xl lg:text-2xl text-center bg-black/70 p-2`}>
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

function CircleIcon({ src, sizePx }) {
  const size = Math.max(28, Math.round(sizePx || 64));
  return (
    <div
      className="overflow-hidden rounded-full shadow-md ring-1 ring-black/5 bg-white/95 backdrop-blur-[0.5px]"
      style={{ width: `${size}px`, height: `${size}px`, filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.15))" }}
    >
      <img src={src} alt="" className="h-full w-full object-cover" draggable="false" />
    </div>
  );
}
