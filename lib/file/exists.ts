import fs from "fs";
import path from "path";

const root = process.cwd();

// Check if a file, not directory
export const fileExists = (filepath: string) => {
  return fs.existsSync(path.join(root, "content", `${filepath}`));
};
