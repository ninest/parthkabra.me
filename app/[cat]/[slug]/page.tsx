import { ContentLayout } from "@/app/_components/layouts/content-layout";
import { Navbar } from "@/app/_components/navbar";
import { getCategory, getPost, reader } from "@/modules/keystatic";
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

  return (
    <>
      <main>
        <Navbar crumbs={[{ title: category.title, href: `/${category.slug}` }]} />
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
      </main>
    </>
  );
}
