import { Button, PageTitleBanner, Spacer, TOC } from "@/components";
import { formatDateFull } from "@/lib/date";
import { Children, ReactNode } from "react";
import { RightSidebarLayout } from "@/layouts";

interface Props {
  top?: ReactNode;
  title: string;
  description: string;
  date?: ReactNode;
  sidebar: ReactNode;
  sidebarBottom?: ReactNode;
  children: ReactNode;
}
export const PageRightSidebarLayout = ({
  top = <></>,
  title,
  description,
  date,
  sidebar,
  sidebarBottom = <></>,
  children,
}: Props) => {
  return (
    <>
      {top}

      <Spacer size="xl" />

      <PageTitleBanner title={title} date={date} description={description} />

      <Spacer size="xl" />

      <div className="space">
        <RightSidebarLayout
          sidebar={<div className="space-y-lg">{sidebar}</div>}
          sidebarBottom={sidebarBottom}
        >
          <article className="prose">{children}</article>
        </RightSidebarLayout>
      </div>
    </>
  );
};
