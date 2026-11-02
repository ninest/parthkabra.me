// Every internal URL goes through here. Links authored in markdown content may use root-relative URLs.
export const routes = {
  home: "/",
  all: "/all",
  projects: "/projects",
  work: "/work",
  microblog: "/micro",
  tools: "/tools",
  about: "/about",
  llms: "/llms.txt",
  rss: "/rss.xml",
} as const;

export const getPostUrl = (category: string, slug: string) => `/${category}/${slug}`;
export const getProjectUrl = (slug: string) => `/projects/${slug}`;
export const getWorkUrl = (slug: string) => `/work/${slug}`;
export const getCategoryUrl = (slug: string) => `/${slug}`;
export const getPageUrl = (slug: string) => `/${slug}`;
export const getMicroblogUrl = (id: string) => `/micro/${id}`; // id is `{year}/{slug}`
export const getCollectionUrl = (slug: string) => `/collection/${slug}`;
export const getToolUrl = (slug: string) => `/tools/${slug}`;
export const getToolAgentDocUrl = (slug: string) => `${getToolUrl(slug)}/agents`;
export const getToolAgentMarkdownDocUrl = (slug: string) => `${getToolUrl(slug)}/agents.md`;
export const getToolAgentTextDocUrl = (slug: string) => `${getToolUrl(slug)}/agents.txt`;
