import {
  DEFAULT_COLOR_ID,
  getPaletteEntryById,
  getPaletteEntryByIndex,
  getLineUserPoints,
  type DrawingFeature,
  type LineFeature,
  type LngLat,
} from "./map-drawing";

// ============================================================================
// URL query-param state for the map drawer.
//
// Params:
//   ?d=<payload>   serialized drawings. The payload shape depends on `v`.
//   ?v=<N>         version of the drawer-owned URL state. Missing `v` means
//                  legacy shared URL = v0.
//   ?hl=1          map labels hidden. Omitted = labels visible (the default).
//
// Evolving the `d` format:
//   1. Bump CURRENT_VERSION.
//   2. Add decodeVN to `decoders` (parses that version's string into its own shape).
//   3. Add an entry at `upgraders[N-1]` that turns the previous version's shape
//      into the new one.
// readUrlState runs the detected version's decoder, then walks upgraders up to
// CURRENT_VERSION, so callers always get the current shape.
// ============================================================================

export type DrawingState = {
  features: DrawingFeature[];
  pointCounter: number;
  lineCounter: number;
};

export type UrlState = DrawingState & {
  labelsVisible: boolean;
};

const CURRENT_VERSION = 2;

const ROUTE_MODE_TO_TOKEN: Record<NonNullable<DrawingFeature["properties"]["routeMatchMode"]>, string> = {
  walk: "w",
  bike: "b",
  drive: "d",
};

const TOKEN_TO_ROUTE_MODE: Record<string, NonNullable<DrawingFeature["properties"]["routeMatchMode"]>> = {
  w: "walk",
  b: "bike",
  d: "drive",
};

// --- Shared helpers ---

function roundCoord(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

function encodeFeatureCoords(feature: DrawingFeature): string {
  if (feature.geometry.type === "Point") {
    const [lng, lat] = feature.geometry.coordinates;
    return `${roundCoord(lat)},${roundCoord(lng)}`;
  }
  // For matched lines, ship the sparse user waypoints — the dense snapped geometry
  // is reconstructed on load via OSRM. Falls back to the rendered geometry for
  // unmatched lines (and for matched lines that somehow lost their waypoints).
  const coords = getLineUserPoints(feature);
  return coords
    .map(([lng, lat]) => `${roundCoord(lat)},${roundCoord(lng)}`)
    .join(";");
}

function decodeCounters(features: DrawingFeature[]): Pick<DrawingState, "pointCounter" | "lineCounter"> {
  let pointCounter = 0;
  let lineCounter = 0;
  for (const f of features) {
    const pointMatch = f.properties.name.match(/^(?:Point|Dot) (\d+)$/);
    if (pointMatch) pointCounter = Math.max(pointCounter, parseInt(pointMatch[1]));
    const lineMatch = f.properties.name.match(/^Line (\d+)$/);
    if (lineMatch) lineCounter = Math.max(lineCounter, parseInt(lineMatch[1]));
  }
  return { pointCounter, lineCounter };
}

function finalizeDecodedFeatures(features: DrawingFeature[]): DrawingState {
  const counters = decodeCounters(features);
  return { features, ...counters };
}

function decodePointName(name: string, pointCounter: number): { name: string; pointCounter: number } {
  if (name) return { name, pointCounter };
  const next = pointCounter + 1;
  return { name: `Point ${next}`, pointCounter: next };
}

function decodeLineName(name: string, lineCounter: number): { name: string; lineCounter: number } {
  if (name) return { name, lineCounter };
  const next = lineCounter + 1;
  return { name: `Line ${next}`, lineCounter: next };
}

// --- v0 codec ---
// p:[h]colorIdx:encodedName:lat,lng|l:[h]colorIdx:encodedName:lat,lng;...
// "h" prefix on colorIdx means hideLabel=true. 5-decimal rounding (~1.1m) keeps URLs short.
//
// This is the legacy pre-versioned format. It stores palette indexes, so decoding
// immediately upgrades those indexes to stable color IDs in the current state shape.

function decodeV0(raw: string): DrawingState {
  let pointCounter = 0;
  let lineCounter = 0;
  const features: DrawingFeature[] = [];

  for (const entry of raw.split("|")) {
    const colon = entry.indexOf(":");
    if (colon < 0) continue;
    const kind = entry.slice(0, colon);
    const body = entry.slice(colon + 1);

    let colorId = DEFAULT_COLOR_ID;
    let hideLabel = false;
    let name = "";
    let coordBody = body;
    const firstColon = body.indexOf(":");
    if (firstColon >= 0) {
      const maybeIdx = body.slice(0, firstColon);
      const match = maybeIdx.match(/^(h?)(\d+)$/);
      if (match) {
        const rest = body.slice(firstColon + 1);
        const secondColon = rest.indexOf(":");
        if (secondColon >= 0) {
          hideLabel = match[1] === "h";
          colorId = getPaletteEntryByIndex(parseInt(match[2])).id;
          name = decodeURIComponent(rest.slice(0, secondColon));
          coordBody = rest.slice(secondColon + 1);
        }
      }
    }

    if (kind === "p") {
      const [latStr, lngStr] = coordBody.split(",");
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        const decoded = decodePointName(name, pointCounter);
        pointCounter = decoded.pointCounter;
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: { name: decoded.name, colorId, hideLabel },
        });
      }
    } else if (kind === "l") {
      const coords: LngLat[] = [];
      for (const pair of coordBody.split(";")) {
        const [latStr, lngStr] = pair.split(",");
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (!isNaN(lat) && !isNaN(lng)) coords.push([lng, lat]);
      }
      if (coords.length >= 2) {
        const decoded = decodeLineName(name, lineCounter);
        lineCounter = decoded.lineCounter;
        features.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: { name: decoded.name, colorId, hideLabel },
        });
      }
    }
  }

  return finalizeDecodedFeatures(features);
}

