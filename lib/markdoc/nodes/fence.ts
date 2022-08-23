import { Schema, Tag } from "@markdoc/markdoc";
import * as shiki from "shiki";

const highlighter = await shiki.getHighlighter({ theme: "one-dark-pro" });

export const fence: Schema = {
  render: "MarkdocFence",
  attributes: {
    language: { type: String },
    content: { type: String },
    title: { type: String },
    lineNumbers: { type: Boolean, default: false },
    lineStart: { type: Number, default: 1 },
    highlightedLines: { type: Array, required: false },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    const { language, content, highlightedLines = [] } = attributes;

    const html = highlighter.codeToHtml(content, {
      lang: language,
      // lineOptions: [{ line: 2, classes: ["highlight"] }],
      lineOptions: highlightedLines.map((line: number) => ({
        line,
        classes: ["highlighted"],
      })),
    });

    return new Tag(this.render, { ...attributes, html }, children);
  },
};
