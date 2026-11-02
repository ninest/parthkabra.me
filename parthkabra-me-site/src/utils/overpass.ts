// Overpass API client. Pure transport: takes a query, returns parsed geometry, never throws.
// Sibling to geolocation.ts (Nominatim client). Domain logic — fallbacks, stitching, sort —
// belongs in streets.ts so this file stays narrow and easy to swap if we ever change endpoints.

import type { StreetGeometry } from "./geolocation";

export type AreaScope = {
  // Admin area name as it appears in OSM (`name` tag), e.g. "Boston" or "Cambridge".
  cityName: string;
  // Optional broader region (US state, similar elsewhere). Required to disambiguate
  // city-name collisions like "Boston, MA" vs. "Boston, GA"; can be omitted for unique
  // names but providing it costs nothing and makes the query strictly safer.
  regionName?: string;
};

const ENDPOINT = "https://overpass-api.de/api/interpreter";

// OSM `highway=*` values that represent a real public roadway. Any other value (service,
// footway, *_link, path, etc.) is a connector, ramp, parking aisle, or pedestrian surface
// that often inherits a nearby street's `name` tag and would otherwise pollute the result —
// e.g. parking-lot driveways tagged `name="Newbury Street"`, or motorway_link ramps cluttering
// an interchange. We pass tags through Overpass and filter here rather than in the query so
// the cache key (street + city + region) stays stable and we keep the filter logic in code.
const ALLOWED_HIGHWAY_VALUES: ReadonlySet<string> = new Set([
  "motorway",
  "trunk",
  "primary",
  "secondary",
  "tertiary",
  "unclassified",
  "residential",
  "living_street",
]);

function isMainRoadway(tags: Record<string, string> | undefined): boolean {
  if (!tags) return false;
  const h = tags.highway;
  return typeof h === "string" && ALLOWED_HIGHWAY_VALUES.has(h);
}

// Session-scoped, in-memory cache. `null` means "we already tried and got nothing back" —
// we cache that too so a user re-clicking ✓ on a no-results street doesn't re-fetch.
const cache = new Map<string, StreetGeometry | null>();
const inFlight = new Map<string, Promise<StreetGeometry | null>>();

function cacheKey(streetName: string, scope: AreaScope): string {
  return `${streetName.toLowerCase()}|${scope.cityName.toLowerCase()}|${(scope.regionName ?? "").toLowerCase()}`;
}

// Backslash-escape backslashes and double quotes to keep them inside an Overpass QL
// "..." string literal. Overpass uses the same escape rules as JSON for these two chars.
function escapeOverpassString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// Builds an Overpass QL query that returns every way named `streetName` inside the named
// admin area. `boundary="administrative"` filters out non-admin features (parks, buildings)
// that happen to share the city's name. `out geom;` emits each way's full coordinate list,
// which is what we need to render the road geometry without a second round-trip.
function buildQuery(streetName: string, scope: AreaScope): string {
  const name = escapeOverpassString(streetName);
  const city = escapeOverpassString(scope.cityName);
  const lines = ["[out:json][timeout:15];"];
  if (scope.regionName) {
    const region = escapeOverpassString(scope.regionName);
    lines.push(`area["name"="${region}"]["boundary"="administrative"]->.r;`);
    lines.push(`area["name"="${city}"]["boundary"="administrative"](area.r)->.c;`);
  } else {
    lines.push(`area["name"="${city}"]["boundary"="administrative"]->.c;`);
  }
  lines.push(`way["name"="${name}"](area.c);`);
  // `out tags geom;` includes both the way's tags (so we can filter by `highway` value)
  // and its node-by-node geometry (so we don't need a second round-trip to resolve nodes).
  lines.push("out tags geom;");
  return lines.join("\n");
}

// Fetches every OSM way named `streetName` that lies within `scope`. Returns a
// MultiLineString of those ways' geometries, or null on any failure (network error,
// timeout, abort, empty result, malformed response). The caller decides what to do
// with null — typically fall back to a smaller-scope geometry.
//
// Caches by (street, city, region) and dedupes concurrent requests for the same key.
// Pass `signal` to abort an in-flight fetch (e.g. user cancels the confirm panel).
export async function fetchStreetWaysByArea(
  streetName: string,
  scope: AreaScope,
  signal?: AbortSignal,
): Promise<StreetGeometry | null> {
  const key = cacheKey(streetName, scope);
  if (cache.has(key)) return cache.get(key) ?? null;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const p = (async (): Promise<StreetGeometry | null> => {
    try {
      const query = buildQuery(streetName, scope);
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        body: new URLSearchParams({ data: query }).toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal,
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      const elements = (data?.elements ?? []) as Array<{
        type?: string;
        tags?: Record<string, string>;
        geometry?: Array<{ lat: number; lon: number }>;
      }>;
      const segments: [number, number][][] = [];
      for (const w of elements) {
        if (w.type !== "way" || !Array.isArray(w.geometry) || w.geometry.length < 2) continue;
        // Drop service drives, link ramps, footways, alleys, etc. — they share the road's
        // `name` tag but aren't part of the road a person means when they search "Newbury St".
        if (!isMainRoadway(w.tags)) continue;
        segments.push(w.geometry.map((p) => [p.lon, p.lat] as [number, number]));
      }
      if (segments.length === 0) {
        cache.set(key, null);
        return null;
      }
      const result: StreetGeometry = { type: "MultiLineString", coordinates: segments };
      cache.set(key, result);
      return result;
    } catch {
      // AbortError lands here too. Don't cache aborts — a future retry should be allowed.
      return null;
    }
  })().finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, p);
  return p;
}
