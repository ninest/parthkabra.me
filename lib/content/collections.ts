
export const collections = [
  {
    slug: "husker",
    title: "Husker",
    description:
      "Progress on Husker, a university portal for Northeastern University",
    posts: [
      { cat: "blog", slug: "better-university-website" },
      { cat: "blog", slug: "working-on-husker" },
    ],
  },
  {
    slug: "redesign",
    title: "Redesigns",
    description: "Website redesigns",
    posts: [
      { cat: "meta", slug: "redesign" },
      { cat: "meta", slug: "redesign-3" },
    ],
  },
  {
    slug: "cool-commands",
    title: "Cool Terminal Commands",
    description: "Interesting terminal commands and packages",
    posts: [
      { cat: "cli", slug: "cmatrix" },
      { cat: "cli", slug: "asciiquarium" },
      { cat: "mac", slug: "terminal-games" },
    ],
  },
];
export type CollectionKey = keyof typeof collections;