// --- v1 codec ---
// p:[h]colorId:encodedName:lat,lng|l:[h]colorId:encodedName:lat,lng;...
// Same compact shape as v0, but `colorId` is now a stable token instead of a palette index.

function decodeV1(raw: string): DrawingState {
  let pointCounter = 0;
  let lineCounter = 0;
  const features: DrawingFeature[] = [];

  for (const entry of raw.split("|")) {
    const colon = entry.indexOf(":");
    if (colon < 0) continue;
    const kind = entry.slice(0, colon);
    const body = entry.slice(colon + 1);

    let colorId = DEFAULT_COLOR_ID;
    let hideLabel = false;
    let name = "";
    let coordBody = body;
    const firstColon = body.indexOf(":");
    if (firstColon >= 0) {
      const maybeColorId = body.slice(0, firstColon);
      const match = maybeColorId.match(/^(h?)([a-z][a-z0-9-]*)$/i);
      if (match) {
        const rest = body.slice(firstColon + 1);
        const secondColon = rest.indexOf(":");
        if (secondColon >= 0) {
          hideLabel = match[1] === "h";
          colorId = getPaletteEntryById(match[2]).id;
          name = decodeURIComponent(rest.slice(0, secondColon));
          coordBody = rest.slice(secondColon + 1);
        }
      }
    }

    if (kind === "p") {
      const [latStr, lngStr] = coordBody.split(",");
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        const decoded = decodePointName(name, pointCounter);
        pointCounter = decoded.pointCounter;
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: { name: decoded.name, colorId, hideLabel },
        });
      }
    } else if (kind === "l") {
      const coords: LngLat[] = [];
      for (const pair of coordBody.split(";")) {
        const [latStr, lngStr] = pair.split(",");
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (!isNaN(lat) && !isNaN(lng)) coords.push([lng, lat]);
      }
      if (coords.length >= 2) {
        const decoded = decodeLineName(name, lineCounter);
        lineCounter = decoded.lineCounter;
        features.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: { name: decoded.name, colorId, hideLabel },
        });
      }
    }
  }

  return finalizeDecodedFeatures(features);
}

