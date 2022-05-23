import { allPosts, Post, Project, Work } from "@/.contentlayer/generated";
import { altCatPosts, CatName } from "@/content/map";
import { formatDate, startEndYear } from "@/lib/date";
import { LinkItem } from "@/types";

export const getContent = <T extends { slug: string }>(
  allContent: T[],
  slug: string
): T => {
  return allContent.find((content) => content.slug == slug)!;
};

export const getPostLinkInfo = (post: Post): LinkItem => {
  return {
    title: post.title,
    cat: post.cat,
    href: `/${post.cat}/${post.slug}`,
    date: formatDate(new Date(post.date)),
    description: post.description,
  };
};

export const getPostLinks = (posts: Post[]): LinkItem[] =>
  posts.map((post) => getPostLinkInfo(post));

export const getWorkLinkInfo = (work: Work): LinkItem => {
  // Only but a year range (2001-2002) if the start date and end date have different years

  const date = startEndYear({
    start: new Date(work.startDate),
    end: work.endDate ? new Date(work.endDate) : undefined,
  });

  return {
    title: work.title,
    href: `/work/${work.slug}`,
    date,
  };
};

export const getProjectLinkInfo = (project: Project): LinkItem => {
  return {
    title: project.title,
    href: `/project/${project.slug}`,
    date: new Date(project.date).getFullYear().toString(),
  };
};

export const sortByDate = <T extends { date: string }>(
  allContent: T[]
): T[] => {
  // Some content contains startDate, some contain date
  return allContent //
    .sort((a, z) => new Date(z.date).getTime() - new Date(a.date).getTime());
};

export const getPosts = (catName: CatName): Post[] => {
  const altPosts = altCatPosts[catName].map((post) =>
    getContent(allPosts, post.slug)
  );
  const posts = allPosts.filter((post) => post.cat == catName);

  return sortByDate([...altPosts, ...posts]);
};
