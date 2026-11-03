import { excerpt, items, plainText, type Kind } from "../lib/content";

const SEARCHED: Partial<Record<Kind, string>> = {
  category: "category",
  post: "post",
  project: "project",
  work: "work",
  tool: "tool",
  micro: "microblog",
};

// Everything the sidebar search can find.
export function GET() {
  const index = items().flatMap((i) => {
    const type = SEARCHED[i.kind];
    if (!type) return [];
    const isPublished = i.kind !== "category" && !i.external;
    return [
      {
        id: i.path,
        type,
        title: i.title,
        description: i.description ?? (i.kind === "micro" ? excerpt(i, 155) : ""),
        body: isPublished ? plainText(i) : "",
        createdAt: i.date,
        url: i.href,
        external: i.external,
      },
    ];
  });
  return new Response(JSON.stringify(index), { headers: { "Content-Type": "application/json" } });
}
