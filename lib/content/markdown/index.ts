import { markdocFromFile } from "@/lib/markdoc";
import { Frontmatter } from "../frontmatter";

export interface MarkdownPageInfo {
  slug: string[];
}

export interface MarkdownPage extends MarkdownPageInfo {
  href: string;
  frontmatter: Frontmatter;
  content: any;
}

export type HrefFunction = (
  folder: string,
  pageInfo: MarkdownPageInfo
) => string;

const defaultHrefFn: HrefFunction = (folder, pageInfo) =>
  pageInfo.slug.join("/");

interface GetMarkdownPageParams {
  folder: string;
  pageInfo: MarkdownPageInfo;
  hrefFn?: HrefFunction;
}
export const getMarkdownPage = ({
  folder,
  pageInfo,
  hrefFn = defaultHrefFn,
}: GetMarkdownPageParams): MarkdownPage => {
  const path = pageInfo.slug.join("/");
  const page = markdocFromFile(`./${folder}/${path}`);

  return {
    ...pageInfo,
    href: hrefFn(folder, pageInfo),
    ...page,
  };
};

interface GetMarkdownPagesParams {
  folder: string;
  pageInfos: MarkdownPageInfo[];
  hrefFn?: HrefFunction;
}
export const getMarkdownPages = ({
  folder,
  pageInfos,
  hrefFn = defaultHrefFn,
}: GetMarkdownPagesParams): MarkdownPage[] => {
  return pageInfos.map((pageInfo) =>
    getMarkdownPage({ folder, pageInfo, hrefFn })
  );
};
