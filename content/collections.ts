export interface Collection {
  slug: string;
  title: string;
  description: string;
  posts: {
    slugs: string[];
  };
}
export const collections: Collection[] = [
  {
    slug: "husker",
    title: "Husker",
    description:
      "Progress on Husker, a university portal for Northeastern University",
    posts: {
      slugs: ["better-university-website", "working-on-husker"],
    },
  },
  {
    slug: "redesign",
    title: "Redesigns",
    description: "Website redesigns",
    posts: {
      slugs: ["redesign", "redesign-3"],
    },
  },
  {
    slug: "cool-commands",
    title: "Cool Terminal Commands",
    description: "Interesting terminal commands and packages",
    posts: { slugs: ["cmatrix", "asciiquarium", "terminal-games"] },
  },
];
export type CollectionKey = keyof typeof collections;
