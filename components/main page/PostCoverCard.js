import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

const metaVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
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

  const img =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/fallback.jpg";

  const excerpt = post.excerpt?.rendered
    ?.replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const hoverEvents = isActive
    ? { onMouseEnter: () => setShowExcerpt(true), onMouseLeave: () => setShowExcerpt(false) }
    : {};

  return (
    <Link
      href={`/posts/${post.slug}`}
      {...hoverEvents}
      className={clsx(
        "group relative block w-full h-full rounded-xl overflow-hidden select-none bg-black shadow-xl border-3 border-viator-sky/75 transition-transform duration-500",
        !isActive && "pointer-events-none cursor-default",
        className
      )}
    >
      {/* Image */}
      <Image
        fill
        priority
        src={img}
        alt={post.title.rendered}
        className={clsx(
          "object-cover object-center transition-transform duration-500 ease-in-out opacity-90",
          isActive && "group-hover:scale-105"
        )}
      />

      {/* Bottom panel */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="meta"
            variants={metaVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute bottom-0 left-0 w-full bg-white/90 px-4 pt-4 pb-4 text-black pointer-events-auto space-y-2 overflow-hidden"
          >
            {/* Title row with toggle button inline */}
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-xl md:text-xl font-semibold leading-tight uppercase tracking-wide flex-1"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />

              {/* Toggle only on mobile, sits beside the title — never overlaps it */}
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

            {/* Excerpt */}
            <AnimatePresence initial={false}>
              {excerpt && (
                <motion.div
                  key="excerpt"
                  variants={excerptVariants}
                  initial="hidden"
                  animate={showExcerpt ? "visible" : "hidden"}
                  exit="hidden"
                  className="overflow-y-auto md:overflow-hidden scrollbar-thin scrollbar-thumb-gray-400 pr-2"
                >
                  <p
                    className="text-base md:text-lg leading-snug"
                    dangerouslySetInnerHTML={{ __html: excerpt }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}
