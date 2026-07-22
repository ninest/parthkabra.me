import { z } from "astro/zod";

export type ContentComponentBodyMode = "markdown" | "raw" | "none";

export type ContentComponentDefinition = {
  body: ContentComponentBodyMode;
  bodyRequired?: boolean;
  rawBodyProp?: string;
  schema: z.ZodType<Record<string, unknown>>;
};

const noProps = z.object({}).strict();

export const contentComponentDefinitions = {
  alert: {
    body: "markdown",
    schema: z
      .object({
        variant: z.enum(["default", "secondary"]).default("default"),
        title: z.string().optional(),
      })
      .strict(),
  },
  mermaid: {
    body: "raw",
    bodyRequired: true,
    rawBodyProp: "chart",
    schema: noProps,
  },
  "subscribe-form": { body: "none", schema: noProps },
  "ai-map-maker": { body: "none", schema: noProps },
  "average-location-calculator": { body: "none", schema: noProps },
  "duplicate-word-finder": { body: "none", schema: noProps },
  "map-drawer": { body: "none", schema: noProps },
  "absolutely-write": { body: "none", schema: noProps },
} as const satisfies Record<string, ContentComponentDefinition>;

export type ContentComponentName = keyof typeof contentComponentDefinitions;

export type ContentComponentDescriptor = {
  id: string;
  name: ContentComponentName;
  props: Record<string, unknown>;
  rawBody?: string;
};

export const CONTENT_COMPONENT_METADATA_KEY = "__contentComponents";
export const CONTENT_COMPONENT_MARKER_PREFIX = "content-component";

export function isContentComponentName(name: string): name is ContentComponentName {
  return name in contentComponentDefinitions;
}
