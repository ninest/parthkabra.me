export const prerender = false;

import { buildToolAgentDocResponse } from "../../../utils/tool-agent-doc-response";

export async function GET({ params }: { params: { slug?: string } }) {
  return buildToolAgentDocResponse(params.slug ?? "");
}
