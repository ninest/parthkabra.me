import { getCategoryUrl, getPageUrl, getProjectUrl, getToolUrl, getWorkUrl, routes } from "./links";

const redirects = [
  {
    from: /^\/me\/about(?=\/|$)/,
    to: getPageUrl("about"),
    status: 301,
  },
  {
    from: /^\/project\/nsr(?=\/|$)/,
    to: getProjectUrl("national-service-resources"),
    status: 301,
  },
  {
    from: /^\/project(?=\/|$)/,
    to: routes.projects,
    status: 301,
  },
  {
    from: /^\/projects\/nsr(?=\/|$)/,
    to: getProjectUrl("national-service-resources"),
    status: 301,
  },
  {
    from: /^\/work\/saf(?=\/|$)/,
    to: getWorkUrl("singapore-armed-forces"),
    status: 301,
  },
  {
    from: /^\/tools\/ai-mapmaker(?=\/|$)/,
    to: getToolUrl("ai-map"),
    status: 301,
  },
  {
    from: /^\/tool\/repeated-word-finder(?=\/|$)/,
    to: getToolUrl("duplicate-word-finder"),
    status: 301,
  },
  {
    from: /^\/tools\/doc(?=\/|$)/,
    to: getToolUrl("absolutely-write"),
    status: 301,
  },
  {
    from: /^\/restaurant(?=\/|$)/,
    to: getCategoryUrl("restaurants"),
    status: 301,
  },
  // Restaurant mini-blog moved to friedrice.fun; send old micropost URLs there.
  {
    from: /^\/micro\/2026\/fire-ice-back-bay\/?$/,
    to: "https://friedrice.fun/fire-ice/",
    status: 301,
  },
  {
    from: /^\/micro\/2026\/pinocchios-pizza-harvard\/?$/,
    to: "https://friedrice.fun/pinocchios-pizza-subs/",
    status: 301,
  },
  {
    from: /^\/micro\/2026\/pressed-cafe-back-bay-boston\/?$/,
    to: "https://friedrice.fun/pesto-goat-cheese-blt-at-pressed-cafe/",
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

    // Absolute targets (e.g. another domain) redirect as-is.
    if (redirect.to.startsWith("http")) {
      return { url: new URL(redirect.to), status: redirect.status };
    }

    const redirectUrl = new URL(url);
    redirectUrl.pathname = redirectUrl.pathname.replace(redirect.from, redirect.to);

    return {
      url: redirectUrl,
      status: redirect.status,
    };
  }

  return null;
}
