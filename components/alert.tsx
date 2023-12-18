import { cn } from "@/utils/style";
import { ReactNode } from "react";

interface AlertProps {
  variant?: "default" | "secondary";
  title?: string;
  open?: boolean;
  children: ReactNode;
}

export function Alert({ variant, title, open = true, children }: AlertProps) {
  const parentClasses = cn("p-4 rounded-md shadow", {
    "bg-primary-foreground dark:bg-primary": variant == "default",
    "bg-secondary": variant == "secondary",
  });
  const contentClasses = cn("prose dark:prose-invert max-w-none prose-pre:mx-0!important");

  return (
    <details className={parentClasses} open={open}>
      <summary className="list-none font-bold">{title}</summary>
      <div className={contentClasses}>{children}</div>
    </details>
  );
}
