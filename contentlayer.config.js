import {
  defineDocumentType,
  defineNestedType,
  makeSource,
} from "contentlayer/source-files";
import path from "path";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { remarkMdxImages } from "remark-mdx-images";
import rehypePrettyCode from "rehype-pretty-code";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

const Link = defineNestedType(() => ({
  name: "Link",
  fields: {
    title: {
      type: "string",
      description: "Link title",
      required: true,
    },
    source: {
      type: "string",
      description:
        "Link source (GitHub, YouTube, or regular website by default)",
      required: false,
    },
    href: {
      type: "string",
      description: "URL",
      required: true,
    },
  },
}));

export const Post = defineDocumentType(() => ({
  name: "Post",
  contentType: "mdx",
  filePathPattern: "posts/**/*.md",
  fields: {
    title: {
      type: "string",
      description: "Post title",
      required: true,
    },
    date: {
      type: "date",
      description: "Date created",
      required: true,
    },
    description: {
      type: "string",
      description: "Post description",
      required: true,
    },
    metaDescription: {
      type: "string",
      description: "Post description for SEO",
      required: false,
    },
    links: {
      type: "list",
      of: Link,
    },
    showContents: {
      type: "boolean",
      description: "Show table of contents?",
      default: true,
    },
    draft: {
      type: "boolean",
      description: "Should this post be published?",
      default: false,
    },
  },
  computedFields: {
    cat: {
      type: "string",
      resolve: (post) => {
        // Get the parent folder name
        const folderName = post._raw.sourceFileDir
          .split("posts/")[1]
          .split("/")[0];
        return folderName;
      },
    },
    slug: {
      type: "string",
      resolve: (post) => {
        // Name of folder containing index.md
        const folderName = post._raw.sourceFileDir.split("/").at(-1);
        return folderName;
      },
    },
  },
}));

export const Work = defineDocumentType(() => ({
  name: "Work",
  contentType: "mdx",
  filePathPattern: "work/**/*.md",
  fields: {
    title: {
      type: "string",
      description: "Company or experience name",
      required: true,
    },
    description: {
      type: "string",
      description: "Post description",
      required: true,
    },
    startDate: {
      type: "date",
      description: "Experience start date",
      required: true,
    },
    endDate: {
      type: "date",
      description: "Experience end date",
      required: false,
    },
    location: {
      type: "string",
      description: "Location of the job",
      required: true,
    },
    website: {
      type: "string",
      description: "Company website",
      required: true,
    },
    projects: {
      type: "list",
      of: Link,
      required: false,
    },
    showContents: {
      type: "boolean",
      description: "Show table of contents?",
      default: true,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (post) => {
        // Name of folder containing index.md
        const folderName = post._raw.sourceFileDir.split("/").at(-1);
        return folderName;
      },
    },
  },
}));

export const Project = defineDocumentType(() => ({
  name: "Project",
  contentType: "mdx",
  filePathPattern: "projects/**/*.md",
  fields: {
    title: {
      type: "string",
      description: "Project title",
      required: true,
    },
    date: {
      type: "date",
      description: "Date created",
      required: true,
    },
    description: {
      type: "string",
      description: "Project description",
      required: true,
    },
    links: {
      type: "list",
      of: Link,
    },
    showContents: {
      type: "boolean",
      description: "Show table of contents?",
      default: true,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (project) => {
        // Name of folder containing index.md
        const folderName = project._raw.sourceFileDir.split("/").at(-1);
        return folderName;
      },
    },
  },
}));

export const MePage = defineDocumentType(() => ({
  name: "MePage",
  contentType: "mdx",
  filePathPattern: "me/**/*.md",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: true,
    },
    links: {
      type: "list",
      of: Link,
      required: false,
    },
    showContents: {
      type: "boolean",
      description: "Show table of contents?",
      default: true,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (post) => {
        // Name of folder containing index.md
        const folderName = post._raw.sourceFileDir.split("/").at(-1);
        return folderName;
      },
    },
  },
}));

const prettyCodeOptions = {
  theme: "one-dark-pro",

  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className.push("highlighted");
  },
  onVisitHighlightedWord(node) {
    node.properties.className = ["highlighted-word"];
  },
};

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Post, Work, Project, MePage],
  mdx: {
    cwd: path.join(process.cwd(), "/content"),
    remarkPlugins: [remarkMdxImages, remarkMath, remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      rehypeAutolinkHeadings,
      [rehypePrettyCode, prettyCodeOptions],
      rehypeKatex,
    ],
    esbuildOptions: (options) => {
      options.outdir = path.join(process.cwd(), "/public/notouchy");
      options.loader = {
        ...options.loader,
        ".png": "file",
      };
      options.publicPath = "/";
      options.write = true;
      return options;
    },
  },
});
