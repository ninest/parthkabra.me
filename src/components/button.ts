export type ButtonVariant = "primary" | "secondary" | "outline";

export const buttonBaseClasses = "px-3 py-1 rounded flex items-center justify-center";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-muted",
  outline: "border border-border bg-transparent hover:bg-muted",
};

// Compose base + variant + optional extras. Used from client-side JS that builds <button> elements
// dynamically (e.g. MapDrawer) so styling stays in sync with button.astro.
export function buttonClasses(variant: ButtonVariant = "secondary", extra = ""): string {
  return [buttonBaseClasses, buttonVariantClasses[variant], extra].filter(Boolean).join(" ");
}
