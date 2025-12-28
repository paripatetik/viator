import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

/**************** Motion variants ****************/
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

  const categories =
    (post._embedded?.["wp:term"]?.[0] || [])
      .map((t) => ({ id: t.id, name: t.name, slug: t.slug }))
      .filter(Boolean);

  const author = post._embedded?.author?.[0]?.name;
  const date = new Date(post.date).toLocaleDateString("uk-UA");
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
        "group relative block w-full h-full rounded-xl overflow-hidden select-none bg-black shadow-xl border-3 border-black/60 transition-transform duration-500 br",
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

      {/* Mobile toggle */}
      {isActive && excerpt && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setShowExcerpt((s) => !s); }}
          aria-label="Toggle excerpt"
          className="lg:hidden absolute right-4 bottom-4 z-40 p-2 rounded-full bg-black/70 backdrop-blur-sm border-2 border-white"
        >
          {showExcerpt ? <ChevronDown size={24} className="text-white" /> : <ChevronUp size={24} className="text-white" />}
        </button>
      )}

      {/* Meta */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="meta"
            variants={metaVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute bottom-0 left-0 w-full bg-white/90 px-6 pt-8 pb-4 text-black pointer-events-auto space-y-2 overflow-hidden"
          >
            {/* Title */}
            <h3
              className="text-2xl md:text-3xl font-semibold leading-tight uppercase tracking-wide"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

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

            {/* Responsive bottom area:
               - ≤ tablet (md & below): categories on top, date/author below
               - ≥ desktop (lg): date/author left, categories right */}
            <div className="mt-2 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Categories */}
              <div className="order-1 lg:order-2 min-w-0">
                <ul className="flex flex-wrap gap-2 justify-start lg:justify-end">
                  {(categories.length ? categories : [{ id: "none", name: "Без категорії" }]).map(
                    (c) => (
                      <li
                        key={c.id}
                        className={clsx(
                          // Peach pill like the screenshot
                          "px-4 py-1.5 rounded-full bg-[#e9a97f]/90 text-black",
                          "font-serif uppercase tracking-wide",
                          "text-xs md:text-sm",
                          // Subtle depth
                          "shadow-[inset_0_-1px_0_rgba(0,0,0,0.06)] border border-black/10",
                          "whitespace-nowrap"
                        )}
                        title={c.name}
                      >
                        {c.name}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Date & Author */}
              <p className="order-2 lg:order-1 text-sm md:text-base opacity-90">
                {date}
                {author && (
                  <>
                    {" "}|{" "}
                    <span className="uppercase">{author}</span>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}