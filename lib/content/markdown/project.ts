import {
  getMarkdownPage,
  getMarkdownPages,
  HrefFunction,
  MarkdownPageInfo,
} from ".";

export const featuredProjects = [
  { slug: ["nextbussg"] },
  { slug: ["husker"] },
  { slug: ["ninenine"] },
  { slug: ["nsr"] },
  { slug: ["shots"] },
];

export const miniProjects = [
  { slug: ["typer"] },
  { slug: ["uniquecode"] },
  { slug: ["hexy-time"] },
  { slug: ["direct-contact"] },
  { slug: ["nric-utils"] },
  { slug: ["ippt-utils"] },
  { slug: ["commonapp-celebrate"] },
];

const projectHrefFn: HrefFunction = (folder, pageInfo) =>
  `/project/${pageInfo.slug[0]}`;

export const getProjectPage = (pageInfo: MarkdownPageInfo) =>
  getMarkdownPage({
    folder: "projects",
    pageInfo,
    hrefFn: projectHrefFn,
  });

export const getProjectPages = (pageInfos: MarkdownPageInfo[]) =>
  getMarkdownPages({
    folder: "projects",
    pageInfos,
    hrefFn: projectHrefFn,
  });
