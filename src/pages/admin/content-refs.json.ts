export const prerender = true;

import { getCollection } from "astro:content";

export async function GET() {
  const [posts, microblog, projects, workExperience, pages, postCollections, tools] = await Promise.all([
    getCollection("posts"),
    getCollection("microblog"),
    getCollection("projects"),
    getCollection("workExperience"),
    getCollection("pages"),
    getCollection("postCollections"),
    getCollection("tools"),
  ]);

  const refs = [
    ...posts.map((p) => ({ ref: `post:${p.id}`, title: p.data.title, type: "Post" })),
    ...microblog.map((m) => ({
      ref: `microblog:${m.id}`,
      title: m.data.title ?? m.id,
      type: "Microblog",
    })),
    ...projects.map((p) => ({ ref: `project:${p.id}`, title: p.data.title, type: "Project" })),
    ...workExperience.map((w) => ({ ref: `work:${w.id}`, title: w.data.title, type: "Work" })),
    ...pages.map((p) => ({ ref: `page:${p.id}`, title: p.data.title, type: "Page" })),
    ...postCollections.map((c) => ({ ref: `collection:${c.id}`, title: c.data.title, type: "Collection" })),
    ...tools.map((t) => ({ ref: `tool:${t.id}`, title: t.data.title, type: "Tool" })),
  ];

  return new Response(JSON.stringify(refs), {
    headers: { "Content-Type": "application/json" },
  });
}
