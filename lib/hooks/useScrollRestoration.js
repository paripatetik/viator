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
  const saveFrame = useRef(0);
  const previousPathname = useRef(pathname);
  const lastHomePosition = useRef(null);

  const key = "home-scroll-pos";
  const restoreKey = "home-scroll-restore-pending";

  const saveHomePosition = useCallback(() => {
    if (window.location.pathname !== "/") return;

    const content = getPageContent();
    const pos = {
      x: scrollX,
      y: scrollY,
      contentHeight: content?.offsetHeight || 0,
    };

    lastHomePosition.current = pos;
    sessionStorage.setItem(key, JSON.stringify(pos));
  }, []);

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
      sessionStorage.setItem(restoreKey, "1");
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (restoreFrame.current) cancelAnimationFrame(restoreFrame.current);
      if (saveFrame.current) cancelAnimationFrame(saveFrame.current);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/") return undefined;

    const scheduleSave = () => {
      if (saveFrame.current) return;

      saveFrame.current = requestAnimationFrame(() => {
        saveFrame.current = 0;
        saveHomePosition();
      });
    };

    const onPageHide = () => saveHomePosition();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") saveHomePosition();
    };

    const restorePending =
      shouldRestore.current ||
      previousPathname.current.startsWith("/posts/") ||
      sessionStorage.getItem(restoreKey) === "1";

    if (!restorePending) {
      saveHomePosition();
    }
    window.addEventListener("scroll", scheduleSave, { passive: true });
    window.addEventListener("resize", scheduleSave);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      saveHomePosition();
      window.removeEventListener("scroll", scheduleSave);
      window.removeEventListener("resize", scheduleSave);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (saveFrame.current) {
        cancelAnimationFrame(saveFrame.current);
        saveFrame.current = 0;
      }
    };
  }, [pathname, saveHomePosition]);

  useEffect(() => {
    const cameFromPost = previousPathname.current.startsWith("/posts/");
    const shouldRestoreHome =
      pathname === "/" &&
      (shouldRestore.current ||
        cameFromPost ||
        sessionStorage.getItem(restoreKey) === "1");

    if (shouldRestoreHome) {
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
      sessionStorage.removeItem(restoreKey);
    }

    if (previousPathname.current === "/" && pathname.startsWith("/posts/")) {
      sessionStorage.setItem(restoreKey, "1");
    }

    previousPathname.current = pathname;
  }, [pathname, releaseReserveWhenReady]);
}
