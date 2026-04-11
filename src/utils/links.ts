// Static index/listing routes
export const routes = {
  home: "/",
  all: "/all",
  projects: "/projects",
  work: "/work",
  collections: "/collections",
  tools: "/tools",
} as const;

// Per-collection URL builders
export const getPostUrl = (id: string) => `/${id}`; // id is `{category}/{slug}`
export const getProjectUrl = (id: string) => `/projects/${id}`;
export const getWorkUrl = (id: string) => `/work/${id}`;
export const getCategoryUrl = (id: string) => `/${id}`;
export const getPageUrl = (id: string) => `/${id}`;
export const getMicroblogUrl = (id: string) => `/micro/${id}`; // id is `{year}/{slug}`
export const getCollectionUrl = (id: string) => `/collections/${id}`;
export const getToolUrl = (id: string) => `/tools/${id}`;

// Collection-agnostic dispatcher (used by resolveRelated)
export function getContentUrl(collection: string, id: string): string | null {
  switch (collection) {
    case "posts":
      return getPostUrl(id);
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
