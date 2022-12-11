import { PageTitleBanner, Spacer, TOC } from "@/components";
import { ReactNode } from "react";

interface PostLayoutProps {
  top?: ReactNode;
  title: string;
  description: string;
  date?: ReactNode;
  showContents?: boolean;
  children: ReactNode;
}

export const PostLayout = ({
  top,
  title,
  date,
  description,
  showContents = false,
  children,
}: PostLayoutProps) => {
  return (
    <>
      {top}

      <Spacer size="xl" />

      <PageTitleBanner title={title} date={date} description={description} />

      <div className="p-base lg:p-0 max-w-[80ch] mx-auto">
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
