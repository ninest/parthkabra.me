import { buildMapAgentDocs } from "./map-agent-docs";

const TOOL_AGENT_DOC_BUILDERS: Record<string, () => string> = {
  map: buildMapAgentDocs,
};

// Builds the agent docs response for a supported tool id.
export function buildToolAgentDocResponse(toolId: string): Response {
  const buildDocs = TOOL_AGENT_DOC_BUILDERS[toolId];

  if (!buildDocs) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(buildDocs(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
