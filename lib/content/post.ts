import { markdocFromFile } from "../markdoc";
import type { CatName } from "./cat";
import type { Frontmatter } from "./frontmatter";

export interface PostInfo {
  cat: CatName;
  slug: string;
}
export interface Post extends PostInfo {
  frontmatter: Frontmatter;
  content: any;
}

export const posts: PostInfo[] = [
  {
    cat: "blog",
    slug: "first",
  },
  {
    cat: "blog",
    slug: "account-hacked",
  },
  {
    cat: "blog",
    slug: "better-university-website",
  },
  {
    cat: "blog",
    slug: "working-on-husker",
  },
];

export const getPostsFromCat = (cat?: string): Post[] => {
  const filteredPosts = posts.filter(
    cat ? (postInfo) => postInfo.cat === cat : () => true
  );
  return filteredPosts.map((postInfo) => {
    const post = markdocFromFile(
      `./content/posts/${postInfo.cat}/${postInfo.slug}.md`
    );
    return {
      ...postInfo,
      ...post,
    };
  });
};

export const getPostsFromList = (postInfos: PostInfo[]): Post[] => {
  return postInfos.map((postInfo) => {
    const post = markdocFromFile(
      `./content/posts/${postInfo.cat}/${postInfo.slug}.md`
    );
    return {
      ...postInfo,
      ...post,
    };
  });
};
