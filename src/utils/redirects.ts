import { getToolUrl, routes } from "./links";

const redirects = [
  {
    from: /^\/project(?=\/|$)/,
    to: routes.projects,
    status: 301,
  },
  {
    from: /^\/tools\/ai-mapmaker(?=\/|$)/,
    to: getToolUrl("ai-map"),
    status: 301,
  },
] as const;

type Redirect = {
  url: URL;
  status: 301 | 302 | 307 | 308;
};

export function getRedirect(url: URL): Redirect | null {
  for (const redirect of redirects) {
    if (!redirect.from.test(url.pathname)) continue;

    const redirectUrl = new URL(url);
    redirectUrl.pathname = redirectUrl.pathname.replace(redirect.from, redirect.to);

    return {
      url: redirectUrl,
      status: redirect.status,
    };
  }

  return null;
}
