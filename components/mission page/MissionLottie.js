// components/mission page/MissionLottie.js
"use client";

import { useEffect, useRef, useState } from "react";

let lottiePromise;
function loadLottie() {
  if (!lottiePromise) lottiePromise = import("lottie-web").then(m => m.default || m);
  return lottiePromise;
}

/** Lottie pose viewer (0..1) — lazy init + canvas renderer */
export default function MissionLottie({
  src = "/animations/traveller_anim.json",
  value = 0.2,
  initial = 0.12,
  className = "",
}) {
  const rootRef = useRef(null);
  const animRef = useRef(null);
  const roRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Start loading only when near viewport
  useEffect(() => {
    const el = rootRef.current;
    if (!el || shouldLoad) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "60% 0px 60% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldLoad]);

  // Create animation once
  useEffect(() => {
    if (!shouldLoad) return;
    let killed = false;

    const run = async () => {
      const Lottie = await loadLottie();
      const json = await fetch(src, { cache: "force-cache" }).then(r => r.json());
      if (killed) return;

      const anim = Lottie.loadAnimation({
        container: rootRef.current,
        renderer: "canvas",
        loop: false,
        autoplay: false,
        animationData: json,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: true,
          clearCanvas: true,
        },
      });
      animRef.current = anim;

      const applyPose = () => {
        if (!anim?.totalFrames) return;
        const frames = anim.totalFrames;
        const clamp01 = x => Math.min(1, Math.max(0, x ?? 0));
        anim.goToAndStop(Math.round(frames * clamp01(initial)), true);
        anim.goToAndStop(Math.round(frames * clamp01(value)), true);
      };

      anim.addEventListener("DOMLoaded", applyPose);
      anim.addEventListener("data_ready", applyPose);

      if (rootRef.current && typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => anim?.resize && anim.resize());
        ro.observe(rootRef.current);
        roRef.current = ro;
      }
    };

    const id =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(run, { timeout: 1500 })
        : setTimeout(run, 0);

    return () => {
      if ("cancelIdleCallback" in window) window.cancelIdleCallback?.(id);
      else clearTimeout(id);
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
  }, [src, initial, value, shouldLoad]);

  // Update pose when `value` changes
  useEffect(() => {
    const anim = animRef.current;
    if (!anim || !anim.totalFrames) return;
    const frames = anim.totalFrames;
    const v = Math.min(1, Math.max(0, value ?? 0));
    const raf = requestAnimationFrame(() => {
      anim.goToAndStop(Math.round(frames * v), true);
    });
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <div ref={rootRef} className={`w-full h-full ${className}`} />;
}
