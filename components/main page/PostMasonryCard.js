// components/PostMasonryCard.js
import Link from "next/link";
import Image from "next/image";
import { Clock, Tag, User } from "lucide-react";

// Word-count fallback (200 wpm), used only if reading_time is missing
function readTime(html = "") {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  return Math.max(1, Math.ceil(text.split(" ").length / 200));
}

export default function PostMasonryCard({ post }) {
  const img =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/fallback.jpg";

  // ← multiple categories, joined with commas
  const categoryLabel = (() => {
    const names =
      (post._embedded?.["wp:term"]?.[0] || [])
        .map((t) => t?.name)
        .filter(Boolean);
    return names.length ? names.join(", ") : "Без категорії";
  })();

  const author = post._embedded?.author?.[0]?.name;

  const excerpt = post.excerpt?.rendered
    ?.replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const minutes =
    Number(post.reading_time) || readTime(post.content?.rendered);

  return (
    <article className="break-inside-avoid mb-6 shadow-lg rounded-lg overflow-hidden ring-1 ring-slate-200 hover:scale-[1.015] transition-transform">
      {/* ── image ─ */}
      <Link href={`/posts/${post.slug}`}>
        <Image
          src={img}
          alt={post.title.rendered}
          width={600}
          height={400}
          className="w-full h-auto object-cover"
        />
      </Link>

      {/* ── text block ─ */}
      <div className=" p-5 space-y-3 ">
        <Link href={`/posts/${post.slug}`}>
          <h3
            className="text-xl font-semibold leading-snug uppercase p-2 bg-[#f7e7d7]/70 text-black text-center mb-2"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </Link>

        {excerpt && (
          <p
            className="text-slate-700 leading-snug text-pretty"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        )}

        {/* meta column */}
        <div className="flex flex-col gap-1 pt-3 border-t border-slate-200">
          <Meta icon={<Clock size={16} />} label={`${minutes} хв`} />
          <Meta icon={<Tag size={16} />} label={categoryLabel} />
          {author && <Meta icon={<User size={16} />} label={author} />}
        </div>
      </div>
    </article>
  );
}

function Meta({ icon, label }) {
  return (
    <span className="flex items-center gap-2 text-xs text-slate-600">
      {icon}
      {label}
    </span>
  );
}