import { Post } from "@/.contentlayer/generated";
import { allPosts } from "@/.contentlayer/generated/index.mjs";
import { Links, mdxComponents, PageBar, ProjectLink, TOC } from "@/components";
import { allCats, Cat, CatName } from "@/content/map";
import { PageRightSidebarLayout } from "@/layouts";
import { formatDateFull } from "@/lib/date";
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import { useMDXComponent } from "next-contentlayer/hooks";
import { NextSeo } from "next-seo";

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: allPosts.map((post) => `/${post.cat}/${post.slug}`),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
  const postPath = `${params!.cat}/${params!.slug}`;
  // const postPath = (params!.path as string[]).join("/");

  const post = allPosts.find((post) => `${post.cat}/${post.slug}` == postPath);
  return {
    props: {
      post,
      cat: allCats[post?.cat as CatName],
    },
  };
};

const PostPage = ({ post, cat }: { cat: Cat; post: Post }) => {
  const MDX = useMDXComponent(post.body.code);

  const sidebarSections = [];
  if (post.links) sidebarSections.push(<Links links={post.links} />);
  if (post.showContents) sidebarSections.push(<TOC />);

  return (
    <>
      <NextSeo
        title={post.title}
        description={post.metaDescription ?? post.description}
      />

      <PageRightSidebarLayout
        top={
          <PageBar
            items={[
              { title: cat.title, href: `/${post.cat}` },
              { title: post.title, href: `/${post.cat}/${post.slug}` },
            ]}
            sidebarSections={sidebarSections}
          />
        }
        title={post.title}
        description={post.description}
        date={formatDateFull(new Date(post.date))}
        sidebar={
          <>
            {post.links && <Links links={post.links} />}
            {post.showContents && <TOC />}
          </>
        }
      >
        <MDX components={mdxComponents} />
      </PageRightSidebarLayout>
    </>
  );
};

export default PostPage;
