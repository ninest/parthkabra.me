import { extractSearchableComponentMarkdown } from "../content-components/search";

export function stripMarkdown(md: string): string {
  return extractSearchableComponentMarkdown(md)
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1") // links
    .replace(/#{1,6}\s+/g, "") // headings
    .replace(/[*_~]{1,3}/g, "") // bold/italic/strikethrough
    .replace(/>\s+/g, "") // blockquotes
    .replace(/[-*+]\s+/g, "") // unordered lists
    .replace(/\d+\.\s+/g, "") // ordered lists
    .replace(/---/g, "") // horizontal rules
    .replace(/\n{2,}/g, " ") // collapse newlines
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}
