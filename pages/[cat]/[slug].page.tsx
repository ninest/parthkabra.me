import { Post } from "@/.contentlayer/generated";
import { allPosts } from "@/.contentlayer/generated/index.mjs";
import {
  Links,
  mdxComponents,
  MiniTitle,
  PageBar,
  PostList, Spacer,
  TOC
} from "@/components";
import { Collection, collections } from "@/content/collections";
import { allCats, Cat, CatName } from "@/content/map";
import { PageRightSidebarLayout } from "@/layouts";
import {
  getContent,
  getPostLinkInfo,
  getPostLinks,
  getPosts,
  sortByDate
} from "@/lib/content";
import { formatDateFull } from "@/lib/date";
import { LinkItem } from "@/types";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useMDXComponent } from "next-contentlayer/hooks";
import { NextSeo } from "next-seo";

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: allPosts.map((post) => `/${post.cat}/${post.slug}`),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
  const slug = params!.slug as string;
  const catName = params!.cat as CatName;
  const postPath = `${catName}/${slug}`;

  const post = allPosts.find((post) => `${post.cat}/${post.slug}` == postPath);
  const cat: Cat = allCats[post?.cat as CatName];

  const relatedPosts = getPosts(catName);


  const relatedPostLinks = getPostLinks(relatedPosts);

  // Check if this post is part of a collection
  const collection = collections.find((collection) =>
    collection.posts.slugs.includes(slug)
  );

  if (collection) {
    const collectionPosts = sortByDate(
      collection.posts.slugs.map((slug) => getContent(allPosts, slug))
    ).map((post) => getPostLinkInfo(post as Post));

    return {
      props: { post, cat, collection, collectionPosts, relatedPostLinks },
    };
  }

  return {
    props: { post, cat, relatedPostLinks },
  };
};

interface Props {
  cat: Cat;
  post: Post;
  collection?: Collection;
  collectionPosts?: LinkItem[];
  relatedPostLinks: LinkItem[];
}

const PostPage = ({
  post,
  cat,
  collection,
  collectionPosts,
  relatedPostLinks,
}: Props) => {
  const MDX = useMDXComponent(post.body.code);

  const sidebarSections = [];
  if (post.links) sidebarSections.push(<Links links={post.links} />);
  if (post.showContents) sidebarSections.push(<TOC />);

  if (!!collectionPosts)
    sidebarSections.push(
      <div>
        <MiniTitle>In this series</MiniTitle>
        <div className="mt-xs space-y-xs">
          <PostList items={collectionPosts} />
        </div>
      </div>
    );

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
            fullWidth={!!collectionPosts}
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
        collection={collection}
        collectionPosts={collectionPosts}
      >
        <div className="lg:hidden">
          {post.links && <Links showTitle={false} links={post.links} />}
          <Spacer size="lg" />
        </div>
        <article className="prose">
          <MDX components={mdxComponents} />
        </article>

        <Spacer size="3xl" />
        {/* <Spacer size="3xl" />
        <section>
          <MiniTitle>Related</MiniTitle>
          <Spacer size="xs" />
          <SimpleList items={relatedPostLinks} />
        </section> */}
      </PageRightSidebarLayout>
    </>
  );
};

export default PostPage;
