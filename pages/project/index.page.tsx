import { allProjects, Project } from "@/.contentlayer/generated";
import { PageBar, PageTitleBanner, SmartLink, Spacer } from "@/components";
import { ProjectLink } from "@/components/ui/Project";
import { featuredProjectSlugs } from "@/content/map";
import { sortByDate } from "@/lib/content";
import { GetStaticProps } from "next";
import { NextSeo } from "next-seo";

export const getStaticProps: GetStaticProps = () => {
  return {
    props: { projects: sortByDate(allProjects) },
  };
};

const ProjectsListPage = ({ projects }: { projects: Project[] }) => {
  return (
    <>
      <NextSeo
        title="Projects"
        description="A showcase of my favorite projects"
      />

      <PageBar items={[{ title: "Projects", href: `/project` }]} />

      <Spacer size="xl" />

      <PageTitleBanner>
        <Spacer size="xl" />

        <div className="space flex justify-between items-center">
          <div>
            <SmartLink href="/">
              <h1 className="text-left font-display font-extrabold text-3xl">
                Projects
              </h1>
            </SmartLink>
            <Spacer />

            <p className="">A showcase of my favorite projects</p>
          </div>
        </div>
        <Spacer size="xl" />
      </PageTitleBanner>

      <Spacer size="3xl" />

      <div className="space">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg md:gap-2xl">
          {projects.map((project) => (
            <ProjectLink
              key={project._id}
              project={project}
              highlighted={featuredProjectSlugs.includes(project.slug)}
            />
          ))}
        </section>
      </div>
    </>
  );
};

export default ProjectsListPage;
