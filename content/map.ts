import { allDocuments } from "@/.contentlayer/generated";

/* Blog cats */
export const allCats = {
  blog: { title: "Blog" },
  cli: { title: "CLI and Terminal" },
  git: { title: "Git" },
  html: { title: "HTML" },
  mac: { title: "Mac" },
  nextjs: { title: "NextJS" },
  python: { title: "Python" },
  firefox: { title: "Firefox" },
  meta: { title: "Meta" },
};
export interface Cat {
  title: string;
}
export type CatName = keyof typeof allCats;

export const featuredProjectSlugs = [
  "nextbussg",
  "husker",
  "ninenine",
  "nsr",
  "shots",
];

export const miniProjectSlugs = [
  "typer",
  "uniquecode",
  "hexy-time",
  "direct-contact",
  "nric-utils",
  "ippt-utils",
  "commonapp-celebrate",
];

export const workSlugs = ["ourfinals", "saf", "h3zoomai", "credr"];

export const socialLinks = [
  { title: "GitHub", href: "https://github.com/ninest" },
  { title: "LinkedIn", href: "https://www.linkedin.com/in/parth-kabra/" },
  { title: "Contact", href: "/contact" },
];

/* Alt Cat slugs */
// Some content belongs under multiple slugs
export const altCatPosts: Record<CatName, { cat: CatName; slug: string }[]> = {
  blog: [{ cat: "meta", slug: "redesign-4" }],
  cli: [],
  git: [],
  html: [],
  mac: [
    { cat: "cli", slug: "cmatrix" },
    { cat: "cli", slug: "asciiquarium" },
  ],
  nextjs: [],
  python: [],
  firefox: [],
  meta: [],
};
