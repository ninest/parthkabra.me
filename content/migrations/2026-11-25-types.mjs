// One-off migration (ticket ninest/parthkabra.me#1): gives every page of the parthkabra-me content root its
// miscfs Type, and writes posts' and micro posts' categories as links to category pages, as their link
// Fields expect. It edits frontmatter lines in place, so the rest of each file stays as written, and it moves
// no file. Run once, with the instance stopped, from anywhere: node content/migrations/2026-11-25-types.mjs
//
// The Type comes from the folder a page sits in: that's the rule this migration retires. Agent guides, the
// `categories` index (the category groups) and `site` stay an Any.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../miscfs-content");

const TYPES = {
  posts: "post",
  micro: "micro",
  categories: "category",
  projects: "project",
  work: "work",
  tools: "tool",
  collections: "collection",
  pages: "page",
};

/** Every markdown file in the content root, skipping hidden and reserved (`_`) folders. */
function* markdownFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (/^[._]/.test(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* markdownFiles(path);
    else if (entry.name.endsWith(".md")) yield path;
  }
}

/** A file's page path: without `.md` or `/index.md`. */
const pagePath = (file) => relative(root, file).replace(/(\/index)?\.md$/, "");

/** The Type a page gets, or none for a page that stays an Any. */
function typeOf(path) {
  const segments = path.split("/");
  if (segments.length < 2 || segments.at(-1) === "AGENTS") return undefined;
  return TYPES[segments[0]];
}

const asLink = (slug) => `"[[categories/${slug}]]"`;
const isLink = (value) => /^["']?\[\[/.test(value);

/** Frontmatter `lines` with each category slug written as a link to its category page. */
function linkCategories(lines) {
  const at = lines.findIndex((line) => /^categories:/.test(line));
  if (at === -1) return lines;
  const out = [...lines];
  const flow = /^categories:\s*\[(.*)\]\s*$/.exec(lines[at]);
  if (flow) {
    const slugs = flow[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    if (slugs.length && !slugs.some(isLink)) out[at] = `categories: [${slugs.map(asLink).join(", ")}]`;
    return out;
  }
  if (!/^categories:\s*$/.test(lines[at])) throw new Error(`can't read categories: ${lines[at]}`);
  for (let i = at + 1; i < lines.length && /^\s*-\s/.test(lines[i]); i++) {
    const [, indent, value] = /^(\s*-\s+)(.*?)\s*$/.exec(lines[i]);
    if (!isLink(value)) out[i] = indent + asLink(value.replace(/^["']|["']$/g, ""));
  }
  return out;
}

let changed = 0;
for (const file of markdownFiles(root)) {
  const path = pagePath(file);
  const type = typeOf(path);
  if (!type) continue;
  const raw = readFileSync(file, "utf8");
  const match = /^---\n([\s\S]*?)\n---(\n|$)/.exec(raw);
  if (!match) throw new Error(`${path} has no frontmatter`);
  let lines = match[1].split("\n");
  if (lines.some((line) => /^type:/.test(line))) throw new Error(`${path} already has a type`);
  if (type === "post" || type === "micro") lines = linkCategories(lines);
  lines = [`type: ${type}`, ...lines];
  writeFileSync(file, `---\n${lines.join("\n")}\n---${match[2]}${raw.slice(match[0].length)}`);
  changed++;
}
console.log(`gave ${changed} pages their Type`);
