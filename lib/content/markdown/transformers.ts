import { LinkItem } from "@/types";
import { MarkdownPage } from ".";

export const mdToLink = (mdPage: MarkdownPage): LinkItem => ({
  title: mdPage.frontmatter.title,
  href: mdPage.href,
  description: mdPage.frontmatter.description,
  date: new Date(mdPage.frontmatter.date),
});

export const mdsToLinks = (mdPages: MarkdownPage[]): LinkItem[] =>
  mdPages.map(mdToLink);
