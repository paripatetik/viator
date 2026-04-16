"use client";

import { useEffect } from "react";
import useHomeScrollRestoration from "@/lib/hooks/useScrollRestoration";

export default function AppProviders({ children }) {
  useHomeScrollRestoration();

  useEffect(() => {
    if (!("PerformanceObserver" in window)) return undefined;

    let observer;
    try {
      observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log(
            "shift:",
            entry.value.toFixed(4),
            entry.sources?.map((source) =>
              source.node?.id || source.node?.className?.toString().slice(0, 50)
            )
          );
        });
      });
      observer.observe({ type: "layout-shift", buffered: true });
    } catch {
      return undefined;
    }

    return () => observer?.disconnect();
  }, []);

  useEffect(() => {
    const d = window.__scrollDebug;
    console.log("[scroll] Y at inline script:", d?.scrollYAtScript);
    console.log("[scroll] Y at hydration:", window.scrollY);

    const start = performance.now();
    const poll = () => {
      if (performance.now() - start < 2000) {
        if (window.scrollY !== 0) {
          console.warn(
            "[scroll] Y changed AFTER hydration:",
            window.scrollY,
            "at",
            performance.now() - start,
            "ms"
          );
        }
        requestAnimationFrame(poll);
      }
    };
    requestAnimationFrame(poll);
  }, []);

  return children;
}
