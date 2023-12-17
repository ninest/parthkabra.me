import { cn } from "@/utils/style";
import { ReactNode } from "react";

interface AlertProps {
  variant?: "default" | "secondary";
  title?: string;
  open?: boolean;
  children: ReactNode;
}

export function Alert({ variant, title, open = true, children }: AlertProps) {
  return (
    <details
      className={cn("p-4 rounded-md", {
        "bg-primary text-primary-foreground": variant == "default",
        "bg-gray-200 dark:bg-gray-800": variant == "secondary",
      })}
      open={open}
    >
      {title && <summary className="list-none font-bold">{title}</summary>}
      <div className="prose">{children}</div>
    </details>
  );
}
