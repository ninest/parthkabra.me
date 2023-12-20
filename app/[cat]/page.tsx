import { Navbar } from "@/app/_components/navbar";
import { PostsList } from "@/app/_components/post";
import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { getAllCategories, getAllPosts } from "@/modules/keystatic";
import { cn } from "@/utils/style";
import Link from "next/link";

export const dynamic = "force-static";

interface Params {
  params: { cat: string };
}

export async function generateStaticParams() {
  const categories = [{ slug: "all" }, ...(await getAllCategories())];

  return categories.map((category) => {
    return { cat: category.slug };
  });
}

export default async function PostsPage({ params }: Params) {
  const posts = await getAllPosts();

  const categories = [{ title: "All", slug: "all" }, ...(await getAllCategories())];
  const filteredPosts =
    params.cat === "all"
      ? posts
      : posts.filter((post) => post.slug.startsWith(params.cat) || post.alternateCategories.includes(params.cat));

  return (
    <>
      <Navbar />

      <Spacer className="h-8" />

      <main className="space-x">
        <h1 className="text-5xl font-bold">Articles</h1>
        <Spacer className="h-8" />

        <div className="md:-mx-4 flex flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.slug}
              asChild
              variant={params.cat === category.slug ? "default" : "outline"}
              className={cn("mr-2 mb-2")}
            >
              <Link href={`/${category.slug}`}>{category.title}</Link>
            </Button>
          ))}
        </div>

        <Spacer className="h-10" />

        <PostsList posts={filteredPosts} />

        <Spacer className="h-28" />
      </main>
    </>
  );
}
