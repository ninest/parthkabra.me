import Markdoc, { Config } from "@markdoc/markdoc";
import yaml from "js-yaml";
import { Frontmatter } from "../content/frontmatter";
import { readMarkdownFile } from "../file/read";
import { fence } from "./nodes/fence";
import { image } from "./nodes/image";
import { link } from "./nodes/links";
import { div } from "./tags/div";
import { alert } from "./tags/alert";
import { chat } from "./tags/chat";
import { span } from "./tags/span";

const config: Config = {
  nodes: {
    image,
    link,
    fence,
  },
  tags: {
    div,
    span,
    alert,
    chat,
    keyboard: {
      render: "Keyboard",
    },
    mouse: {
      render: "Mouse",
    },
    "pee-seat": {
      render: "PeeSeat",
    },
  },
};

export const markdocFromFile = (filepath: string) => {
  const source = readMarkdownFile(filepath).trim();
  const ast = Markdoc.parse(source);
  const errors = Markdoc.validate(ast, config);
  const frontmatter = (
    ast.attributes.frontmatter ? yaml.load(ast.attributes.frontmatter) : {}
  ) as Frontmatter;
  const content = Markdoc.transform(ast, config);

  return {
    frontmatter,
    content,
    errors,
  };
};
