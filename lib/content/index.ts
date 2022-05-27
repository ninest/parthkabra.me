import { allPosts, Post, Project, Work } from "@/.contentlayer/generated";
import { altCatPosts, CatName } from "@/content/map";
import { formatDate, formatDateMonthYear, startEndYear } from "@/lib/date";
import { LinkItem } from "@/types";
import { map } from "zod";

export const getContent = <T extends { slug: string }>(
  allContent: T[],
  slug: string
): T => {
  return allContent.find((content) => content.slug == slug)!;
};

export const getPostLinkInfo = (post: Post): LinkItem => {
  return {
    title: post.title,
    cat: post.cat as CatName,
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

interface MonthPosts {
  month: string;
  posts: LinkItem[];
  // year * 100 + month so that MonthPosts[] can be sorted by time
  order: number;
}

// Convert from a list of `allPosts` to a list of { month, content[] }[]
export const getPostsMonthsList = (): MonthPosts[] => {
  const contentByMonth: MonthPosts[] = [];

  allPosts.forEach((post) => {
    const date = new Date(post.date);
    const monthYear = formatDateMonthYear(date);
    const postLink = getPostLinkInfo(post);
    // Check if there is a dictionary with this month in first
    const monthPosts = contentByMonth.find((mp) => mp.month == monthYear);
    if (monthPosts) {
      monthPosts.posts.push(postLink);
    } else {
      // Otherwise create and add it
      contentByMonth.push({
        month: monthYear,
        posts: [postLink],
        order: date.getFullYear() * 100 + date.getMonth(),
      });
    }
  });

  return contentByMonth.sort((mpA, mpZ) => mpZ.order - mpA.order);
};