// --- v2 codec ---
// p:[h]colorId:encodedName:lat,lng
// l:[h]colorId[:m{w|b|d}]:encodedName:lat,lng;...[:nencodedPointName;encodedPointName;...]
//
// Same as v1 but lines may carry an extra `m<token>` segment after the color segment
// to record `routeMatchMode`. The token is a single char (w/b/d) to keep URLs short.
// Lines may also carry an optional `n` segment for per-user-point labels. The names
// array aligns with getLineUserPoints(feature), not dense snapped route vertices.

function encodeLinePointNames(feature: LineFeature): string {
  const pointCount = getLineUserPoints(feature).length;
  const names = Array.from({ length: pointCount }, (_, i) => feature.properties.pointNames?.[i] ?? "");
  if (!names.some((name) => name !== "")) return "";
  return `:n${names.map((name) => encodeURIComponent(name)).join(";")}`;
}

function decodeLinePointNames(raw: string, pointCount: number): string[] | undefined {
  const names = raw.split(";").slice(0, pointCount).map((name) => decodeURIComponent(name));
  while (names.length < pointCount) names.push("");
  return names.some((name) => name !== "") ? names : undefined;
}

function encodeV2(features: DrawingFeature[]): string | null {
  if (features.length === 0) return null;
  const parts: string[] = [];
  for (const feature of features) {
    const { colorId, name, hideLabel, routeMatchMode } = feature.properties;
    const encName = encodeURIComponent(name);
    const stableColorId = getPaletteEntryById(colorId).id;
    const colorSeg = hideLabel ? `h${stableColorId}` : stableColorId;
    const kind = feature.geometry.type === "Point" ? "p" : "l";
    const modeSeg =
      kind === "l" && routeMatchMode ? `:m${ROUTE_MODE_TO_TOKEN[routeMatchMode]}` : "";
    const namesSeg = feature.geometry.type === "LineString" ? encodeLinePointNames(feature) : "";
    parts.push(`${kind}:${colorSeg}${modeSeg}:${encName}:${encodeFeatureCoords(feature)}${namesSeg}`);
  }
  return parts.join("|");
}

function decodeV2(raw: string): DrawingState {
  let pointCounter = 0;
  let lineCounter = 0;
  const features: DrawingFeature[] = [];

  for (const entry of raw.split("|")) {
    const colon = entry.indexOf(":");
    if (colon < 0) continue;
    const kind = entry.slice(0, colon);
    const body = entry.slice(colon + 1);

    let colorId = DEFAULT_COLOR_ID;
    let hideLabel = false;
    let name = "";
    let coordBody = body;
    let pointNamesRaw: string | undefined;
    let routeMatchMode: NonNullable<DrawingFeature["properties"]["routeMatchMode"]> | undefined;

    const firstColon = body.indexOf(":");
    if (firstColon >= 0) {
      const maybeColorId = body.slice(0, firstColon);
      const colorMatch = maybeColorId.match(/^(h?)([a-z][a-z0-9-]*)$/i);
      if (colorMatch) {
        hideLabel = colorMatch[1] === "h";
        colorId = getPaletteEntryById(colorMatch[2]).id;

        let rest = body.slice(firstColon + 1);
        // Optional m<token> segment, lines only.
        if (kind === "l") {
          const nextColon = rest.indexOf(":");
          if (nextColon >= 0) {
            const seg = rest.slice(0, nextColon);
            const modeMatch = seg.match(/^m([wbd])$/);
            if (modeMatch) {
              routeMatchMode = TOKEN_TO_ROUTE_MODE[modeMatch[1]];
              rest = rest.slice(nextColon + 1);
            }
          }
        }

        const nameColon = rest.indexOf(":");
        if (nameColon >= 0) {
          name = decodeURIComponent(rest.slice(0, nameColon));
          coordBody = rest.slice(nameColon + 1);
          if (kind === "l") {
            const namesMarker = coordBody.indexOf(":n");
            if (namesMarker >= 0) {
              pointNamesRaw = coordBody.slice(namesMarker + 2);
              coordBody = coordBody.slice(0, namesMarker);
            }
          }
        }
      }
    }

    if (kind === "p") {
      const [latStr, lngStr] = coordBody.split(",");
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        const decoded = decodePointName(name, pointCounter);
        pointCounter = decoded.pointCounter;
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: { name: decoded.name, colorId, hideLabel },
        });
      }
    } else if (kind === "l") {
      const coords: LngLat[] = [];
      for (const pair of coordBody.split(";")) {
        const [latStr, lngStr] = pair.split(",");
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (!isNaN(lat) && !isNaN(lng)) coords.push([lng, lat]);
      }
      if (coords.length >= 2) {
        const decoded = decodeLineName(name, lineCounter);
        lineCounter = decoded.lineCounter;
        const props: DrawingFeature["properties"] = { name: decoded.name, colorId, hideLabel };
        if (routeMatchMode) {
          props.routeMatchMode = routeMatchMode;
          // For matched lines, the wire coords ARE the user waypoints. Stash them so the
          // load-time re-match has the original input; geometry.coordinates starts as the
          // raw waypoints and gets replaced by the OSRM-snapped path once it lands.
          props.waypoints = coords.map(([lng, lat]) => [lng, lat]);
        }
        if (pointNamesRaw !== undefined) {
          props.pointNames = decodeLinePointNames(pointNamesRaw, coords.length);
        }
        features.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: props,
        });
      }
    }
  }

  return finalizeDecodedFeatures(features);
}

