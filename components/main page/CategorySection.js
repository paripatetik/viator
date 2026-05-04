"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import usePostsByCategories from "@/lib/hooks/usePostsByCategories";
import CategoryPicker from "./CategoryPicker";
import PostMasonryCard from "./PostMasonryCard";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { layoutStyles } from "@/lib/styles";

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
  const [displayPosts, setDisplayPosts] = useState(posts);
  const [lockH, setLockH] = useState(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (loading && gridRef.current) {
      setLockH(gridRef.current.offsetHeight);
      return;
    }

    setDisplayPosts((prev) => {
      if (prev.length === 0) return posts;

      const nextById = new Map(posts.map((post) => [post.id, post]));
      const kept = prev
        .filter((post) => nextById.has(post.id))
        .map((post) => nextById.get(post.id));
      const keptIds = new Set(kept.map((post) => post.id));
      const appended = posts.filter((post) => !keptIds.has(post.id));

      return [...kept, ...appended];
    });
    setLockH(null);
  }, [loading, posts]);

  /* -------- toggle helper for chips ------------------------- */
  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      return id === "all"
        ? new Set()
        : (next.has(id) ? (next.delete(id), next) : (next.add(id), next));
    });
  }

  /* ---------------------------- UI -------------------------- */
  return (
<section className="pb-6 overflow-visible">
  <div className={`${layoutStyles.pageCompact} overflow-visible`}>
    <SectionHeading className="mb-6 mt-6 md:mt-12 text-[#416472]">
      Наші Розвідки
    </SectionHeading>

    {/* chips: top buffer so hover lift doesn't get clipped */}
    <div className="relative z-20 overflow-visible pt-4 -mt-4 pb-2">
      <CategoryPicker categories={cats} selected={selected} onToggle={toggle} />
    </div>

    {/* grid wrapper */}
    <div
      ref={gridRef}
      className="relative transition-[min-height] duration-200"
      style={lockH ? { minHeight: lockH } : undefined}
    >
      <div
        className="mb-4 flex h-5 justify-center"
        aria-hidden={!loading || displayPosts.length === 0}
      >
        <span
          className={`w-5 h-5 border-2 border-[#416472] border-t-transparent rounded-full transition-opacity ${
            loading && displayPosts.length > 0 ? "animate-spin opacity-100" : "opacity-0"
          }`}
        />
      </div>

        <motion.div
          variants={fade}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.25 }}
        >
          {error ? (
            <p className="py-20 text-center text-red-600">{error}</p>
          ) : loading && displayPosts.length === 0 ? (
            <div className="py-20 flex justify-center">
              <span className="w-6 h-6 border-2 border-[#416472] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !loading && displayPosts.length === 0 ? (
            <p className="py-20 text-center">Немає постів у вибраних категоріях.</p>
          ) : (
            <>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-3 md:gap-6 space-y-6">
                {displayPosts.map((p, i) => (
                  <PostMasonryCard key={p.id} post={p} index={i} />
                ))}
              </div>

              {hasMore && !loading && (
                <div className="mt-10 text-center">
                  <Button
                    variant="loadMore"
                    onClick={loadNextPage}
                  >
                    Більше дописів
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
    </div>
  </div>
</section>
  );
}
