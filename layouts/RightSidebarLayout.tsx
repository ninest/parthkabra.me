import { Spacer } from "@/components";
import clsx from "clsx";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  // Left sidebar
  hasNavbar?: boolean;
  navbar?: ReactNode;
  // Right sidebar
  hasSidebar?: boolean;
  sidebar?: ReactNode;
  sidebarBottom?: ReactNode;
}

export const RightSidebarLayout = ({
  children,
  hasNavbar = false,
  navbar,
  hasSidebar = false,
  sidebar,
  sidebarBottom,
}: Props) => {
  return (
    <div className={clsx("max-w-[150ch] mx-auto")}>
      <main
        className={clsx(
          // debugger
          // "bg-red-300",
          "mx-auto min-w-0 min-h-0",
          // https://stackoverflow.com/a/43312314/8677167
          // minmax and min width and height required for horizontally scrolling code blocks as grid children
          "grid min-w-0 min-h-0",
          {
            "lg:space-x-12 xl:space-x-40": !hasNavbar,
            // Keep content more dense if there is also a right sidebar
            "lg:space-x-10 xl:space-x-24": hasNavbar,
          },
          "grid-cols-1",
          {
            // Most pages have the right sidebar
            "lg:grid-cols-[minmax(0,3fr)_1fr]": !hasNavbar,
            "lg:grid-cols-[1fr_minmax(0,3fr)_1fr]": hasNavbar,
            // Some may only have navbar (left sidebar)
            // Some pages have no sidebars at all, so center in that case
            "lg:grid-cols-1 !max-w-[80ch]": !hasNavbar && !hasSidebar,
          }
        )}
      >
        {hasNavbar && (
          <div className="relative hidden lg:block flex-none w-64">
            <div className="sticky top-16 pt-16 overflow-y-scroll max-h-screen">
              {navbar}
            </div>
          </div>
        )}

        <div className="">
          <Spacer size="3xl" />
          {children}
        </div>

        {hasSidebar && (
          <div className="relative hidden lg:block flex-none w-72">
            <div className="sticky top-16 pt-16 overflow-y-scroll max-h-screen">
              {sidebar}
            </div>
            <div className="fixed w-72 bottom-0 ">
              <div className="pb-3xl">{sidebarBottom}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
