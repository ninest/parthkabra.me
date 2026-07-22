import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { ContentComponentName } from "./definitions";

type ComponentModule = { default: AstroComponentFactory };

export const contentComponentLoaders: Record<
  ContentComponentName,
  () => Promise<ComponentModule>
> = {
  alert: () => import("../components/content/Alert.astro"),
  mermaid: () => import("../components/content/Mermaid.astro"),
  "subscribe-form": () => import("../components/subscribe-form.astro"),
  "ai-map-maker": () => import("../components/tools/AIMapMaker.astro"),
  "average-location-calculator": () => import("../components/tools/AverageLocationCalculator.astro"),
  "duplicate-word-finder": () => import("../components/tools/DuplicateWordFinder.astro"),
  "map-drawer": () => import("../components/tools/MapDrawer.astro"),
  "absolutely-write": () => import("../components/tools/AbsolutelyWrite.astro"),
};
