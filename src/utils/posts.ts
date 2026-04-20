import { getCollection, type CollectionEntry } from "astro:content";

/** All posts, including drafts. Use for detail-page getStaticPaths, validation, and admin tooling. */
export async function getAllPosts(): Promise<CollectionEntry<"posts">[]> {
  return getCollection("posts");
}

/** Non-draft posts. Use for every listing, sidebar, and internal-search surface. */
export async function getVisiblePosts(): Promise<CollectionEntry<"posts">[]> {
  return (await getAllPosts()).filter((p) => !p.data.draft);
}
