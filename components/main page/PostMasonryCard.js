"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

function readTime(html = "") {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  return Math.max(1, Math.ceil(text.split(" ").length / 200));
}

export default function PostMasonryCard({ post, index = 0 }) {
  const img =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/fallback.jpg";

  const categories = (post._embedded?.["wp:term"]?.[0] || [])
    .map((t) => t?.name)
    .filter(Boolean);

  const author = post._embedded?.author?.[0]?.name;

  const excerpt = post.excerpt?.rendered
    ?.replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const minutes = Number(post.reading_time) || readTime(post.content?.rendered);

  const prefersReducedMotion = useReducedMotion();
  const dir = index % 2 === 0 ? -1 : 1;

  const card = {
    hidden: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir * 12,
      y: prefersReducedMotion ? 0 : 6,
      scale: prefersReducedMotion ? 1 : 0.995,
      filter: prefersReducedMotion ? "none" : "blur(1px)",
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.85, ease: [0.22, 0.61, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={card}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -10% 0px" }}
      className="break-inside-avoid mb-6"
    >
      <Link href={`/posts/${post.slug}`} className="group block">
        <article className="rounded-2xl overflow-hidden shadow-md ring-1 ring-slate-200 hover:shadow-xl transition-shadow duration-300 bg-white">

          {/* Image — natural height, no crop */}
          <div className="w-full overflow-hidden">
            <Image
              src={img}
              alt={post.title.rendered}
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Text block */}
          <div className="p-5 space-y-2">

            {/* Title */}
            <h3
              className="text-lg font-bold leading-snug text-slate-900 group-hover:text-viator-deep transition-colors duration-200"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Accent line */}
            <div className="w-10 h-[3px] rounded-full bg-viator-sky" />

            {excerpt && (
              <p className="text-slate-600 text-sm leading-relaxed pt-1">
                {excerpt}
              </p>
            )}

            {/* Category pills — below text, warm yellow */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map((name) => (
                  <span
                    key={name}
                    className="inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-viator-cream text-viator-category border border-viator-sun/40"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Clock size={13} />
                <span>{minutes} хв</span>
              </div>
              {author && (
                <div className="flex items-center gap-1">
                  <User size={13} />
                  <span>{author}</span>
                </div>
              )}
            </div>

          </div>
        </article>
      </Link>
    </motion.div>
  );
}
