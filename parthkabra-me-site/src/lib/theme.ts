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
//       roundness: 0       # Allo's ROND axis, 0 (sharp) to 100 (round); default 50
//       tracking: 0.06     # letter spacing in em; positive is wider
//       size: 48           # px
//       case: lowercase    # or uppercase
//       color: "#712199"   # default: the page's accent when it has one
//
// A typo fails the build rather than silently rendering the default look.
import { fileDir, mediaUrl, type Item } from "./content";

export type PageTheme = {
  navbarColor?: string;
  logo?: { src: string; size: number };
  title?: { style: string; custom: boolean };
};

const KEYS: Record<string, string[]> = { navbar: ["color"], logo: ["src", "size"], title: ["roundness", "tracking", "size", "case", "color"] };

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
  const num = (key: string, v: unknown, min: number, max: number) => {
    if (v !== undefined && (typeof v !== "number" || v < min || v > max)) fail(`title.${key} must be a number from ${min} to ${max}`);
  };
  num("roundness", title?.roundness, 0, 100);
  num("tracking", title?.tracking, -0.2, 0.5);
  if (title?.case && !["lowercase", "uppercase"].includes(title.case)) fail(`unknown case "${title.case}"`);

  const styles = [
    title?.roundness !== undefined && `font-variation-settings: "ROND" ${title.roundness}`,
    title?.tracking !== undefined && `letter-spacing: ${title.tracking}em`,
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
