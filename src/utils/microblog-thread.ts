import { getCollection, type CollectionEntry } from "astro:content";
import { parseRelatedString } from "./related";

type MicroblogEntry = CollectionEntry<"microblog">;

type ThreadIndex = {
  byId: Map<string, MicroblogEntry>;
  /** Maps each thread root id to the ids of all posts in that thread (including the root). */
  threadMembers: Map<string, string[]>;
};

/**
 * Load all (non-draft) microblog entries and build the `byId` + `threadMembers`
 * maps. Each entry's thread root is determined by its `thread` field (or itself
 * if absent). `threadMembers[rootId]` lists every post in that conversation.
 */
async function loadIndex(): Promise<ThreadIndex> {
  const all = (await getCollection("microblog")).filter((e) => !e.data.draft);

  const byId = new Map<string, MicroblogEntry>();
  for (const entry of all) byId.set(entry.id, entry);

  const threadMembers = new Map<string, string[]>();
  for (const entry of all) {
    const rootId = getThreadRootId(entry);
    const list = threadMembers.get(rootId) ?? [];
    list.push(entry.id);
    threadMembers.set(rootId, list);
  }

  return { byId, threadMembers };
}

/** Resolve the root id for a post — either the parsed `thread` field or the post's own id. */
function getThreadRootId(entry: MicroblogEntry): string {
  if (!entry.data.thread) return entry.id;
  const parsed = parseRelatedString(entry.data.thread);
  if (!parsed || parsed.collection !== "microblog") return entry.id;
  return parsed.id;
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
 * Returns `[current, ...later]` — the current post followed by every post in
 * the same thread dated at or after it — sorted chronologically. Use this for
 * the focused view (current post at the top, replies flow below).
 */
export async function getMicroblogDescendantChain(
  currentId: string,
): Promise<MicroblogEntry[]> {
  const { byId, threadMembers } = await loadIndex();
  const current = byId.get(currentId);
  if (!current) return [];

  const rootId = getThreadRootId(current);
  const memberIds = threadMembers.get(rootId) ?? [currentId];

  const currentTime = current.data.createdAt.getTime();
  const entries = memberIds
    .map((id) => byId.get(id)!)
    .filter((e) => {
      const t = e.data.createdAt.getTime();
      // Include posts at or after the current post's date (with id tiebreaker for same-date)
      return t > currentTime || (t === currentTime && e.id >= currentId);
    });

  return sortChrono(entries);
}

/**
 * Returns every post in the thread that contains `currentId`, sorted
 * chronologically (root first). If `currentId` is standalone, returns just [current].
 */
export async function getMicroblogThreadMembers(
  currentId: string,
): Promise<MicroblogEntry[]> {
  const { byId, threadMembers } = await loadIndex();
  const current = byId.get(currentId);
  if (!current) return [];
  const rootId = getThreadRootId(current);
  const memberIds = threadMembers.get(rootId) ?? [currentId];
  return sortChrono(memberIds.map((id) => byId.get(id)!).filter(Boolean));
}

/**
 * Returns a map of thread root id → total post count, including only roots
 * that have at least one reply. Used for listings that want to mark which
 * posts anchor a real thread. e.g. { "2026/cms-just-for-me" => 4 }.
 */
export async function getMicroblogThreadRootSizes(): Promise<Map<string, number>> {
  const { threadMembers } = await loadIndex();
  const sizes = new Map<string, number>();
  for (const [rootId, members] of threadMembers) {
    if (members.length > 1) sizes.set(rootId, members.length);
  }
  return sizes;
}

/**
 * Returns all thread root posts that have at least one reply,
 * sorted by root post `createdAt` descending (newest thread first).
 */
export async function getMicroblogThreads(): Promise<MicroblogEntry[]> {
  const { byId, threadMembers } = await loadIndex();
  const roots: MicroblogEntry[] = [];
  for (const [rootId, members] of threadMembers) {
    if (members.length > 1) {
      const root = byId.get(rootId);
      if (root) roots.push(root);
    }
  }
  return roots.sort(
    (a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime(),
  );
}

/**
 * Returns the root post of the thread above `currentId`. Returns an empty
 * array when `currentId` is itself a root, so callers can use length to decide
 * whether to render a "View full thread" link.
 */
export async function getMicroblogAncestorRoots(
  currentId: string,
): Promise<MicroblogEntry[]> {
  const { byId } = await loadIndex();
  const current = byId.get(currentId);
  if (!current) return [];

  // No thread field means this post IS the root
  if (!current.data.thread) return [];

  const rootId = getThreadRootId(current);
  const root = byId.get(rootId);
  if (!root) return [];

  return [root];
}
