import fs from "fs";
import path from "path";
import { fileExists } from "./exists";

const root = process.cwd();

export const readFile = (filepath: string) => {
  return fs.readFileSync(path.join(root, "content", `${filepath}`), "utf8");
};

export const readMarkdownFile = (contentpath: string) => {
  if (fileExists(`${contentpath}.md`)) {
    return readFile(`${contentpath}.md`);
  } else {
    return readFile(`${contentpath}/index.md`);
  }
};