// --- Version registry ---
// Each decoder produces that version's decoded shape; upgraders[N] turns vN into v(N+1).
// Return types are `unknown` so the chain stays honest — each step casts to the shape
// it understands. The only cast callers see is the final one in decodeAndUpgrade.
const decoders: Record<number, (raw: string) => unknown> = {
  0: decodeV0,
  1: decodeV1,
  2: decodeV2,
};

const upgraders: Record<number, (state: unknown) => unknown> = {
  // v0 already decodes into the current DrawingState shape, so the first explicit
  // upgrader lands on an identity function. Keeping the step in the registry makes
  // the version chain explicit.
  0: (state) => state,
  // v1 → v2 added optional routeMatchMode on lines; absence on a v1 line just means unmatched.
  1: (state) => state,
};

// --- Public API ---

export function readUrlState(search: URLSearchParams): UrlState {
  const raw = search.get("d");
  const drawings = raw
    ? decodeAndUpgrade(raw, parseVersion(search.get("v")))
    : emptyState();
  return { ...drawings, labelsVisible: search.get("hl") !== "1" };
}

// Mutates `url` in place: sets/removes the drawer-owned query params.
export function writeUrlState(
  url: URL,
  state: Pick<UrlState, "features" | "labelsVisible">,
): void {
  const encoded = encodeV2(state.features);
  if (encoded === null) {
    url.searchParams.delete("d");
  } else {
    url.searchParams.set("d", encoded);
  }

  if (state.labelsVisible) url.searchParams.delete("hl");
  else url.searchParams.set("hl", "1");

  if (encoded === null && state.labelsVisible) {
    url.searchParams.delete("v");
    return;
  }
  url.searchParams.set("v", String(CURRENT_VERSION));
}

// --- internals ---

function emptyState(): DrawingState {
  return { features: [], pointCounter: 0, lineCounter: 0 };
}

// Missing `v` means legacy URL = v0. Non-numeric/negative also fall back to v0.
function parseVersion(raw: string | null): number {
  if (raw === null) return 0;
  const n = parseInt(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function decodeAndUpgrade(raw: string, fromVersion: number): DrawingState {
  const decoder = decoders[fromVersion];
  // Unknown (future) version — ignore rather than crash; user likely pasted a URL
  // from a newer build and we shouldn't blow up their session.
  if (!decoder) return emptyState();
  let state = decoder(raw);
  for (let v = fromVersion; v < CURRENT_VERSION; v++) {
    const upgrade = upgraders[v];
    if (!upgrade) return emptyState();
    state = upgrade(state);
  }
  return state as DrawingState;
}
