// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import rehypeExternalLinks from "rehype-external-links";
import AutoImport from "astro-auto-import";
import mdx from "@astrojs/mdx";

import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import { getDraftPostPathnames } from "./src/utils/sitemap-drafts.ts";

const draftPostPaths = getDraftPostPathnames();

// https://astro.build/config
export default defineConfig({
  site: "https://parthkabra.me",

  output: "server",

  prefetch: { prefetchAll: true },

  integrations: [
    AutoImport({
      imports: ["./src/components/content/Alert.astro", "./src/components/content/Mermaid.astro"],
    }),
    mdx(),
    sitemap({
      filter: (page) => !draftPostPaths.has(new URL(page).pathname),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
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

  adapter: cloudflare(),
});
