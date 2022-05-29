import type { Project } from "@/.contentlayer/generated";
import { allProjects } from "@/.contentlayer/generated/index.mjs";
import {
  Links,
  mdxComponents,
  MiniTitle,
  PageBar,
  PostList,
  Spacer,
  TOC,
} from "@/components";
import { PageRightSidebarLayout } from "@/layouts";
import { sortByDate } from "@/lib/content";
import { formatDateFull } from "@/lib/date";
import { LinkItem } from "@/types";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useMDXComponent } from "next-contentlayer/hooks";
import { NextSeo } from "next-seo";

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: allProjects.map((project) => `/project/${project.slug}`),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
  const projectSlug = params!.slug as string;

  return {
    props: {
      project: allProjects.find((project) => project.slug == projectSlug),
    },
  };
};

const ProjectPage = ({ project }: { project: Project }) => {
  const MDX = useMDXComponent(project.body.code);

  const collectionPosts: LinkItem[] = sortByDate(allProjects).map(
    (project) => ({
      href: `/project/${project.slug}`,
      title: project.title,
      description: project.description,
    })
  );

  const mobileSidebarSections = [];
  if (project.links)
    mobileSidebarSections.push(<Links links={project.links} />);
  if (project.showContents) mobileSidebarSections.push(<TOC />);

  // Add this to all, make component?
  mobileSidebarSections.push(
    <div>
      <MiniTitle>All projects</MiniTitle>
      <div className="mt-xs space-y-xs">
        <PostList items={collectionPosts} />
      </div>
    </div>
  );

  return (
    <>
      <NextSeo title={project.title} description={project.description} />

      <PageRightSidebarLayout
        top={
          <PageBar
            items={[
              { title: "Projects", href: `/project` },
              { title: project.title, href: `/project/${project.slug}` },
            ]}
            sidebarSections={mobileSidebarSections}
            fullWidth={!!collectionPosts}
          />
        }
        title={project.title}
        description={project.description}
        date={formatDateFull(new Date(project.date))}
        collectionPosts={collectionPosts}
        sidebar={
          <>
            {project.links && <Links links={project.links} />}
            {project.showContents && <TOC />}
          </>
        }
        sidebarBottom={
          <>
            {/* <div className="">
            <Button className="w-full">Comment</Button>
            <Spacer />
            <p className="text-gray-light">
              Leave some feedback or just say hi
            </p>
          </div> */}
          </>
        }
      >
        <div className="lg:hidden">
          {project.links && (
            <>
              <MiniTitle>Links</MiniTitle>
              <Links showTitle={false} links={project.links} />
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

export default ProjectPage;
