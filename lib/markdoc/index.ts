import Markdoc, { Config } from "@markdoc/markdoc";
import yaml from "js-yaml";
import { Frontmatter } from "../content/frontmatter";
import { readMarkdownFile } from "../file/read";
import { fence } from "./nodes/fence";
import { image } from "./nodes/image";
import { link } from "./nodes/links";
import { div } from "./tags/div";

const config: Config = {
  nodes: {
    image,
    link,
    fence,
  },
  tags: {
    div,
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
