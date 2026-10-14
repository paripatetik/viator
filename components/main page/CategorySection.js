"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

import usePostsByCategories from "@/lib/hooks/usePostsByCategories";
import usePageReady from "@/lib/hooks/usePageReady";
import CategoryPicker from "./CategoryPicker";
import PostMasonryCard from "./PostMasonryCard";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { layoutStyles } from "@/lib/styles";

const fade = { hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } };
const PER_PAGE = 10; // ask WP for 10 posts per page

function useMasonryColumnCount() {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const md = window.matchMedia("(min-width: 768px)");
    const lg = window.matchMedia("(min-width: 1024px)");

    const sync = () => {
      if (lg.matches) {
        setColumnCount(3);
      } else if (md.matches) {
        setColumnCount(2);
      } else {
        setColumnCount(1);
      }
    };

    const addListener = (media) => {
      if (media.addEventListener) {
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
      }

      media.addListener(sync);
      return () => media.removeListener(sync);
    };

    sync();
    const removeMd = addListener(md);
    const removeLg = addListener(lg);

    return () => {
      removeMd();
      removeLg();
    };
  }, []);

  return columnCount;
}

export default function CategorySection({ categories = [], initialPosts = [] }){ 
  /* -------- category chips ---------------------------------- */
  const cats = categories.filter((c) => c.count > 0);
  const [selected, setSelected] = useState(new Set()); // empty ⇒ “all”
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  /* -------- paginated posts --------------------------------- */
const {
  posts,
  loading: fetching,
  error,
  loadNextPage,
  hasMore,
} = usePostsByCategories([...selected], PER_PAGE, initialPosts, searchQuery);
  const loading = fetching || searchInput.trim() !== searchQuery;
  const [displayPosts, setDisplayPosts] = useState(posts);
  const [lockH, setLockH] = useState(null);
  const gridRef = useRef(null);
  const animationReady = usePageReady(220);
  const columnCount = useMasonryColumnCount();
  const postColumns = useMemo(() => {
    const columns = Array.from({ length: columnCount }, () => []);

    displayPosts.forEach((post, index) => {
      columns[index % columnCount].push({ post, index });
    });

    return columns;
  }, [columnCount, displayPosts]);

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

    <form
      role="search"
      aria-label="Пошук дописів"
      className="mx-auto mb-3 w-full max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();
        setSearchQuery(searchInput.trim());
      }}
    >
      <label htmlFor="post-search" className="sr-only">Пошук за заголовком або уривком</label>
      <div className="relative">
        <Search aria-hidden="true" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#416472]" />
        <input
          ref={searchInputRef}
          id="post-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Заголовок або уривок…"
          autoComplete="off"
          enterKeyHint="search"
          aria-controls="category-posts"
          className="w-full rounded-xl border border-[#AFC5CD] bg-white/85 py-3 pl-12 pr-12 text-base text-[#1E2A32] placeholder:text-[#687B84] focus:border-[#416472] focus:outline-none focus:ring-2 focus:ring-[#416472]/20 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {searchInput && (
          <button
            type="button"
            aria-label="Очистити пошук"
            onClick={() => {
              setSearchInput("");
              setSearchQuery("");
              searchInputRef.current?.focus();
            }}
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#416472] hover:bg-[#E7ECEE] focus-visible:outline-2 focus-visible:outline-[#416472]"
          >
            <X aria-hidden="true" size={19} />
          </button>
        )}
      </div>
      <p role="status" className="sr-only">
        {loading ? "Пошук дописів…" : error || `Показано дописів: ${posts.length}${hasMore ? ". Доступні інші дописи." : "."}`}
      </p>
    </form>

    {/* grid wrapper */}
    <div
      id="category-posts"
      aria-busy={loading}
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
          animate={animationReady ? "visible" : "hidden"}
          transition={{ duration: 0.25 }}
        >
          {error ? (
            <p className="py-20 text-center text-red-600">{error}</p>
          ) : loading && displayPosts.length === 0 ? (
            <div className="py-20 flex justify-center">
              <span className="w-6 h-6 border-2 border-[#416472] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !loading && displayPosts.length === 0 ? (
            <p className="py-20 text-center text-[#416472]">
              {searchQuery
                ? "Збігів не знайдено. Спробуйте інший запит або змініть рубрики."
                : "Немає дописів у вибраних рубриках."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {postColumns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex min-w-0 flex-col gap-6">
                    {column.map(({ post: p, index: i }) => (
                      <PostMasonryCard
                        key={p.id}
                        post={p}
                        index={i}
                        animationReady={animationReady}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 text-center">
                  <Button
                    variant="loadMore"
                    disabled={loading}
                    onClick={loadNextPage}
                  >
                    {loading ? "Завантаження..." : "Більше дописів"}
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
