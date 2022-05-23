import { Spacer } from "@/components";
import clsx from "clsx";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarBottom?: ReactNode;
  // Left sidebar
  navbar?: ReactNode;
}

export const RightSidebarLayout = ({
  children,
  sidebar,
  sidebarBottom,
  navbar,
}: Props) => {
  const hasLeftSidebar = !!navbar;

  return (
    <main
      className={clsx(
        "min-w-0 min-h-0",
        // https://stackoverflow.com/a/43312314/8677167
        // minmax and min width and height required for horizontally scrolling code blocks as grid children
        "grid min-w-0 min-h-0",
        {
          "lg:space-x-12 xl:space-x-28": !hasLeftSidebar,
          // Keep content more dense if there is also a right sidebar
          "lg:space-x-10 xl:space-x-24": hasLeftSidebar,
        },
        "grid-cols-1",
        {
          "lg:grid-cols-[minmax(0,3fr)_1fr]": !hasLeftSidebar,
          "lg:grid-cols-[1fr_minmax(0,3fr)_1fr]": hasLeftSidebar,
        },
        "max-w-[200ch] mx-auto"
      )}
    >
      {hasLeftSidebar && (
        <div className="relative hidden lg:block flex-none w-64">
          <div className="sticky top-16 pt-16 overflow-y-scroll max-h-screen">
            {navbar}
          </div>
        </div>
      )}
      <div className="max-w-[100ch]">
        <Spacer size="3xl" />
        {children}
      </div>
      <div className="relative hidden lg:block flex-none w-72">
        <div className="sticky top-16 pt-16 overflow-y-scroll max-h-screen">
          {sidebar}
        </div>
        <div className="fixed w-72 bottom-0 ">
          <div className="pb-3xl">{sidebarBottom}</div>
        </div>
      </div>
    </main>
  );
};
