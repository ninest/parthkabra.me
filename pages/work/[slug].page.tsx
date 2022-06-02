import { Work } from "@/.contentlayer/generated";
import { allWorks } from "@/.contentlayer/generated/index.mjs";
import {
  Links,
  mdxComponents,
  MiniTitle,
  PageBar,
  Spacer,
  TOC,
} from "@/components";
import { PageRightSidebarLayout, RightSidebarLayout } from "@/layouts";
import { startEndYear } from "@/lib/date";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useMDXComponent } from "next-contentlayer/hooks";
import { NextSeo } from "next-seo";
import Link from "next/link";

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: allWorks.map((post) => `/work/${post.slug}`),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
  const workSlug = params!.slug as string;

  return {
    props: {
      work: allWorks.find((work) => `${work.slug}` == workSlug),
    },
  };
};

const WorkPage = ({ work }: { work: Work }) => {
  const MDX = useMDXComponent(work.body.code);

  const sidebarSections = [
    <Links key={1} links={[{ href: work.website, title: "Website" }]} />,
  ];
  if (work.projects)
    sidebarSections.push(<Links title="Projects" links={work.projects} />);
  if (work.showContents) sidebarSections.push(<TOC />);

  return (
    <>
      <NextSeo title={work.title} description={work.description} />

      <PageRightSidebarLayout
        top={
          <PageBar
            items={[
              { title: "Work", href: `/work` },
              { title: work.title, href: `/work/${work.slug}` },
            ]}
            sidebarSections={sidebarSections}
          ></PageBar>
        }
        title={work.title}
        description={work.description}
        date={
          <>
            {work.location}
            {" · "}
            {startEndYear({
              start: new Date(work.startDate),
              end: work.endDate ? new Date(work.endDate) : undefined,
            })}
          </>
        }
        hasNavbar={false}
        hasSidebar={true}
        sidebar={
          <>
            <Links links={[{ href: work.website, title: "Website" }]} />
            {work.projects && <Links title="Projects" links={work.projects} />}
            {work.showContents && <TOC />}
          </>
        }
      >
        <div className="lg:hidden">
          {work.projects && (
            <>
              <MiniTitle>Links</MiniTitle>
              <Links showTitle={false} links={work.projects} />
            </>
          )}
          <Spacer size="lg" />
        </div>
        <article className="prose">
          <MDX components={mdxComponents} />
        </article>
      </PageRightSidebarLayout>
    </>
  );
};

export default WorkPage;
