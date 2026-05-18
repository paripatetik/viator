import { notFound } from "next/navigation";
import PostPageClient from "@/components/pages/PostPageClient";
import { getPostBySlug, getAllSlugs } from "@/lib/api/rest";
import { absoluteUrl, siteName } from "@/lib/seo";

export const revalidate = 600;
export const dynamicParams = true;

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
  const description =
    stripHtml(post.excerpt?.rendered || post.content?.rendered || "")
      .slice(0, 160) || "Допис Viator про філософію, науку та культуру.";
  const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const author = post._embedded?.author?.[0]?.name;
  const path = `/posts/${post.slug || slug}`;
  const url = absoluteUrl(path);
  const imageUrl = image ? absoluteUrl(image) : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    authors: author ? [{ name: author }] : [{ name: siteName }],
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "article",
      locale: "uk_UA",
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: author ? [author] : [siteName],
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
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
