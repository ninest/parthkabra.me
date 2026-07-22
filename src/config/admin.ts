// Maps content collection folders to their image folders in public/images/.
// Add a row to enable image support for a new collection.
export const IMAGE_MAP = [
  { content: "posts", images: "posts" },
  { content: "projects", images: "projects" },
  { content: "work-experience", images: "work" },
  { content: "microblog", images: "microblog" },
];

export function getImagePath(contentPath: string): string | null {
  const match = contentPath.match(/^parthkabra-me\/([^/]+)\/(.+)\.md$/);
  if (!match) return null;

  const [, collection, rest] = match;
  const mapping = IMAGE_MAP.find((m) => m.content === collection);
  if (!mapping) return null;

  return `public/images/${mapping.images}/${rest}`;
}
