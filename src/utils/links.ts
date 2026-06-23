// Static index/listing routes
export const routes = {
  home: "/",
  all: "/all",
  projects: "/projects",
  work: "/work",
  collections: "/collections",
  microblog: "/micro",
  tools: "/tools",
  llms: "/llms.txt",
  rss: "/rss.xml",
  admin: "/admin",
  optOutAnalytics: "/opt-out-analytics",
  subscribe: "/subscribe",
} as const;

// Per-collection URL builders
export const getPostUrl = (id: string) => `/${id}`; // id is `{category}/{slug}`
export const getPostLink = (id: string, externalUrl?: string) => ({
  href: externalUrl ?? getPostUrl(id),
  external: Boolean(externalUrl),
});
export const getProjectUrl = (id: string) => `/projects/${id}`;
export const getWorkUrl = (id: string) => `/work/${id}`;
export const getCategoryUrl = (id: string) => `/${id}`;
export const getPageUrl = (id: string) => `/${id}`;
export const getMicroblogUrl = (id: string) => `/micro/${id}`; // id is `{year}/{slug}`
export const getCollectionUrl = (id: string) => `/collections/${id}`;
export const getToolUrl = (id: string) => `/tools/${id}`;
export const getToolAgentDocUrl = (id: string) => `${getToolUrl(id)}/agents`;
export const getToolAgentMarkdownDocUrl = (id: string) => `${getToolUrl(id)}/agents.md`;
export const getToolAgentTextDocUrl = (id: string) => `${getToolUrl(id)}/agents.txt`;

// Collection-agnostic dispatcher (used by resolveRelated)
export function getContentUrl(
  collection: string,
  id: string,
  data?: Record<string, unknown>,
): string | null {
  switch (collection) {
    case "posts":
      return getPostLink(id, data?.externalUrl as string | undefined).href;
    case "projects":
      return getProjectUrl(id);
    case "workExperience":
      return getWorkUrl(id);
    case "pages":
      return getPageUrl(id);
    case "microblog":
      return getMicroblogUrl(id);
    case "postCollections":
      return getCollectionUrl(id);
    case "tools":
      return getToolUrl(id);
    default:
      return null;
  }
}
