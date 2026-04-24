export const prerender = true;

import { buildLlmsTxt } from "../utils/map-agent-docs";

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
