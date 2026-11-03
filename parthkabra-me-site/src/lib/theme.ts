// A page's optional `theme` property: the only per-page customization there is, and it works on any
// page. Three parts, each optional:
//
//   theme:
//     navbar:
//       color: "#712199"   # fills the navbar, and becomes the page's accent (links, title)
//     logo:
//       src: wayfair.svg   # an image beside the page, shown next to the title
//       size: 40           # px; default 24
//     title:
//       font: Mulish       # a name from FONTS below
//       size: 48           # px
//       case: lowercase    # or uppercase
//       color: "#712199"   # default: the page's accent when it has one
//
// A typo fails the build rather than silently rendering the default look.
import { fileDir, mediaUrl, type Item } from "./content";

const FONTS: Record<string, string> = {
  Inter: '"Inter Variable", sans-serif',
  Mulish: '"Mulish Variable", sans-serif',
};

export type PageTheme = {
  navbarColor?: string;
  logo?: { src: string; size: number };
  title?: { style: string; custom: boolean };
};

const KEYS: Record<string, string[]> = { navbar: ["color"], logo: ["src", "size"], title: ["font", "size", "case", "color"] };

/** Reads and checks `theme` from a page's frontmatter. */
export function pageTheme(i: Item): PageTheme {
  const raw = i.frontmatter.theme;
  if (raw === undefined) return {};
  const fail = (why: string) => {
    throw new Error(`[theme] ${i.path}: ${why}`);
  };
  if (typeof raw !== "object") fail(`theme must be an object, got "${raw}"`);
  for (const [part, value] of Object.entries<Record<string, unknown>>(raw)) {
    if (!KEYS[part]) fail(`unknown part "${part}"; use ${Object.keys(KEYS).join(", ")}`);
    for (const key of Object.keys(value)) if (!KEYS[part]!.includes(key)) fail(`unknown ${part}.${key}`);
  }
  const { navbar, logo, title } = raw;
  if (logo && !logo.src) fail("logo needs a src");
  if (title?.font && !FONTS[title.font]) fail(`unknown font "${title.font}"; use ${Object.keys(FONTS).join(", ")}`);
  if (title?.case && !["lowercase", "uppercase"].includes(title.case)) fail(`unknown case "${title.case}"`);

  const styles = [
    title?.font && `font-family: ${FONTS[title.font]}`,
    title?.size && `font-size: ${title.size}px; line-height: 1`,
    title?.case && `text-transform: ${title.case}`,
    (title?.color || navbar?.color) && `color: ${title?.color ?? "var(--primary)"}`,
  ].filter(Boolean);

  return {
    navbarColor: navbar?.color,
    logo: logo && { src: mediaUrl(`${fileDir(i)}/${logo.src}`), size: logo.size ?? 24 },
    title: { style: styles.join("; "), custom: Boolean(title) },
  };
}
