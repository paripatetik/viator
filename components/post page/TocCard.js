"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";


export function TocCard({ toc = [], onSelect, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const [active, setActive] = useState(toc[0]?.id || "");
  const [suppressUntil, setSuppressUntil] = useState(0);

  // robust scroll-spy
  useEffect(() => {
    if (!toc.length) return;

    const ids = toc.map(t => t.id);
    const getHeaderOffset = () => {
      const cssVar = getComputedStyle(document.documentElement)
        .getPropertyValue("--header-offset");
      const n = parseInt(cssVar, 10);
      return Number.isFinite(n) ? n : 88;
    };

    let ticking = false;
    const compute = () => {
      if (Date.now() < suppressUntil) { ticking = false; return; }

      const header = getHeaderOffset();
      const y = window.scrollY + header + 8;
      let current = ids[0];

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= y) current = id; else break;
      }
      if (current !== active) setActive(current);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(compute);
        ticking = true;
      }
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [toc, suppressUntil, active]);

  if (toc.length < 2) return null;

  return (
    <>
      {/* MOBILE (card on top). Hidden ≥900px) */}
 <nav className="min-[900px]:hidden">
  <div className="max-w-[20rem] rounded-lg bg-white/55 p-4 shadow-sm ring-1 ring-[#B9CBD3]/70">
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-controls="toc-list"
      className="w-full flex items-center justify-between"
    >
      <h2 className="text-left text-base font-semibold uppercase tracking-[0.14em] text-[#416472]">Зміст</h2>
      <svg
        className={`w-6 h-6 transition-transform ${open ? "" : "-rotate-90"}`}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <AnimatePresence initial={false}>
      {open && (
        <motion.ol
          id="toc-list"
          className="mt-3 list-disc space-y-2.5 overflow-hidden pl-5 text-[15px] leading-6 marker:text-viator-muted-blue"
          initial={{ height: 0, opacity: 0, y: -6 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {toc.map(({ id, text }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}   // ← simple & reliable
                className="text-left text-slate-700 transition-colors hover:text-viator-muted-blue"
              >
                {text}
              </button>
            </li>
          ))}
        </motion.ol>
      )}
    </AnimatePresence>
  </div>
</nav>

      {/* DESKTOP (sticky left) */}
      <aside className="hidden min-[900px]:block w-[220px] shrink-0 mt-2">
        <div className="sticky" style={{ top: "var(--header-offset, 88px)" }} aria-label="Зміст статті">
          <h2 className="mb-3 text-left text-[14px] font-semibold uppercase tracking-[0.16em] text-[#416472]">Зміст</h2>
          <ol className="max-h-[calc(100vh-var(--header-offset,88px)-24px)] space-y-1.5 overflow-auto border-l border-[#B9CBD3] pl-4 pr-2 text-[15px] leading-6">
            {toc.map(({ id, text }) => {
              const isActive = id === active;
              return (
                <li key={id}>
                  <button
                    onClick={() => {
                      setActive(id);
                      setSuppressUntil(Date.now() + 800);
                      onSelect(id);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={[
                      "block w-full rounded-sm py-1 text-left transition-all duration-200",
                      isActive
                        ? "bg-viator-note pl-2 pr-2 font-semibold text-viator-toc-active"
                        : "pl-2 pr-2 text-slate-600 hover:text-viator-toc-active"
                    ].join(" ")}
                  >
                    {text}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>
    </>
  );
}
