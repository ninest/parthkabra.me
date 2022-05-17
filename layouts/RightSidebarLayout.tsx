import { Spacer } from "@/components";
import clsx from "clsx";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarBottom?: ReactNode;
}

export const RightSidebarLayout = ({
  children,
  sidebar,
  sidebarBottom,
}: Props) => {
  return (
    <main
      className={clsx(
        "min-w-0 min-h-0",
        // https://stackoverflow.com/a/43312314/8677167
        // minmax and min width and height required for horizontally scrolling code blocks as grid children
        "grid min-w-0 min-h-0 space-x-12 xl:space-x-28",
        "grid-cols-1 lg:grid-cols-[minmax(0,3fr)_1fr]"
      )}
      style={{}}
    >
      <div className="max-w-[100ch]">{children}</div>
      <div className="relative hidden lg:block flex-none w-72">
        <div className="sticky -mt-32 pt-32 top-0 overflow-y-scroll max-h-screen">
          {sidebar}
        </div>

        <div className="bg-red -50 fixed w-72 bottom-0 ">
          <div className="pb-3xl">{sidebarBottom}</div>
        </div>
      </div>
    </main>
  );
};
