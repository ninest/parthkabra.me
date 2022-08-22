import { markdocFromFile } from "../markdoc";
import { Frontmatter } from "./frontmatter";

export interface MePageInfo {
  slug: string;
}
export interface MePage extends MePageInfo {
  frontmatter: Frontmatter;
  content: any;
}

export const mePages: MePageInfo[] = [{ slug: "about" }, { slug: "resume" }];

export const getMePages = (): MePage[] => {
  return mePages.map((mePage) => {
    const page = getMePage(mePage.slug);
    return page;
  });
};

export const getMePage = (slug: string): MePage => {
  return { slug, ...markdocFromFile(`me/${slug}`) };
};
