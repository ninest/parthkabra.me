const TEMPLATE_MAP: Record<string, string> = {
  categories: "category",
  posts: "post",
  microblog: "microblog",
  "work-experience": "work",
  projects: "project",
  pages: "page",
};

export function getTemplatePath(contentPath: string): string | null {
  const parts = contentPath.split("/");
  if (parts[0] !== "parthkabra-me" || parts.length < 2) return null;
  const collection = parts[1];
  const template = TEMPLATE_MAP[collection];
  return template ? `parthkabra-me/templates/${template}.md` : null;
}
