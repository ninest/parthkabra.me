import { getCollection } from "astro:content";

let validated = false;

export async function validateRelatedLinks() {
  if (validated) return;
  validated = true;

  const [posts, microblog, projects, work, pages, tools] = await Promise.all([
    getCollection("posts"),
    getCollection("microblog"),
    getCollection("projects"),
    getCollection("workExperience"),
    getCollection("pages"),
    getCollection("tools"),
  ]);

  const validIds = new Set<string>();
  for (const p of posts) validIds.add(`post:${p.id}`);
  for (const m of microblog) validIds.add(`microblog:${m.id}`);
  for (const p of projects) validIds.add(`project:${p.id}`);
  for (const w of work) validIds.add(`work:${w.id}`);
  for (const p of pages) validIds.add(`page:${p.id}`);
  for (const t of tools) validIds.add(`tool:${t.id}`);

  // Build a map of microblog id → thread root ref for inReplyTo validation
  const microblogThreadRoot = new Map<string, string | undefined>();
  for (const m of microblog) {
    microblogThreadRoot.set(m.id, m.data.thread);
  }

  // Validate thread + inReplyTo fields on microblog entries
  for (const m of microblog) {
    if (m.data.thread) {
      if (!validIds.has(m.data.thread)) {
        console.warn(`[thread] Invalid reference "${m.data.thread}" in microblog:${m.id}`);
      } else {
        // Thread target must be a root (no thread field itself)
        const targetId = m.data.thread.replace(/^microblog:/, "");
        const targetThread = microblogThreadRoot.get(targetId);
        if (targetThread) {
          console.warn(
            `[thread] Target "${m.data.thread}" in microblog:${m.id} is not a root (it has thread: "${targetThread}")`,
          );
        }
      }
    }

    if (m.data.inReplyTo) {
      if (!validIds.has(m.data.inReplyTo)) {
        console.warn(`[inReplyTo] Invalid reference "${m.data.inReplyTo}" in microblog:${m.id}`);
      } else {
        // inReplyTo target must share the same thread root
        const targetId = m.data.inReplyTo.replace(/^microblog:/, "");
        const targetThread = microblogThreadRoot.get(targetId);
        // The source's root is its thread field; the target's root is its thread field (or itself if absent)
        const sourceRoot = m.data.thread;
        const targetRoot = targetThread ?? `microblog:${targetId}`;
        if (sourceRoot && sourceRoot !== targetRoot) {
          console.warn(
            `[inReplyTo] Target "${m.data.inReplyTo}" in microblog:${m.id} is not in the same thread (source root: "${sourceRoot}", target root: "${targetRoot}")`,
          );
        }
      }
    }
  }
}
