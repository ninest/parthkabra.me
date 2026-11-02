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

/** Every published item: guides, the group index and drafts are left out. */
export function items(): Item[] {
  return (cached ??= entries().flatMap((e) => {
    const kind = DIRS[e.path.split("/")[0]!];
    const name = basename(e.path);
    if (!kind || name === "AGENTS" || e.path === "categories/index" || e.frontmatter.draft) return [];
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

const newestFirst = (a: Item, b: Item) => b.date.localeCompare(a.date);

export const ofKind = (kind: Kind) => items().filter((i) => i.kind === kind).sort(newestFirst);
export const byPath = (path: string) => items().find((i) => i.path === path);
export const hasPage = (i: Item) => !i.external && i.kind !== "tool";

/** The site-wide status line and profile links from `site.md`. */
export function site() {
  const fm = entries().find((e) => e.path === "site")!.frontmatter;
  const [, stamp, text] = /^(\d{4}\/\d{2})?\s*(.*)$/.exec(String(fm.status ?? ""))!;
  return { status: text!, statusSince: stamp, links: fm.links as { title: string; url: string }[] };
}

/** A page's markdown with its frontmatter removed. */
export const bodyOf = (i: Pick<Item, "file">) =>
  readFileSync(join(ROOT, i.file), "utf8").replace(/^---\n[\s\S]*?\n---\n?/, "");

export const mediaUrl = (path: string) => "/media/" + path;
export const fileDir = (i: Pick<Item, "file">) => dirname(i.file);

const pathInLink = (value: unknown) => String(value ?? "").replace(/^\[\[|\]\]$/g, "").split("|")[0]!;

/** The first note of the thread a note belongs to; a note with no parent is its own root. */
export function threadRoot(i: Item): Item {
  const parent = byPath(pathInLink(i.frontmatter.thread || i.frontmatter.inReplyTo));
  return parent && parent !== i ? threadRoot(parent) : i;
}

/** Every note in `i`'s thread, oldest first. Only the root when `i` isn't threaded. */
export function thread(i: Item): Item[] {
  const root = threadRoot(i);
  return ofKind("micro")
    .filter((m) => threadRoot(m) === root)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Plain-text opening of a page: its first real paragraph, cut to a sentence or two. */
export function excerpt(i: Item, max = 190): string {
  const block = bodyOf(i)
    .replace(/(`{3,})[\s\S]*?\n\1/g, "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|!\[|>|[-*] |\d+\. |\||<|Links:|Related:)/.test(b));
  if (!block) return "";
  const text = block
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`\\]/g, "")
    .replace(/\s+/g, " ")
    .replace(/'/g, "’");
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentence = cut.search(/[.!?](?=[^.!?]*$)/);
  return sentence > 60 ? cut.slice(0, sentence + 1) : cut.replace(/\s+\S*$/, "") + "…";
}

/** Rough reading time in minutes. */
export function readingTime(i: Item): number {
  return Math.max(1, Math.round(bodyOf(i).split(/\s+/).length / 220));
}

/** The items that link to `i`, newest first, skipping its own thread. */
export function mentionedIn(i: Item): Item[] {
  const own = i.kind === "micro" ? thread(i) : [i];
  return items()
    .filter((o) => Object.values(o.links).includes(i.path) && !own.includes(o) && o.kind !== "category")
    .sort(newestFirst);
}

/** What to read after `i`: its neighbours in the same topic first, then in the same kind. */
export function keepReading(i: Item, count = 2): Item[] {
  const pool = (i.kind === "micro" ? ledger() : ofKind(i.kind)).filter((o) => !o.external && o.kind !== "tool");
  const at = pool.findIndex((o) => o.path === threadRoot(i).path);
  const near = (list: Item[]) => {
    const older = list.filter((o) => pool.indexOf(o) > at);
    const newer = list.filter((o) => pool.indexOf(o) < at).reverse();
    return [older[0], newer[0], ...older.slice(1)];
  };
  const sameTopic = pool.filter((o) => o.categories[0] && o.categories[0] === i.categories[0]);
  const picks = [...near(sameTopic), ...near(pool)].filter((o): o is Item => !!o && o.path !== threadRoot(i).path);
  return [...new Set(picks)].slice(0, count);
}

/** The chronological list of writing: posts and the first note of each thread. */
export function ledger(): Item[] {
  return items()
    .filter((i) => i.kind === "post" || (i.kind === "micro" && threadRoot(i) === i))
    .sort(newestFirst);
}

/** Topics with at least one published post or note, most used first. */
export function topics(): { item: Item; count: number }[] {
  return ofKind("category")
    .map((item) => ({
      item,
      count: items().filter((i) => (i.kind === "post" || i.kind === "micro") && i.categories.includes(item.slug)).length,
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count || a.item.title.localeCompare(b.item.title));
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
