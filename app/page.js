import Banner from "@/components/main page/Banner";
import PostsCubeCarousel from "@/components/main page/PostCubeCarousel";
import CategorySection from "@/components/main page/CategorySection";
import { getPosts, getAllCategories } from "@/lib/api/rest";

export const revalidate = 600;

export const metadata = {
  title: "Блог Viator",
  description: "Наші розвідки про філософію, науку та культуру.",
};

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
