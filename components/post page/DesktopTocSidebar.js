// components/post page/DesktopTocSidebar.js
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useHeaderHeight } from "@/lib/hooks/useHeaderHeight";

/**
 * Desktop-only sticky ToC with scroll-spy.
 * Highlights the section in view; clears highlight when outside the article.
 *
 * props:
 *  - toc: [{ id, text }]
 *  - img: featured image URL
 *  - onSelect: (id) => void
 *  - articleRef: ref to <article>
 */
export default function DesktopTocSidebar({ toc = [], img, onSelect, articleRef }) {
  const headerH = useHeaderHeight();
  const [active, setActive] = useState(null);

  const heads = useMemo(
    () =>
      toc.map((t) => ({
        ...t,
        el: typeof document !== "undefined" ? document.getElementById(t.id) : null,
      })),
    [toc]
  );

  useEffect(() => {
    if (!heads.length) return;

    const handle = () => {
      const markerY = window.scrollY + headerH + 20;

      const firstEl = heads.find((h) => h.el)?.el;
      const lastEl = [...heads].reverse().find((h) => h.el)?.el;

      if (!firstEl || !lastEl) return;

      const artTop = articleRef?.current
        ? articleRef.current.getBoundingClientRect().top + window.scrollY
        : firstEl.getBoundingClientRect().top + window.scrollY;

      const artBottom = articleRef?.current
        ? articleRef.current.getBoundingClientRect().top +
          window.scrollY +
          articleRef.current.scrollHeight
        : lastEl.getBoundingClientRect().top + window.scrollY + 1;

      // None active if above first or past article end
      if (markerY < artTop || markerY > artBottom) {
        setActive(null);
        return;
      }

      // Find the section the marker is within
      let next = null;
      for (let i = 0; i < heads.length; i++) {
        const a = heads[i].el;
        const b = heads[i + 1]?.el;
        if (!a) continue;

        const aTop = a.getBoundingClientRect().top + window.scrollY;
        const bTop = b ? b.getBoundingClientRect().top + window.scrollY : artBottom;

        if (markerY >= aTop && markerY < bTop) {
          next = heads[i].id;
          break;
        }
      }
      setActive(next);
    };

    handle();
    window.addEventListener("scroll", handle, { passive: true });
    window.addEventListener("resize", handle);
    return () => {
      window.removeEventListener("scroll", handle);
      window.removeEventListener("resize", handle);
    };
  }, [heads, headerH, articleRef]);

  if (toc.length < 2) return null;

  return (
    <aside className="hidden lg:block w-[260px] xl:w-[300px] shrink-0" aria-label="Зміст статті">
      <div className="sticky" style={{ top: headerH + 16 }}>
        <div className="rounded-xl bg-[#94B4C1]/20 ring-1 ring-slate-200 p-4">
          <h2 className="text-xl font-semibold mb-3">Зміст</h2>
          <ol className="space-y-2">
            {toc.map(({ id, text }) => (
              <li key={id}>
                <button
                  onClick={() => {
                    onSelect?.(id);
                    setActive(id);
                  }}
                  className={clsx(
                    "block w-full text-left transition-colors",
                    active === id
                      ? "text-[#8EB7C6] font-semibold"
                      : "text-slate-700 hover:text-[#8EB7C6]"
                  )}
                >
                  {text}
                </button>
              </li>
            ))}
          </ol>
        </div>

        {img && (
          <div className="mt-4">
            <Image
              src={img}
              alt=""
              width={600}
              height={400}
              className="w-full h-auto rounded-lg ring-1 ring-slate-200 object-cover"
              priority
            />
          </div>
        )}
      </div>
    </aside>
  );
}