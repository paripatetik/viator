"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const getPageContent = () => document.querySelector(".viator-page-content");

const getNaturalContentHeight = (el) => {
  const children = Array.from(el?.children || []);
  if (!children.length) return 0;

  const top = el.getBoundingClientRect().top + window.scrollY;
  return children.reduce((max, child) => {
    const rect = child.getBoundingClientRect();
    return Math.max(max, rect.bottom + window.scrollY - top);
  }, 0);
};

/**
 * Saves scroll {x,y} when you leave `/` and restores it when you return.
 * Nothing else is affected.
 */
export default function useHomeScrollRestoration() {
  const pathname = usePathname();
  const shouldRestore = useRef(false);
  const restoreFrame = useRef(0);

  const releaseReserveWhenReady = useCallback((savedHeight, attempt = 0) => {
    const content = getPageContent();
    if (!content) return;

    const naturalHeight = getNaturalContentHeight(content);
    if (naturalHeight >= savedHeight - 2) {
      content.style.minHeight = "";
      restoreFrame.current = 0;
      return;
    }

    if (attempt < 120) {
      restoreFrame.current = requestAnimationFrame(() =>
        releaseReserveWhenReady(savedHeight, attempt + 1)
      );
    } else {
      restoreFrame.current = 0;
    }
  }, []);

  useEffect(() => {
    if (!("scrollRestoration" in history)) return undefined;
    history.scrollRestoration = "manual";

    const onPopState = () => {
      shouldRestore.current = true;
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (restoreFrame.current) cancelAnimationFrame(restoreFrame.current);
    };
  }, []);

  useEffect(() => {
    const key = "home-scroll-pos";

    if (pathname === "/" && shouldRestore.current) {
      const pos = JSON.parse(sessionStorage.getItem(key) || "null");
      if (pos) {
        if (restoreFrame.current) cancelAnimationFrame(restoreFrame.current);
        const content = getPageContent();
        if (content && pos.contentHeight) {
          content.style.minHeight = `${pos.contentHeight}px`;
        }

        requestAnimationFrame(() => {
          window.scrollTo(pos.x, pos.y);
          if (pos.contentHeight) {
            releaseReserveWhenReady(pos.contentHeight);
          }
        });
      }
      shouldRestore.current = false;
    }

    return () => {
      if (pathname === "/") {
        const content = getPageContent();
        sessionStorage.setItem(
          key,
          JSON.stringify({
            x: scrollX,
            y: scrollY,
            contentHeight: content?.offsetHeight || 0,
          })
        );
      }
    };
  }, [pathname, releaseReserveWhenReady]);
}
