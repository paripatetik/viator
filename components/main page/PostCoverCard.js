"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { playfair } from "@/lib/fonts";
import { htmlToPlainText } from "@/lib/text";

const metaVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function PostCoverCard({
  post,
  isActive = false,
  className = "",
  imagePriority = false,
  shouldBlockNavigation,
}) {
  const [isExcerptOpen, setIsExcerptOpen] = useState(false);
  const gesture = useRef({ x: 0, y: 0, moved: false });
  const img =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/fallback.jpg";

  const categories = (post._embedded?.["wp:term"]?.[0] || [])
    .map((term) => term?.name)
    .filter(Boolean);

  const date = post.date
    ? new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(post.date))
    : null;

  const excerpt = htmlToPlainText(post.excerpt?.rendered);
  const postHref = `/posts/${post.slug}`;

  useEffect(() => {
    if (!isActive) setIsExcerptOpen(false);
  }, [isActive]);

  const startGesture = useCallback((x, y) => {
    gesture.current = { x, y, moved: false };
  }, []);

  const updateGesture = useCallback((x, y) => {
    const dx = Math.abs(x - gesture.current.x);
    const dy = Math.abs(y - gesture.current.y);
    if (dx > 6 || dy > 10) gesture.current.moved = true;
  }, []);

  const handleNavigationClick = useCallback(
    (event) => {
      if (gesture.current.moved || shouldBlockNavigation?.()) {
        event.preventDefault();
        event.stopPropagation();
        gesture.current.moved = false;
      }
    },
    [shouldBlockNavigation]
  );

  return (
    <article
      onPointerDown={(event) => startGesture(event.clientX, event.clientY)}
      onPointerMove={(event) => updateGesture(event.clientX, event.clientY)}
      onTouchStart={(event) => {
        const touch = event.touches?.[0];
        if (touch) startGesture(touch.clientX, touch.clientY);
      }}
      onTouchMove={(event) => {
        const touch = event.touches?.[0];
        if (touch) updateGesture(touch.clientX, touch.clientY);
      }}
      className={clsx(
        "group relative block w-full h-full select-none bg-[#111820]",
        "rounded-lg border border-[#24313A]/20 shadow-[0_22px_60px_rgba(36,49,58,0.22)]",
        !isActive && "cursor-default",
        className
      )}
      style={{
        willChange: isActive ? "transform" : "auto",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        clipPath: "inset(0 round 0.5rem)",
        WebkitTapHighlightColor: "transparent",
        touchAction: "pan-y",
      }}
    >
      <Link
        href={postHref}
        aria-label={htmlToPlainText(post.title.rendered)}
        onClickCapture={handleNavigationClick}
        draggable={false}
        className={clsx("absolute inset-0 z-10", !isActive && "pointer-events-none")}
      />

      <Image
        fill
        src={img}
        alt={post.title.rendered}
        sizes="(max-width: 640px) 84vw, (max-width: 768px) 70vw, (max-width: 1024px) 56vw, (max-width: 1280px) 46vw, 760px"
        className="object-cover object-center opacity-95 transition-transform duration-700 md:group-hover:scale-[1.025]"
        loading={imagePriority ? "eager" : "lazy"}
        fetchPriority={imagePriority ? "high" : "auto"}
        draggable={false}
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,32,0.02)_0%,rgba(17,24,32,0.18)_42%,rgba(17,24,32,0.7)_100%)]" />
      <div className="absolute inset-0 bg-[#111820]/10" />

      <motion.div
        variants={metaVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className={clsx(
          "absolute inset-x-4 bottom-4 z-20 text-[#24313A] md:inset-x-7 md:bottom-6",
          isActive ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div className="relative overflow-visible rounded-md border border-[#D7E2E5]/70 bg-[#F8F5EE]/92 px-4 py-4 shadow-[0_18px_42px_rgba(17,24,32,0.20)] ring-1 ring-white/45 backdrop-blur-md md:px-6 md:py-5">
          {excerpt && (
            <button
              type="button"
              aria-label={isExcerptOpen ? "Сховати уривок" : "Показати уривок"}
              aria-expanded={isExcerptOpen}
              disabled={!isActive}
              onClick={() => setIsExcerptOpen((open) => !open)}
              className="absolute left-1/2 top-0 z-30 flex h-10 w-10 -translate-x-1/2 -translate-y-[calc(100%+0.35rem)] items-center justify-center rounded-full border border-[#D7E2E5] bg-[#F8F5EE]/96 text-[#24313A] shadow-[0_10px_24px_rgba(17,24,32,0.22)] ring-4 ring-[#F8F5EE]/30 backdrop-blur-md transition-[border-color,background-color,color,transform,box-shadow] duration-200 hover:-translate-y-[calc(100%+0.5rem)] hover:border-[#416472]/55 hover:bg-white hover:shadow-[0_14px_28px_rgba(17,24,32,0.24)] disabled:pointer-events-none disabled:opacity-0"
            >
              <ChevronUp
                size={20}
                strokeWidth={1.75}
                className={clsx(
                  "transition-transform duration-300",
                  isExcerptOpen && "rotate-180"
                )}
              />
            </button>
          )}

          {excerpt && (
            <motion.div
              initial={false}
              animate={
                isExcerptOpen
                  ? { height: "auto", opacity: 1, y: 0 }
                  : { height: 0, opacity: 0, y: 12 }
              }
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
              aria-hidden={!isExcerptOpen}
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#24313A]/15 pb-3">
                <div className="min-w-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7B6D57] md:text-[11px]">
                  <span className="truncate">
                    {categories[0] || "Публікація"}
                  </span>
                </div>
                {date && (
                  <time className="shrink-0 text-[11px] text-[#59656D]" dateTime={post.date}>
                    {date}
                  </time>
                )}
              </div>

              <div className="mb-5 max-h-36 overflow-y-auto pr-2 md:max-h-44">
                <p className="text-[15px] leading-[1.62] text-[#4D5961] md:text-[17px]">
                  {excerpt}
                </p>
              </div>
            </motion.div>
          )}

          <Link
            href={postHref}
            onClickCapture={handleNavigationClick}
            draggable={false}
            className="block"
          >
            <div className="flex items-start">
              <h3
                className={`${playfair.className} flex-1 text-[1.35rem] font-bold italic leading-[1.1] text-[#18242C] md:text-[1.7rem] lg:text-[1.9rem]`}
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
            </div>
          </Link>
        </div>
      </motion.div>
    </article>
  );
}
