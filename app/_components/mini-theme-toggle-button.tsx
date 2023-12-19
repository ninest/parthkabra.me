"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { LuMoon } from "react-icons/lu";

export const metaColors: Record<string, string> = {
  light: "#5048E5",
  dark: "#000000",
};

export function MiniThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", metaColors[theme]);
  }, [theme]);

  return (
    <button onClick={theme === "dark" ? () => setTheme("light") : () => setTheme("dark")} className="text-gray-600">
      <LuMoon />
    </button>
  );
}
