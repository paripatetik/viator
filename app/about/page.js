import AboutPageClient from "@/components/pages/AboutPageClient";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Про нас",
  description:
    "Команда Viator, наші засади та підхід до філософського, наукового й культурного контенту.",
  path: "/about",
  image: "/imgs/banner-about.png",
});

export default function AboutPage() {
  return <AboutPageClient />;
}
