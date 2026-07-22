import { load as loadYaml } from "js-yaml";
import type { Code, Content, Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import {
  CONTENT_COMPONENT_MARKER_PREFIX,
  CONTENT_COMPONENT_METADATA_KEY,
  contentComponentDefinitions,
  isContentComponentName,
  type ContentComponentDescriptor,
} from "./definitions";

const COMPONENT_LANGUAGE_PREFIX = "component:";
const fragmentParser = unified().use(remarkParse).use(remarkGfm);

type ParsedPayload = {
  propsText: string;
  body: string;
  hasDelimiter: boolean;
};

/** Splits the component payload at the first standalone YAML/body delimiter. */
function splitPayload(value: string): ParsedPayload {
  const lines = value.split("\n");
  const delimiterIndex = lines.findIndex((line) => line.trim() === "---");
  if (delimiterIndex === -1) {
    return { propsText: value, body: "", hasDelimiter: false };
  }
  return {
    propsText: lines.slice(0, delimiterIndex).join("\n"),
    body: lines.slice(delimiterIndex + 1).join("\n").trim(),
    hasDelimiter: true,
  };
}

/** Creates a file-aware build error anchored to the offending code fence. */
function componentError(file: VFile, node: Code, message: string): never {
  throw file.message(message, node);
}

/** Parses and validates one registered component fence. */
function parseDescriptor(
  file: VFile,
  node: Code,
  name: string,
  id: string,
): { descriptor: ContentComponentDescriptor; markdownChildren: Content[] } {
  if (!isContentComponentName(name)) {
    componentError(file, node, `Unknown content component "${name}"`);
  }

  const definition = contentComponentDefinitions[name];
  const { propsText, body, hasDelimiter } = splitPayload(node.value);

  let yaml: unknown = {};
  if (propsText.trim()) {
    try {
      yaml = loadYaml(propsText);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      componentError(file, node, `Invalid YAML for component "${name}": ${message}`);
    }
  }

  const parsed = definition.schema.safeParse(yaml ?? {});
  if (!parsed.success) {
    componentError(file, node, `Invalid properties for component "${name}": ${parsed.error.message}`);
  }

  if (definition.body === "none" && (hasDelimiter || body)) {
    componentError(file, node, `Component "${name}" does not accept a body`);
  }
  if (definition.bodyRequired && !body) {
    componentError(file, node, `Component "${name}" requires a body after a --- delimiter`);
  }

  const descriptor: ContentComponentDescriptor = {
    id,
    name,
    props: parsed.data,
    ...(definition.body === "raw" ? { rawBody: body } : {}),
  };

  if (definition.body !== "markdown" || !body) {
    return { descriptor, markdownChildren: [] };
  }

  const bodyRoot = fragmentParser.parse(body) as Root;
  const nested = bodyRoot.children.find(
    (child) => child.type === "code" && child.lang?.startsWith(COMPONENT_LANGUAGE_PREFIX),
  );
  if (nested) {
    componentError(file, node, `Component "${name}" cannot contain another component fence`);
  }

  return { descriptor, markdownChildren: bodyRoot.children };
}

/** Converts registered component fences into render markers plus validated metadata. */
export const remarkContentComponents: Plugin<[], Root> = () => {
  return (tree, file) => {
    const descriptors: ContentComponentDescriptor[] = [];

    for (let index = 0; index < tree.children.length; index += 1) {
      const node = tree.children[index];
      if (node.type !== "code" || !node.lang?.startsWith(COMPONENT_LANGUAGE_PREFIX)) continue;

      const name = node.lang.slice(COMPONENT_LANGUAGE_PREFIX.length);
      const id = `cc-${descriptors.length}`;
      const { descriptor, markdownChildren } = parseDescriptor(file, node, name, id);
      descriptors.push(descriptor);

      tree.children.splice(
        index,
        1,
        { type: "html", value: `<!--${CONTENT_COMPONENT_MARKER_PREFIX}:start:${id}-->` },
        ...markdownChildren,
        { type: "html", value: `<!--${CONTENT_COMPONENT_MARKER_PREFIX}:end:${id}-->` },
      );
      index += markdownChildren.length + 1;
    }

    // Any component fence still present was nested in another Markdown block.
    const stack: Content[] = [...tree.children];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node.type === "code" && node.lang?.startsWith(COMPONENT_LANGUAGE_PREFIX)) {
        componentError(file, node, "Content component fences must be top-level blocks");
      }
      if ("children" in node && Array.isArray(node.children)) {
        stack.push(...(node.children as Content[]));
      }
    }

    const astroData = ((file.data as any).astro ??= {});
    const frontmatter = (astroData.frontmatter ??= {});
    frontmatter[CONTENT_COMPONENT_METADATA_KEY] = descriptors;
  };
};

/** Replaces component fences with only the Markdown text that should enter search. */
export function extractSearchableComponentMarkdown(markdown: string): string {
  const root = fragmentParser.parse(markdown) as Root;
  const replacements: Array<{ start: number; end: number; value: string }> = [];

  for (const node of root.children) {
    if (node.type !== "code" || !node.lang?.startsWith(COMPONENT_LANGUAGE_PREFIX)) continue;
    const name = node.lang.slice(COMPONENT_LANGUAGE_PREFIX.length);
    if (!isContentComponentName(name) || node.position?.start.offset === undefined || node.position.end.offset === undefined) {
      continue;
    }

    const definition = contentComponentDefinitions[name];
    const { body } = splitPayload(node.value);
    replacements.push({
      start: node.position.start.offset,
      end: node.position.end.offset,
      value: definition.body === "markdown" ? body : "",
    });
  }

  let result = markdown;
  for (const replacement of replacements.toReversed()) {
    result = result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end);
  }
  return result;
}
