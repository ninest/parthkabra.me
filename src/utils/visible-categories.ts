import { getCollection } from "astro:content";

export const visibleCategoryIds = [
  "ai",
  "astro",
  "blog",
  "cli",
  "firefox",
  "git",
  "html",
  "javascript",
  "leetcode",
  "mac",
  "maps",
  "meta",
  "origami",
  "python",
  "restaurants",
  "typescript",
  "ui",
  "vscode",
];

export async function getVisibleCategories() {
  const allCategories = await getCollection("categories");
  const categoryById = new Map(allCategories.map((cat) => [cat.id, cat]));
  return visibleCategoryIds.flatMap((id) => {
    const category = categoryById.get(id);
    return category ? [category] : [];
  });
}
