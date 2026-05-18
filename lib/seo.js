export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://viator.com.ua"
).replace(/\/$/, "");

export const siteName = "Viator";
export const defaultOgImage = "/imgs/banner.jpg";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path = "/",
  image = defaultOgImage,
  type = "website",
}) {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type,
      locale: "uk_UA",
      images: image ? [{ url: absoluteUrl(image) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [absoluteUrl(image)] : undefined,
    },
  };
}
