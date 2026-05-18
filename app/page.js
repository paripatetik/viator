import Banner from "@/components/main page/Banner";
import PostsCubeCarousel from "@/components/main page/PostCubeCarousel";
import CategorySection from "@/components/main page/CategorySection";
import { getPosts, getAllCategories } from "@/lib/api/rest";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export const metadata = pageMetadata({
  title: "Блог Viator",
  description:
    "Розвідки Viator про філософію, науку, культуру та історію думки українською.",
  path: "/",
  image: "/imgs/banner.jpg",
});

export default async function Home() {
  const [posts, categories] = await Promise.all([
    getPosts(8),
    getAllCategories(),
  ]);

  return (
    <>
      <Banner
        title="Блог Viator"
        subtitle="Наші розвідки про філософію, науку та культуру"
        imgSrc="/imgs/banner.jpg"
      />

      <div>
        <PostsCubeCarousel posts={posts} />
        <CategorySection categories={categories} initialPosts={posts} />
      </div>
    </>
  );
}
