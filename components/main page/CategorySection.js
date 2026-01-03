import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import usePostsByCategories from "@/lib/hooks/usePostsByCategories";
import CategoryPicker from "./CategoryPicker";
import PostMasonryCard from "./PostMasonryCard";
import { playfair } from "@/lib/fonts";

const fade = { hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } };
const PER_PAGE = 10; // ask WP for 10 posts per page

export default function CategorySection({ categories = [], initialPosts = [] }){ 
  /* -------- category chips ---------------------------------- */
  const cats = categories.filter((c) => c.count > 0);
  const [selected, setSelected] = useState(new Set()); // empty ⇒ “all”

  /* -------- paginated posts --------------------------------- */
const {
  posts,
  loading,
  error,           // ← this must be here
  loadNextPage,
  hasMore,
} = usePostsByCategories([...selected], PER_PAGE, initialPosts);
  /* -------- height-lock to avoid jump on overlay ------------ */
  const [lockH, setLockH] = useState(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (loading && gridRef.current) setLockH(gridRef.current.offsetHeight);
    else setLockH(null);
  }, [loading]);

  /* -------- toggle helper for chips ------------------------- */
  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      return id === "all"
        ? new Set()
        : (next.has(id) ? (next.delete(id), next) : (next.add(id), next));
    });
  }

  const activeKey = [...selected].sort().join("-") || "all";

  /* ---------------------------- UI -------------------------- */
  return (
    <section className="pb-6">
      <div className="container mx-auto px-4">
        <h2 className={`${playfair.className} text-3xl md:text-4xl font-extrabold text-center uppercase tracking-wider text-[#416472] mb-6 mt-6 md:mt-12`}> 
          Наші Розвідки
        </h2>
        {/* chips */}
        <CategoryPicker categories={cats} selected={selected} onToggle={toggle} />

        {/* grid wrapper */}
        <div
          ref={gridRef}
          className="relative transition-[min-height] duration-200"
          style={lockH ? { minHeight: lockH } : undefined}
        >
          {/* single, translucent loading overlay */}
          {loading && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm pointer-events-none"
              style={{ background: "rgba(255,255,255,0.6)" }}
            >
              <span className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              variants={fade}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.25 }}
            >
              {error ? (
                <p className="py-20 text-center text-red-600">{error}</p>
              ) : !loading && posts.length === 0 ? (
                <p className="py-20 text-center">
                  Немає постів у вибраних категоріях.
                </p>
              ) : (
                <>
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-3 md:gap-6 space-y-6">
                    {posts.map((p) => (
                      <PostMasonryCard key={p.id} post={p} />
                    ))}
                  </div>

                  {hasMore && !loading && (
                    <div className="mt-10 text-center">
                      <button
                        onClick={loadNextPage}
                        className="px-6 py-3 text-xl font-semibold text-white rounded-full"
                        style={{ backgroundColor: "#DEAA79" }}
                      >
                        Більше дописів
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}