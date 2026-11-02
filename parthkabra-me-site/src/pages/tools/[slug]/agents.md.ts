import type { APIRoute } from "astro";
import { buildToolAgentDocResponse } from "../../../utils/tool-agent-doc-response";

// Instructions for AI agents on how to drive a tool through its URL. Only the map has them.
export const getStaticPaths = () => [{ params: { slug: "map" } }];
export const GET: APIRoute = ({ params }) => buildToolAgentDocResponse(params.slug!);
