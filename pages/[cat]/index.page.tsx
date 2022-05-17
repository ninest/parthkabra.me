import { Post } from "@/.contentlayer/generated";
import { allPosts } from "@/.contentlayer/generated/index.mjs";
import {
  PageBar,
  PageTitleBanner,
  SimpleList,
  SmartLink,
  Spacer,
} from "@/components";
import { allCats, CatName, Cat, altCatPosts } from "@/content/map";
import { getContent, getPostLinkInfo, sortByDate } from "@/lib/content";
import type { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo } from "next-seo";

export const getStaticPaths: GetStaticPaths = () => {
  // Get all cats from posts and remove duplicates
  const cats = [...new Set(allPosts.map((post) => post.cat))];
  return {
    paths: cats.map((cat) => `/${cat}`),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
  const catName = params!.cat as string as CatName;
  const cat = allCats[catName];

  // Also get posts from the altPosts list

  const altPosts = altCatPosts[catName].map((post) =>
    getContent(allPosts, post.slug)
  );
  const posts = sortByDate([
    ...allPosts.filter((post) => post.cat == catName),
    ...altPosts,
  ]);

  return {
    props: { catName, cat, posts },
  };
};

const CatPage = ({
  catName,
  cat,
  posts,
}: {
  catName: CatName;
  cat: Cat;
  posts: Post[];
}) => {
  const pythonPosts = posts.map((post) => getPostLinkInfo(post));

  return (
    <>
      <NextSeo title={cat.title} description={`${cat.title} related posts`} />

      <PageBar items={[{ title: cat.title, href: `/${catName}` }]} />

      <Spacer size="xl" />

      <PageTitleBanner>
        <Spacer size="xl" />

        <div className="space flex justify-between items-center">
          <div>
            <SmartLink href="/">
              <h1 className="text-left font-display font-extrabold text-3xl">
                {cat.title}
              </h1>
            </SmartLink>
          </div>
        </div>
        <Spacer size="xl" />
      </PageTitleBanner>

      <Spacer size="xl" />

      <div className="space">
        <section className="lg:w-4/6 xl:w-3/6 max-w-6xl">
          <SimpleList items={pythonPosts} />
        </section>
      </div>
    </>
  );
};

export default CatPage;
