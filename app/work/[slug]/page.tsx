import { ContentLayout } from "@/app/_components/layouts/content-layout";
import { Navbar } from "@/app/_components/navbar";
import { createOgImageUrl } from "@/app/api/og/og-functions";
import { getAllWork, getWork } from "@/modules/keystatic";
import { getStartEndDateString } from "@/utils/date";
import { Metadata } from "next";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Params):Promise<Metadata> {
  const params = await props.params;
  const post = await getWork(params.slug);
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      images: [{ url: createOgImageUrl({ title: post.title, color: `${post.color}35` }) }],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllWork();

  return posts.map((post) => {
    return { slug: post.slug };
  });
}

export default async function WorkPage(props: Params) {
  const params = await props.params;
  const workPost = await getWork(params.slug);

  let dateString = getStartEndDateString(
    new Date(workPost.date.start),
    workPost.date.end ? new Date(workPost.date.end) : null
  );

  return (
    <ContentLayout
      navbarSlot={<Navbar crumbs={[{ title: "Work", href: `/work` }]} />}
      bannerColor={workPost.color}
      icon={workPost.icon}
      title={workPost.title}
      description={
        <>
          {dateString} | {workPost.description} | {workPost.location}
        </>
      }
      links={workPost.links}
      keystaticContent={await workPost.content()}
    />
  );
}
