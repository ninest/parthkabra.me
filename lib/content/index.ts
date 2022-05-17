import { Post, Project, Work } from "@/.contentlayer/generated";
import { formatDate, startEndYear } from "@/lib/date";

export const getContent = <T extends { slug: string }>(
  allContent: T[],
  slug: string
): T => {
  return allContent.find((content) => content.slug == slug)!;
};

export const getPostLinkInfo = (post: Post) => {
  return {
    text: post.title,
    href: `/${post.cat}/${post.slug}`,
    side: formatDate(new Date(post.date)),
  };
};

export const getWorkLinkInfo = (work: Work) => {
  // Only but a year range (2001-2002) if the start date and end date have different years

  const side = startEndYear({
    start: new Date(work.startDate),
    end: work.endDate ? new Date(work.endDate) : undefined,
  });

  return {
    text: work.title,
    href: `/work/${work.slug}`,
    side,
  };
};

export const getProjectLinkInfo = (project: Project) => {
  return {
    text: project.title,
    href: `/project/${project.slug}`,
    side: new Date(project.date).getFullYear().toString(),
  };
};

export const sortByDate = <T extends { date: string }>(
  allContent: T[]
): T[] => {
  // Some content contains startDate, some contain date
  return allContent //
    .sort((a, z) => new Date(z.date).getTime() - new Date(a.date).getTime());
};
