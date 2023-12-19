"use client";

import { useScrollPosition } from "@/app/_hooks/use-scroll-position";
import { useSidebar } from "@/app/_hooks/use-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/style";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ReactNode } from "react";
import { LuChevronRight, LuMoon, LuPanelRight, LuSliders } from "react-icons/lu";

type Crumb = { title: string; href: string; classes?: string };

interface NavbarProps {
  showSidebarToggle?: boolean;
  crumbs?: Crumb[];
  onlyVisibleOnScroll?: boolean;
  mobileSidebarSlot?: ReactNode;
}

export function Navbar({
  showSidebarToggle = false,
  crumbs = [],
  onlyVisibleOnScroll,
  mobileSidebarSlot,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const scrollPosition = useScrollPosition();

  const haveScrolledBelowTitle = scrollPosition > 100;

  const show = haveScrolledBelowTitle || !onlyVisibleOnScroll;

  const mobileCrumbs = [{ title: "Parth Kabra", href: "/", classes: "font-bold text-base" }, ...crumbs];
  let desktopCrumbs = [...mobileCrumbs];
  if (sidebarOpen) desktopCrumbs.shift();

  return (
    <>
      {show && (
        <div className="sticky top-0 z-50 ">
          <header className="p-5 flex items-center justify-between bg-background/75 lg:bg-transparent">
            <div className="flex items-center space-x-2">
              {/* On mobile, the close sidebar button remains in the same place, but
              on desktop, the close sidebar button is in the sidebar
              */}
              {showSidebarToggle && (
                <Button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  variant={"outline"}
                  size={"icon"}
                  className={cn({ "md:hidden": sidebarOpen })}
                >
                  <LuPanelRight />
                </Button>
              )}
              <CrumbList crumbs={mobileCrumbs} className="md:hidden" />
              <CrumbList crumbs={desktopCrumbs} className="hidden md:flex" />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={theme === "dark" ? () => setTheme("light") : () => setTheme("dark")}
                variant={"outline"}
                className="p-3"
              >
                <LuMoon />
              </Button>
              <Button asChild>
                <Link href={"/contact"}>Contact</Link>
              </Button>
            </div>
          </header>

          {/* Mobile "sidebar" */}
          {!!mobileSidebarSlot && sidebarOpen && (
            <aside className="md:hidden bg-background border-t border-b max-h-[50vh] overflow-y-auto">
              {mobileSidebarSlot}
            </aside>
          )}
        </div>
      )}
    </>
  );
}

function CrumbList({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {crumbs.map((crumb, i) => {
        const isFirst = i === 0;
        return (
          <Link key={crumb.href} href={crumb.href} className={cn("flex items-center text-sm", crumb.classes)}>
            {/* Show chevron for everything but the first element */}
            {!isFirst && <LuChevronRight className="mr-1" />}
            {crumb.title}
          </Link>
        );
      })}
    </div>
  );
}
