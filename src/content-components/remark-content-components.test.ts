import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { describe, expect, it } from "vitest";
import { CONTENT_COMPONENT_METADATA_KEY } from "./definitions";
import { remarkContentComponents } from "./remark-content-components";
import { extractSearchableComponentMarkdown } from "./search";

/** Renders Markdown through the content-component plugin without syntax highlighting. */
async function renderMarkdown(source: string) {
  const processor = await createMarkdownProcessor({
    syntaxHighlight: false,
    smartypants: false,
    remarkPlugins: [remarkContentComponents],
  });
  return processor.render(source, { frontmatter: { title: "Test" } });
}

describe("remarkContentComponents", () => {
  it("renders an alert body through the normal Markdown pipeline", async () => {
    const result = await renderMarkdown(`before

\`\`\`\`component:alert
variant: secondary
title: Examples
---
A **bold** body.

\`\`\`js
const value = 1;
\`\`\`
\`\`\`\`

after`);

    expect(result.code).toContain("<!--content-component:start:cc-0-->");
    expect(result.code).toContain("<p>A <strong>bold</strong> body.</p>");
    expect(result.code).toContain('<code class="language-js">const value = 1;');
    expect(result.code).toContain("<!--content-component:end:cc-0-->");
    expect(result.metadata.frontmatter[CONTENT_COMPONENT_METADATA_KEY]).toEqual([
      {
        id: "cc-0",
        name: "alert",
        props: { variant: "secondary", title: "Examples" },
      },
    ]);
  });

  it("stores Mermaid source as a raw body", async () => {
    const result = await renderMarkdown(`\`\`\`component:mermaid
---
graph LR
A --> B
\`\`\``);

    expect(result.metadata.frontmatter[CONTENT_COMPONENT_METADATA_KEY]).toEqual([
      {
        id: "cc-0",
        name: "mermaid",
        props: {},
        rawBody: "graph LR\nA --> B",
      },
    ]);
  });

  it("leaves ordinary code fences unchanged", async () => {
    const result = await renderMarkdown("```ts\nconst value = 1;\n```");
    expect(result.code).toContain('<code class="language-ts">const value = 1;');
    expect(result.metadata.frontmatter[CONTENT_COMPONENT_METADATA_KEY]).toEqual([]);
  });

  it.each([
    ["unknown component", "```component:missing\n```", "Unknown content component"],
    ["unknown property", "```component:alert\nmissing: true\n```", "Invalid properties"],
    ["forbidden body", "```component:map-drawer\n---\ntext\n```", "does not accept a body"],
    ["missing raw body", "```component:mermaid\n```", "requires a body"],
    [
      "nested component",
      "````component:alert\n---\n```component:alert\n---\nNested\n```\n````",
      "cannot contain another component fence",
    ],
    [
      "non-root component",
      "> ```component:alert\n> ---\n> Body\n> ```",
      "must be top-level blocks",
    ],
  ])("rejects %s", async (_name, source, message) => {
    await expect(renderMarkdown(source)).rejects.toThrow(message);
  });
});

describe("extractSearchableComponentMarkdown", () => {
  it("keeps alert prose and removes non-searchable component payloads", () => {
    const source = `Start

\`\`\`component:alert
title: Note
---
Searchable **alert text**.
\`\`\`

\`\`\`component:mermaid
---
graph LR
SecretNode --> B
\`\`\`

End`;

    const searchable = extractSearchableComponentMarkdown(source);
    expect(searchable).toContain("Searchable **alert text**.");
    expect(searchable).not.toContain("title: Note");
    expect(searchable).not.toContain("SecretNode");
  });
});
