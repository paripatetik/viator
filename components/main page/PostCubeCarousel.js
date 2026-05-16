"use client";

import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import PostCoverCard from "./PostCoverCard";
import { heroHeightStyle, layoutStyles } from "@/lib/styles";
import SectionHeading from "@/components/ui/SectionHeading";

export default function PostsCubeCarousel({ posts = [] }) {
  const displayPosts = useMemo(() => posts.slice(0, 7), [posts]);
  const hasLoopBuffer = displayPosts.length > 1;
  const loopCycles = hasLoopBuffer ? 9 : 1;
  const middleCycle = Math.floor(loopCycles / 2);
  const carouselPosts = useMemo(() => {
    if (!hasLoopBuffer) {
      return displayPosts.map((post, realIndex) => ({
        key: post.id,
        post,
        realIndex,
      }));
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
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeSlideIdx, setActiveSlideIdx] = useState(firstSlideIndex);
  const [swiper, setSwiper] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setActiveIdx(0);
    setActiveSlideIdx(firstSlideIndex);
  }, [firstSlideIndex, displayPosts]);

  const syncActiveFromSwiper = (s) => {
    const realIndex = Number(s.slides[s.activeIndex]?.dataset.realIndex ?? 0);
    setActiveIdx(realIndex);
    setActiveSlideIdx(s.activeIndex);
  };

  const handleTransitionEnd = (s) => {
    if (!hasLoopBuffer) {
      syncActiveFromSwiper(s);
      return;
    }

    const cycleSize = displayPosts.length;
    const activeIndex = s.activeIndex;
    const realIndex = Number(s.slides[activeIndex]?.dataset.realIndex ?? 0);
    const safeStart = cycleSize * 2;
    const safeEnd = cycleSize * (loopCycles - 2);

    if (activeIndex < safeStart || activeIndex >= safeEnd) {
      const normalizedIndex = cycleSize * middleCycle + realIndex;
      s.slideTo(normalizedIndex, 0, false);
      setActiveIdx(realIndex);
      setActiveSlideIdx(normalizedIndex);
      return;
    }

    syncActiveFromSwiper(s);
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
      whileInView="show"
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -12% 0px" }}
      className="flex flex-col pb-6"
      style={heroHeightStyle}
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
          spaceBetween={60}
          speed={600}
          keyboard={{ enabled: true }}
          coverflowEffect={{
            rotate: 0,
            depth: 220,
            stretch: 0,
            modifier: 1,
            slideShadows: true,
          }}
          modules={[EffectCoverflow, Keyboard]}
          onTransitionEnd={handleTransitionEnd}
          className="w-full flex-1 h-full min-h-0"
        >
          {carouselPosts.map(({ key, post, realIndex }, i) => (
            <SwiperSlide
              key={key}
              data-real-index={realIndex}
              className="w-[80vw] sm:w-[70vw] md:w-[55vw] lg:w-[45vw] max-w-[880px] h-full flex"
            >
              <PostCoverCard post={post} isActive={i === activeSlideIdx && realIndex === activeIdx} />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          aria-label="Попередній"
          onClick={() => swiper?.slidePrev()}
          className="cube-prev hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-2 xl:left-6 z-20 w-14 h-14 rounded-full bg-slate-400/90 text-slate-50 hover:bg-white hover:text-black shadow-lg backdrop-blur-sm transition-colors"
        >
          <ChevronLeft size={36} />
        </button>

        <button
          type="button"
          aria-label="Наступний"
          onClick={() => swiper?.slideNext()}
          className="cube-next hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-2 xl:right-6 z-20 w-14 h-14 rounded-full bg-slate-400/90 text-slate-50 hover:bg-white hover:text-black shadow-lg backdrop-blur-sm transition-colors"
        >
          <ChevronRight size={36} />
        </button>

        <div className="cube-dots flex justify-center mt-8 space-x-3">
          {displayPosts.map((post, i) => (
            <button
              key={post.id}
              type="button"
              aria-label={`Перейти до публікації ${i + 1}`}
              aria-current={i === activeIdx ? "true" : undefined}
              onClick={() => swiper?.slideTo(hasLoopBuffer ? displayPosts.length * middleCycle + i : i)}
              className={`h-3.5 w-3.5 rounded-full transition duration-500 ${
                i === activeIdx ? "scale-125 bg-black" : "bg-black/30 hover:bg-black/50"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
