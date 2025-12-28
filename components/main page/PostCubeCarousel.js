import { useState, useEffect, useMemo, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PostCoverCard from "./PostCoverCard";
import { playfair } from "@/lib/fonts";

function useHeaderHeight() {
  const [height, setHeight] = useState(0);
  const measure = useCallback(() => {
    const header = document.getElementById("site-header");
    setHeight(header ? header.offsetHeight : 0);
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);
  return height;
}

export default function PostsCubeCarousel({ posts = [] }) {
  const headerH = useHeaderHeight();
  const displayPosts = useMemo(() => posts.slice(0, 7), [posts]);
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section className="bg-slate-100/90 flex flex-col pb-6" style={{ height: `calc(100vh - ${headerH}px)` }}>
      <div className="container mx-auto px-4 flex flex-col flex-1 relative">
        <h2 className={`${playfair.className} text-3xl md:text-4xl font-extrabold text-center uppercase tracking-wider text-[#416472] pb-6 mt-6 md:mt-12`}> 
          Останні публікації
        </h2>
        <Swiper
          effect="coverflow"
          centeredSlides
          grabCursor
          slidesPerView="auto"
          spaceBetween={60}
          speed={600}
          keyboard={{ enabled: true }}
          coverflowEffect={{ rotate: 0, depth: 220, stretch: 0, modifier: 1, slideShadows: true }}
          navigation={{ nextEl: ".cube-next", prevEl: ".cube-prev" }}
          pagination={{ el: ".cube-dots", clickable: true }}
          modules={[EffectCoverflow, Navigation, Pagination, Keyboard]}
          onSlideChange={(s) => setActiveIdx(s.realIndex)}
          className="w-full flex-1 h-full min-h-0"
        >
          {displayPosts.map((p, i) => (
            <SwiperSlide key={p.id} className="w-[80vw] sm:w-[70vw] md:w-[55vw] lg:w-[45vw] max-w-[880px] h-full flex">
              <PostCoverCard post={p} isActive={i === activeIdx} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button aria-label="Попередній" className="cube-prev hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-2 xl:left-6 z-20 w-14 h-14 rounded-full bg-slate-400/90 text-slate-50 hover:bg-white hover:text-black shadow-lg backdrop-blur-sm transition-colors">
          <ChevronLeft size={36} />
        </button>
        <button aria-label="Наступний" className="cube-next hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-2 xl:right-6 z-20 w-14 h-14 rounded-full bg-slate-400/90 text-slate-50 hover:bg-white hover:text-black shadow-lg backdrop-blur-sm transition-colors">
          <ChevronRight size={36} />
        </button>
        <div className="cube-dots flex justify-center mt-8 space-x-3" />
      </div>
      <style jsx global>{`
        .cube-dots .swiper-pagination-bullet { transition: transform 1s ease, opacity 1s ease; }
        .cube-dots .swiper-pagination-bullet-active { transform: scale(1.4); }
        .cube-dots {
          --swiper-pagination-bullet-width: 14px;
          --swiper-pagination-bullet-height: 14px;
          --swiper-pagination-color: #000;
          --swiper-pagination-bullet-inactive-color: #000;
          --swiper-pagination-bullet-inactive-opacity: 0.3;
          --swiper-pagination-bullet-opacity: 1;
        }
      `}</style>
    </section>
  );
}
