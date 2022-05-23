import { PageTitleBanner, SmartLink, Spacer } from "@/components";
import { PostList } from "@/components/ui/PostList";
import { Collection } from "@/content/collections";
import { RightSidebarLayout } from "@/layouts";
import clsx from "clsx";
import { ReactNode } from "react";

interface Props {
  top?: ReactNode;
  title: string;
  description: string;
  date?: ReactNode;
  sidebar: ReactNode;
  sidebarBottom?: ReactNode;
  children: ReactNode;

  // Not all posts are parts of "collections"
  collection?: Collection;
  collectionPosts?: any[];
}
export const PageRightSidebarLayout = ({
  top = <></>,
  title,
  description,
  date,
  sidebar,
  sidebarBottom = <></>,
  children,
  collectionPosts,
  collection,
}: Props) => {
  const hasLeftSidebar = !!collectionPosts;

  return (
    <>
      {top}
      <Spacer size="xl" />
      <PageTitleBanner title={title} date={date} description={description} />

      <div
        className={clsx("space-x", {
          "md:space-x": !hasLeftSidebar,
          "md:px-3xl": hasLeftSidebar,
        })}
      >
        <RightSidebarLayout
          sidebar={<div className="space-y-lg">{sidebar}</div>}
          sidebarBottom={sidebarBottom}
          navbar={
            hasLeftSidebar && (
              <div className="space-y-base relative -z-10">
                <PostList items={collectionPosts} />
              </div>
            )
          }
        >
          <div>{children}</div>
        </RightSidebarLayout>
      </div>
    </>
  );
};
