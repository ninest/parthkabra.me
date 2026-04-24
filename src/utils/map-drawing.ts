import type { Map as MapLibreMap } from "maplibre-gl";
import { geographicMidpoint } from "./geolocation";

// --- Types ---

export type LngLat = [number, number];
export type FeatureProps = {
  name: string;
  colorId: string;
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

export type PaletteEntry = {
  id: string;
  label: string;
  hex: string;
};

// Stable IDs decouple persisted drawing state from palette order, so shared URLs
// keep decoding even if we reorder or extend the swatch list later.
// Gray sits near 50% lightness so it reads well in both light mode and the inverted dark-mode canvas.
export const PALETTE: readonly PaletteEntry[] = [
  { id: "red", label: "red", hex: "#dc2626" },
  { id: "blue", label: "blue", hex: "#2563eb" },
  { id: "green", label: "green", hex: "#16a34a" },
  { id: "yellow", label: "yellow", hex: "#eab308" },
  { id: "gray", label: "gray", hex: "#737373" },
];
export const DEFAULT_COLOR_ID = PALETTE[0].id;

const PALETTE_BY_ID = new Map(PALETTE.map((entry) => [entry.id, entry]));

// Resolves a stored color ID to the current palette entry, defaulting safely for
// malformed or future IDs instead of breaking map rendering.
export function getPaletteEntryById(colorId: string): PaletteEntry {
  return PALETTE_BY_ID.get(colorId) ?? PALETTE[0];
}

// Maps legacy palette indexes from old shared URLs onto today's stable IDs.
export function getPaletteEntryByIndex(idx: number): PaletteEntry {
  return PALETTE[idx] ?? PALETTE[0];
}

export const SRC_DRAWINGS = "drawings";
export const SRC_PREVIEW = "drawings-preview";

// --- Pure helpers ---

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

// URL codec for drawings lives in ./map-drawing-url.ts.

// --- MapLibre setup ---

// Adds the two GeoJSON sources (committed drawings + in-progress preview) and all six
// layers: line, point, point labels, line labels (committed) and line, point (preview).
//
// The data-driven color expression is built from PALETTE so the map stays in sync with
// feature `colorId`. Label layers use black text with a white halo so they read in both
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
    ["get", "colorId"],
    ...PALETTE.flatMap(({ id, hex }) => [id, hex]),
    /* default */ getPaletteEntryById(DEFAULT_COLOR_ID).hex,
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
