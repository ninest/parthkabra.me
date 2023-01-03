import { PageBar } from "@/components";

import { PostLayout } from "@/layouts/PostLayout";
import { getProjectPage, projects } from "@/lib/content/markdown/project";
import { formatDateFull } from "@/lib/date";
import { markdocComponents } from "@/lib/markdoc/components";
import { parseMarkdownPage, serializeMarkdownPage } from "@/lib/markdoc/parse";
import Markdoc from "@markdoc/markdoc";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";

import { NextSeo } from "next-seo";
import React from "react";

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: projects.map((project) => `/project/${project.slug}`),
    fallback: false,
  };
};

export const getStaticProps = ({ params }: GetStaticPropsContext) => {
  const projectSlug = params!.slug as string;
  const page = getProjectPage({ slug: [projectSlug] });

  return {
    props: {
      slug: projectSlug,
      serializedPage: serializeMarkdownPage(page),
    },
  };
};

const ProjectPage = ({
  slug,
  serializedPage,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const page = parseMarkdownPage(serializedPage);
  const renderedContent = Markdoc.renderers.react(page.content, React, {
    components: markdocComponents,
  });

  return (
    <>
      <NextSeo
        title={page.frontmatter.title}
        description={page.frontmatter.description}
      />

      <PostLayout
        top={
          <PageBar
            items={[
              { title: "Projects", href: `/project` },
              { title: page.frontmatter.title, href: `/project/${slug}` },
            ]}
          />
        }
        title={page.frontmatter.title}
        description={page.frontmatter.description}
        date={formatDateFull(new Date(page.frontmatter.date!))}
        links={page.frontmatter.links}
        showContents={page.frontmatter.showContents ?? true}
      >
        <div className="prose">{renderedContent}</div>
      </PostLayout>
    </>
  );
};

export default ProjectPage;
