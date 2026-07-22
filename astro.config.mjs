// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import rehypeExternalLinks from "rehype-external-links";
import remarkSmartypants from "remark-smartypants";

import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import { getDraftPostPathnames } from "./src/utils/sitemap-drafts.ts";
import { remarkContentComponents } from "./src/content-components/remark-content-components.ts";

const draftPostPaths = getDraftPostPathnames();

// https://astro.build/config
export default defineConfig({
  site: "https://parthkabra.me",

  output: "server",

  prefetch: { prefetchAll: true },

  security: {
    // Keep in sync with IMAGE_ACTION_BODY_SIZE_LIMIT in src/lib/image.ts.
    actionBodySizeLimit: 25 * 1024 * 1024,
  },

  integrations: [
    sitemap({
      filter: (page) => !draftPostPaths.has(new URL(page).pathname),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    smartypants: false,
    remarkPlugins: [remarkContentComponents, remarkSmartypants],
    rehypePlugins: [[rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }]],
  },

  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-inter",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600, 700, 800, 900],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      name: "Mulish",
      cssVariable: "--font-mulish",
      provider: fontProviders.fontsource(),
      weights: [400, 700, 900],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],

  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
});
