// Brings the content in: exports the parthkabra-me miscfs instance (../content) to .export/, and
// hard-links its attachments (never its markdown) into public/media/, where pages link their images.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(site, ".export");
const media = join(site, "public/media");
const miscfs = process.env.MISCFS ?? join(homedir(), ".local/bin/miscfs");

export function exportContent() {
  rmSync(out, { recursive: true, force: true });
  execFileSync(miscfs, ["export", out, "--dir", resolve(site, "../content")], { stdio: "inherit" });
  rmSync(media, { recursive: true, force: true });
  mkdirSync(dirname(media), { recursive: true });
  execFileSync("cp", ["-al", out, media]);
  rmSync(join(media, "_miscfs"), { recursive: true, force: true });
  execFileSync("find", [media, "-name", "*.md", "-delete"]);
}

/** The URL paths of draft posts: they have a page, but stay out of the sitemap. */
export function draftPostPaths() {
  const { pages } = JSON.parse(readFileSync(join(out, "_miscfs/pages.json"), "utf8"));
  return new Set(
    pages
      .filter((p) => p.frontmatter.draft && p.path.startsWith("posts/"))
      .map((p) => `/${p.frontmatter.categories[0]}/${basename(p.path)}`),
  );
}
