"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { htmlToPlainText } from "@/lib/text";

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

  const excerpt = htmlToPlainText(post.excerpt?.rendered);

  const minutes = Number(post.reading_time) || readTime(post.content?.rendered);

  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const dir = index % 2 === 0 ? -1 : 1;
  const shouldReduceMotion = prefersReducedMotion || isMobile;

  const card = {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : dir * 12,
      y: prefersReducedMotion ? 0 : isMobile ? 4 : 6,
      scale: shouldReduceMotion ? 1 : 0.995,
      filter: shouldReduceMotion ? "none" : "blur(1px)",
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: isMobile ? 0.22 : 0.85,
        ease: [0.22, 0.61, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      variants={card}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: true,
        amount: isMobile ? 0.08 : 0.18,
        margin: isMobile ? "0px 0px -4% 0px" : "0px 0px -10% 0px",
      }}
      className="break-inside-avoid mb-6"
    >
      <Link href={`/posts/${post.slug}`} className="group block">
        <article className="overflow-hidden rounded-lg border border-[#AFC5CD] bg-[#FAFBF8] shadow-[0_12px_30px_rgba(30,42,50,0.11)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[#416472]/65 hover:shadow-[0_18px_38px_rgba(30,42,50,0.15)]">

          {/* Image — natural height, no crop */}
          <div className="relative w-full overflow-hidden bg-[#DCE6E8]">
            <Image
              src={img}
              alt={post.title.rendered}
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-auto w-full saturate-[0.92] transition-transform duration-700 group-hover:scale-[1.035]"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1E2A32]/14 to-transparent" />
          </div>

          {/* Text block */}
          <div className="p-5 md:p-6">
            {/* Title */}
            <h3
              className="text-[1.35rem] font-semibold leading-[1.12] text-[#1E2A32] transition-colors duration-200 group-hover:text-[#416472] md:text-[1.45rem]"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Accent line */}
            <div className="mt-4 h-px w-16 bg-[#8EB7C6]" />

            {excerpt && (
              <p className="mt-4 text-[15px] leading-7 text-[#53606A]">
                {excerpt}
              </p>
            )}

            {/* Category pills */}
            {categories.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {categories.map((name) => (
                  <span
                    key={name}
                    className="inline-block rounded-sm border border-[#B9CBD3] bg-[#EEF4F5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#416472]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#D8E3E6] pt-3 text-xs text-[#84929B]">
              <div className="flex items-center gap-1.5">
                <Clock size={13} strokeWidth={1.8} />
                <span>{minutes} хв</span>
              </div>
              {author && (
                <div className="flex min-w-0 items-center gap-1.5">
                  <User size={13} strokeWidth={1.8} />
                  <span className="truncate">{author}</span>
                </div>
              )}
            </div>

          </div>
        </article>
      </Link>
    </motion.div>
  );
}
