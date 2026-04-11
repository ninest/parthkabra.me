import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const linkSchema = z.object({
  title: z.string().min(1),
  url: z.string(),
});

const baseFields = {
  draft: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  related: z.array(z.string()).default([]),
};

const contentFields = {
  ...baseFields,
  description: z.string().min(5),
  links: z.array(linkSchema).default([]),
  showContents: z.boolean().default(false),
  featured: z.boolean().default(false),
  theme: z.string().optional(),
};

const categories = defineCollection({
  loader: glob({ base: "./content/categories", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
  }),
});

const posts = defineCollection({
  loader: glob({ base: "./content/posts", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    ...contentFields,
    categories: z.array(z.string()).default([]),
  }),
});

const workExperience = defineCollection({
  loader: glob({ base: "./content/work-experience", pattern: "**/*.{md,mdx}" }),
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
  loader: glob({ base: "./content/projects", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    ...contentFields,
  }),
});

const links = defineCollection({
  loader: file("./content/links.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    order: z.number(),
  }),
});

const microblog = defineCollection({
  loader: glob({ base: "./content/microblog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().optional(),
    ...baseFields,
    description: z.string().optional(),
    categories: z.array(z.string()).default([]),
    links: z.array(linkSchema).default([]),
    featured: z.boolean().default(false),
    reply: z.array(z.string()).default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ base: "./content/pages", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    ...contentFields,
    description: z.string().optional(),
  }),
});

const postCollections = defineCollection({
  loader: glob({ base: "./content/collections", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ...baseFields,
    items: z.array(z.string()).default([]),
  }),
});

const tools = defineCollection({
  loader: glob({ base: "./content/tools", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    ...contentFields,
  }),
});

const status = defineCollection({
  loader: file("./content/status.json"),
  schema: z.object({
    id: z.string(),
    status: z.string(),
  }),
});

export const collections = { categories, links, microblog, posts, workExperience, projects, pages, postCollections, tools, status };
