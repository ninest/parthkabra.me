import { ContentLayout } from "@/app/_components/layouts/content-layout";
import { Navbar } from "@/app/_components/navbar";
import { createOgImageUrl } from "@/app/api/og/og-functions";
import { getMetaPost, getMetaPosts } from "@/modules/keystatic";
import { Metadata } from "next";

interface Params {
  params: Promise<{ cat: string; slug: string }>;
}

export async function generateMetadata(props: Params):Promise<Metadata> {
  const params = await props.params;
  const post = await getMetaPost(params.slug);
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      images: [{ url: createOgImageUrl({ title: post.title, color: `${post.color}20` }) }],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getMetaPosts();

  return posts.map((post) => {
    return { slug: post.slug };
  });
}

export default async function WorkPage(props: Params) {
  const params = await props.params;
  const post = await getMetaPost(params.slug);

  return (
    <ContentLayout
      navbarSlot={<Navbar />}
      bannerColor={post.color}
      icon={post.icon}
      title={post.title}
      description={<>{post.description}</>}
      links={post.links}
      keystaticContent={await post.content()}
    />
  );
}
