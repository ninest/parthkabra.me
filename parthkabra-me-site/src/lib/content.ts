// The site's view of the content: the miscfs export in .export/ (see scripts/content.mjs), turned
// into items a page can show. The content's AGENTS.md is the source for the path-to-URL rules.
import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import {
  getCategoryUrl,
  getCollectionUrl,
  getMicroblogUrl,
  getPageUrl,
  getPostUrl,
  getProjectUrl,
  getToolUrl,
  getWorkUrl,
} from "../utils/links";

const ROOT = join(process.cwd(), ".export");

export type Kind = "post" | "micro" | "project" | "work" | "tool" | "collection" | "page" | "category";

type ManifestEntry = {
  path: string;
  file: string;
  title?: string;
  frontmatter: Record<string, any>;
  cover?: string;
  links: Record<string, string>;
};

export type Item = {
  path: string;
  file: string;
  kind: Kind;
  slug: string;
  title: string;
  description?: string;
  href: string;
  external: boolean;
  date: string;
  updated?: string;
  categories: string[];
  frontmatter: Record<string, any>;
  cover?: string;
  links: Record<string, string>;
};

const DIRS: Record<string, Kind> = {
  posts: "post",
  micro: "micro",
  projects: "project",
  work: "work",
  tools: "tool",
  collections: "collection",
  pages: "page",
  categories: "category",
};

