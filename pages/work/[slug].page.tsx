import { PageBar } from "@/components";

import { PostLayout } from "@/layouts/PostLayout";
import { getWorkPage, works } from "@/lib/content/markdown/work";
import { startEndYear } from "@/lib/date";
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
    paths: works.map((post) => `/work/${post.slug[0]}`),
    fallback: false,
  };
};

export const getStaticProps = ({ params }: GetStaticPropsContext) => {
  const workSlug = params!.slug as string;

  const page = getWorkPage({ slug: [workSlug] });

  return {
    props: {
      serializedPage: serializeMarkdownPage(page),
    },
  };
};

const WorkPage = ({
  serializedPage,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const page = parseMarkdownPage(serializedPage);

  const renderedContent = Markdoc.renderers.react(page.content, React, {
    components: markdocComponents,
  });

  // const sidebarSections = [
  //   <Links key={1} links={[{ href: work.website, title: "Website" }]} />,
  // ];
  // if (work.projects)
  //   sidebarSections.push(<Links title="Projects" links={work.projects} />);
  // if (work.showContents) sidebarSections.push(<TOC />);

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
              { title: "Work", href: `/work` },
              { title: page.frontmatter.title, href: page.href },
            ]}
          />
        }
        title={page.frontmatter.title}
        description={page.frontmatter.description}
        date={
          <>
            {page.frontmatter.location},{" "}
            {startEndYear({
              start: new Date(page.frontmatter.startDate!),
              end: page.frontmatter.endDate
                ? new Date(page.frontmatter.endDate)
                : undefined,
            })}
          </>
        }
        showContents={page.frontmatter.showContents ?? true}
        links={page.frontmatter.links}
      >
        <div className="prose">{renderedContent}</div>
      </PostLayout>
    </>
  );
};

export default WorkPage;
