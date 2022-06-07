import { allPosts } from "@/.contentlayer/generated/index.mjs";
import {
  PageBar,
  PageTitleBanner,
  SimpleList,
  SmartLink,
  Spacer
} from "@/components";
import { allCats, Cat, CatName } from "@/content/map";
import {
  getPostLinks,
  getPosts
} from "@/lib/content";
import { LinkItem } from "@/types";
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

  const posts = getPosts(catName);
  const postLinks = getPostLinks(posts);

  return {
    props: { catName, cat, postLinks },
  };
};

const CatPage = ({
  catName,
  cat,
  postLinks,
}: {
  catName: CatName;
  cat: Cat;
  postLinks: LinkItem[];
}) => {
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
          <SimpleList items={postLinks} />
        </section>
      </div>
    </>
  );
};

export default CatPage;
