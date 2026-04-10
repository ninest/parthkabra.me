import { getCollection } from "astro:content";

let validated = false;

export async function validateRelatedLinks() {
  if (validated) return;
  validated = true;

  const [posts, microblog, projects, work, pages, postCollections] = await Promise.all([
    getCollection("posts"),
    getCollection("microblog"),
    getCollection("projects"),
    getCollection("workExperience"),
    getCollection("pages"),
    getCollection("postCollections"),
  ]);

  const validIds = new Set<string>();
  for (const p of posts) validIds.add(`post:${p.id}`);
  for (const m of microblog) validIds.add(`microblog:${m.id}`);
  for (const p of projects) validIds.add(`project:${p.id}`);
  for (const w of work) validIds.add(`work:${w.id}`);
  for (const p of pages) validIds.add(`page:${p.id}`);
  for (const c of postCollections) validIds.add(`collection:${c.id}`);

  const allEntries = [
    ...posts.map((e) => ({ source: `post:${e.id}`, related: e.data.related })),
    ...microblog.map((e) => ({
      source: `microblog:${e.id}`,
      related: e.data.related,
    })),
    ...microblog.map((e) => ({
      source: `microblog:${e.id} (reply)`,
      related: e.data.reply,
    })),
    ...projects.map((e) => ({
      source: `project:${e.id}`,
      related: e.data.related,
    })),
    ...work.map((e) => ({ source: `work:${e.id}`, related: e.data.related })),
    ...pages.map((e) => ({
      source: `page:${e.id}`,
      related: e.data.related,
    })),
    ...postCollections.map((e) => ({
      source: `collection:${e.id}`,
      related: [...e.data.related, ...e.data.items],
    })),
  ];

  for (const entry of allEntries) {
    for (const ref of entry.related) {
      if (!validIds.has(ref)) {
        console.warn(`[related] Invalid reference "${ref}" in ${entry.source}`);
      }
    }
  }
}
