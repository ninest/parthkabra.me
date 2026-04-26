export type ButtonVariant = "primary" | "secondary" | "outline";
export type ButtonSize = "sm" | "md";

export const buttonBaseClasses = "rounded flex items-center justify-center";

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "h-5 px-2 py-0.5 text-xs",
  md: "h-7 px-3 py-1",
};

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-muted",
  outline: "border border-border bg-transparent hover:bg-muted",
};

// Compose base + size + variant + optional extras. Used from client-side JS that builds <button> elements
// dynamically (e.g. MapDrawer) so styling stays in sync with button.astro.
export function buttonClasses(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md",
  extra = "",
): string {
  return [buttonBaseClasses, buttonSizeClasses[size], buttonVariantClasses[variant], extra]
    .filter(Boolean)
    .join(" ");
}
