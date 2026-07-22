import { contentComponentDefinitions, isContentComponentName } from "./definitions";

type ComponentFence = {
  end: number;
  name: string;
  start: number;
  value: string;
};

/** Finds top-level content-component fences without loading the Markdown parser at runtime. */
function findComponentFences(markdown: string): ComponentFence[] {
  const lines = markdown.match(/[^\n]*(?:\n|$)/g)?.filter(Boolean) ?? [];
  const fences: ComponentFence[] = [];
  let offset = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].replace(/\r?\n$/, "");
    const opening = line.match(/^ {0,3}(`{3,}|~{3,})component:([^\s`~]+)[ \t]*$/);
    if (!opening) {
      offset += lines[index].length;
      continue;
    }

    const start = offset;
    const marker = opening[1][0];
    const minimumLength = opening[1].length;
    const bodyStart = offset + lines[index].length;
    let closingOffset = bodyStart;

    for (let closingIndex = index + 1; closingIndex < lines.length; closingIndex += 1) {
      const closingLine = lines[closingIndex].replace(/\r?\n$/, "");
      const closing = closingLine.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
      if (closing?.[1][0] === marker && closing[1].length >= minimumLength) {
        fences.push({
          start,
          end: closingOffset + lines[closingIndex].length,
          name: opening[2],
          value: markdown.slice(bodyStart, closingOffset).replace(/\r?\n$/, ""),
        });
        index = closingIndex;
        offset = closingOffset + lines[closingIndex].length;
        break;
      }
      closingOffset += lines[closingIndex].length;
    }
  }

  return fences;
}

/** Replaces component fences with only the Markdown text that should enter search. */
export function extractSearchableComponentMarkdown(markdown: string): string {
  const replacements = findComponentFences(markdown).flatMap((fence) => {
    if (!isContentComponentName(fence.name)) return [];

    const definition = contentComponentDefinitions[fence.name];
    const { body } = splitPayload(fence.value);
    return [{
      start: fence.start,
      end: fence.end,
      value: definition.body === "markdown" ? body : "",
    }];
  });

  let result = markdown;
  for (const replacement of replacements.toReversed()) {
    result = result.slice(0, replacement.start) + replacement.value + result.slice(replacement.end);
  }
  return result;
}

type ParsedPayload = {
  body: string;
  hasDelimiter: boolean;
  propsText: string;
};

/** Splits the component payload at the first standalone YAML/body delimiter. */
export function splitPayload(value: string): ParsedPayload {
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
