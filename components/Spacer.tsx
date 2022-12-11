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

// // So Tailwind can read it
// // TODO: fix
// const _ = [
//   ,
// ] as const;
