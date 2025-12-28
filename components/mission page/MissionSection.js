// components/mission page/MissionSection.js
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { inter, playfair, garamond } from "@/lib/fonts";

/* ------------------- SHARED SEQUENTIAL LOADING ------------------- */
// single lottie-web import for the whole page
let _lottieModPromise = null;
function loadLottieMod() {
  if (!_lottieModPromise) {
    _lottieModPromise = import("lottie-web").then((m) => m.default || m);
  }
  return _lottieModPromise;
}

// JSON cache by src to avoid refetch
const jsonCache = new Map();

// Simple FIFO queue so JSON fetch/parse happens one at a time
const q = [];
let running = false;

function enqueueJsonLoad(src) {
  return new Promise((resolve, reject) => {
    q.push({ src, resolve, reject });
    if (!running) runQueue();
  });
}

async function runQueue() {
  running = true;
  while (q.length) {
    const task = q.shift();
    try {
      // cache first
      if (!jsonCache.has(task.src)) {
        const json = await fetch(task.src, { cache: "force-cache" }).then((r) => r.json());
        jsonCache.set(task.src, json);
      }
      task.resolve(jsonCache.get(task.src));
    } catch (err) {
      task.reject(err);
    }
  }
  running = false;
}
/* ----------------------------------------------------------------- */

/** Lottie loop that:
 *  - preloads JSON via the global queue (sequential)
 *  - uses canvas + progressiveLoad
 *  - only starts initializing when `shouldLoad` is true
 */
function LottieLoop({
  src,
  play,
  speed = 0.35,
  shouldLoad = false,            // gate: when to start queueing/initializing
  className = "",
}) {
  const rootRef = useRef(null);
  const animRef = useRef(null);
  const roRef = useRef(null);
  const wantPlayRef = useRef(play);
  const wantSpeedRef = useRef(speed);

  useEffect(() => {
    wantPlayRef.current = play;
    const a = animRef.current;
    if (a) (play ? a.play() : a.pause());
  }, [play]);

  useEffect(() => {
    wantSpeedRef.current = speed;
    const a = animRef.current;
    if (a?.setSpeed) a.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    if (!shouldLoad) return;
    let killed = false;
    let ro;

    (async () => {
      // 1) sequentially fetch JSON
      const json = await enqueueJsonLoad(src);
      if (killed) return;

      // 2) shared lottie module
      const Lottie = await loadLottieMod();
      if (killed) return;

      // 3) create animation
      const anim = Lottie.loadAnimation({
        container: rootRef.current,
        renderer: "canvas",
        loop: true,
        autoplay: false,
        animationData: json,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: true,
          clearCanvas: true,
        },
      });
      animRef.current = anim;

      const apply = () => {
        anim.setSpeed?.(wantSpeedRef.current ?? 0.35);
        wantPlayRef.current ? anim.play() : anim.pause();
      };
      anim.addEventListener("DOMLoaded", apply);
      anim.addEventListener("data_ready", apply);

      if (rootRef.current && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => anim?.resize && anim.resize());
        ro.observe(rootRef.current);
        roRef.current = ro;
      }
    })();

    return () => {
      killed = true;
      try { roRef.current?.disconnect(); } catch {}
      roRef.current = null;
      try {
        const a = animRef.current;
        a?.removeEventListener?.("DOMLoaded");
        a?.removeEventListener?.("data_ready");
        a?.destroy?.();
      } catch {}
      animRef.current = null;
    };
  }, [shouldLoad, src]);

  return <div ref={rootRef} className={`w-full h-full ${className}`} />;
}

export default function MissionSection({
  id,
  title,
  paras = [],
  lottieSrc = "/animations/traveller_anim 1.json",
  flip = false,
  lottieSpeed = 0.35,
}) {
  const sectionRef = useRef(null);
  const animPaneRef = useRef(null);

  // Smooth text reveal (keep your stagger)
  const [revealed, setRevealed] = useState(false);

  // Animation gating:
  //  - shouldLoadAnim: when to start queueing/fetching JSON (early)
  //  - onScreen: when to actually play/pause the loop
  const [shouldLoadAnim, setShouldLoadAnim] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  // Text reveal when ~40% visible (smooth fade-in)
  useEffect(() => {
    if (!sectionRef.current || revealed) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!revealed && e.isIntersecting && e.intersectionRatio >= 0.4) {
          setRevealed(true);
        }
      },
      { threshold: [0, 0.25, 0.4, 0.6, 0.8, 1], rootMargin: "6% 0px -6% 0px" }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, [revealed]);

  // Start JSON queue early (way before the pane is on screen)
  useEffect(() => {
    if (!animPaneRef.current || shouldLoadAnim) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShouldLoadAnim(true);
          io.disconnect();
        }
      },
      { rootMargin: "200% 0px 200% 0px", threshold: 0 }
    );
    io.observe(animPaneRef.current);
    return () => io.disconnect();
  }, [shouldLoadAnim]);

  // Play/pause when pane touches viewport
  useEffect(() => {
    if (!animPaneRef.current) return;
    const io = new IntersectionObserver(
      ([e]) => setOnScreen(e.isIntersecting),
      { threshold: 0 }
    );
    io.observe(animPaneRef.current);
    return () => io.disconnect();
  }, []);

  const playAnim = onScreen;

  // Motion (unchanged feel)
  const list = { hidden: {}, shown: { transition: { staggerChildren: 0.16, delayChildren: 0.12 } } };
  const item = {
    hidden: { opacity: 0, y: 16 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] } },
  };

  return (
     <section
  id={id}
  ref={sectionRef}
  className={`pt-8 lg:pt-10 pb-4 lg:pb-5 ${inter.className}`}
>
  <div className="container mx-auto px-6">
    <div className="max-w-5xl mx-auto">
      {title && (
        <h2
          className={`${garamond.className} text-3xl md:text-4xl font-extrabold text-center uppercase tracking-wider text-[#416472] mb-6`}
        >
          {title}
        </h2>
      )}

      <div
        className={`
          flex flex-col lg:flex-row
          lg:items-start lg:justify-between
          
          ${flip ? "lg:flex-row-reverse" : ""}
        `}
      >
        {/* Анімація */}
        <div
          ref={animPaneRef}
          className="w-full lg:basis-[42%] flex justify-center"
        >
          <div
            className="w-full max-w-[380px] lg:max-w-[420px] mx-auto"
            style={{ aspectRatio: "4 / 3" }}
          >
            <LottieLoop
              src={lottieSrc}
              play={playAnim}
              speed={lottieSpeed}
              shouldLoad={shouldLoadAnim}
            />
          </div>
        </div>

        {/* Текст */}
        <div className="w-full lg:basis-[58%]">
          <motion.div
            variants={list}
            initial="hidden"
            animate={revealed ? "shown" : "hidden"}
            className={`${playfair.className} space-y-4 lg:space-y-5 text-lg lg:text-xl leading-relaxed`}
          >
            {paras.map((p, i) => (
              <motion.p
                key={i}
                variants={item}
                className={
                  i === 0
                    ? [
                        "first-letter:float-left first-letter:mr-3",
                        "first-letter:text-6xl lg:first-letter:text-7xl",
                        "first-letter:leading-[0.8] lg:first-letter:leading-[0.8]",
                        "first-letter:font-extrabold first-letter:tracking-tight",
                        "first-letter:text-slate-800",
                      ].join(" ")
                    : ""
                }
              >
                {p}
              </motion.p>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  </div>
</section>



  );
}

export { LottieLoop };