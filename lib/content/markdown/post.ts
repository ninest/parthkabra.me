import { formatDate, formatDateMonthYear } from "@/lib/date";
import { LinkItem } from "@/types";
import {
  getMarkdownPage,
  getMarkdownPages,
  HrefFunction,
  MarkdownPage,
  MarkdownPageInfo,
} from ".";
import { mdToLink } from "./transformers";

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
  // Blog
  { slug: ["blog", "first"] },
  { slug: ["blog", "account-hacked"] },
  { slug: ["blog", "better-university-website"] },
  { slug: ["blog", "working-on-husker"] },
  { slug: ["blog", "bad-roommate"] },
  { slug: ["blog", "northeastern-gym"] },
  // CLI
  { slug: ["cli", "asciiquarium"] },
  { slug: ["cli", "cmatrix"] },
  // Firefox
  { slug: ["firefox", "profiles"] },
  { slug: ["firefox", "simple-tab-groups"] },
  // Git
  { slug: ["git", "log"] },
  { slug: ["git", "shortlog"] },
  { slug: ["git", "undo-commits"] },
  // HTML
  { slug: ["html", "google-forms-embed"] },
  // Mac
  { slug: ["mac", "remove-screenshot-shadow"] },
  { slug: ["mac", "terminal-games"] },
  { slug: ["mac", "say"] },
  // Meta
  { slug: ["meta", "redesign"] },
  { slug: ["meta", "redesign-3"] },
  // Python
  { slug: ["python", "black-installation-usage"] },
  { slug: ["python", "vscode-interactive-pyenv-venv"] },
  // TS
  { slug: ["typescript", "sort-array-by-date"] },
  // VS
  { slug: ["vscode", "sonic-pi"] },
];

const postHrefFn: HrefFunction = (folder, pageInfo) =>
  `/${pageInfo.slug[0]}/${pageInfo.slug[1]}`;

export const getPostPage = (pageInfo: MarkdownPageInfo) =>
  getMarkdownPage({
    folder: "posts",
    pageInfo,
    hrefFn: postHrefFn,
  });

export const getPostPages = (pageInfos: MarkdownPageInfo[]) => {
  const pages = getMarkdownPages({
    folder: "posts",
    pageInfos,
    hrefFn: postHrefFn,
  })
    .sort(
      (a, b) => b.frontmatter.date!.getTime() - a.frontmatter.date!.getTime()
    )
    .filter((post) => post.frontmatter.draft != true);
  return pages;
};

interface MonthPosts {
  month: string;
  posts: LinkItem[];
  // year * 100 + month so that MonthPosts[] can be sorted by time
  order: number;
}
export const getPagesByMonths = (pages: MarkdownPage[]): MonthPosts[] => {
  const pagesByMonth: MonthPosts[] = [];

  pages.forEach((page) => {
    const date = page.frontmatter.date!;
    const monthYear = formatDateMonthYear(date);

    const monthPages = pagesByMonth.find((mp) => mp.month === monthYear);
    if (monthPages) {
      monthPages.posts.push(mdToLink(page));
    } else {
      // Create and add
      pagesByMonth.push({
        month: monthYear,
        posts: [mdToLink(page)],
        order: date.getFullYear() * 100 + date.getMonth(),
      });
    }
  });

  return pagesByMonth.sort((mpA, mpZ) => mpZ.order - mpA.order);
};
