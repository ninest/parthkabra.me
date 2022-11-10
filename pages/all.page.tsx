import {
  Links,
  PageBar,
  PageTitleBanner,
  SimpleList,
  SmartLink,
  Spacer
} from "@/components";
import {
  cats as allCats,
  getPagesByMonths,
  getPostPages,
  posts
} from "@/lib/content/markdown/post";
import { InferGetStaticPropsType } from "next";

import { NextSeo } from "next-seo";

export const getStaticProps = async () => {
  const fullBlogPages = getPostPages(posts);
  const blogPagesByMonth = getPagesByMonths(fullBlogPages);

  return {
    props: { blogPagesByMonth, cats: allCats },
  };
};

export default function AllPostsPage({
  blogPagesByMonth,
  cats,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <NextSeo
        title="All Blog Posts"
        description="Every single blog post I have written so far"
      />

      <PageBar items={[{ title: "Projects", href: `/project` }]} />

      <Spacer size="xl" />

      <PageTitleBanner>
        <Spacer size="xl" />

        <div className="space flex justify-between items-center">
          <div>
            <SmartLink href="/">
              <h1 className="text-left font-display font-extrabold text-3xl">
                Posts
              </h1>
            </SmartLink>
            <Spacer />

            <p className="">Every single blog post I{"'"}ve written so far</p>

            <Spacer />
            <Links
              showTitle={false}
              links={cats.map((cat) => ({ ...cat, href: `/${cat.slug}` }))}
            />
          </div>
        </div>
        <Spacer size="xl" />
      </PageTitleBanner>

      <Spacer size="xl" />

      <div className="space flex flex-col-reverse md:space-y-0 md:space-x-3xl md:flex-row">
        <section className="lg:w-4/6 xl:w-3/6 max-w-6xl">
          <div className="space-y-xl">
            {blogPagesByMonth.map((mp) => (
              <div key={mp.order}>
                <h3 className="font-extrabold text-xl">{mp.month}</h3>
                <Spacer size="xs" />
                <SimpleList items={mp.posts} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
