export const prerender = true;

import { getCollection } from "astro:content";
import { stripMarkdown } from "../utils/markdown";
import { firstSentence, truncate } from "../utils/string";
import { getVisiblePosts } from "../utils/posts";
import { getPostLink } from "../utils/links";

export async function GET() {
  const [categories, posts, projects, workExperience, microblog, tools] = await Promise.all([
    getCollection("categories"),
    getVisiblePosts(),
    getCollection("projects"),
    getCollection("workExperience"),
    getCollection("microblog"),
    getCollection("tools"),
  ]);

  const index = [
    ...categories.map((c) => ({
      id: `category-${c.id}`,
      type: "category",
      title: c.data.title,
      description: "",
      body: c.body ? stripMarkdown(c.body) : "",
      createdAt: "",
    })),
    ...posts.map((p) => {
      const link = getPostLink(p.id, p.data.externalUrl);
      return {
        id: `post-${p.id}`,
        type: "post",
        title: p.data.title,
        description: p.data.description,
        body: p.body ? stripMarkdown(p.body) : "",
        createdAt: p.data.createdAt.toISOString(),
        url: link.href,
        external: link.external,
      };
    }),
    ...projects.map((p) => ({
      id: `project-${p.id}`,
      type: "project",
      title: p.data.title,
      description: p.data.description,
      body: p.body ? stripMarkdown(p.body) : "",
      createdAt: p.data.createdAt.toISOString(),
    })),
    ...workExperience.map((w) => ({
      id: `work-${w.id}`,
      type: "work",
      title: w.data.title,
      description: w.data.description,
      body: w.body ? stripMarkdown(w.body) : "",
      createdAt: w.data.createdAt.toISOString(),
    })),
    ...tools.map((t) => ({
      id: `tool-${t.id}`,
      type: "tool",
      title: t.data.title,
      description: t.data.description,
      body: t.body ? stripMarkdown(t.body) : "",
      createdAt: t.data.createdAt.toISOString(),
    })),
    ...microblog.map((m) => {
      const plain = m.body ? stripMarkdown(m.body) : "";
      const firstMbSentence = firstSentence(plain);
      const dateline = m.data.createdAt.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      return {
        id: `microblog-${m.id}`,
        type: "microblog",
        title: m.data.title ?? (firstMbSentence ? truncate(firstMbSentence, 60) : dateline),
        description: m.data.description ?? truncate(plain, 155),
        body: plain,
        createdAt: m.data.createdAt.toISOString(),
      };
    }),
  ];

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
}
