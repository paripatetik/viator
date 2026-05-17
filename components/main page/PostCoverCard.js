import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

const metaVariants = {
  hidden: { opacity: 0, pointerEvents: "none" },
  visible: {
    opacity: 1,
    pointerEvents: "auto",
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
};

const excerptVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 130,
    transition: {
      height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  },
};

export default function PostCoverCard({ post, isActive = false, className = "" }) {
  const [showExcerpt, setShowExcerpt] = useState(false);

  useEffect(() => {
    if (!isActive) setShowExcerpt(false);
  }, [isActive]);

  const img =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/fallback.jpg";

  const excerpt = post.excerpt?.rendered
    ?.replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <Link
      href={`/posts/${post.slug}`}
      onMouseEnter={() => isActive && setShowExcerpt(true)}
      onMouseLeave={() => isActive && setShowExcerpt(false)}
      className={clsx(
        "group relative block w-full h-full select-none bg-black shadow-xl",
        "rounded-xl border-3 border-viator-sky/75",
        !isActive && "pointer-events-none cursor-default",
        className
      )}
      style={{
        // ✅ Fix 1: власний GPU-шар для карточки —
        // браузер більше не перераховує clip під час 3D-трансформ Swiper
        willChange: "transform",
        backfaceVisibility: "hidden",
        // ✅ Fix 2: clip-path замість overflow-hidden —
        // не створює новий stacking context, не конфліктує з 3D
        clipPath: "inset(0 round 0.75rem)",
      }}
    >
      <Image
        fill
        src={img}
        alt={post.title.rendered}
        // ✅ Fix 3: фіксований sizes замість responsive —
        // браузер не свапає srcset під час scale-анімації coverflow
     
        className="object-cover object-center opacity-90"
        // ✅ Fix 4: eager loading для всіх слайдів каруселі —
        // зображення вже завантажені до того як стають видимими
        loading="eager"
          style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
  }}
      />

      <motion.div
        variants={metaVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="absolute bottom-0 left-0 w-full bg-white/90 px-4 pt-4 pb-4 text-black space-y-2 overflow-hidden"
      >
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-xl font-semibold leading-tight uppercase tracking-wide flex-1"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          {excerpt && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setShowExcerpt((s) => !s); }}
              aria-label="Toggle excerpt"
              className="lg:hidden shrink-0 mt-0.5 p-1.5 rounded-full bg-black/15 border border-black/20"
            >
              {showExcerpt
                ? <ChevronDown size={20} className="text-black" />
                : <ChevronUp size={20} className="text-black" />}
            </button>
          )}
        </div>

        {excerpt && (
          <motion.div
            variants={excerptVariants}
            initial="hidden"
            animate={showExcerpt ? "visible" : "hidden"}
            className="overflow-y-auto md:overflow-hidden scrollbar-thin scrollbar-thumb-gray-400 pr-2"
          >
            <p
              className="text-base md:text-lg leading-snug"
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
}