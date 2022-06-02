import type { MePage } from "@/.contentlayer/generated";
import { allMePages } from "@/.contentlayer/generated/index.mjs";
import {
  Links,
  mdxComponents,
  MiniTitle,
  PageBar,
  PostList,
  TOC,
} from "@/components";
import { Collection } from "@/content/collections";
import { PageRightSidebarLayout } from "@/layouts";
import { LinkItem } from "@/types";
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

  const collectionPosts: LinkItem[] = allMePages.map((mePage) => ({
    href: `/${mePage.slug}`,
    title: mePage.title,
    description: mePage.description,
  }));

  const mobileSidebarSections = [];
  if (page.links) mobileSidebarSections.push(<Links links={page.links} />);
  if (page.showContents) mobileSidebarSections.push(<TOC />);
  mobileSidebarSections.push(
    <div>
      <MiniTitle>More about me</MiniTitle>
      <div className="mt-xs space-y-xs">
        <PostList items={collectionPosts} />
      </div>
    </div>
  );


  return (
    <>
      <NextSeo title={page.title} description={page.description} />

      <PageRightSidebarLayout
        top={
          <PageBar
            items={[{ title: page.title, href: `/me/${page.slug}` }]}
            sidebarSections={mobileSidebarSections}
            fullWidth={!!collectionPosts}
          />
        }
        title={page.title}
        description={page.description}
        
        hasNavbar={true}
        collectionPosts={collectionPosts}

        hasSidebar={!!page.links || page.showContents}
        sidebar={
          <>
            {page.links && <Links links={page.links} />}
            {page.showContents && <TOC />}
          </>
        }
      >
        <article className="prose">
          <MDX components={mdxComponents} />
        </article>
      </PageRightSidebarLayout>
    </>
  );
};

export default MePage;
