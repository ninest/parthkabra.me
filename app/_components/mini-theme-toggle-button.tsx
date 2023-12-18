"use client";

import { useTheme } from "next-themes";
import { LuMoon } from "react-icons/lu";

export function MiniThemeToggleButton() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={theme === "dark" ? () => setTheme("light") : () => setTheme("dark")} className="text-gray-600">
      <LuMoon />
    </button>
  );
}
