import { CollectionsSidebarContent } from "@/app/_components/collections-sidebar-content";
import { ContentLayout } from "@/app/_components/layouts/content-layout";
import { Navbar } from "@/app/_components/navbar";
import { Sidebar } from "@/app/_components/sidebar";
import { getCategory, getPost, getPostCollections, reader } from "@/modules/keystatic";
import { formatDateMonthYear } from "@/utils/date";

interface Params {
  params: { cat: string; slug: string };
}

export async function generateMetadata({ params }: Params) {
  const post = await getPost(params.cat, params.slug);
  return {
    title: post.title,
  };
}

export default async function PostComponent({ params }: Params) {
  const post = await getPost(params.cat, params.slug);
  const category = await getCategory(params.cat);

  // Collection
  const collections = await getPostCollections(params.cat, params.slug);

  console.log(collections)

  return (
    <>
      <main className="flex">
        <Sidebar>
          <CollectionsSidebarContent collections={collections} />
        </Sidebar>
        <div className="flex-1">
          <Navbar
            crumbs={[{ title: category.title, href: `/${category.slug}` }]}
            showSidebarToggle={collections.length > 0}
          />
          <ContentLayout
            bannerColor={post.color}
            icon={post.icon}
            title={post.title}
            description={
              <>
                {formatDateMonthYear(new Date(post.createdAt))} | {post.description}
              </>
            }
            links={post.links}
            keystaticContent={await post.content()}
          />
        </div>
      </main>
    </>
  );
}
