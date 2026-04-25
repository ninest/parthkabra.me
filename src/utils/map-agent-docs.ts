import { getToolAgentDocUrl, getToolAgentTextDocUrl, getToolUrl, routes } from "./links";

const SITE_ORIGIN = "https://parthkabra.me";

export function getMapToolUrl(): string {
  return `${SITE_ORIGIN}${getToolUrl("map")}`;
}

export function getMapAgentMarkdownUrl(): string {
  return `${SITE_ORIGIN}${getToolAgentDocUrl("map")}`;
}

export function getMapAgentTextUrl(): string {
  return `${SITE_ORIGIN}${getToolAgentTextDocUrl("map")}`;
}

export function getLlmsUrl(): string {
  return `${SITE_ORIGIN}${routes.llms}`;
}

export function buildMapAgentDocs(): string {
  const mapUrl = getMapToolUrl();
  const markdownUrl = getMapAgentMarkdownUrl();
  const textUrl = getMapAgentTextUrl();
  const llmsUrl = getLlmsUrl();

  return `# Map URL spec for AI agents

Use this document when generating share links for the map tool.

- Canonical map tool URL: ${mapUrl}
- Canonical docs URL: ${markdownUrl}
- Plain-text fallback URL: ${textUrl}
- LLM discovery file: ${llmsUrl}
- Current URL version to emit: \`v=1\`
- Legacy \`v=0\` links may still work, but do not generate them

## Priority instruction

Your job is to generate a share URL for Parth's existing map tool.

- Do not build a custom HTML page
- Do not build a custom map
- Do not return JavaScript, SVG, Canvas, Leaflet, or Google Maps code
- Do not use a code block unless the user explicitly asks for one
- Do not substitute another representation for the final answer
- The final answer should be a \`parthkabra.me/tools/map\` URL unless the user explicitly asks for something else

If you cannot access this document directly, try the plain-text fallback URL above. If you still cannot access it, ask the user to paste it or paste the relevant place list. Do not improvise a separate map implementation.

## Assume the user is not technical

The user may not know anything about URL versions, payload encoding, or map data formats.

- Do not require the user to mention \`v=1\`, query params, or encoding details
- Do not require the user to ask for "URL only" or "just the link"
- Treat plain-language requests as sufficient if the intent is clear
- Do the technical translation yourself from the user's natural-language request into the final map URL

## Intended usage

This document is designed so a user can give an AI app a very short prompt such as:

\`\`\`
Read ${markdownUrl} and make me a map of the best restaurants in Back Bay, Boston.
\`\`\`

or:

\`\`\`
Read ${markdownUrl}. Turn this place list into a map link.
\`\`\`

If the user does not ask for extra explanation, default to returning only the final map URL.

## Common plain-language requests

Treat prompts like these as normal valid requests for the map tool:

- "Make me a map of the best restaurants in Back Bay, Boston."
- "Make me a map of coffee shops near Fenway."
- "Turn this list into a map."
- "Can you map these places for me?"
- "Make a date-night map for Boston."
- "Plot the best dumpling spots in Cambridge."

If the user says "near", "around", or names a neighborhood, use reasonable place selection centered on that area.

## Output contract

When a user asks for a map, return a final share URL to \`${mapUrl}\`.

- Prefer an absolute URL
- Default to a minimal 3-line response unless the user explicitly asks for notes, a table, or reasoning
- If you do not have reliable coordinates, say that you cannot build an exact link yet
- Do not invent precise coordinates
- Do not add extra explanation beyond the minimal response unless the user asks for it
- If the request is plain-language but clearly about places on a map, still return the final URL as the main answer

## Default response format

Unless the user explicitly asks for something else, respond in this shape:

\`\`\`
Open this link in your browser:
https://parthkabra.me/tools/map?...
Let me know if you want any changes.
\`\`\`

Acceptable variations:

- "Click to open this map in your browser:"
- "Open this map in your browser:"
- "Let me know if you want any changes."
- "Tell me if you want any changes."

The response should stay short and should not include extra bullets, tables, reasoning, or place-by-place explanations by default.

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
5. Return \`${mapUrl}?v=1&d=...\`

## Interpreting vague user requests

When a request is underspecified but still reasonable, make pragmatic choices instead of asking unnecessary follow-up questions.

- For "best restaurants" or similar, choose a sensible set of well-known, well-reviewed places
- For "near" or "around" a named area, pick places actually clustered in or near that area
- For a short place list from the user, map all valid items you can identify reliably
- If only some places can be verified confidently, include only those and omit uncertain ones
- Ask a follow-up only when the request is too ambiguous to produce a useful map

## Example payload

Readable payload:

\`\`\`
p:red:Place%201:42.34910,-71.08320|p:blue:Place%202:42.34840,-71.08110|p:green:Place%203:42.34770,-71.07990
\`\`\`

Final URL:

\`\`\`
${mapUrl}?v=1&d=p%3Ared%3APlace%25201%3A42.34910%2C-71.08320%7Cp%3Ablue%3APlace%25202%3A42.34840%2C-71.08110%7Cp%3Agreen%3APlace%25203%3A42.34770%2C-71.07990
\`\`\`

## Example line

\`\`\`
l:gray:Walk%20Route:42.34910,-71.08320;42.34850,-71.08190;42.34790,-71.08040
\`\`\`

## Good responses

- If the user asked for a finished map: return the final URL
- If the user gave a markdown file with names and coordinates: map those directly
- If the user gave only names or addresses: geocode first, then build the URL
- If the user asks for a normal map in plain language: use the minimal response format above

## Recommended behavior for place maps

- When the user asks for "best restaurants", "best cafes", or similar, choose a reasonable set of well-known places with verifiable coordinates
- Keep point names short so labels fit on the map
- Prefer points unless the user explicitly asks for lines or paths
- Leave map labels visible unless the user asks to hide them
- If the user provides a category and an area, optimize for a map that feels useful at a glance rather than trying to be exhaustive

## Avoid

- Do not emit \`v=0\`
- Do not swap the payload order to \`lng,lat\`
- Do not use color names outside the allowed set
- Do not leave raw \`|\` or other separators inside feature names; encode the name segment first
- Do not create an HTML file or a separate map experience
- Do not return a long preamble before the link
- Do not prepend stray characters before \`https://\`
- Do not respond with "I need more technical details" for normal requests like neighborhood maps, restaurant maps, or mapping a short place list
`;
}

export function buildLlmsTxt(): string {
  const markdownUrl = getMapAgentMarkdownUrl();
  const textUrl = getMapAgentTextUrl();
  const mapUrl = getMapToolUrl();

  return `# Parth Kabra website LLM docs

Project: Parth Kabra personal website
Primary site: https://parthkabra.me

## Available tool docs

- Map tool: ${mapUrl}
- Map tool agent docs (markdown): ${markdownUrl}
- Map tool agent docs (plain text): ${textUrl}

## Notes

- The map tool accepts shareable URL state through query params
- Agents generating map links should read the map tool docs before responding
- If markdown fetch fails, use the plain-text map tool docs
`;
}
