import { useRef, useCallback, useEffect } from 'react';
import Image                   from 'next/image';
import clsx                    from 'clsx';

import { getPostBySlug, getAllSlugs }       from '@/lib/api/rest';
import { useHeaderHeight }                  from '@/lib/hooks/useHeaderHeight';
import { usePostContent }                   from '@/lib/hooks/usePostContent';
import { useScrollProgress }                from '@/lib/hooks/useScrollProgress';

import { Hero }            from '@/components/post page/Hero';
import { TocCard }         from '@/components/post page/TocCard';
import { ProgressCircle }  from '@/components/post page/ProgressCircle';
import SameAuthorSection   from '@/components/post page/SameAuthorSection';
import SameCategorySection from '@/components/post page/SameCategorySection';

import useCitations from '@/lib/hooks/UseCitations';

import {inter, playfair, garamond} from '@/lib/fonts';

/* ── SSG helpers ───────────────────────────────────────────── */
export async function getStaticPaths() {
  const slugs = await getAllSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { notFound: true };
  return { props: { post }, revalidate: 600 };
}

/* ── Page component ────────────────────────────────────────── */
export default function PostPage({ post }) {
  /* dynamic hooks */
  const headerH     = useHeaderHeight();
  const articleRef  = useRef(null);
  const { html, toc, readingTime } = usePostContent(post.content.rendered);
  const progress    = useScrollProgress(articleRef);
  
  // Track the scroll listener reference
  const scrollListenerRef = useRef(null);
  
  /* meta extracted from WP payload */
  const title    = post.title.rendered;
  const img      = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/fallback.jpg';
  const date     = new Date(post.date).toLocaleDateString('uk-UA');
  const author   = post._embedded?.author?.[0]?.name;
  const epigraph = post.acf?.epigraph || '';

  const postId     = post.id;          // numeric ID
  const slug       = post.slug;        // "human" slug
  const authorId   = post.author;      // numeric author ID
  const primaryCat = post.categories?.[0]; // first category ID (adjust as needed)

  // Cleanup on unmount or page change
  useEffect(() => {
    return () => {
      const btn = document.getElementById("viator-cite-back");
      btn?.remove();
      if (scrollListenerRef.current) {
        window.removeEventListener('scroll', scrollListenerRef.current);
        scrollListenerRef.current = null;
      }
    };
  }, []);

  /* scroll helper for ToC */
  const scrollToHeading = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Clean up any existing listener first
    if (scrollListenerRef.current) {
      window.removeEventListener('scroll', scrollListenerRef.current);
      scrollListenerRef.current = null;
    }

    // Store the current position
    const prevY = window.scrollY || window.pageYOffset || 0;
    
    // Create or update the back button
    let btn = document.getElementById("viator-cite-back");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "viator-cite-back";
      btn.type = "button";
      btn.textContent = "↑";
      btn.setAttribute("aria-label", "Повернутися нагору");
      btn.style.cssText = [
        "position:fixed","bottom:16px","right:16px","z-index:9999",
        "width:40px","height:40px","border:none","border-radius:9999px",
        "background:#94B4C1","color:#000","font-weight:700",
        "font-size:20px","line-height:40px","text-align:center",
        "box-shadow:0 6px 18px rgba(0,0,0,.25)","cursor:pointer",
      ].join(";");
      document.body.appendChild(btn);
    }

    const removeButton = () => {
      const button = document.getElementById("viator-cite-back");
      button?.remove();
      if (scrollListenerRef.current) {
        window.removeEventListener('scroll', scrollListenerRef.current);
        scrollListenerRef.current = null;
      }
    };

    // Scroll to the heading first
    const cssVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-offset");
    const headerOffset = parseFloat(cssVar) || (headerH + 16);
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: y, behavior: "smooth" });

    // Wait for scroll to complete, then start tracking
    setTimeout(() => {
      const startY = window.scrollY;
      
      // Remove button if user scrolls 300px in any direction
      const scrollHandler = () => {
        const currentY = window.scrollY;
        if (Math.abs(currentY - startY) > 300) {
          removeButton();
        }
      };

      scrollListenerRef.current = scrollHandler;
      window.addEventListener('scroll', scrollHandler, { passive: true });
    }, 800); // Wait for smooth scroll to finish

    // Click handler to go back
    btn.onclick = () => {
      window.scrollTo({ top: prevY, behavior: "smooth" });
      removeButton();
    };
  }, [headerH]);

  /* ── render ─────────────────────────────────────────────── */
  return (
    <>
      {/* full-width banner lives here */}
      <Hero
        title={title} img={img} author={author}
        date={date} readingTime={readingTime}
        headerH={headerH} epigraph={epigraph}
      />

      {/* rest of the page inside normal container */}
      <main className="container mx-auto px-6 lg:px-10 pb-10 pt-7
                     flex flex-col min-[900px]:flex-row gap-10 justify-center">
        <TocCard toc={toc} onSelect={scrollToHeading} />
        <article
          ref={articleRef}
          className={`${garamond.className} flex-1 prose max-w-5xl text-[19px] lg:text-[23px] text-black
                     prose-img:max-w-full prose-img:h-auto prose-pre:overflow-x-auto
                     prose-code:break-words break-words leading-8 text-justify prose-p:mt-2 prose-p:mb-3`} 
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>

      <ProgressCircle progress={progress} />

      <SameAuthorSection   authorId={authorId}   excludeId={postId} />
      <SameCategorySection categoryId={primaryCat} excludeId={postId} />
    </>
  );
}