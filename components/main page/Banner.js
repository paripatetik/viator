import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { playfair } from "@/lib/fonts";

export default function Banner({
  title,
  subtitle,
  imgSrc,
  headerSelector = "#site-header",
}) {
  const [headerH, setHeaderH] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      const header = document.querySelector(headerSelector);
      setHeaderH(header ? header.offsetHeight : 0);
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768); // md breakpoint
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [headerSelector]);

  const heroH = `calc(100dvh - ${headerH}px)`;

  const [pauseText, setPauseText] = useState(false); // desktop text
  const [pauseImg, setPauseImg] = useState(false);   // mobile image

  const handleMobileToggle = () => {
    if (!isMobile) return;
    setPauseImg((p) => !p);
  };

  return (
    <section
      style={{ height: heroH, minHeight: heroH, marginTop: headerH }}
      className="relative w-full overflow-hidden"
      onClick={handleMobileToggle}
    >
      {/* фон */}
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
        style={
          isMobile
            ? { animationPlayState: pauseImg ? "paused" : "running" }
            : undefined
        }
      />

      {/* текстовий блок */}
      <div
        className={clsx(
          "absolute inset-y-0 flex items-center",
          "w-full md:w-auto"
        )}
        style={{ left: 0 }}
      >
        <div
          className={clsx(
            "relative flex flex-col justify-between h-full text-white",
            "px-6 py-12 sm:px-10 sm:py-14 md:px-14 lg:px-20",
            "w-full md:max-w-2xl",
            "bg-black/30",
            "md:backdrop-blur-sm"
          )}
          onMouseEnter={() => {
            if (!isMobile) setPauseText(true);
          }}
          onMouseLeave={() => {
            if (!isMobile) setPauseText(false);
          }}
          style={
            !isMobile
              ? {
                  // стартує з лівого краю, їде вправо і повертається
                  animation:
                    "viatorBannerTextSlide 60s linear infinite alternate",
                  animationPlayState: pauseText ? "paused" : "running",
                }
              : undefined
          }
        >
          {/* декоративні кути */}
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
  /* DESKTOP: блок стартує зліва і їде аж до правого краю */
  @keyframes viatorBannerTextSlide {
    0% {
      transform: translateX(0);
    }
    50% {
      /* 100vw = ширина вікна, 100% = ширина самого блока */
      transform: translateX(calc(100vw - 100%));
    }
    100% {
      transform: translateX(0);
    }
  }

  /* MOBILE: панорама через object-position */
  @keyframes viatorBannerImagePan {
    0% {
      object-position: 0% 50%;   /* крайня ліва частина */
    }
    50% {
      object-position: 50% 50%;  /* центр */
    }
    100% {
      object-position: 100% 50%; /* крайня права частина */
    }
  }

  .viator-banner-img-pan {
    animation: viatorBannerImagePan 28s linear infinite alternate;
    object-fit: cover;
  }

  @media (min-width: 768px) {
    .viator-banner-img-pan {
      animation: none;
    }
  }
`}</style>

    </section>
  );
}
