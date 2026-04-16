import { notFound } from "next/navigation";
import PostPageClient from "@/components/pages/PostPageClient";
import { getPostBySlug, getAllSlugs } from "@/lib/api/rest";

export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Допис не знайдено",
    };
  }

  const title = stripHtml(post.title?.rendered || "Допис");
  const description = stripHtml(post.excerpt?.rendered || "").slice(0, 160);
  const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function PostRoute({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return <PostPageClient post={post} />;
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
