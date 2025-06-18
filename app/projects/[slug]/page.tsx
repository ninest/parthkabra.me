import { ContentLayout } from "@/app/_components/layouts/content-layout";
import { Navbar } from "@/app/_components/navbar";
import { createOgImageUrl } from "@/app/api/og/og-functions";
import { getAllProjects, getProject } from "@/modules/keystatic";
import { formatDateMonthYear } from "@/utils/date";
import { Metadata } from "next";

interface Params {
  params: Promise<{ cat: string; slug: string }>;
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = await getProject(params.slug);
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      images: [{ url: createOgImageUrl({ title: post.title, color: `${post.color}20` }) }],
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllProjects();

  return posts.map((post) => {
    return { slug: post.slug };
  });
}

export default async function ProjectPage(props: Params) {
  const params = await props.params;
  const projectPost = await getProject(params.slug);

  return (
    <ContentLayout
      navbarSlot={<Navbar crumbs={[{ title: "Projects", href: `/projects` }]} />}
      bannerColor={projectPost.color}
      icon={projectPost.icon}
      title={projectPost.title}
      description={
        <>
          {formatDateMonthYear(new Date(projectPost.createdAt))} | {projectPost.description}
        </>
      }
      links={projectPost.links}
      keystaticContent={await projectPost.content()}
    />
  );
}
