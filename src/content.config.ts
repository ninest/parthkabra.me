import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const baseFields = {
  draft: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
};

const contentFields = {
  ...baseFields,
  description: z.string().min(5),
  showContents: z.boolean().default(false),
  featured: z.boolean().default(false),
  theme: z.string().optional(),
};

const categories = defineCollection({
  loader: glob({ base: "./parthkabra-me/categories", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
  }),
});

const supercats = defineCollection({
  loader: glob({ base: "./parthkabra-me/supercats", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    categories: z.array(z.string()).default([]),
    order: z.number().default(0),
  }),
});

const posts = defineCollection({
  loader: glob({ base: "./parthkabra-me/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    ...contentFields,
    categories: z.array(z.string()).default([]),
    externalUrl: z.string().url().optional(),
  }),
});

const workExperience = defineCollection({
  loader: glob({ base: "./parthkabra-me/work-experience", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    ...contentFields,
    icon: z.string().optional(),
    dateline: z.string(),
    order: z.number().optional(),
    location: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: "./parthkabra-me/projects", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    ...contentFields,
  }),
});

const links = defineCollection({
  loader: file("./parthkabra-me/links.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    order: z.number(),
  }),
});

const microblog = defineCollection({
  loader: glob({ base: "./parthkabra-me/microblog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().optional(),
    ...baseFields,
    description: z.string().optional(),
    categories: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    thread: z.string().optional(),
    inReplyTo: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ base: "./parthkabra-me/pages", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    ...contentFields,
    description: z.string().optional(),
  }),
});

const tools = defineCollection({
  loader: glob({ base: "./parthkabra-me/tools", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    ...contentFields,
  }),
});

const status = defineCollection({
  loader: file("./parthkabra-me/status.json"),
  schema: z.object({
    id: z.string(),
    status: z.string(),
  }),
});

export const collections = { categories, supercats, links, microblog, posts, workExperience, projects, pages, tools, status };
