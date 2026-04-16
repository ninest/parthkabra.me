import { getCollection, type CollectionEntry } from "astro:content";
import { parseRelatedString } from "./related";

type MicroblogEntry = CollectionEntry<"microblog">;

type ThreadIndex = {
  byId: Map<string, MicroblogEntry>;
  /** For each entry id, the ids of posts that reply to it (its descendants). */
  children: Map<string, string[]>;
};

/**
 * Load all (non-draft) microblog entries and build the `byId` + `children`
 * maps used by the thread walkers. `children[parentId]` lists the ids of posts
 * whose `reply` array contains `parentId`.
 */
async function loadIndex(): Promise<ThreadIndex> {
  const all = (await getCollection("microblog")).filter((e) => !e.data.draft);

  const byId = new Map<string, MicroblogEntry>();
  for (const entry of all) byId.set(entry.id, entry);

  const children = new Map<string, string[]>();
  for (const entry of all) {
    for (const ref of entry.data.reply) {
      const parsed = parseRelatedString(ref);
      if (!parsed || parsed.collection !== "microblog") continue;
      if (parsed.id === entry.id) continue; // self-reference
      if (!byId.has(parsed.id)) continue; // missing / deleted
      const list = children.get(parsed.id) ?? [];
      list.push(entry.id);
      children.set(parsed.id, list);
    }
  }

  return { byId, children };
}

/** Parents of a post, resolved to entries. Skips self-refs, missing, and non-microblog refs. */
function resolveParents(
  entry: MicroblogEntry,
  byId: Map<string, MicroblogEntry>,
): MicroblogEntry[] {
  const parents: MicroblogEntry[] = [];
  for (const ref of entry.data.reply) {
    const parsed = parseRelatedString(ref);
    if (!parsed || parsed.collection !== "microblog") continue;
    if (parsed.id === entry.id) continue;
    const parent = byId.get(parsed.id);
    if (!parent) continue;
    parents.push(parent);
  }
  return parents;
}

/** Sort entries oldest-first by `createdAt`, with `id` as a stable tiebreaker. */
function sortChrono(entries: MicroblogEntry[]): MicroblogEntry[] {
  return [...entries].sort((a, b) => {
    const diff = a.data.createdAt.getTime() - b.data.createdAt.getTime();
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Returns `[current, ...descendants]` — the current post followed by every
 * post transitively replying to it — sorted chronologically. Use this for
 * the Twitter-style focused view (current post at the top, replies flow below).
 */
export async function getMicroblogDescendantChain(
  currentId: string,
): Promise<MicroblogEntry[]> {
  const { byId, children } = await loadIndex();
  if (!byId.has(currentId)) return [];

  const visited = new Set<string>([currentId]);
  const queue: string[] = [currentId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const childId of children.get(id) ?? []) {
      if (visited.has(childId)) continue;
      visited.add(childId);
      queue.push(childId);
    }
  }

  return sortChrono([...visited].map((id) => byId.get(id)!));
}

/**
 * Returns the root post(s) of the conversation above `currentId` — the
 * topmost ancestors with no (resolvable) parent. Returns an empty array
 * when `currentId` is itself a root, so callers can use length to decide
 * whether to render a "View full thread" link.
 *
 * Can return multiple entries when the ancestor chain branches (a post
 * replies to multiple parents from different threads).
 */
export async function getMicroblogAncestorRoots(
  currentId: string,
): Promise<MicroblogEntry[]> {
  const { byId } = await loadIndex();
  const current = byId.get(currentId);
  if (!current) return [];

  const directParents = resolveParents(current, byId);
  if (directParents.length === 0) return []; // current IS a root

  const visited = new Set<string>();
  const roots = new Map<string, MicroblogEntry>();

  const walk = (entry: MicroblogEntry) => {
    if (visited.has(entry.id)) return;
    visited.add(entry.id);
    const parents = resolveParents(entry, byId);
    if (parents.length === 0) {
      roots.set(entry.id, entry);
      return;
    }
    for (const parent of parents) walk(parent);
  };

  for (const parent of directParents) walk(parent);
  return sortChrono([...roots.values()]);
}
