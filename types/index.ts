const sizes = ["xs", "sm", "base", "md", "lg", "xl", "2xl", "3xl"] as const;
export type Size = typeof sizes[number];

export interface LinkItem {
  title: string;
  href: string;
  right?: string;
  description?: string;
  date?: Date;
}
