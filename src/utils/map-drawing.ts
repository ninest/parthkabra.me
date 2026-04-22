import type { Map as MapLibreMap } from "maplibre-gl";
import { geographicMidpoint } from "./geolocation";

// --- Types ---

export type LngLat = [number, number];
export type FeatureProps = {
  name: string;
  colorIdx: number;
  hideLabel?: boolean;
};
export type PointFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: LngLat };
  properties: FeatureProps;
};
export type LineFeature = {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: LngLat[] };
  properties: FeatureProps;
};
export type DrawingFeature = PointFeature | LineFeature;
export type FeatureCollection = {
  type: "FeatureCollection";
  features: DrawingFeature[];
};

// --- Constants ---

// [label, hex]. Index into this array is the colorIdx stored on each feature.
// Gray sits near 50% lightness so it reads well in both light mode and the inverted dark-mode canvas.
export const PALETTE: readonly [string, string][] = [
  ["red", "#dc2626"],
  ["blue", "#2563eb"],
  ["green", "#16a34a"],
  ["yellow", "#eab308"],
  ["gray", "#737373"],
];

export const SRC_DRAWINGS = "drawings";
export const SRC_PREVIEW = "drawings-preview";

// --- Pure helpers ---

// Round to 5 decimals (~1.1m) to keep URLs short.
export function roundCoord(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

// For points, use the coordinate directly; for lines, use the geographic midpoint of the path
// so any derived label (e.g. a reverse-geocoded address) represents the line's rough center.
export function getFeatureCoord(f: DrawingFeature): { lat: number; lng: number } {
  if (f.geometry.type === "Point") {
    const [lng, lat] = f.geometry.coordinates;
    return { lat, lng };
  }
  const pts = f.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
  return geographicMidpoint(pts);
}

// --- URL codec ---
// Serialize features to "p:colorIdx:encodedName:lat,lng|l:colorIdx:encodedName:lat,lng;...".
// "h" prefix on the colorIdx segment signals label hidden; absence = shown.
// Returns null when there are no features so the caller can delete the URL param.
export function encodeFeaturesToSearchParam(features: DrawingFeature[]): string | null {
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

// Parse the "d" query param back into features. Supports the new format
// (p:idx:name:lat,lng / l:idx:name:lat,lng;...) and legacy (p:lat,lng / l:lat,lng;...).
// Unknown/garbled entries are dropped silently.
//
// Also returns the computed pointCounter/lineCounter so the caller can resume
// auto-naming ("Point N", "Line N") without colliding with imported names.
// The counters advance in two ways: by naming unnamed entries during parse, and
// by bumping past any user-edited names that happen to match "Point N" / legacy
// "Dot N" / "Line N".
export function decodeFeaturesFromSearchParam(param: string | null): {
  features: DrawingFeature[];
  pointCounter: number;
  lineCounter: number;
} {
  let pointCounter = 0;
  let lineCounter = 0;
  const features: DrawingFeature[] = [];
  if (!param) return { features, pointCounter, lineCounter };

  for (const entry of param.split("|")) {
    const colon = entry.indexOf(":");
    if (colon < 0) continue;
    const kind = entry.slice(0, colon);
    const body = entry.slice(colon + 1);

    // Detect new format: body starts with optional "h" (hide-label) + integer colorIdx,
    // followed by ":name:coords". E.g. "2:Home:..." or "h2:Home:...". If the prefix
    // doesn't parse, treat the whole body as coords (legacy shape).
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

  // Bump counters past any user-edited names that happen to match "Point N" / "Line N"
  // (or legacy "Dot N" from older shared URLs) so the next placement doesn't collide.
  for (const f of features) {
    const m = f.properties.name.match(/^(?:Point|Dot) (\d+)$/);
    if (m) pointCounter = Math.max(pointCounter, parseInt(m[1]));
    const m2 = f.properties.name.match(/^Line (\d+)$/);
    if (m2) lineCounter = Math.max(lineCounter, parseInt(m2[1]));
  }

  return { features, pointCounter, lineCounter };
}

// --- MapLibre setup ---

// Adds the two GeoJSON sources (committed drawings + in-progress preview) and all six
// layers: line, point, point labels, line labels (committed) and line, point (preview).
//
// The data-driven color expression is built from PALETTE so the map stays in sync with
// feature `colorIdx`. Label layers use black text with a white halo so they read in both
// light and the inverted dark-mode canvas. The preview layers are initialized with a
// single hex; the caller keeps them in sync with the active swatch via setPaintProperty
// on layer IDs "preview-point" / "preview-line".
export function createDrawingSourcesAndLayers(
  map: MapLibreMap,
  opts: {
    initialDrawings: FeatureCollection;
    initialPreview: FeatureCollection;
    initialPreviewHex: string;
  },
): void {
  const colorMatch: any = [
    "match",
    ["get", "colorIdx"],
    ...PALETTE.flatMap(([, hex], i) => [i, hex]),
    /* default */ PALETTE[0][1],
  ];

  map.addSource(SRC_DRAWINGS, { type: "geojson", data: opts.initialDrawings as any });
  map.addLayer({
    id: "drawings-lines",
    type: "line",
    source: SRC_DRAWINGS,
    filter: ["==", ["geometry-type"], "LineString"],
    paint: { "line-color": colorMatch, "line-width": 3 },
    layout: { "line-cap": "round", "line-join": "round" },
  });
  map.addLayer({
    id: "drawings-points",
    type: "circle",
    source: SRC_DRAWINGS,
    filter: ["==", ["geometry-type"], "Point"],
    paint: {
      "circle-radius": 6,
      "circle-color": colorMatch,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 2,
    },
  });
  map.addLayer({
    id: "drawings-point-labels",
    type: "symbol",
    source: SRC_DRAWINGS,
    filter: [
      "all",
      ["==", ["geometry-type"], "Point"],
      ["!=", ["get", "hideLabel"], true],
    ],
    layout: {
      "text-field": ["get", "name"],
      "text-size": 12,
      "text-offset": [0, 0.7],
      "text-anchor": "top",
      "text-allow-overlap": false,
      "text-optional": true,
    },
    paint: {
      "text-color": "#111111",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.5,
    },
  });
  map.addLayer({
    id: "drawings-line-labels",
    type: "symbol",
    source: SRC_DRAWINGS,
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["!=", ["get", "hideLabel"], true],
    ],
    layout: {
      "text-field": ["get", "name"],
      "text-size": 12,
      "symbol-placement": "line-center",
      "text-allow-overlap": false,
      "text-optional": true,
    },
    paint: {
      "text-color": "#111111",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.5,
    },
  });

  map.addSource(SRC_PREVIEW, { type: "geojson", data: opts.initialPreview as any });
  map.addLayer({
    id: "preview-line",
    type: "line",
    source: SRC_PREVIEW,
    filter: ["==", ["geometry-type"], "LineString"],
    paint: {
      "line-color": opts.initialPreviewHex,
      "line-width": 3,
      "line-opacity": 0.8,
      // Tiny dash + round cap = circular dots, clearly signalling the line is still in-progress.
      // A non-zero dash length renders more reliably than [0, x] across MapLibre versions.
      "line-dasharray": [0.1, 2],
    },
    layout: { "line-cap": "round", "line-join": "round" },
  });
  map.addLayer({
    id: "preview-point",
    type: "circle",
    source: SRC_PREVIEW,
    filter: ["==", ["geometry-type"], "Point"],
    paint: {
      "circle-radius": 5,
      "circle-color": opts.initialPreviewHex,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 2,
      "circle-opacity": 0.7,
    },
  });
}
