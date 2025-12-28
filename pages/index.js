import Banner from "@/components/main page/Banner";
import PostsCubeCarousel from "@/components/main page/PostCubeCarousel";
import CategorySection from "@/components/main page/CategorySection";
import { getPosts, getAllCategories } from "@/lib/api/rest";

export async function getStaticProps() {
  const [posts, categories] = await Promise.all([
    getPosts(8),        // first 8 for the carousel
    getAllCategories(),
  ]);

  return {
    props: { posts, categories },
    revalidate: 600,
  };
}

export default function Home({ posts, categories }) {
  return (
    <>
      <Banner
        title="Блог Viator"
        subtitle="Наші розвідки про філософію, науку та культуру"
        imgSrc="/imgs/banner.jpg"
      />

      <PostsCubeCarousel posts={posts} />
      <CategorySection categories={categories} initialPosts={posts} />
    </>
  );
}