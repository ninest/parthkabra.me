import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { exportContent } from "./scripts/content.mjs";

/** Exports the content before Astro reads it. */
const content = {
  name: "parthkabra-content",
  hooks: { "astro:config:setup": () => exportContent() },
};

export default defineConfig({
  site: "https://parthkabra.me",
  // page.html rather than page/index.html, so /page is served as is (no redirect to /page/)
  build: { format: "file" },
  trailingSlash: "never",
  prefetch: { prefetchAll: true },
  integrations: [content, sitemap()],
  devToolbar: { enabled: false },
  server: { host: "0.0.0.0", port: 2102 },
  // Tailwind only reaches tool pages: src/styles/tools.css is the one file that imports it.
  vite: { plugins: [tailwindcss()], server: { allowedHosts: ["hel", ".ts.net"] } },
});
