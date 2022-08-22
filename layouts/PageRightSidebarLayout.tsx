import { PageTitleBanner, SmartLink, Spacer } from "@/components";
import { PostList } from "@/components/ui/PostList";
import { Collection } from "@/lib/content/collections";
import { RightSidebarLayout } from "@/layouts";
import clsx from "clsx";
import { ReactNode } from "react";

interface Props {
  top?: ReactNode;
  title: string;
  description: string;
  date?: ReactNode;
  children: ReactNode;

  hasSidebar: boolean;
  sidebar: ReactNode;
  sidebarBottom?: ReactNode;

  hasNavbar: boolean;
  // Not all posts are parts of "collections"
  collection?: Collection;
  collectionPosts?: any[];
}
export const PageRightSidebarLayout = ({
  top = <></>,
  title,
  description,
  date,
  children,

  hasSidebar = false,
  sidebar,
  sidebarBottom = <></>,

  hasNavbar = false,
  collectionPosts,
}: Props) => {
  return (
    <>
      {top}
      <Spacer size="xl" />
      <PageTitleBanner title={title} date={date} description={description} />

      <div
        className={clsx("space-x", {
          "md:space-x": !hasNavbar,
          "md:px-3xl": hasNavbar,
        })}
      >
        <RightSidebarLayout
          hasNavbar={hasNavbar}
          navbar={
            hasNavbar && (
              <div className="space-y-base relative -z-10">
                <PostList items={collectionPosts!} />
              </div>
            )
          }
          hasSidebar={hasSidebar}
          sidebar={hasSidebar && <div className="space-y-lg">{sidebar}</div>}
          sidebarBottom={hasSidebar && sidebarBottom}
        >
          <div>{children}</div>
        </RightSidebarLayout>
      </div>
    </>
  );
};
