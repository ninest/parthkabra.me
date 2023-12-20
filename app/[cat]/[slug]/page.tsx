import { CollectionsSidebarContent } from "@/app/_components/collections-sidebar-content";
import { ContentLayout } from "@/app/_components/layouts/content-layout";
import { Navbar } from "@/app/_components/navbar";
import { createOgImageUrl } from "@/app/api/og/og-functions";
import { getAllPosts, getCategory, getPost, getPostCollections } from "@/modules/keystatic";
import { formatDateMonthYear } from "@/utils/date";
import { Metadata } from "next";

interface Params {
  params: { cat: string; slug: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost(params.cat, params.slug);
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      images: [{ url: createOgImageUrl({ title: post.title, color: `${post.color}20` }) }],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts({ all: true });

  return posts.map((post) => {
    const [cat, slug] = post.slug.split("/");
    return { cat, slug };
  });
}

export default async function PostComponent({ params }: Params) {
  const post = await getPost(params.cat, params.slug);
  const category = await getCategory(params.cat);

  // Collection
  const collections = await getPostCollections(params.cat, params.slug);

  return (
    <ContentLayout
      // Only show sidebar if more than one collection
      sidebarSlot={<>{collections.length > 0 && <CollectionsSidebarContent collections={collections} />}</>}
      navbarSlot={
        <Navbar
          crumbs={[{ title: category.title, href: `/${category.slug}` }]}
          showSidebarToggle={collections.length > 0}
          mobileSidebarSlot={<CollectionsSidebarContent collections={collections} />}
        />
      }
      bannerColor={post.color}
      icon={post.icon}
      draft={post.draft}
      title={post.title}
      description={
        <>
          {formatDateMonthYear(new Date(post.createdAt))} | {post.description}
        </>
      }
      links={post.links}
      keystaticContent={await post.content()}
    />
  );
}
