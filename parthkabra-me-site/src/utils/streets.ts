// Helpers for processing Nominatim search results that represent streets.
// `geolocation.ts` is the API client (request building, queue, cache, raw shape parsing);
// this file is the layer above it that turns those raw shapes into UI-ready data —
// stitching slices together, picking representatives, flattening geometry for rendering.

import type { SuggestedPlace, StreetGeometry } from "./geolocation";
import { fetchStreetWaysByArea, type AreaScope } from "./overpass";

export type LngLat = [number, number];

// Flattens MultiLineString → single LineString by concatenating segments end-to-end.
// MapLibre will draw straight connectors across any disjoint segments — acceptable since
// Nominatim usually returns a single connected way for a named street; the alternative
// (drop all but the longest part) loses real street geometry, which is worse.
export function flattenStreetGeometry(g: StreetGeometry): LngLat[] {
  if (g.type === "LineString") return g.coordinates as LngLat[];
  const out: LngLat[] = [];
  for (const seg of g.coordinates) {
    for (const c of seg) out.push(c as LngLat);
  }
  return out;
}

// Squared euclidean distance in degree-space. We only ever compare distances of
// nearby points (slice endpoints in the same city), so the ~cosine distortion at
// non-equator latitudes is uniform across the comparison and doesn't change ordering.
// Cheaper than haversine and good enough for "which endpoint is closer."
function sqDist(a: LngLat, b: LngLat): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

// Greedy nearest-endpoint sort. Starts with the first segment, then repeatedly
// appends whichever remaining segment has an endpoint closest to the current path's
// end — reversing that segment if its tail is the closer end. Result: when these
// segments are concatenated into one LineString later, the connector "bridges"
// between segments are short, often invisibly so for slices that abut at intersections.
//
// Not optimal (true shortest-path stitching is a TSP-ish problem), but the greedy
// choice handles real-world streets well: most named avenues are roughly linear, and
// the heuristic naturally walks along the road end-to-end.
function greedyOrderSegments(segments: LngLat[][]): LngLat[][] {
  if (segments.length <= 1) return segments.map((s) => s.slice());
  const remaining = segments.map((s) => s.slice());
  const result: LngLat[][] = [remaining.shift()!];
  while (remaining.length > 0) {
    const cur = result[result.length - 1];
    const curEnd = cur[cur.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    let reverse = false;
    for (let i = 0; i < remaining.length; i++) {
      const seg = remaining[i];
      const dStart = sqDist(curEnd, seg[0]);
      const dEnd = sqDist(curEnd, seg[seg.length - 1]);
      if (dStart < bestDist) {
        bestDist = dStart;
        bestIdx = i;
        reverse = false;
      }
      if (dEnd < bestDist) {
        bestDist = dEnd;
        bestIdx = i;
        reverse = true;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    result.push(reverse ? next.reverse() : next);
  }
  return result;
}

// Collapses multiple slices of the same named street into a single suggestion row,
// with their geometries stitched together as a MultiLineString. Two street results
// merge when they share both `title` and `addressLocality` (e.g. "Massachusetts
// Avenue" + Boston). Non-street results and streets without geometry pass through
// unchanged with order preserved.
//
// The merged row's geometry is a MultiLineString containing every slice's segments,
// greedy-sorted so the eventual flatten-to-LineString concat produces minimal bridge
// artifacts. lat/lng is the centroid of all stitched points so a fitBounds zoom
// frames the whole highlight, not any one slice.
export function dedupeStreetSuggestions(items: SuggestedPlace[]): SuggestedPlace[] {
  const groups = new Map<string, SuggestedPlace[]>();
  const order: string[] = [];
  items.forEach((it, idx) => {
    const mergeable = it.isStreet && !!it.geometry;
    // Non-mergeable rows get a unique per-index key so they pass through in order.
    const key = mergeable ? `s|${it.title}|${it.addressLocality ?? ""}` : `u|${idx}`;
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(it);
  });
  return order.map((key) => {
    const slices = groups.get(key)!;
    if (slices.length === 1) return slices[0];

    // Collect every slice's coordinate segments. Each LineString contributes one
    // segment; each MultiLineString contributes its existing segments individually.
    const rawSegments: LngLat[][] = [];
    for (const s of slices) {
      if (!s.geometry) continue;
      if (s.geometry.type === "LineString") {
        rawSegments.push(s.geometry.coordinates as LngLat[]);
      } else {
        for (const seg of s.geometry.coordinates) rawSegments.push(seg as LngLat[]);
      }
    }
    if (rawSegments.length === 0) return slices[0];

    const sortedSegments = greedyOrderSegments(rawSegments);
    const stitched: StreetGeometry = {
      type: "MultiLineString",
      coordinates: sortedSegments,
    };

    // Centroid across every stitched vertex — gives a fly-to target that frames the
    // whole road. Equal-weighting points (vs. equal-weighting segments) is fine for
    // this use case; differences are visually imperceptible after fitBounds anyway.
    let totalLng = 0;
    let totalLat = 0;
    let count = 0;
    for (const seg of sortedSegments) {
      for (const [lng, lat] of seg) {
        totalLng += lng;
        totalLat += lat;
        count++;
      }
    }

    // Drop the leading neighborhood segment from the subtitle ("Back Bay, Boston, …" →
    // "Boston, …") so the merged row reads at the locality level rather than pretending
    // to belong to one specific neighborhood. Falls back to the original if there's
    // only one segment to begin with.
    const base = slices[0];
    const segs = base.subtitle
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const subtitle = segs.length > 1 ? segs.slice(1).join(", ") : base.subtitle;

    return {
      ...base,
      geometry: stitched,
      lat: count > 0 ? totalLat / count : base.lat,
      lng: count > 0 ? totalLng / count : base.lng,
      subtitle,
    };
  });
}

// Expands a Nominatim-derived street geometry to the full city-scoped road via Overpass.
// On success: returns a MultiLineString of every way named `streetName` inside `scope`,
// greedy-sorted so the eventual flatten produces minimal bridge artifacts at junctions.
// On failure (network, timeout, abort, no matches): returns the supplied `fallback`
// unchanged. Callers should treat this as "best-effort upgrade" — never blocks commit.
export async function expandStreetToFullGeometry(
  streetName: string,
  scope: AreaScope,
  fallback: StreetGeometry,
  signal?: AbortSignal,
): Promise<StreetGeometry> {
  const expanded = await fetchStreetWaysByArea(streetName, scope, signal);
  if (!expanded) return fallback;
  return {
    type: "MultiLineString",
    coordinates: greedyOrderSegments(expanded.coordinates),
  };
}
