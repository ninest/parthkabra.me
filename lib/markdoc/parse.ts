import { MarkdownPage } from "../content/markdown";

export const serializeMarkdownPage = (mdPage: MarkdownPage): string =>
  JSON.stringify(mdPage);
export const parseMarkdownPage = (str: string): MarkdownPage => JSON.parse(str);

export const serializeMarkdownPages = (mdPages: MarkdownPage[]): string[] =>
  mdPages.map(serializeMarkdownPage);

export const parseMarkdownPages = (strs: string[]): MarkdownPage[] =>
  strs.map(parseMarkdownPage);
