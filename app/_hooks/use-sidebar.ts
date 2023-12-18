import { atom, useAtom } from "jotai";

const sidebarOpenAtom = atom(false);

export function useSidebar() {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  return { sidebarOpen, setSidebarOpen };
}
