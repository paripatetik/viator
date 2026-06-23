"use client";

import { useState } from "react";
import clsx from "clsx";
import { playfair } from "@/lib/fonts";
import usePageReady from "@/lib/hooks/usePageReady";
import { heroHeightStyle, heroStyles } from "@/lib/styles";

export default function Banner({ title, subtitle, imgSrc }) {
  const animationReady = usePageReady(220);
  const [pauseText, setPauseText] = useState(false);

  return (
    <>
      <link rel="preload" as="image" href={imgSrc} fetchPriority="high" />
      <section
        style={{
          ...heroHeightStyle,
          backgroundColor: "#111",
        }}
        className={heroStyles.root}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 viator-banner-bg-pan"
          style={{
            backgroundImage: `url("${imgSrc}")`,
          }}
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
            "bg-black/30 md:backdrop-blur-sm",
            "viator-banner-text-pan"
          )}
          onMouseEnter={() => setPauseText(true)}
          onMouseLeave={() => setPauseText(false)}
          style={{
            animationPlayState:
              !animationReady || pauseText ? "paused" : "running",
          }}
        >
          <span className="pointer-events-none hidden md:block absolute top-6 left-6 w-12 h-12 border-t-[8px] border-l-[8px] border-white" />
          <span className="pointer-events-none hidden md:block absolute bottom-6 right-6 w-12 h-12 border-b-[8px] border-r-[8px] border-white" />

          <h1
            className={`${playfair.className} ${heroStyles.title}`}
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
        @keyframes viatorBannerImageDrift {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-4%, 0, 0); }
        }
        @keyframes viatorBannerImageDriftMobile {
          0%   { transform: translate3d(0, 0, 0) scale(1.02); }
          50%  { transform: translate3d(-7%, -1.2%, 0) scale(1.02); }
          100% { transform: translate3d(-12%, 0, 0) scale(1.02); }
        }
        .viator-banner-text-pan {
          animation: viatorBannerTextSlide 60s linear infinite alternate;
          will-change: transform;
        }
        .viator-banner-bg-pan {
          inset: 0 auto 0 -4%;
          width: 108%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          animation: viatorBannerImageDrift 28s linear infinite alternate;
          will-change: transform;
        }
        @media (max-width: 767px) {
          .viator-banner-text-pan {
            animation: none;
            transform: none;
            will-change: auto;
          }
          .viator-banner-bg-pan {
            inset: 0 auto 0 -18%;
            width: 136%;
            animation-name: viatorBannerImageDriftMobile;
            animation-duration: 18s;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .viator-banner-text-pan {
            animation: none;
            transform: none;
            will-change: auto;
          }
          .viator-banner-bg-pan {
            animation: none;
            transform: none;
            will-change: auto;
          }
        }
      `}</style>
      </section>
    </>
  );
}
