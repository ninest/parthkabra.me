import { allWorks, Work } from "@/.contentlayer/generated";
import { PageBar, PageTitleBanner, SmartLink, Spacer } from "@/components";
import { sortByDate } from "@/lib/content";
import { GetStaticProps } from "next";
import { NextSeo } from "next-seo";

// Subset of type work required for timeline
type WorkSubset = Pick<
  Work,
  "slug" | "title" | "description" | "startDate" | "endDate"
>;

export const getStaticProps: GetStaticProps = () => {
  //@ts-ignore
  const workPosts: WorkSubset[] = allWorks
    .sort(
      (a, z) =>
        new Date(z.startDate).getTime() - new Date(a.startDate).getTime()
    )
    .map((work) => ({
      slug: work.slug,
      title: work.title,
      description: work.description,
      startDate: work.startDate,
      endDate: work.endDate ?? null,
    }));

  return {
    props: {
      workPosts,
    },
  };
};

const WorkListPage = ({ workPosts }: { workPosts: WorkSubset[] }) => {
  return (
    <>
      <NextSeo
        title="Work"
        description="A timeline and summary of my professional work experience"
      />

      <PageBar items={[{ title: "Projects", href: `/project` }]} />

      <Spacer size="xl" />

      <PageTitleBanner>
        <Spacer size="xl" />

        <div className="space flex justify-between items-center">
          <div>
            <SmartLink href="/">
              <h1 className="text-left font-display font-extrabold text-3xl">
                Work Experience
              </h1>
            </SmartLink>
            <Spacer />

            <p className="">A timeline of my professional work experience</p>
          </div>
        </div>
        <Spacer size="xl" />
      </PageTitleBanner>

      <Spacer size="3xl" />

      <div className="space">
        <div className="ml-lg border-l-4 pl-2xl space-y-2xl">
          {workPosts.map((work) => (
            <SmartLink
              key={work.slug}
              href={`/work/${work.slug}`}
              className="block relative group"
            >
              <div className="absolute -left-[4.6rem] -top-3 mb-5 py-sm bg-light">
                <div className="bg-primary-50 px-2 py-0.5 rounded-full text-sm">
                  {new Date(work.startDate).getFullYear()}
                </div>
              </div>
              <h3 className="font-medium text-xl group-hover:underline">
                {work.title}
              </h3>
              <Spacer size="xs" />
              <p>{work.description}</p>
            </SmartLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default WorkListPage;
