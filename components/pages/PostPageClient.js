"use client";

import { useRef, useCallback, useEffect } from "react";

import { useHeaderHeight } from "@/lib/hooks/useHeaderHeight";
import { usePostContent } from "@/lib/hooks/usePostContent";

import { Hero } from "@/components/post page/Hero";
import { TocCard } from "@/components/post page/TocCard";
import { ArticleProgressCircle } from "@/components/post page/ProgressCircle";
import SameAuthorSection from "@/components/post page/SameAuthorSection";
import SameCategorySection from "@/components/post page/SameCategorySection";

import { garamond } from "@/lib/fonts";
import { cn, layoutStyles } from "@/lib/styles";

export default function PostPageClient({ post }) {
  const headerH = useHeaderHeight();
  const articleRef = useRef(null);
  const { html, toc, readingTime } = usePostContent(post.content.rendered);
  const scrollListenerRef = useRef(null);

  const title = post.title.rendered;
  const img =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/fallback.jpg";
  const date = new Date(post.date).toLocaleDateString("uk-UA");
  const author = post._embedded?.author?.[0]?.name;
  const category = post._embedded?.["wp:term"]
    ?.flat()
    ?.find((term) => term?.taxonomy === "category")?.name;
  const epigraph = post.acf?.epigraph || "";
  const epigraphParts = epigraph
    .replace(/\r\n/g, "\n")
    .split(/<\/?br\s*\/?>|\n+/i);
  const epigraphQuote = epigraphParts[0]?.trim() || "";
  const epigraphSource = epigraphParts.slice(1).join(" ").trim();

  const postId = post.id;
  const authorId = post.author;
  const primaryCat = post.categories?.[0];

  useEffect(() => {
    return () => {
      const btn = document.getElementById("viator-cite-back");
      btn?.remove();
      if (scrollListenerRef.current) {
        window.removeEventListener("scroll", scrollListenerRef.current);
        scrollListenerRef.current = null;
      }
    };
  }, []);

  const scrollToHeading = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (scrollListenerRef.current) {
      window.removeEventListener("scroll", scrollListenerRef.current);
      scrollListenerRef.current = null;
    }

    const prevY = window.scrollY || window.pageYOffset || 0;

    let btn = document.getElementById("viator-cite-back");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "viator-cite-back";
      btn.type = "button";
      btn.textContent = "↑";
      btn.setAttribute("aria-label", "Повернутися нагору");
      btn.style.cssText = [
        "position:fixed",
        "bottom:16px",
        "right:16px",
        "z-index:9999",
        "width:40px",
        "height:40px",
        "border:none",
        "border-radius:9999px",
        "background:var(--color-viator-sky)",
        "color:#000",
        "font-weight:700",
        "font-size:20px",
        "line-height:40px",
        "text-align:center",
        "box-shadow:0 6px 18px rgba(0,0,0,.25)",
        "cursor:pointer",
      ].join(";");
      document.body.appendChild(btn);
    }

    const removeButton = () => {
      const button = document.getElementById("viator-cite-back");
      button?.remove();
      if (scrollListenerRef.current) {
        window.removeEventListener("scroll", scrollListenerRef.current);
        scrollListenerRef.current = null;
      }
    };

    const cssVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-offset");
    const headerOffset = parseFloat(cssVar) || headerH + 16;
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: y, behavior: "smooth" });

    setTimeout(() => {
      const startY = window.scrollY;

      const scrollHandler = () => {
        const currentY = window.scrollY;
        if (Math.abs(currentY - startY) > 300) {
          removeButton();
        }
      };

      scrollListenerRef.current = scrollHandler;
      window.addEventListener("scroll", scrollHandler, { passive: true });
    }, 800);

    btn.onclick = () => {
      window.scrollTo({ top: prevY, behavior: "smooth" });
      removeButton();
    };
  }, [headerH]);

  return (
    <>
      <Hero
        title={title}
        img={img}
        author={author}
        date={date}
        category={category}
        readingTime={readingTime}
        headerH={headerH}
      />

      <main
        className={cn(
          layoutStyles.page,
          "pb-10 pt-8 md:pt-10"
        )}
      >
        {epigraph && (
          <div className="mb-7 flex flex-col min-[900px]:flex-row min-[900px]:gap-7 min-[900px]:justify-center">
            <div className="hidden min-[900px]:block w-[220px] shrink-0" />
            <blockquote
              className={`${garamond.className} flex-1 max-w-5xl border-y border-[#B9CBD3] px-3 py-4 text-center text-[21px] leading-[1.5] text-[#1E2A32] md:text-[24px]`}
            >
              <span
                className="italic"
                dangerouslySetInnerHTML={{ __html: epigraphQuote }}
              />
              {epigraphSource && (
                <span
                  className="mt-4 block not-italic"
                  dangerouslySetInnerHTML={{ __html: epigraphSource }}
                />
              )}
            </blockquote>
          </div>
        )}

        <div className="flex flex-col min-[900px]:flex-row min-[900px]:gap-7 justify-center">
          <TocCard toc={toc} onSelect={scrollToHeading} />
          <article
            ref={articleRef}
            className={`${garamond.className} viator-post-article w-full min-w-0 flex-1 prose max-w-[780px] text-[21px] md:text-[22px] lg:text-[23px] text-[#18242C]
                       prose-img:max-w-full prose-img:h-auto prose-pre:overflow-x-auto
                       prose-code:break-words break-words leading-[1.8] lg:leading-[1.78] text-pretty prose-p:my-[0.95em] mt-[22px] min-[900px]:mt-[39px]`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </main>

      <ArticleProgressCircle targetRef={articleRef} />

      <SameAuthorSection authorId={authorId} excludeId={postId} />
      <SameCategorySection categoryId={primaryCat} excludeId={postId} />
    </>
  );
}
