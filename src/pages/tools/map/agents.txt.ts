export const prerender = true;

import { buildMapAgentDocs } from "../../../utils/map-agent-docs";

export async function GET() {
  return new Response(buildMapAgentDocs(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
