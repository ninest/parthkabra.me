import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

export const reader = createReader(process.cwd(), keystaticConfig);

export async function getAllWork(filters?: { featured?: boolean }) {
  const workSlugs = await reader.collections.work.list();
  const posts = await Promise.all(
    workSlugs.map(async (slug) => ({ slug, ...(await reader.collections.work.readOrThrow(slug)) }))
  );

  posts.sort((a, b) => new Date(b.date.start).getTime() - new Date(a.date.start).getTime());

  if (filters) {
    return posts.filter((post) => post.featured === filters.featured);
  }
  return posts;
}
export async function getWork(slug: string) {
  const post = await reader.collections.work.readOrThrow(`${slug}`);
  return post;
}

export async function getAllProjects(filters?: { featured?: boolean }) {
  const projectSlugs = await reader.collections.projects.list();
  const posts = await Promise.all(
    projectSlugs.map(async (slug) => ({ slug, ...(await reader.collections.projects.readOrThrow(slug)) }))
  );

  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filters) {
    return posts.filter((post) => post.featured === filters.featured);
  }
  return posts;
}
export async function getProject(slug: string) {
  const post = await reader.collections.projects.readOrThrow(`${slug}`);
  return post;
}

export async function getAllPosts() {
  const postSlugs = await reader.collections.posts.list();
  const posts = await Promise.all(
    postSlugs.map(async (slug) => ({ slug, ...(await reader.collections.posts.readOrThrow(slug)) }))
  );
  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return posts.filter((post) => !post.draft);
}

export async function getPost(cat: string, slug: string) {
  const post = await reader.collections.posts.readOrThrow(`${cat}/${slug}`);
  return post;
}

export async function getMetaPost(slug: string) {
  const post = await reader.collections.metaPosts.readOrThrow(slug);
  return post;
}

export async function getAllCategories() {
  const catSlugs = await reader.collections.categories.list();
  const cats = await Promise.all(
    catSlugs.map(async (slug) => ({ slug, ...(await reader.collections.categories.readOrThrow(slug)) }))
  );
  // cats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return cats;
}

export async function getCategory(slug: string) {
  const cat = await reader.collections.categories.readOrThrow(slug);
  return { slug, ...cat };
}
