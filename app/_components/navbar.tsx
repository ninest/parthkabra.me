"use client";

import { useScrollPosition } from "@/app/_hooks/use-scroll-position";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Link from "next/link";
import { LuChevronRight, LuMoon } from "react-icons/lu";

interface NavbarProps {
  crumbs?: { title: string; href: string }[];
  onlyVisibleOnScroll?: boolean;
}

export function Navbar({ crumbs, onlyVisibleOnScroll }: NavbarProps) {
  const { theme, setTheme } = useTheme();

  const scrollPosition = useScrollPosition();
  const haveScrolledBelowTitle = scrollPosition > 100;

  const show = haveScrolledBelowTitle || !onlyVisibleOnScroll;

  return (
    <>
      {show && (
        <header className="sticky top-0 z-50 px-5 py-4 flex items-center justify-between bg-background/75 lg:bg-transparent">
          <div className="flex items-center space-x-2">
            <Link href="/" className="block font-bold">
              Parth Kabra
            </Link>
            {crumbs &&
              crumbs.map((crumb) => (
                <Link href={crumb.href} className="flex items-center text-sm">
                  <LuChevronRight className="mr-1" />
                  {crumb.title}
                </Link>
              ))}
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
      )}
    </>
  );
}
