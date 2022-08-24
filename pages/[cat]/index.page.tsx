import {
  PageBar,
  PageTitleBanner,
  SimpleList,
  SmartLink,
  Spacer
} from "@/components";
import {
  cats,
  getCat, getPostPages,
  posts
} from "@/lib/content/markdown/post";
import { mdsToLinks } from "@/lib/content/markdown/transformers";
import type {
  GetStaticPaths, GetStaticPropsContext,
  InferGetStaticPropsType
} from "next";
import { NextSeo } from "next-seo";

export const getStaticPaths: GetStaticPaths = () => {
  const paths = cats.map((cat) => `/${cat.slug}`);
  return { paths, fallback: false };
};

export const getStaticProps = ({ params }: GetStaticPropsContext) => {
  const catName = params!.cat as string;
  const cat = getCat(catName);
  if (!cat) throw Error("Category not found");

  const pageInfos = posts.filter((pageInfo) => pageInfo.slug[0] === catName);
  const pages = getPostPages(pageInfos);
  const pageLinks = mdsToLinks(pages);

  return {
    props: { cat, pageLinks },
  };
};

const CatPage = ({
  cat,
  pageLinks,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <>
      <NextSeo title={cat.title} description={`${cat.title} related posts`} />

      <PageBar items={[{ title: cat.title, href: `/${cat.slug}` }]} />

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
          <SimpleList items={pageLinks} />
        </section>
      </div>
    </>
  );
};

export default CatPage;
