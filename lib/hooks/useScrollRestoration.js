"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Saves scroll {x,y} when you leave `/` and restores it when you return.
 * Nothing else is affected.
 */
export default function useHomeScrollRestoration() {
  const pathname = usePathname();
  const shouldRestore = useRef(false);

  useEffect(() => {
    if (!("scrollRestoration" in history)) return undefined;
    history.scrollRestoration = "manual";

    const onPopState = () => {
      shouldRestore.current = true;
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const key = "home-scroll-pos";

    if (pathname === "/" && shouldRestore.current) {
      const pos = JSON.parse(sessionStorage.getItem(key) || "null");
      if (pos) {
        requestAnimationFrame(() => window.scrollTo(pos.x, pos.y));
      }
      shouldRestore.current = false;
    }

    return () => {
      if (pathname === "/") {
        sessionStorage.setItem(
          key,
          JSON.stringify({ x: scrollX, y: scrollY })
        );
      }
    };
  }, [pathname]);
}
