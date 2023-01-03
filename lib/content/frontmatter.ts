export interface Frontmatter {
  title: string;
  description: string;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  showContents?: boolean;
  draft: boolean;
  links: PostLink[];
}

export interface PostLink {
  title: string;
  source: string;
  href: string;
}
