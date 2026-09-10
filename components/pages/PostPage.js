import "server-only";
import { Suspense } from "react";

import { Hero } from "@/components/post page/Hero";
import { PostTableOfContents } from "@/components/post page/PostTableOfContents";
import { PostInteractions } from "@/components/post page/PostInteractions";
import SameAuthorSection from "@/components/post page/SameAuthorSection";
import SameCategorySection from "@/components/post page/SameCategorySection";
import { garamond, playfair } from "@/lib/fonts";
import { cn, layoutStyles } from "@/lib/styles";
import { getReadingTimeMinutes } from "@/lib/readingTime";
import { buildPostContent } from "@/lib/postContent/transform";
import "@/styles/post-content.css";

export default function PostPage({ post }) {
  const { html, toc } = buildPostContent(post.content.rendered, playfair.className);
  const readingTime = `${getReadingTimeMinutes(post)} хв`;
  const articleId = `post-article-${post.id}`;

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

  return (
    <>
      <Hero
        title={title}
        img={img}
        author={author}
        date={date}
        category={category}
        readingTime={readingTime}
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
          <PostTableOfContents key={postId} toc={toc} />
          <article
            id={articleId}
            className={`${garamond.className} viator-post-article w-full min-w-0 flex-1 prose max-w-[780px] text-[21px] md:text-[22px] lg:text-[23px] text-[#18242C]
                       prose-img:max-w-full prose-img:h-auto prose-pre:overflow-x-auto
                       prose-code:break-words break-words leading-[1.8] lg:leading-[1.78] text-pretty prose-p:my-[0.95em] mt-[22px] min-[900px]:mt-[39px]`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </main>

      <PostInteractions key={postId} articleId={articleId} />

      <Suspense fallback={null}>
        <SameAuthorSection authorId={authorId} excludeId={postId} />
      </Suspense>
      <Suspense fallback={null}>
        <SameCategorySection categoryId={primaryCat} excludeId={postId} />
      </Suspense>
    </>
  );
}
