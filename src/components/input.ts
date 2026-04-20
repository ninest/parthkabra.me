export const inputBaseClasses = "border border-border focus:outline-none";

// Compose base + optional extras. Used from client-side JS that builds <input> elements
// dynamically (e.g. MapDrawer) so styling stays in sync with input.astro.
export function inputClasses(extra = ""): string {
  return [inputBaseClasses, extra].filter(Boolean).join(" ");
}
