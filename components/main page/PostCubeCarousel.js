"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import PostCoverCard from "./PostCoverCard";
import usePageReady from "@/lib/hooks/usePageReady";
import { heroHeightStyle, layoutStyles } from "@/lib/styles";
import SectionHeading from "@/components/ui/SectionHeading";

const carouselHeightStyle = {
  ...heroHeightStyle,
  height: "calc(var(--hero-h, calc(100vh - var(--header-h, 4rem))) * 0.84)",
};

export default function PostsCubeCarousel({ posts = [] }) {
  const displayPosts = useMemo(() => posts.slice(0, 7), [posts]);
  const hasLoopBuffer = displayPosts.length > 1;
  const loopCycles = hasLoopBuffer ? 9 : 1;
  const middleCycle = Math.floor(loopCycles / 2);

  const carouselPosts = useMemo(() => {
    if (!hasLoopBuffer) {
      return displayPosts.map((post, realIndex) => ({ key: post.id, post, realIndex }));
    }
    return Array.from({ length: loopCycles }, (_, cycle) =>
      displayPosts.map((post, realIndex) => ({
        key: `${cycle}-${post.id}`,
        post,
        realIndex,
      }))
    ).flat();
  }, [displayPosts, hasLoopBuffer, loopCycles]);

  const firstSlideIndex = hasLoopBuffer ? displayPosts.length * middleCycle : 0;

  // ✅ Зберігаємо тільки realIndex — slideIndex більше не потрібен
  const [activeRealIndex, setActiveRealIndex] = useState(0);
  const [swiper, setSwiper] = useState(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const animationReady = usePageReady(220);
  const isTeleporting = useRef(false);

  useEffect(() => {
    setActiveRealIndex(0);
  }, [displayPosts]);

  const getRealIndex = (s) =>
    Number(s.slides[s.activeIndex]?.dataset.realIndex ?? 0);

  // ✅ Оновлюємо activeRealIndex одразу при зміні слайда,
  //    але пропускаємо події що виникають під час телепортації
  const handleSlideChange = (s) => {
    if (isTeleporting.current) return;
    setActiveRealIndex(getRealIndex(s));
  };

  // ✅ Телепортація — тільки позиційна, без зміни видимого стану
  const handleTransitionEnd = (s) => {
    if (!hasLoopBuffer) return;
    if (isTeleporting.current) return;

    const cycleSize = displayPosts.length;
    const safeStart = cycleSize * 2;
    const safeEnd = cycleSize * (loopCycles - 2);

    if (s.activeIndex < safeStart || s.activeIndex >= safeEnd) {
      const realIndex = getRealIndex(s);
      const normalizedIndex = cycleSize * middleCycle + realIndex;

      isTeleporting.current = true;
      s.slideTo(normalizedIndex, 0, false);

      // Два rAF — гарантуємо що slideTo повністю завершився
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isTeleporting.current = false;
        });
      });
    }
  };

  const fromTop = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -10,
      scale: prefersReducedMotion ? 1 : 0.992,
      filter: prefersReducedMotion ? "none" : "blur(1px)",
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 1.05, ease: [0.22, 0.61, 0.36, 1] },
    },
  };

  return (
    <motion.section
      variants={fromTop}
      initial="hidden"
      animate={animationReady && hasEnteredView ? "show" : "hidden"}
      onViewportEnter={() => setHasEnteredView(true)}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -12% 0px" }}
      className="flex flex-col pb-6"
      style={carouselHeightStyle}
    >
      <div className={`${layoutStyles.pageCompact} flex flex-col flex-1 relative`}>
        <SectionHeading className="pb-6 mt-6 md:mt-12 text-[#416472]">
          Останні публікації
        </SectionHeading>

        <Swiper
          onSwiper={setSwiper}
          effect="coverflow"
          centeredSlides
          grabCursor
          initialSlide={firstSlideIndex}
          slidesPerView="auto"
          spaceBetween={28}
          speed={520}
          keyboard={{ enabled: true }}
          coverflowEffect={{
            rotate: 0,
            depth: 120,
            stretch: 8,
            modifier: 1,
            scale: 0.9,
            slideShadows: false,
          }}
          modules={[EffectCoverflow, Keyboard]}
          onSlideChange={handleSlideChange}
          onTransitionEnd={handleTransitionEnd}
          className="w-full flex-1 h-full min-h-0 !overflow-visible"
        >
          {carouselPosts.map(({ key, post, realIndex }) => (
            <SwiperSlide
              key={key}
              data-real-index={realIndex}
              className="w-[84vw] sm:w-[70vw] md:w-[56vw] lg:w-[46vw] xl:w-[42vw] max-w-[760px] h-full flex"
            >
              {/* ✅ isActive залежить тільки від realIndex —
                  під час телепортації стан картки не змінюється */}
              <PostCoverCard
                post={post}
                isActive={realIndex === activeRealIndex}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          aria-label="Попередній"
          onClick={() => swiper?.slidePrev()}
          className="cube-prev hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-2 xl:left-6 z-20 h-12 w-12 rounded-lg border border-[#24313A]/25 bg-[#F7F8F6]/90 text-[#24313A] shadow-[0_10px_26px_rgba(36,49,58,0.14)] backdrop-blur-sm transition hover:border-[#24313A] hover:bg-white"
        >
          <ChevronLeft size={28} />
        </button>

        <button
          type="button"
          aria-label="Наступний"
          onClick={() => swiper?.slideNext()}
          className="cube-next hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-2 xl:right-6 z-20 h-12 w-12 rounded-lg border border-[#24313A]/25 bg-[#F7F8F6]/90 text-[#24313A] shadow-[0_10px_26px_rgba(36,49,58,0.14)] backdrop-blur-sm transition hover:border-[#24313A] hover:bg-white"
        >
          <ChevronRight size={28} />
        </button>

        <div className="cube-dots flex justify-center gap-2 pt-5">
          {displayPosts.map((post, i) => (
            <button
              key={post.id}
              type="button"
              aria-label={`Перейти до публікації ${i + 1}`}
              aria-current={i === activeRealIndex ? "true" : undefined}
              onClick={() =>
                swiper?.slideTo(
                  hasLoopBuffer ? displayPosts.length * middleCycle + i : i
                )
              }
              className={`h-1 rounded-full transition-all duration-500 ${
                i === activeRealIndex
                  ? "w-10 bg-[#24313A]"
                  : "w-5 bg-[#24313A]/25 hover:bg-[#24313A]/45"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
