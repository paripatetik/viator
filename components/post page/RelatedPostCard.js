import Image from "next/image";
import Link from "next/link";

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
    <Link href={`/posts/${post.slug}`} className="group block">
      <article className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 rounded-lg border border-[#94B4C1]/50 bg-[#F1F5F4]/78 p-3 shadow-[0_10px_26px_rgba(30,42,50,0.06)] transition-[border-color,background-color,box-shadow] duration-200 hover:border-[#416472]/55 hover:bg-[#EAF1F3] hover:shadow-[0_14px_32px_rgba(30,42,50,0.09)] sm:grid-cols-[116px_minmax(0,1fr)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#DCE6E8]">
          <Image
            src={img}
            alt=""
            fill
            sizes="116px"
            className="object-cover object-center saturate-[0.9] transition-transform duration-500 group-hover:scale-[1.035]"
          />
        </div>

        <div className="min-w-0 self-center">
          {(category || date) && (
            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#416472]">
              {category && <span>{category}</span>}
              {category && date && <span className="text-[#94B4C1]">/</span>}
              {date && <time dateTime={post.date}>{date}</time>}
            </div>
          )}
          <h3
            className="text-[1.08rem] font-semibold leading-snug text-[#1E2A32] transition-colors group-hover:text-[#0F3B57] sm:text-[1.2rem]"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </div>
      </article>
    </Link>
  );
}
