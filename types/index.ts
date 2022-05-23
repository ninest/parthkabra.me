import { CatName } from "@/content/map";

const sizes = ["xs", "sm", "base", "md", "lg", "xl", "2xl", "3xl"] as const;
export type Size = typeof sizes[number];

export interface LinkItem {
  title: string;
  href: string;
  date?: string;
  description?: string;
  cat?: CatName;
}
