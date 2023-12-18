"use client";

import { useSidebar } from "@/app/_hooks/use-sidebar";
import { ComponentProps } from "react";

type SidebarProps = ComponentProps<"div"> & {};

export function Sidebar({ children }: SidebarProps) {
  const { sidebarOpen } = useSidebar();
  return <>{sidebarOpen && <aside className="flex-none w-[20rem] sticky top-0 h-screen border-r">{children}</aside>}</>;
}
