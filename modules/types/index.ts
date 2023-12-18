import { Entry } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

type WithSlugField = { slug: string };

export type Work = Omit<Entry<(typeof keystaticConfig)["collections"]["work"]> & WithSlugField, "content">;
export type Project = Entry<(typeof keystaticConfig)["collections"]["projects"]> & WithSlugField;
export type Post = Omit<Entry<(typeof keystaticConfig)["collections"]["posts"]>, "content"> & WithSlugField;
export type Category = Entry<(typeof keystaticConfig)["collections"]["categories"]> & WithSlugField;

export type PostCollection = Omit<
  Entry<(typeof keystaticConfig)["collections"]["postCollections"]>,
  "content" | "posts"
> &
  WithSlugField & { posts: Post[] };

export type PostLink = Post["links"][number];
