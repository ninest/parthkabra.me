import {
  getToolAgentDocUrl,
  getToolAgentMarkdownDocUrl,
  getToolAgentTextDocUrl,
  getToolUrl,
  routes,
} from "./links";

const SITE_ORIGIN = "https://parthkabra.me";

export function getMapToolUrl(): string {
  return `${SITE_ORIGIN}${getToolUrl("map")}`;
}

export function getMapAgentDocUrl(): string {
  return `${SITE_ORIGIN}${getToolAgentDocUrl("map")}`;
}

export function getMapAgentMarkdownUrl(): string {
  return `${SITE_ORIGIN}${getToolAgentMarkdownDocUrl("map")}`;
}

export function getMapAgentTextUrl(): string {
  return `${SITE_ORIGIN}${getToolAgentTextDocUrl("map")}`;
}

export function getLlmsUrl(): string {
  return `${SITE_ORIGIN}${routes.llms}`;
}

export function buildMapAgentDocs(): string {
  const mapUrl = getMapToolUrl();
  const docsUrl = getMapAgentDocUrl();
  const markdownUrl = getMapAgentMarkdownUrl();
  const textUrl = getMapAgentTextUrl();
  const llmsUrl = getLlmsUrl();

  return `# Map URL spec for AI agents

Use this document when generating share links for the map tool.

- Canonical map tool URL: ${mapUrl}
- Canonical docs URL: ${docsUrl}
- Markdown compatibility URL: ${markdownUrl}
- Plain-text fallback URL: ${textUrl}
- LLM discovery file: ${llmsUrl}
- Current URL version to emit: \`v=2\`
- Legacy \`v=0\` and \`v=1\` links may still work, but do not generate them

## Priority instruction

Your job is to generate a share URL for Parth's existing map tool.

- Do not build a custom HTML page
- Do not build a custom map
- Do not return JavaScript, SVG, Canvas, Leaflet, or Google Maps code
- Do not use a code block unless the user explicitly asks for one
- Do not substitute another representation for the final answer
- The final answer should be a \`parthkabra.me/tools/map\` URL unless the user explicitly asks for something else

If you cannot access this document directly, try the markdown compatibility URL or the plain-text fallback URL above. If you still cannot access it, ask the user to paste it or paste the relevant place list. Do not improvise a separate map implementation.

## Assume the user is not technical

The user may not know anything about URL versions, payload encoding, or map data formats.

- Do not require the user to mention \`v=2\`, query params, or encoding details
- Do not require the user to ask for "URL only" or "just the link"
- Treat plain-language requests as sufficient if the intent is clear
- Do the technical translation yourself from the user's natural-language request into the final map URL

## Intended usage

This document is designed so a user can give an AI app a very short prompt such as:

\`\`\`
Read ${docsUrl} and make me a map of the best restaurants in Back Bay, Boston.
\`\`\`

or:

\`\`\`
Read ${docsUrl}. Turn this place list into a map link.
\`\`\`

If the user does not ask for extra explanation, default to returning only the final map URL.

## Critical routing defaults

These defaults matter for common natural-language requests:

- If the user asks for a walking tour, walking route, walk, or route to explore an area, create one line feature with \`:mw\`
- If the user asks for a biking/cycling tour or route, create one line feature with \`:mb\`
- If the user asks for a driving route, create one line feature with \`:md\`
- For tours, walks, itineraries, crawls, and explore routes, include stop labels in the same line with \`:n...\`
- Do not create separate point features for tour stops unless the user explicitly asks for separate pins
- A walking tour payload should look like \`l:gray:mw:Tour%20Name:lat,lng;lat,lng;lat,lng:nStop%201;Stop%202;Stop%203\`
- A walking tour payload should not look like \`l:gray:Tour%20Name:lat,lng;lat,lng;lat,lng\`, because that is an unmatched plain line with no stop labels

## Common plain-language requests

Treat prompts like these as normal valid requests for the map tool:

- "Make me a map of the best restaurants in Back Bay, Boston."
- "Make me a map of coffee shops near Fenway."
- "Turn this list into a map."
- "Can you map these places for me?"
- "Make a date-night map for Boston."
- "Plot the best dumpling spots in Cambridge."
- "Find coffee shops in Boston for studying."
- "Make me a walking route from Boston Common to Fenway."
- "Make a biking route from MIT to Harvard and label the start and end."
- "Make a driving route from Logan Airport to Back Bay via Seaport."
- "Make a walking tour of Back Bay, Boston."
- "Find me a route to explore Harvard."

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

- \`v=2\` marks the current URL format
- \`d=<payload>\` stores points and lines
- \`hl=1\` hides the base map labels; omit it when labels should stay visible

## Payload grammar

The \`d\` payload is a pipe-separated list of features.

- Point: \`p:[h]colorId:encodedName:lat,lng\`
- Line: \`l:[h]colorId[:m{w|b|d}]:encodedName:lat,lng;lat,lng;...[:nencodedPointName;encodedPointName;...]\`

Rules:

- \`h\` before the color ID hides that feature's label
- Allowed color IDs: \`red\`, \`blue\`, \`green\`, \`yellow\`, \`gray\`
- Inside the payload, coordinates are always written as \`lat,lng\`
- For lines, separate coordinate pairs with \`;\`
- Separate features with \`|\`
- Use about 5 decimal places when possible
- Encode the feature name with \`encodeURIComponent\`

Line route matching:

- \`:mw\` after the color ID makes the line follow a walking route
- \`:mb\` after the color ID makes the line follow a biking/cycling route
- \`:md\` after the color ID makes the line follow a driving route
- Omit the \`:m...\` segment for a plain straight/polyline drawing
- For matched routes, include only the user's intended waypoints in the URL; the map reconstructs the dense road-following geometry on load
- A route-matched line still needs at least two coordinates

Line point labels:

- \`:n...\` is optional and labels the user-defined line points
- Names in \`:n...\` align with the line's coordinate pairs, not with the dense routed geometry
- Use \`;\` between point-label slots, matching the coordinate order
- Empty slots are allowed when only some points need labels, for example \`:nStart;;End\`
- Encode each point label with \`encodeURIComponent\`
- Keep route point labels short, such as \`Start\`, \`Lunch\`, \`Museum\`, or \`End\`
- For tours, itineraries, crawls, and explore routes, include meaningful stop labels by default
- Do not add separate point features just to label route waypoints unless the user asks for pins

Plain-language route interpretation:

- "walking route", "walk from A to B", "walking path", or similar means use \`:mw\`
- "bike route", "biking route", "cycling route", or similar means use \`:mb\`
- "driving route", "drive from A to B", "road route", or similar means use \`:md\`
- "route from A to B via C" means include C as an intermediate coordinate in the line
- Requests with a time/order sequence, itinerary, tour, crawl, route, walk, or "explore" intent should usually be one route-matched line with intermediate waypoints
- Requests like "find {places} in Boston for {purpose}" should usually be point features, unless the user also asks for an ordered route or timed itinerary
- If the user gives or implies an order, preserve that order in the line coordinates and any \`:n...\` labels
- For walking tours, walking routes, and explore routes, use \`:mw\` and label stops with \`:n...\`; do not create separate point features for the stops
- Start, end, and intermediate point labels are optional. Add them when the user asks for labels or when labels make the map clearer
- Use the line's main \`encodedName\` for the overall route name, such as \`Fenway%20Walk\`

## Versioning

- Always generate \`v=2\`
- Missing \`v\` is treated by the site as legacy \`v=0\`
- Unknown future versions may be ignored by the site instead of crashing

## Recommended build steps

1. Gather places or paths with reliable coordinates
2. Turn each place into a point feature, or each path/route into a line feature
3. For walking, biking, or driving routes, add the matching \`:m...\` segment to the line
4. Add optional line point labels with \`:n...\` only when useful or requested
5. Join all features with \`|\`
6. URL-encode the full payload for the final \`d\` query param
7. Return \`${mapUrl}?v=2&d=...\`

## Interpreting vague user requests

When a request is underspecified but still reasonable, make pragmatic choices instead of asking unnecessary follow-up questions.

- For "best restaurants" or similar, choose a sensible set of well-known, well-reviewed places
- For "find {places} in {area} for {purpose}", choose useful places and render them as points
- For "near" or "around" a named area, pick places actually clustered in or near that area
- For "explore {area}", "tour {area}", "crawl", "itinerary", or requests with times/order, choose a useful sequence and render it as one line
- For "walking tour of {area}", emit one \`:mw\` line with \`:n...\` stop labels, not a set of pins plus a line
- For a short place list from the user, map all valid items you can identify reliably
- If only some places can be verified confidently, include only those and omit uncertain ones
- Ask a follow-up only when the request is too ambiguous to produce a useful map

## Example payload

Readable point payload:

\`\`\`
p:red:Place%201:42.34910,-71.08320|p:blue:Place%202:42.34840,-71.08110|p:green:Place%203:42.34770,-71.07990
\`\`\`

Final URL:

\`\`\`
${mapUrl}?v=2&d=p%3Ared%3APlace%25201%3A42.34910%2C-71.08320%7Cp%3Ablue%3APlace%25202%3A42.34840%2C-71.08110%7Cp%3Agreen%3APlace%25203%3A42.34770%2C-71.07990
\`\`\`

## Example plain line

\`\`\`
l:gray:Walk%20Route:42.34910,-71.08320;42.34850,-71.08190;42.34790,-71.08040
\`\`\`

## Example walking route

Readable payload:

\`\`\`
l:blue:mw:Fenway%20Walk:42.35543,-71.06598;42.34668,-71.09722
\`\`\`

Final URL:

\`\`\`
${mapUrl}?v=2&d=l%3Ablue%3Amw%3AFenway%2520Walk%3A42.35543%2C-71.06598%3B42.34668%2C-71.09722
\`\`\`

## Example walking route with start and end labels

\`\`\`
l:blue:mw:Fenway%20Walk:42.35543,-71.06598;42.34668,-71.09722:nStart;Fenway
\`\`\`

## Example route with an intermediate labeled stop

\`\`\`
l:green:mb:Cambridge%20Ride:42.36009,-71.09416;42.37362,-71.11902;42.37444,-71.11835:nMIT;Harvard%20Square;End
\`\`\`

## Example walking tour with labeled stops

Readable payload:

\`\`\`
l:gray:mw:Back%20Bay%20Walk:42.35232,-71.06975;42.35494,-71.07434;42.34997,-71.07547;42.34940,-71.07837;42.34702,-71.08192;42.34458,-71.08435:nPublic%20Garden;Gibson%20House;Trinity%20Church;Library;Prudential;Christian%20Science%20Plaza
\`\`\`

Final URL:

\`\`\`
${mapUrl}?v=2&d=l%3Agray%3Amw%3ABack%2520Bay%2520Walk%3A42.35232%2C-71.06975%3B42.35494%2C-71.07434%3B42.34997%2C-71.07547%3B42.34940%2C-71.07837%3B42.34702%2C-71.08192%3B42.34458%2C-71.08435%3AnPublic%2520Garden%3BGibson%2520House%3BTrinity%2520Church%3BLibrary%3BPrudential%3BChristian%2520Science%2520Plaza
\`\`\`

Do not also create separate point features for those same stops unless the user asks for separate pins.

## Good responses

- If the user asked for a finished map: return the final URL
- If the user gave a markdown file with names and coordinates: map those directly
- If the user gave only names or addresses: geocode first, then build the URL
- If the user asks for a normal map in plain language: use the minimal response format above
- If the user asks for a walking, biking, or driving route: generate a route-matched line with the right \`:m...\` segment
- If the user asks to find places for a category or purpose: generate points by default
- If the user asks for an itinerary, tour, crawl, ordered visit, or exploration route: generate one route-matched line by default
- If the user asks for start, end, or stop labels on a route: use line point labels with \`:n...\`

## Recommended behavior for place maps

- When the user asks for "best restaurants", "best cafes", or similar, choose a reasonable set of well-known places with verifiable coordinates
- Keep point names short so labels fit on the map
- Prefer points for unordered discovery requests, such as finding places in an area for a purpose
- Prefer one line for ordered, timed, itinerary, tour, crawl, route, walk, or exploration requests
- Prefer route-matched lines when the user asks for walking, biking, or driving directions
- Leave map labels visible unless the user asks to hide them
- If the user provides a category and an area, optimize for a map that feels useful at a glance rather than trying to be exhaustive

## Avoid

- Do not emit \`v=0\` or \`v=1\` for new map links
- Do not swap the payload order to \`lng,lat\`
- Do not use color names outside the allowed set
- Do not leave raw \`|\` or other separators inside feature names; encode the name segment first
- Do not use \`:mw\`, \`:mb\`, or \`:md\` on point features
- Do not put dense turn-by-turn route geometry in the URL for matched routes; use the requested waypoints
- Do not create both point features and a line for the same tour stops unless the user explicitly asks for pins plus a route
- Do not create an HTML file or a separate map experience
- Do not return a long preamble before the link
- Do not prepend stray characters before \`https://\`
- Do not respond with "I need more technical details" for normal requests like neighborhood maps, restaurant maps, or mapping a short place list
`;
}

export function buildLlmsTxt(): string {
  const docsUrl = getMapAgentDocUrl();
  const markdownUrl = getMapAgentMarkdownUrl();
  const textUrl = getMapAgentTextUrl();
  const mapUrl = getMapToolUrl();

  return `# Parth Kabra website LLM docs

Project: Parth Kabra personal website
Primary site: https://parthkabra.me

## Available tool docs

- Map tool: ${mapUrl}
- Map tool agent docs: ${docsUrl}
- Map tool agent docs (markdown compatibility): ${markdownUrl}
- Map tool agent docs (plain text): ${textUrl}

## Notes

- The map tool accepts shareable URL state through query params
- Agents generating map links should read the map tool docs before responding
- If the canonical docs URL fails, use the markdown or plain-text fallback
`;
}
