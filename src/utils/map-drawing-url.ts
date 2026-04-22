import { PALETTE, type DrawingFeature, type LngLat } from "./map-drawing";

// ============================================================================
// URL query-param state for the map drawer.
//
// Params:
//   ?d=<payload>   serialized drawings. See the v0 codec section below for shape.
//   ?v=<N>         version of the `d` payload. Omitted when v=0 so URLs produced
//                  before versioning (which had no `v`) still round-trip.
//   ?hl=1          map labels hidden. Omitted = labels visible (the default).
//                  Not versioned — it's just a flag.
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

const CURRENT_VERSION = 0;

// --- v0 codec ---
// p:[h]colorIdx:encodedName:lat,lng|l:[h]colorIdx:encodedName:lat,lng;...
// "h" prefix on colorIdx means hideLabel=true. 5-decimal rounding (~1.1m) keeps URLs short.

function roundCoord(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

function encodeV0(features: DrawingFeature[]): string | null {
  if (features.length === 0) return null;
  const parts: string[] = [];
  for (const f of features) {
    const { colorIdx, name, hideLabel } = f.properties;
    const encName = encodeURIComponent(name);
    const colorSeg = hideLabel ? `h${colorIdx}` : `${colorIdx}`;
    if (f.geometry.type === "Point") {
      const [lng, lat] = f.geometry.coordinates;
      parts.push(`p:${colorSeg}:${encName}:${roundCoord(lat)},${roundCoord(lng)}`);
    } else {
      const coords = f.geometry.coordinates
        .map(([lng, lat]) => `${roundCoord(lat)},${roundCoord(lng)}`)
        .join(";");
      parts.push(`l:${colorSeg}:${encName}:${coords}`);
    }
  }
  return parts.join("|");
}

// Decode the v0 payload. Unknown/garbled entries are dropped silently.
// The returned counters let the caller resume auto-naming ("Point N" / "Line N")
// without colliding with existing names — they advance past both unnamed entries
// we had to label here and any user-edited names that already match the pattern
// (including legacy "Dot N" from older shared URLs).
//
// When we cut v1: move the "Dot N" → "Point N" coercion into the v0→v1 upgrader
// so this stays a faithful decoder of v0's own format.
function decodeV0(raw: string): DrawingState {
  let pointCounter = 0;
  let lineCounter = 0;
  const features: DrawingFeature[] = [];

  for (const entry of raw.split("|")) {
    const colon = entry.indexOf(":");
    if (colon < 0) continue;
    const kind = entry.slice(0, colon);
    const body = entry.slice(colon + 1);

    let colorIdx = 0;
    let hideLabel = false;
    let name = "";
    let coordBody = body;
    const firstColon = body.indexOf(":");
    if (firstColon >= 0) {
      const maybeIdx = body.slice(0, firstColon);
      const m = maybeIdx.match(/^(h?)(\d+)$/);
      if (m && parseInt(m[2]) < PALETTE.length) {
        const rest = body.slice(firstColon + 1);
        const secondColon = rest.indexOf(":");
        if (secondColon >= 0) {
          hideLabel = m[1] === "h";
          colorIdx = parseInt(m[2]);
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
        if (!name) {
          pointCounter++;
          name = `Point ${pointCounter}`;
        }
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [lng, lat] },
          properties: { name, colorIdx, hideLabel },
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
        if (!name) {
          lineCounter++;
          name = `Line ${lineCounter}`;
        }
        features.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: { name, colorIdx, hideLabel },
        });
      }
    }
  }

  for (const f of features) {
    const m = f.properties.name.match(/^(?:Point|Dot) (\d+)$/);
    if (m) pointCounter = Math.max(pointCounter, parseInt(m[1]));
    const m2 = f.properties.name.match(/^Line (\d+)$/);
    if (m2) lineCounter = Math.max(lineCounter, parseInt(m2[1]));
  }

  return { features, pointCounter, lineCounter };
}

// --- Version registry ---
// Each decoder produces that version's decoded shape; upgraders[N] turns vN into v(N+1).
// Return types are `unknown` so the chain stays honest — each step casts to the shape
// it understands. The only cast callers see is the final one in decodeAndUpgrade.
const decoders: Record<number, (raw: string) => unknown> = {
  0: decodeV0,
};

const upgraders: Record<number, (state: unknown) => unknown> = {
  // Example for a future bump:
  // 0: (s) => { const v0 = s as DrawingState; return { ...v0, /* new field */ }; },
};

// --- Public API ---

export function readUrlState(search: URLSearchParams): UrlState {
  const raw = search.get("d");
  const drawings = raw
    ? decodeAndUpgrade(raw, parseVersion(search.get("v")))
    : emptyState();
  return { ...drawings, labelsVisible: search.get("hl") !== "1" };
}

// Mutates `url` in place: sets/removes the drawings + version params.
export function writeDrawingsParam(url: URL, features: DrawingFeature[]): void {
  const encoded = encodeV0(features);
  if (encoded === null) {
    url.searchParams.delete("d");
    url.searchParams.delete("v");
    return;
  }
  url.searchParams.set("d", encoded);
  // Omit v=0 so URLs produced before versioning stay byte-identical.
  if (CURRENT_VERSION === 0) url.searchParams.delete("v");
  else url.searchParams.set("v", String(CURRENT_VERSION));
}

export function writeLabelsParam(url: URL, labelsVisible: boolean): void {
  if (labelsVisible) url.searchParams.delete("hl");
  else url.searchParams.set("hl", "1");
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
    const up = upgraders[v];
    if (!up) return emptyState();
    state = up(state);
  }
  return state as DrawingState;
}
