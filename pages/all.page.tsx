import { allPosts } from "@/.contentlayer/generated";
import {
  Links,
  PageBar,
  PageTitleBanner,
  PostList,
  SimpleList,
  SmartLink,
  Spacer,
} from "@/components";
import { allCats, CatName } from "@/content/map";
import { getPostLinkInfo, sortByDate } from "@/lib/content";
import { NextSeo } from "next-seo";

export default function AllPostsPage() {
  const blogPosts = sortByDate(allPosts.filter((post) => !post.draft)).map(
    (post) => getPostLinkInfo(post)
  );

  const catLinks = Object.keys(allCats).map((catName) => ({
    title: allCats[catName as CatName].title,
    href: `/${catName}`,
  }));

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

            <p className="">Every single blog post I've written so far</p>
          </div>
        </div>
        <Spacer size="xl" />
      </PageTitleBanner>

      <Spacer size="xl" />

      <div className="space flex flex-col-reverse md:space-y-0 md:space-x-3xl md:flex-row">
        <section className="lg:w-4/6 xl:w-3/6 max-w-6xl">
          <div className="space-y-base">
            <PostList items={blogPosts} bubble showCat />
          </div>
        </section>

        <div className="md:hidden">
          <Spacer size="xl" />
        </div>

        <section>
          <Links title={"Categories"} links={catLinks} />
        </section>
      </div>
    </>
  );
}
