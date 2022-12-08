import { getMarkdownPage, getMarkdownPages, MarkdownPageInfo } from ".";

export const works: MarkdownPageInfo[] = [
  { slug: ["ninja-van"] },
  { slug: ["ourfinals"] },
  { slug: ["saf"] },
  { slug: ["h3zoomai"] },
  { slug: ["credr"] },
];

export const getWorkPage = (pageInfo: MarkdownPageInfo) =>
  getMarkdownPage({
    folder: "work",
    pageInfo,
  });

export const getWorkPages = (pageInfos: MarkdownPageInfo[]) =>
  getMarkdownPages({
    folder: "work",
    pageInfos,
  });
