export interface Cat {
  id: CatName;
  title: string;
}

export const catMap = {
  blog: { title: "Blog" },
  cli: { title: "CLI and Terminal" },
  git: { title: "Git" },
  html: { title: "HTML" },
  mac: { title: "Mac" },
  nextjs: { title: "NextJS" },
  python: { title: "Python" },
  firefox: { title: "Firefox" },
  cs: { title: "Computer Science" },
  meta: { title: "Meta" },
  vscode: { title: "VS Code" },
  typescript: { title: "TypeScript" },
  javascript: { title: "JavaScript" },
};

export type CatName = keyof typeof catMap;

export const cats: Cat[] = Object.keys(catMap).map((catName) => ({
  id: catName as CatName,
  title: catMap[catName as CatName].title,
}));
