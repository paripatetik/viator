import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";
import { htmlToPlainText } from "@/lib/text";

const metaVariants = {
  hidden: { opacity: 0, pointerEvents: "none" },
  visible: {
    opacity: 1,
    pointerEvents: "auto",
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function PostCoverCard({ post, isActive = false, className = "" }) {
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

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={clsx(
        "group relative block w-full h-full select-none bg-[#111820]",
        "rounded-lg border border-[#24313A]/20 shadow-[0_22px_60px_rgba(36,49,58,0.22)]",
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
        clipPath: "inset(0 round 0.5rem)",
      }}
    >
      <Image
        fill
        src={img}
        alt={post.title.rendered}
        // ✅ Fix 3: фіксований sizes замість responsive —
        // браузер не свапає srcset під час scale-анімації coverflow
     
        className="object-cover object-center opacity-95 transition-transform duration-700 group-hover:scale-[1.025]"
        // ✅ Fix 4: eager loading для всіх слайдів каруселі —
        // зображення вже завантажені до того як стають видимими
        loading="eager"
          style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
  }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,32,0.02)_0%,rgba(17,24,32,0.18)_42%,rgba(17,24,32,0.7)_100%)]" />
      <div
        className={clsx(
          "absolute inset-0 bg-[#111820] transition-opacity duration-500",
          isActive ? "opacity-0" : "opacity-35"
        )}
      />

      <motion.div
        variants={metaVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        className="absolute inset-x-3 bottom-3 max-h-[56%] overflow-hidden bg-[#F7F8F6]/95 px-4 py-4 text-[#24313A] shadow-[0_16px_36px_rgba(17,24,32,0.22)] ring-1 ring-[#24313A]/10 backdrop-blur-sm md:inset-x-5 md:bottom-5 md:max-h-[52%] md:px-6 md:py-5"
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

        <div className="flex items-start">
          <h3
            className="flex-1 text-[1.35rem] font-semibold leading-[1.05] text-[#18242C] md:text-3xl lg:text-[2rem]"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </div>

        {excerpt && (
          <div className="mt-3 max-h-24 overflow-y-auto pr-2 md:max-h-32">
            <p className="text-sm leading-relaxed text-[#4D5961] md:text-base">
              {excerpt}
            </p>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
