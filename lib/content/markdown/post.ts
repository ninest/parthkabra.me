import {
  getMarkdownPage,
  getMarkdownPages,
  HrefFunction,
  MarkdownPageInfo,
} from ".";

interface CatInfo {
  slug: string;
  title: string;
}

export const cats: CatInfo[] = [
  { slug: "blog", title: "Blog" },
  { slug: "cli", title: "CLI and Terminal" },
  { slug: "git", title: "Git" },
  { slug: "html", title: "HTML" },
  { slug: "mac", title: "Mac" },
  { slug: "nextjs", title: "NextJS" },
  { slug: "python", title: "Python" },
  { slug: "firefox", title: "Firefox" },
  { slug: "cs", title: "Computer Science" },
  { slug: "meta", title: "Meta" },
  { slug: "vscode", title: "VS Code" },
  { slug: "typescript", title: "TypeScript" },
  { slug: "javascript", title: "JavaScript" },
];

export const getCat = (catName: string) =>
  cats.find((cat) => cat.slug === catName);

export const posts: MarkdownPageInfo[] = [
  { slug: ["blog", "first"] },
  { slug: ["blog", "account-hacked"] },
  { slug: ["blog", "better-university-website"] },
  { slug: ["blog", "working-on-husker"] },
];

const postHrefFn: HrefFunction = (folder, pageInfo) =>
  `/${pageInfo.slug[0]}/${pageInfo.slug[1]}`;

export const getPostPage = (pageInfo: MarkdownPageInfo) =>
  getMarkdownPage({
    folder: "posts",
    pageInfo,
    hrefFn: postHrefFn,
  });

export const getPostPages = (pageInfos: MarkdownPageInfo[]) =>
  getMarkdownPages({
    folder: "posts",
    pageInfos,
    hrefFn: postHrefFn,
  });
