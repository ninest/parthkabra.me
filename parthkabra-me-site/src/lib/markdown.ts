// Renders a page's markdown to HTML. Handles what the content guide promises: `[[path|label]]` links,
// images beside the page, and ` ```component:… ` fences.
import { Marked, type Tokens } from "marked";
import { markedSmartypants } from "marked-smartypants";
import { buttonClasses } from "../components/button";
import { inputClasses } from "../components/input";
import { render as renderDiagram } from "pele";
import { codeToHtml } from "shiki";
import { bodyOf, byPath, fileDir, mediaUrl, type Item } from "./content";

export type Rendered = { html: string; hasSubscribeForm: boolean };

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

// The script that submits it is components/subscribe-form-script.astro.
const SUBSCRIBE_FORM = `<form id="subscribe-form" class="not-typography mt-6 flex max-w-md flex-col gap-5">
  <label class="flex flex-col gap-1">
    <span class="text-sm">Email</span>
    <input type="email" name="email" required maxlength="254" placeholder="you@example.com" class="${inputClasses("px-2 py-1 rounded")}">
  </label>
  <label class="flex flex-col gap-1">
    <span class="text-sm">Why are you subscribing? What interested you? <span class="text-muted-foreground">(optional)</span></span>
    <textarea name="reason" rows="3" maxlength="2000" class="${inputClasses("px-2 py-1 rounded")}"></textarea>
  </label>
  <div class="flex items-center gap-3">
    <button type="submit" class="${buttonClasses("primary")}">Subscribe</button>
    <span id="subscribe-status" class="text-sm text-muted-foreground" aria-live="polite"></span>
  </div>
</form>`;

/** Page `i`'s body as HTML. */
export async function render(i: Item): Promise<Rendered> {
  const dir = fileDir(i);
  let hasSubscribeForm = false;
  const seen = new Map<string, number>();

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
        code.html = `<figure class="diagram">${renderDiagram(parseFence(code.text).body).svg}</figure>`;
      } else if (lang === "component:subscribe-form") {
        hasSubscribeForm = true;
        code.html = SUBSCRIBE_FORM;
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
        return `<h${depth} id="${id}">${html}</h${depth}>\n`;
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

  return { html: await marked.parse(bodyOf(i)), hasSubscribeForm };
}
