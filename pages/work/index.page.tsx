import { PageBar, PageTitleBanner, SmartLink, Spacer } from "@/components";
import { mdsToLinks } from "@/lib/content/markdown/transformers";
import { getWorkPages, works } from "@/lib/content/markdown/work";
import { LinkItem } from "@/types";

import {
  GetStaticProps,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import { NextSeo } from "next-seo";

export const getStaticProps: GetStaticProps = ({
  params,
}: GetStaticPropsContext) => {
  const workPosts: LinkItem[] = mdsToLinks(getWorkPages(works));

  return {
    props: {
      workPosts,
    },
  };
};

const WorkListPage = ({
  workPosts,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <>
      <NextSeo
        title="Work"
        description="A timeline and summary of my professional work experience"
      />

      <PageBar items={[{ title: "Work", href: `/work` }]} />

      <Spacer size="xl" />

      <PageTitleBanner>
        <Spacer size="xl" />

        <div className="space flex justify-between items-center">
          <div>
            <SmartLink href="/">
              <h1 className="text-left font-display font-extrabold text-3xl">
                Work Experience
              </h1>
            </SmartLink>
            <Spacer />

            <p className="">A timeline of my professional work experience</p>
          </div>
        </div>
        <Spacer size="xl" />
      </PageTitleBanner>

      <Spacer size="3xl" />

      <div className="space max-w-[120ch]">
        <div className="space-y-lg">
          {workPosts.map((work: LinkItem) => (
            <SmartLink
              key={work.href}
              href={work.href}
              className="block bg-gray-50 p-base rounded-lg"
            >
              <h2 className="text-lg font-bold">
                {work.title} <span className="text-gray-400">{work.date}</span>
              </h2>
              <div>{work.description}</div>
            </SmartLink>
          ))}
          {/* {workPosts.map((work: LinkItem) => (
            <SmartLink
              key={work.href}
              href={work.href}
              className="block relative group"
            >
              <div className="absolute -left-[4.6rem] -top-3 mb-5 py-sm bg-light">
                <div className="bg-primary-50 px-2 py-0.5 rounded-full text-sm">
                  {work.date}
                </div>
              </div>
              <h3 className="font-medium text-xl group-hover:underline">
                {work.title}
              </h3>
              <Spacer size="xs" />
              <p>{work.description}</p>
            </SmartLink>
          ))} */}
        </div>
      </div>
    </>
  );
};

export default WorkListPage;
