import { RenderableTreeNode, ValidateError } from "@markdoc/markdoc";
import { Frontmatter } from "../content/frontmatter";

export interface MarkdocFromFile {
  frontmatter: Frontmatter;
  content: RenderableTreeNode;
  errors: ValidateError[];
}
