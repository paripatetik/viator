import { useEffect, useLayoutEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { playfair } from "@/lib/fonts";

// useLayoutEffect on client, useEffect on server (SSR safe)
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Banner({ title, subtitle, imgSrc, headerSelector = "#site-header" }) {
  const [isMobile, setIsMobile] = useState(false);
  const [pauseText, setPauseText] = useState(false);
  const [pauseImg, setPauseImg] = useState(false);

  // null = use CSS fallback (SSR + desktop)
  // number = stable px height captured before first paint (mobile only)
  const [stableH, setStableH] = useState(null);

  // useLayoutEffect fires before paint — no visible frame with wrong height
  useIsomorphicLayoutEffect(() => {
    if (window.innerWidth >= 768) return; // desktop: CSS svh is fine
    const header = document.querySelector(headerSelector);
    const headerH = header ? header.offsetHeight : 0;
    setStableH(window.innerHeight - headerH);
    // Intentionally no resize/scroll listener — height must stay stable
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const sectionStyle =
    isMobile && stableH
      ? { height: `${stableH}px`, marginTop: "var(--header-h)" }
      : { height: "calc(100svh - var(--header-h))", marginTop: "var(--header-h)" };

  return (
    <section
      style={sectionStyle}
      className="relative w-full overflow-hidden"
      onClick={() => isMobile && setPauseImg((p) => !p)}
    >
      <Image
        src={imgSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        className={clsx(
          "object-cover object-left md:object-center",
          isMobile && "viator-banner-img-pan"
        )}
        style={isMobile ? { animationPlayState: pauseImg ? "paused" : "running" } : undefined}
      />

      <div
        className={clsx("absolute inset-y-0 flex items-center", "w-full md:w-auto")}
        style={{ left: 0 }}
      >
        <div
          className={clsx(
            "relative flex flex-col justify-between h-full text-white",
            "px-6 py-12 sm:px-10 sm:py-14 md:px-14 lg:px-20",
            "w-full md:max-w-2xl",
            "bg-black/30 md:backdrop-blur-sm"
          )}
          onMouseEnter={() => { if (!isMobile) setPauseText(true); }}
          onMouseLeave={() => { if (!isMobile) setPauseText(false); }}
          style={
            !isMobile
              ? {
                  animation: "viatorBannerTextSlide 60s linear infinite alternate",
                  animationPlayState: pauseText ? "paused" : "running",
                }
              : undefined
          }
        >
          <span className="pointer-events-none hidden md:block absolute top-6 left-6 w-12 h-12 border-t-[8px] border-l-[8px] border-white" />
          <span className="pointer-events-none hidden md:block absolute bottom-6 right-6 w-12 h-12 border-b-[8px] border-r-[8px] border-white" />

          <h1
            className={`${playfair.className} text-center text-4xl font-extrabold tracking-wider uppercase md:text-6xl drop-shadow text-white`}
          >
            {title}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-center bg-black/70 p-2">
            {subtitle}
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes viatorBannerTextSlide {
          0%   { transform: translateX(0); }
          50%  { transform: translateX(calc(100vw - 100%)); }
          100% { transform: translateX(0); }
        }
        @keyframes viatorBannerImagePan {
          0%   { object-position: 0% 50%; }
          50%  { object-position: 50% 50%; }
          100% { object-position: 100% 50%; }
        }
        .viator-banner-img-pan {
          animation: viatorBannerImagePan 28s linear infinite alternate;
          object-fit: cover;
        }
        @media (min-width: 768px) {
          .viator-banner-img-pan { animation: none; }
        }
      `}</style>
    </section>
  );
}