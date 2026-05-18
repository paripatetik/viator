// components/SameAuthorSection.js
import React from 'react'; 

import RelatedPostCard from './RelatedPostCard';
import usePostsByAuthor from '@/lib/hooks/usePostsByAuthor';
import { layoutStyles } from "@/lib/styles";

export default function SameAuthorSection({ authorId, excludeId }) {
  const { posts, loading, error } = usePostsByAuthor(authorId, excludeId);

  if (error || (!loading && posts.length < 2)) return null;

  return (
    <section className="pb-6 pt-4">
      <div className={layoutStyles.pageCompact}>
        <div className="mx-auto max-w-5xl border-t border-[#94B4C1]/45 pt-7">
          <h2 className="mb-4 text-[1.25rem] font-semibold text-[#1E2A32]">
            Інші дописи автора
          </h2>

          {loading ? (
            <p className="py-8 text-center text-[#53606A]">Завантаження…</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {posts.slice(0, 4).map((p) => (
                <RelatedPostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
