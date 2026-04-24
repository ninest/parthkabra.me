import {
  DEFAULT_COLOR_ID,
  getPaletteEntryById,
  getPaletteEntryByIndex,
  type DrawingFeature,
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

const CURRENT_VERSION = 1;

// --- Shared helpers ---

function roundCoord(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

function encodeFeatureCoords(feature: DrawingFeature): string {
  if (feature.geometry.type === "Point") {
    const [lng, lat] = feature.geometry.coordinates;
    return `${roundCoord(lat)},${roundCoord(lng)}`;
  }
  return feature.geometry.coordinates
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

function encodeV1(features: DrawingFeature[]): string | null {
  if (features.length === 0) return null;
  const parts: string[] = [];
  for (const feature of features) {
    const { colorId, name, hideLabel } = feature.properties;
    const encName = encodeURIComponent(name);
    const stableColorId = getPaletteEntryById(colorId).id;
    const colorSeg = hideLabel ? `h${stableColorId}` : stableColorId;
    const kind = feature.geometry.type === "Point" ? "p" : "l";
    parts.push(`${kind}:${colorSeg}:${encName}:${encodeFeatureCoords(feature)}`);
  }
  return parts.join("|");
}

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

// --- Version registry ---
// Each decoder produces that version's decoded shape; upgraders[N] turns vN into v(N+1).
// Return types are `unknown` so the chain stays honest — each step casts to the shape
// it understands. The only cast callers see is the final one in decodeAndUpgrade.
const decoders: Record<number, (raw: string) => unknown> = {
  0: decodeV0,
  1: decodeV1,
};

const upgraders: Record<number, (state: unknown) => unknown> = {
  // v0 already decodes into the current DrawingState shape, so the first explicit
  // upgrader lands on an identity function. Keeping the step in the registry makes
  // the version chain explicit and leaves room for a real v1 -> v2 transform later.
  0: (state) => state,
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
  const encoded = encodeV1(state.features);
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
