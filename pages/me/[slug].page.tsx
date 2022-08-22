import { Links, mdxComponents, PageBar, TOC } from "@/components";
import { PageRightSidebarLayout } from "@/layouts";
import { getMePage, getMePages, MePage } from "@/lib/content/me";
import { parseMarkdoc, serializeMarkdoc } from "@/lib/markdoc/parse";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo } from "next-seo";

export const getStaticPaths: GetStaticPaths = () => {
  const mePages = getMePages();
  return {
    paths: mePages.map((mePage) => ({ params: { slug: mePage.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
  const pageSlug = params!.slug as string;

  return {
    props: {
      serializedPage: serializeMarkdoc(getMePage(pageSlug)),
    },
  };
};

const Page = ({ serializedPage }: { serializedPage: string }) => {
  const page = parseMarkdoc(serializedPage);

  const mobileSidebarSections = [];
  // if (page.links) mobileSidebarSections.push(<Links links={page.links} />);
  // if (page.showContents) mobileSidebarSections.push(<TOC />);
  // mobileSidebarSections.push(
  //   <div>
  //     <MiniTitle>More about me</MiniTitle>
  //     <div className="mt-xs space-y-xs">
  //       <PostList items={collectionPosts} />
  //     </div>
  //   </div>
  // );

  return (
    <>
      <NextSeo title={page.frontmatter.title} description={page.frontmatter.description} />

      {/* <PageRightSidebarLayout
        top={
          <PageBar
            items={[{ title: page.frontmatter.title, href: `/me/${page.slug}` }]}
            // sidebarSections={mobileSidebarSections}
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
      </PageRightSidebarLayout> */}
    </>
  );
};

export default Page;
