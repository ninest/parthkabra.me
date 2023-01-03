import { PageBar, Spacer } from "@/components";

import { PostLayout } from "@/layouts/PostLayout";

import { cats, getPostPage, posts } from "@/lib/content/markdown/post";
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
    paths: posts.map((post) => `/${post.slug.join("/")}`),
    fallback: false,
  };
};

export const getStaticProps = ({ params }: GetStaticPropsContext) => {
  const catName = params!.cat as string;
  const slug = params!.slug as string;

  const cat = cats.find((cat) => cat.slug === catName);

  const page = getPostPage({ slug: [catName, slug] });

  // TODO: collection

  return {
    props: { cat, serializedPage: serializeMarkdownPage(page) },
  };
};

const PostPage = ({
  cat,
  serializedPage,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const page = parseMarkdownPage(serializedPage);

  const renderedContent = Markdoc.renderers.react(page.content, React, {
    components: markdocComponents,
  });

  const isDraft = page.frontmatter.draft;

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
              { title: cat!.title, href: `/${cat?.slug}` },
              { title: page.frontmatter.title, href: page!.href },
            ]}
          />
        }
        title={`${isDraft ? "[DRAFT] " : ""}${page.frontmatter.title}`}
        description={page.frontmatter.description}
        date={formatDateFull(new Date(page.frontmatter.date!))}
        showContents={page.frontmatter.showContents ?? true}
        links={page.frontmatter.links}
      >
        <div className="prose">{renderedContent}</div>
      </PostLayout>

      {/* <PageRightSidebarLayout
        top={
          <PageBar
            items={[
              { title: cat!.title, href: `/${cat?.slug}` },
              { title: page.frontmatter.title, href: page!.href },
            ]}
            // sidebarSections={mobileSidebarSections}
            // fullWidth={!!collectionPosts}
          />
        }
        // TODO: draft?
        title={`${page.frontmatter.title}`}
        description={page.frontmatter.description}
        date={formatDateFull(new Date(page.frontmatter.date!))}
        // hasSidebar={!!post.links || post.showContents}
        hasSidebar={false}
        sidebar={
          <>
             {post.links && <Links links={post.links} />}
            {post.showContents && <TOC />} 
          </>
        }
        // hasNavbar={!!collectionPosts}
        hasNavbar={false}
        // collection={collection}
        // collectionPosts={collectionPosts}
      >
        <div className="prose">{renderedContent}</div>
        <div className="lg:hidden">
          <Spacer size="xl" />
           {post.links && <Links links={post.links} />} 
        </div>
      </PageRightSidebarLayout> */}
    </>
  );
};

export default PostPage;
