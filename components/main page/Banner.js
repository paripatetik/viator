import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { playfair } from "@/lib/fonts";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Banner({ title, subtitle, imgSrc, headerSelector = "#site-header" }) {
  const [pauseText, setPauseText] = useState(false);
  const [pauseImg, setPauseImg] = useState(false);

  // Capture stable height in px BEFORE first paint.
  // On mobile, iOS Safari changes innerHeight when its chrome slides in/out —
  // any viewport unit (svh/dvh/vh) will reflow. Px captured once = no reflow.
  // On desktop stableH stays null and CSS handles it fine.
  const [stableH, setStableH] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    if (mobile) {
      const header = document.querySelector(headerSelector);
      const headerH = header ? header.offsetHeight : 0;
      // Capture once — intentionally NO resize/scroll listener
      setStableH(window.innerHeight - headerH);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sectionStyle = isMobile && stableH
    ? {
        // Fixed px height: immune to iOS chrome show/hide
        height: `${stableH}px`,
        maxHeight: `${stableH}px`,
        marginTop: "var(--header-h)",
      }
    : {
        height: "calc(100svh - var(--header-h))",
        marginTop: "var(--header-h)",
      };

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