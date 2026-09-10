import "server-only";
import { getPostsByCategories } from '@/lib/api/rest';
import RelatedPostCard from './RelatedPostCard';
import { layoutStyles } from "@/lib/styles";

export default async function SameCategorySection({ categoryId, excludeId }) {
  if (!categoryId) return null;

  let posts;
  try {
    posts = await getPostsByCategories([categoryId], 3);
  } catch (error) {
    console.error("Could not load related posts by category:", error);
    return null;
  }

  // weed out the current post if the API didn’t
  const filtered = posts.filter((p) => p.id !== excludeId);

  if (filtered.length < 2) return null;

  return (
    <section className="pb-6 pt-4">
      <div className={layoutStyles.pageCompact}>
        <div className="mx-auto max-w-5xl border-t border-[#94B4C1]/45 pt-7">
          <h2 className="mb-4 text-[1.25rem] font-semibold text-[#1E2A32]">
            Схожі дописи за темою
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.slice(0, 4).map((p) => (
              <RelatedPostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
