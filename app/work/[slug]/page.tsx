import { ContentLayout } from "@/app/_components/layouts/content-layout";
import { Navbar } from "@/app/_components/navbar";
import { getWork } from "@/modules/keystatic";
import { getStartEndDateString } from "@/utils/date";

interface Params {
  params: { slug: string };
}

export async function generateMetadata({ params }: Params) {
  const post = await getWork(params.slug);
  return {
    title: post.title,
  };
}

export default async function WorkPage({ params }: Params) {
  const workPost = await getWork(params.slug);

  let dateString = getStartEndDateString(
    new Date(workPost.date.start),
    workPost.date.end ? new Date(workPost.date.end) : null
  );

  return (
    <>
      <main>
        <Navbar crumbs={[{ title: "Work", href: `/work` }]} />
        <ContentLayout
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
      </main>
    </>
  );
}
