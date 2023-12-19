"use client";

import { useSidebar } from "@/app/_hooks/use-sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ComponentProps } from "react";
import { LuPanelRight } from "react-icons/lu";

type SidebarProps = ComponentProps<"div"> & {};

export function DesktopSidebar({ children }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  return (
    <>
      {sidebarOpen && (
        <aside className="hidden md:block flex-none w-[16rem] lg:w-[20rem] sticky top-0 h-screen border-r">
          <div className="p-5 border-b flex items-center space-x-2">
            <Button onClick={() => setSidebarOpen(!sidebarOpen)} variant={"outline"} size={"icon"}>
              <LuPanelRight />
            </Button>
            <Link href="/" className="block font-bold">
              Parth Kabra
            </Link>
          </div>
          {children}
        </aside>
      )}
    </>
  );
}
