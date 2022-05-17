import { Size } from "@/types";
import clsx from "clsx";

interface SpacerProps {
  size?: Size;
  axis?: "x" | "y";
  className?: string;
}

export const Spacer = ({
  size = "base",
  axis = "y",
  className = "",
}: SpacerProps) => {
  const prefix = axis == "x" ? "w" : "h";
  return <div className={clsx(`${prefix}-${size}`, className)}></div>;
};

// So Tailwind can read it
// TODO: fix
const _ = [
  "h-md",
  "h-base",
  "h-sm",
  "h-xs",
  "h-xl",
  "h-2xl",
  "h-3xl",
  "h-lg",
  "w-md",
  "w-base",
  "w-sm",
  "w-xs",
  "w-xl",
  "w-lg",
  "w-xl",
  "w-2xl",
  "w-3xl",
] as const;
