import { formatDate, startEndYear } from "@/lib/date";
import { LinkItem } from "@/types";
import { MarkdownPage } from ".";

export const mdToLink = (page: MarkdownPage): LinkItem => {
  const linkItem = {
    slug: page.slug,
    title: page.frontmatter.title,
    href: page.href,
    description: page.frontmatter.description,
    // Format date here so this can be sent without serialization
    date: page.frontmatter.date
      ? formatDate(new Date(page.frontmatter.date))
      : undefined,
  };

  // If it's a work page, the date should be `startYear-endYear`
  if (!linkItem.date && page.frontmatter.startDate) {
    linkItem.date = startEndYear({
      start: page.frontmatter.startDate,
      end: page.frontmatter.endDate,
    });
  }

  return linkItem;
};

export const mdsToLinks = (pages: MarkdownPage[]): LinkItem[] =>
  pages.map(mdToLink);
