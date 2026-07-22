import fs from "node:fs";
import path from "node:path";

/**
 * Returns draft post URL pathnames (e.g. "/foo/bar/") by scanning
 * parthkabra-me/posts/** for Markdown files with `draft: true` in frontmatter.
 * Used by the sitemap integration to exclude draft URLs; reads from disk
 * because astro:content isn't available at config load time.
 */
export function getDraftPostPathnames(): Set<string> {
  const dir = "parthkabra-me/posts";
  const out = new Set<string>();
  if (!fs.existsSync(dir)) return out;

  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.md$/.test(entry.name)) continue;
      const txt = fs.readFileSync(full, "utf8");
      const fm = txt.match(/^---\n([\s\S]*?)\n---/);
      if (fm && /^draft:\s*true\s*$/m.test(fm[1])) {
        const rel = path.relative(dir, full).replace(/\.md$/, "");
        out.add(`/${rel.split(path.sep).join("/")}/`);
      }
    }
  };
  walk(dir);
  return out;
}
