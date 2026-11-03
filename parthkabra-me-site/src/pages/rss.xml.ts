import type { APIRoute } from "astro";
import { ofKind } from "../lib/content";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// All posts, newest first. A guid must never change or readers show the post as new again, so own
// posts keep the trailing slash their guids had on the previous site.
export const GET: APIRoute = ({ site }) => {
  const entries = ofKind("post")
    .map((i) => {
      const url = new URL(i.href, site).href;
      const guid = i.external ? url : url + "/";
      return `<item><title>${esc(i.title)}</title><link>${esc(url)}</link><guid isPermaLink="true">${esc(guid)}</guid><pubDate>${new Date(i.date.slice(0, 10)).toUTCString()}</pubDate><description>${esc(i.description ?? "")}</description></item>`;
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Parth Kabra</title><link>${site}</link><description>Posts on Parth Kabra's website</description>
${entries}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
