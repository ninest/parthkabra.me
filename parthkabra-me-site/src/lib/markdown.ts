// Renders a page's markdown to HTML. Handles what the content guide promises: `[[path|label]]` links,
// images beside the page, ` ```component:… ` fences, and the `Links:` / `Related:` lines, which leave
// the body and go to the sidebar.
import { Marked, type Tokens } from "marked";
import { markedSmartypants } from "marked-smartypants";
import { codeToHtml } from "shiki";
import { bodyOf, byPath, fileDir, mediaUrl, type Item } from "./content";

export type Heading = { depth: number; id: string; text: string };
export type Rendered = { html: string; headings: Heading[]; links: string[]; related: string[]; hasMermaid: boolean };

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>|&[a-z#0-9]+;/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");

async function highlight(code: string, lang: string): Promise<string> {
  const options = { themes: { light: "min-light", dark: "min-dark" }, defaultColor: false } as const;
  try {
    return await codeToHtml(code, { lang: lang || "text", ...options });
  } catch {
    return await codeToHtml(code, { lang: "text", ...options });
  }
}

/** Reads a component fence's payload: `key: value` lines, then an optional body after `---`. */
function parseFence(text: string): { props: Record<string, string>; body: string } {
  const at = text.search(/^---$/m);
  const head = at === -1 ? text : text.slice(0, at);
  const props = Object.fromEntries(
    head
      .split("\n")
      .map((l) => /^(\w+):\s*(.*)$/.exec(l))
      .filter((m) => !!m)
      .map((m) => [m[1]!, m[2]!.replace(/^["']|["']$/g, "")]),
  );
  return { props, body: at === -1 ? "" : text.slice(at + 3).trim() };
}

/** Moves `Links:` and `Related:` lines out of the body, returning each entry as its own markdown. */
function takeLinkLines(markdown: string) {
  const out = { links: [] as string[], related: [] as string[] };
  const body = markdown.replace(/^(Links|Related):[ \t]*(.+?)[ \t]*\\?[ \t]*$/gm, (_, key: string, list: string) => {
    out[key === "Links" ? "links" : "related"].push(...list.split(/,\s*(?=\[|<a\b)/));
    return "";
  });
  return { ...out, body };
}

/** Page `i`'s body as HTML, with its headings and sidebar links. */
export async function render(i: Item): Promise<Rendered> {
  const dir = fileDir(i);
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  let hasMermaid = false;

  const marked = new Marked(markedSmartypants(), {
    async: true,
    extensions: [
      {
        name: "wikilink",
        level: "inline",
        start: (src: string) => src.indexOf("[["),
        tokenizer(src: string) {
          const m = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(src);
          if (m) return { type: "wikilink", raw: m[0], path: m[1], text: m[2] };
        },
        renderer(token: any) {
          const target = byPath(i.links[token.path] ?? token.path);
          const text = escape(token.text ?? target?.title ?? token.path);
          return target ? `<a href="${target.href}">${text}</a>` : text;
        },
      },
    ],
    async walkTokens(token) {
      if (token.type !== "code") return;
      const code = token as Tokens.Code & { html?: string };
      const lang = (code.lang ?? "").split(/\s/)[0]!;
      if (lang === "component:alert") {
        const { props, body } = parseFence(code.text);
        const title = props.title ? `<p class="callout-title">${escape(props.title)}</p>` : "";
        const inner = await marked.parse(body);
        code.html = `<aside class="callout callout-${props.variant ?? "default"}">${title}${inner}</aside>`;
      } else if (lang === "component:mermaid") {
        hasMermaid = true;
        code.html = `<pre class="mermaid">${escape(parseFence(code.text).body)}</pre>`;
      } else if (lang === "component:subscribe-form") {
        code.html = `<aside class="callout callout-secondary"><p>The form isn’t wired up in this rewrite yet. <a href="/rss.xml">RSS</a> works.</p></aside>`;
      } else if (lang.startsWith("component:")) {
        code.html = ""; // tools render on their own full-page route
      } else {
        code.html = await highlight(code.text, lang);
      }
    },
    renderer: {
      code(token: Tokens.Code & { html?: string }) {
        return token.html ?? `<pre><code>${escape(token.text)}</code></pre>`;
      },
      heading({ tokens, depth }: Tokens.Heading) {
        const html = this.parser.parseInline(tokens);
        const base = slugify(html) || "section";
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        const id = n ? `${base}-${n}` : base;
        if (depth === 2 || depth === 3) headings.push({ depth, id, text: html.replace(/<[^>]+>/g, "") });
        return `<h${depth} id="${id}"><a class="anchor" href="#${id}">${html}</a></h${depth}>\n`;
      },
      image({ href, text }: Tokens.Image) {
        const src = /^(https?:)?\//.test(href) ? href : mediaUrl(`${dir}/${href}`);
        if (/\.(mp4|mov|webm)$/i.test(href)) return `<video src="${src}" controls muted playsinline preload="metadata"></video>`;
        return `<img src="${src}" alt="${escape(text ?? "")}" loading="lazy">`;
      },
      link({ href, title, tokens }: Tokens.Link) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:/.test(href) ? ` target="_blank" rel="noopener noreferrer"` : "";
        return `<a href="${href}"${title ? ` title="${escape(title)}"` : ""}${external}>${text}</a>`;
      },
    },
  });

  const { body, links, related } = takeLinkLines(bodyOf(i));
  const html = await marked.parse(body);
  const inline = async (list: string[]) => Promise.all(list.map((m) => marked.parseInline(m) as Promise<string>));
  return { html, headings, links: await inline(links), related: await inline(related), hasMermaid };
}
