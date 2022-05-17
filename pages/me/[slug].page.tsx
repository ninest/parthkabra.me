import type { MePage } from "@/.contentlayer/generated";
import { allMePages } from "@/.contentlayer/generated/index.mjs";
import { Links, mdxComponents, PageBar, TOC } from "@/components";
import { PageRightSidebarLayout } from "@/layouts";
import { GetStaticPaths, GetStaticProps } from "next";
import { useMDXComponent } from "next-contentlayer/hooks";
import { NextSeo } from "next-seo";

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: allMePages.map((page) => `/me/${page.slug}`),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
  const pageSlug = params!.slug as string;

  return {
    props: {
      page: allMePages.find((page) => page.slug == pageSlug),
    },
  };
};

const MePage = ({ page }: { page: MePage }) => {
  const MDX = useMDXComponent(page.body.code);

  const sidebarSections = [];
  if (page.links) sidebarSections.push(<Links links={page.links} />);
  if (page.showContents) sidebarSections.push(<TOC />);
  return (
    <>
      <NextSeo title={page.title} description={page.description} />

      <PageRightSidebarLayout
        top={
          <PageBar
            items={[{ title: page.title, href: `/me/${page.slug}` }]}
            sidebarSections={sidebarSections}
          />
        }
        title={page.title}
        description={page.description}
        sidebar={
          <>
            {page.links && <Links links={page.links} />}
            {page.showContents && <TOC />}
          </>
        }
      >
        <MDX components={mdxComponents} />
      </PageRightSidebarLayout>
    </>
  );
};

export default MePage;
