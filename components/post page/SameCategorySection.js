import React from 'react'; 
import usePostsByCategories from '@/lib/hooks/usePostsByCategories';
import PostMasonryCard from '../main page/PostMasonryCard';

export default function SameCategorySection({ categoryId, excludeId }) {
  // reuse your paginated hook but set perPage=3 and no chips/UI
  const { posts, loading, error } = usePostsByCategories(
    [categoryId],
    3        // perPage
  );

  // weed out the current post if the API didn’t
  const filtered = posts.filter((p) => p.id !== excludeId);

  if (error || (!loading && filtered.length === 0)) return null;

  return (
    <section className="pb-6">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center uppercase tracking-wider pb-10">
          Схожі дописи за темою
        </h2>

        {loading ? (
          <p className="py-12 text-center">Завантаження…</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PostMasonryCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
