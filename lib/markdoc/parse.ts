import { MarkdocFromFile } from "./types";

export const serializeMarkdoc = (markdoc: any): string =>
  JSON.stringify(markdoc);
export const parseMarkdoc = (string: string): MarkdocFromFile =>
  JSON.parse(string);
