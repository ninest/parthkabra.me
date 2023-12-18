import { ContentLayout } from "@/app/_components/layouts/content-layout";
import { Navbar } from "@/app/_components/navbar";
import { getMetaPost } from "@/modules/keystatic";

interface Params {
  params: { cat: string; slug: string };
}

export async function generateMetadata({ params }: Params) {
  const post = await getMetaPost(params.slug);
  return {
    title: post.title,
  };
}

export default async function WorkPage({ params }: Params) {
  const post = await getMetaPost(params.slug);

  return (
    <>
      <main>
        <Navbar />
        <ContentLayout
          bannerColor={post.color}
          icon={post.icon}
          title={post.title}
          description={<>{post.description}</>}
          links={post.links}
          keystaticContent={await post.content()}
        />
      </main>
    </>
  );
}
