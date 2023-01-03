import {
  getMarkdownPage,
  getMarkdownPages,
  HrefFunction,
  MarkdownPageInfo,
} from ".";

export const mePages: MarkdownPageInfo[] = [
  { slug: ["about"] },
  { slug: ["resume"] },
];

const mePageHrefFn: HrefFunction = (folder, pageInfo) => `/~/${pageInfo.slug[0]}`;

export const getMePage = (pageInfo: MarkdownPageInfo) =>
  getMarkdownPage({
    folder: "me",
    pageInfo,
    hrefFn: mePageHrefFn,
  });

export const getMePages = (pageInfos: MarkdownPageInfo[]) =>
  getMarkdownPages({
    folder: "me",
    pageInfos,
    hrefFn: mePageHrefFn,
  });
