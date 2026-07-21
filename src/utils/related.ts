import { getEntry } from "astro:content";
import { getContentUrl } from "./links";

const COLLECTION_MAP: Record<string, string> = {
  post: "posts",
  microblog: "microblog",
  project: "projects",
  work: "workExperience",
  page: "pages",
  tool: "tools",
};

const COLLECTION_LABELS: Record<string, string> = {
  posts: "Post",
  microblog: "Microblog",
  projects: "Project",
  workExperience: "Work",
  pages: "Page",
  tools: "Tool",
};

export function parseRelatedString(str: string) {
  const colonIndex = str.indexOf(":");
  if (colonIndex === -1) return null;
  const prefix = str.slice(0, colonIndex);
  const id = str.slice(colonIndex + 1);
  const collection = COLLECTION_MAP[prefix];
  if (!collection) return null;
  return { collection, id };
}

export type ResolvedRelated = {
  title: string;
  description?: string;
  url: string | null;
  type: string;
  collection: string;
  id: string;
  createdAt?: Date;
  external: boolean;
};

export async function resolveRelated(
  relatedStrings: string[],
): Promise<ResolvedRelated[]> {
  const results: ResolvedRelated[] = [];
  for (const str of relatedStrings) {
    const parsed = parseRelatedString(str);
    if (!parsed) continue;
    const entry = await getEntry(parsed.collection as any, parsed.id);
    if (!entry) continue;
    const data = entry.data as Record<string, unknown>;
    const external = parsed.collection === "posts" && Boolean(data.externalUrl);
    results.push({
      title: (data.title as string) ?? parsed.id,
      description: data.description as string | undefined,
      url: getContentUrl(parsed.collection, parsed.id, data),
      type: COLLECTION_LABELS[parsed.collection] ?? parsed.collection,
      collection: parsed.collection,
      id: parsed.id,
      createdAt: data.createdAt as Date | undefined,
      external,
    });
  }
  return results;
}
