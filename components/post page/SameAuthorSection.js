import "server-only";

import RelatedPostCard from './RelatedPostCard';
import { getPostsByAuthorMeta } from '@/lib/api/rest';
import { layoutStyles } from "@/lib/styles";

export default async function SameAuthorSection({ authorId, excludeId }) {
  if (!authorId) return null;

  let posts;
  try {
    const { data } = await getPostsByAuthorMeta(authorId, 3, { exclude: excludeId });
    posts = data;
  } catch (error) {
    console.error("Could not load related posts by author:", error);
    return null;
  }
  if (posts.length < 2) return null;

  return (
    <section className="pb-6 pt-4">
      <div className={layoutStyles.pageCompact}>
        <div className="mx-auto max-w-5xl border-t border-[#94B4C1]/45 pt-7">
          <h2 className="mb-4 text-[1.25rem] font-semibold text-[#1E2A32]">
            Інші дописи автора
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {posts.slice(0, 4).map((p) => (
              <RelatedPostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