/** The URL an entry is published at, by the content guide's rules. */
function hrefOf(kind: Kind, path: string, slug: string, fm: Record<string, any>): string {
  switch (kind) {
    case "post":
      return fm.externalUrl ?? getPostUrl(fm.categories[0], slug);
    case "micro":
      return getMicroblogUrl(path.replace(/^micro\//, ""));
    case "project":
      return getProjectUrl(slug);
    case "work":
      return getWorkUrl(slug);
    case "tool":
      return getToolUrl(slug);
    case "collection":
      return getCollectionUrl(slug);
    case "page":
      return getPageUrl(slug);
    case "category":
      return getCategoryUrl(slug);
  }
}

let manifest: ManifestEntry[] | undefined;
const entries = () =>
  (manifest ??= JSON.parse(readFileSync(join(ROOT, "_miscfs/pages.json"), "utf8")).pages as ManifestEntry[]);

let cached: Item[] | undefined;

/** Every item with its own page, drafts included: guides and the group index are left out. */
export function allItems(): Item[] {
  return (cached ??= entries().flatMap((e) => {
    const kind = DIRS[e.path.split("/")[0]!];
    const name = basename(e.path);
    if (!kind || name === "AGENTS" || e.path === "categories") return [];
    const fm = e.frontmatter;
    const created = String(fm.createdAt ?? fm.startDate ?? "");
    const updated = fm.updatedAt && String(fm.updatedAt) !== created ? String(fm.updatedAt) : undefined;
    return [
      {
        path: e.path,
        file: e.file,
        kind,
        slug: name,
        title: e.title ?? name,
        description: fm.description,
        href: hrefOf(kind, e.path, name, fm),
        external: Boolean(fm.externalUrl),
        date: created,
        updated,
        categories: fm.categories ?? [],
        frontmatter: fm,
        cover: e.cover,
        links: e.links,
      },
    ];
  }));
}

let published: Item[] | undefined;

/** Every item to list anywhere. Drafts are left out: they have a page, reachable only by its URL. */
export const items = () => (published ??= allItems().filter((i) => !i.frontmatter.draft));

const newestFirst = (a: Item, b: Item) => b.date.localeCompare(a.date);

export const ofKind = (kind: Kind) => items().filter((i) => i.kind === kind).sort(newestFirst);
export const byPath = (path: string) => allItems().find((i) => i.path === path);
export const hasPage = (i: Item) => !i.external && i.kind !== "tool";

/** The site-wide status line and profile links from `site.md`. */
export function site() {
  const fm = entries().find((e) => e.path === "site")!.frontmatter;
  const [, since, now] = /^(\d{4}\/\d{2})?\s*(.*)$/.exec(String(fm.status ?? ""))!;
  return { now: now!, nowSince: since, links: fm.links as { title: string; url: string }[] };
}

/** A page's markdown with its frontmatter removed. */
export const bodyOf = (i: Pick<Item, "file">) =>
  readFileSync(join(ROOT, i.file), "utf8").replace(/^---\n[\s\S]*?\n---\n?/, "");

export const mediaUrl = (path: string) => "/media/" + path;
export const fileDir = (i: Pick<Item, "file">) => dirname(i.file);

const pathInLink = (value: unknown) => String(value ?? "").replace(/^\[\[|\]\]$/g, "").split("|")[0]!;

/**
 * The first note of the thread a note belongs to. Only `thread` joins a thread: a note with no `thread`
 * is its own root, even when its `inReplyTo` names a note elsewhere.
 */
export function threadRoot(i: Item): Item {
  const parent = byPath(pathInLink(i.frontmatter.thread));
  return parent && parent !== i ? threadRoot(parent) : i;
}

/** The note `i` replies to when that note is in another thread, shown as a link above `i`. */
export function replyElsewhere(i: Item): Item | undefined {
  const parent = byPath(pathInLink(i.frontmatter.inReplyTo));
  return parent && parent !== i && threadRoot(parent) !== threadRoot(i) ? parent : undefined;
}

/** Every note in `i`'s thread, oldest first. Only the root when `i` isn't threaded. */
export function thread(i: Item): Item[] {
  const root = threadRoot(i);
  return ofKind("micro")
    .filter((m) => threadRoot(m) === root)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Page `i`'s body as plain text, for search and excerpts. */
export function plainText(i: Pick<Item, "file">): string {
  return bodyOf(i)
    .replace(/(`{3,})[\s\S]*?\n\1/g, "")
    .replace(/^(Links|Related):.*$/gm, "")
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Plain-text opening of a page, cut to a sentence or two. */
export function excerpt(i: Item, max = 190): string {
  const text = plainText(i).replace(/'/g, "’");
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentence = cut.search(/[.!?](?=[^.!?]*$)/);
  return sentence > 60 ? cut.slice(0, sentence + 1) : cut.replace(/\s+\S*$/, "") + "…";
}

/** The URL of an image in a page's folder, as named by its markdown or properties. */
export const assetUrl = (i: Pick<Item, "file">, name: string) =>
  /^(https?:)?\//.test(name) ? name : mediaUrl(`${fileDir(i)}/${name}`);

/** The first image in a page's body, if any. */
export function firstImage(i: Item): string | undefined {
  const name = /!\[[^\]]*\]\(([^)\s]+)/.exec(bodyOf(i))?.[1];
  return name && !/\.(mp4|mov|webm)$/i.test(name) ? assetUrl(i, name) : undefined;
}

/** Work, most recent first. */
export const workByOrder = () =>
  ofKind("work").sort((a, b) => (b.frontmatter.order ?? 0) - (a.frontmatter.order ?? 0));

/** Each microblog thread as its notes (oldest first), the most recently active thread first. */
export function microThreads(): Item[][] {
  return ofKind("micro")
    .filter((m) => threadRoot(m) === m)
    .map(thread)
    .sort((a, b) => b.at(-1)!.date.localeCompare(a.at(-1)!.date));
}

/** The chronological list of writing: posts and the first note of each thread. */
export function ledger(): Item[] {
  return items()
    .filter((i) => i.kind === "post" || (i.kind === "micro" && threadRoot(i) === i))
    .sort(newestFirst);
}

/** Formats an ISO date: long is "April 20, 2026", short is "Apr 20". */
export function formatDate(date: string, style: "long" | "short" | "month" = "long"): string {
  const d = new Date(date.slice(0, 10) + "T12:00:00");
  const options: Intl.DateTimeFormatOptions =
    style === "long"
      ? { month: "long", day: "numeric", year: "numeric" }
      : style === "short"
        ? { month: "short", day: "numeric" }
        : { month: "long", year: "numeric" };
  return d.toLocaleDateString("en-US", options);
}
