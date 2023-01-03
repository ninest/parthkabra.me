import { PageTitleBanner, Spacer, TOC } from "@/components";
import { PostLink } from "@/lib/content/frontmatter";
import { ReactNode } from "react";

interface PostLayoutProps {
  top?: ReactNode;
  title: string;
  description: string;
  date?: ReactNode;
  links?: PostLink[];
  showContents?: boolean;
  children: ReactNode;
}

export const PostLayout = ({
  top,
  title,
  date,
  links,
  description,
  showContents = false,
  children,
}: PostLayoutProps) => {
  return (
    <>
      {top}

      <Spacer size="xl" />

      <PageTitleBanner
        title={title}
        date={date}
        description={description}
        links={links}
      />

      {/* <div className="p-base lg:p-0 max-w-[80ch] mx-auto"> */}
      <div className="space max-w-[120ch]">
        {showContents && (
          <>
            <Spacer size="lg" />
            <TOC />
          </>
        )}
        <Spacer size="2xl" />
        <div>{children}</div>
      </div>
    </>
  );
};
