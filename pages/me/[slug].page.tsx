import { PageBar } from "@/components";
import { PageRightSidebarLayout } from "@/layouts";
import { MarkdownPage } from "@/lib/content/markdown";
import { getMePage, getMePages, mePages } from "@/lib/content/markdown/me";

import { mdsToLinks } from "@/lib/content/markdown/transformers";
import { formatDateFull } from "@/lib/date";
import { markdocComponents } from "@/lib/markdoc/components";
import { parseMarkdownPage, serializeMarkdownPage } from "@/lib/markdoc/parse";
import Markdoc from "@markdoc/markdoc";

import { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo } from "next-seo";
import React from "react";

export const getStaticPaths: GetStaticPaths = () => {
  const mes = mdsToLinks(getMePages(mePages));
  console.log(mes);

  return {
    paths: mes.map((mePage) => mePage.href),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
  const pageSlug = params!.slug as string;

  return {
    props: {
      slug: pageSlug,
      serializedPage: serializeMarkdownPage(getMePage({ slug: [pageSlug] })),
    },
  };
};

const Page = ({ slug, serializedPage }: { serializedPage: string }) => {
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

      <PageRightSidebarLayout
        top={
          <PageBar
            items={[
              { title: "Projects", href: `/project` },
              { title: page.frontmatter.title, href: `/me/${slug}` },
            ]}
          />
        }
        title={page.frontmatter.title}
        description={page.frontmatter.description}
        hasNavbar={false}
        hasSidebar={false}
        sidebar={<></>}
      >
        {/* <div className="lg:hidden">
          {project.links && (
            <>
              <MiniTitle>Links</MiniTitle>
              <Links showTitle={false} links={project.links} />
            </>
          )}
          <Spacer size="lg" />
        </div> */}
        <article className="prose">{renderedContent}</article>
      </PageRightSidebarLayout>
    </>
  );
};

export default Page;
