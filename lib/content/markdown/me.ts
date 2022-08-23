import {
  getMarkdownPage,
  getMarkdownPages,
  HrefFunction,
  MarkdownPageInfo,
} from ".";

export const mePages: MarkdownPageInfo[] = [
  { slug: ["me", "about"] },
  { slug: ["me", "resume"] },
];

const mePageHrefFn: HrefFunction = (folder, pageInfo) => `/${pageInfo.slug[1]}`;

export const getMePage = (pageInfo: MarkdownPageInfo) =>
  getMarkdownPage({
    folder: "me",
    pageInfo,
    hrefFn: mePageHrefFn,
  });

export const getMePages = (pageInfos: MarkdownPageInfo[]) =>
  getMarkdownPages({
    folder: "posts",
    pageInfos,
    hrefFn: mePageHrefFn,
  });
