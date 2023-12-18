import { Entry } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

type WithSlugField = { slug: string };

export type Work = Omit<Entry<(typeof keystaticConfig)["collections"]["work"]> & WithSlugField, "content">;
export type Project = Entry<(typeof keystaticConfig)["collections"]["projects"]> & WithSlugField;
export type Post = Entry<(typeof keystaticConfig)["collections"]["posts"]> & WithSlugField;
export type Category = Entry<(typeof keystaticConfig)["collections"]["categories"]> & WithSlugField;

export type PostLink = Post['links'][number]