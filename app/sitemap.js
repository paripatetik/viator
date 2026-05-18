import { getAllSlugs } from "@/lib/api/rest";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap() {
  const staticRoutes = ["", "/about", "/mission", "/support"].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: new Date(),
    changeFrequency: path ? "monthly" : "weekly",
    priority: path ? 0.7 : 1,
  }));

  let postRoutes = [];
  try {
    const slugs = await getAllSlugs();
    postRoutes = slugs.map((slug) => ({
      url: absoluteUrl(`/posts/${slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    postRoutes = [];
  }

  return [...staticRoutes, ...postRoutes];
}
