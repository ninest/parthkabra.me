import type { APIRoute } from "astro";
import { excerpt, hasPage, ledger } from "../lib/content";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Posts and notes, newest first.
export const GET: APIRoute = ({ site }) => {
  const entries = ledger()
    .slice(0, 50)
    .map((i) => {
      const url = new URL(i.href, site).href;
      const text = i.description ?? (hasPage(i) ? excerpt(i, 400) : "");
      return `<item><title>${esc(i.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(i.date.slice(0, 10)).toUTCString()}</pubDate><description>${esc(text)}</description></item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Parth Kabra</title><link>${site}</link><description>Writing and notes by Parth Kabra</description>
${entries}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
