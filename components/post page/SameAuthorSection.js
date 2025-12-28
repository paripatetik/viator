// components/SameAuthorSection.js
import React from 'react'; 

import PostMasonryCard from '../main page/PostMasonryCard';
import usePostsByAuthor from '@/lib/hooks/usePostsByAuthor';

export default function SameAuthorSection({ authorId, excludeId }) {
  const { posts, loading, error } = usePostsByAuthor(authorId, excludeId);

  if (error || (!loading && posts.length === 0)) return null;

  return (
    <section className="pb-6">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center uppercase tracking-wider pb-10">
          Інші дописи автора
        </h2>

        {loading ? (
          <p className="py-12 text-center">Завантаження…</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostMasonryCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

