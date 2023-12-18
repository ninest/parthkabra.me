import { ContentLayout } from "@/app/_components/layouts/content-layout";
import { Navbar } from "@/app/_components/navbar";
import { getProject } from "@/modules/keystatic";
import { formatDateMonthYear } from "@/utils/date";

interface Params {
  params: { cat: string; slug: string };
}

export async function generateMetadata({ params }: Params) {
  const post = await getProject(params.slug);
  return {
    title: post.title,
  };
}

export default async function ProjectPage({ params }: Params) {
  const projectPost = await getProject(params.slug);

  return (
    <>
      <main>
        <Navbar crumbs={[{ title: "Projects", href: `/projects` }]} />
        <ContentLayout
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
      </main>
    </>
  );
}
