import Image from "next/image";
import Link from "next/link";
import { inter } from "@/lib/fonts";

export default function RelatedPostCard({ post }) {
  const img =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/fallback.jpg";

  const category = (post._embedded?.["wp:term"]?.[0] || [])
    .map((term) => term?.name)
    .filter(Boolean)[0];

  const date = post.date
    ? new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(post.date))
    : null;

  return (
    <Link href={`/posts/${post.slug}`} className={`${inter.className} group block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#416472]`}>
      <article className="grid h-full grid-cols-[72px_minmax(0,1fr)] items-start gap-3 rounded-lg border border-[#94B4C1]/50 bg-[#F1F5F4] p-3 transition-colors duration-200 hover:border-[#416472]/55 hover:bg-[#EAF1F3] sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-4 sm:p-4">
        <div className="relative aspect-square overflow-hidden rounded-md bg-[#DCE6E8]">
          <Image
            src={img}
            alt=""
            fill
            sizes="(min-width: 640px) 96px, 72px"
            className="object-cover object-center saturate-[0.9] transition-transform duration-500 group-hover:scale-[1.035]"
          />
        </div>

        <div className="min-w-0">
          {category && (
            <div className="mb-1.5 text-[11px] font-medium leading-snug text-[#416472]">
              {category}
            </div>
          )}
          <h3
            className="break-words text-[16px] font-medium leading-[1.4] text-[#1E2A32] transition-colors group-hover:text-[#0F3B57] sm:text-[18px]"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          {date && (
            <time className="mt-2 block text-[11px] leading-normal text-[#59656D]" dateTime={post.date}>
              {date}
            </time>
          )}
        </div>
      </article>
    </Link>
  );
}
