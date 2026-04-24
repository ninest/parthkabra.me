export const prerender = true;

import { getToolAgentDocUrl, getToolUrl } from "../../../utils/links";

const SITE_ORIGIN = "https://parthkabra.me";
const MAP_URL = `${SITE_ORIGIN}${getToolUrl("map")}`;
const DOC_URL = `${SITE_ORIGIN}${getToolAgentDocUrl("map")}`;

function buildAgentDocs(): string {
  return `# Map URL spec for AI agents

Use this document when generating share links for the map tool.

- Canonical map tool URL: ${MAP_URL}
- Canonical docs URL: ${DOC_URL}
- Current URL version to emit: \`v=1\`
- Legacy \`v=0\` links may still work, but do not generate them

## Intended usage

This document is designed so a user can give an AI app a very short prompt such as:

\`\`\`
Read ${DOC_URL} and make me a map of the best restaurants in Back Bay, Boston.
\`\`\`

or:

\`\`\`
Read ${DOC_URL}. Turn this place list into a map link.
\`\`\`

If the user does not ask for extra explanation, default to returning only the final map URL.

## Output contract

When a user asks for a map, return a final share URL to \`${MAP_URL}\`.

- Prefer an absolute URL
- Default to returning only the final URL unless the user explicitly asks for notes, a table, or reasoning
- If you do not have reliable coordinates, say that you cannot build an exact link yet
- Do not invent precise coordinates

## Query params

- \`v=1\` marks the current URL format
- \`d=<payload>\` stores points and lines
- \`hl=1\` hides the base map labels; omit it when labels should stay visible

## Payload grammar

The \`d\` payload is a pipe-separated list of features.

- Point: \`p:[h]colorId:encodedName:lat,lng\`
- Line: \`l:[h]colorId:encodedName:lat,lng;lat,lng;...\`

Rules:

- \`h\` before the color ID hides that feature's label
- Allowed color IDs: \`red\`, \`blue\`, \`green\`, \`yellow\`, \`gray\`
- Inside the payload, coordinates are always written as \`lat,lng\`
- For lines, separate coordinate pairs with \`;\`
- Separate features with \`|\`
- Use about 5 decimal places when possible
- Encode the feature name with \`encodeURIComponent\`

## Versioning

- Always generate \`v=1\`
- Missing \`v\` is treated by the site as legacy \`v=0\`
- Unknown future versions may be ignored by the site instead of crashing

## Recommended build steps

1. Gather places or paths with reliable coordinates
2. Turn each place into a point feature
3. Join all features with \`|\`
4. URL-encode the full payload for the final \`d\` query param
5. Return \`${MAP_URL}?v=1&d=...\`

## Example payload

Readable payload:

\`\`\`
p:red:Place%201:42.34910,-71.08320|p:blue:Place%202:42.34840,-71.08110|p:green:Place%203:42.34770,-71.07990
\`\`\`

Final URL:

\`\`\`
${MAP_URL}?v=1&d=p%3Ared%3APlace%25201%3A42.34910%2C-71.08320%7Cp%3Ablue%3APlace%25202%3A42.34840%2C-71.08110%7Cp%3Agreen%3APlace%25203%3A42.34770%2C-71.07990
\`\`\`

## Example line

\`\`\`
l:gray:Walk%20Route:42.34910,-71.08320;42.34850,-71.08190;42.34790,-71.08040
\`\`\`

## Good responses

- If the user asked for a finished map: return the final URL
- If the user gave a markdown file with names and coordinates: map those directly
- If the user gave only names or addresses: geocode first, then build the URL

## Recommended behavior for place maps

- When the user asks for "best restaurants", "best cafes", or similar, choose a reasonable set of well-known places with verifiable coordinates
- Keep point names short so labels fit on the map
- Prefer points unless the user explicitly asks for lines or paths
- Leave map labels visible unless the user asks to hide them

## Avoid

- Do not emit \`v=0\`
- Do not swap the payload order to \`lng,lat\`
- Do not use color names outside the allowed set
- Do not leave raw \`|\` or other separators inside feature names; encode the name segment first
`;
}

export async function GET() {
  return new Response(buildAgentDocs(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
