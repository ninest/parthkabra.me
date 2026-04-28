// Coords are [lng, lat] pairs to match GeoJSON / MapLibre conventions.
export type StreetGeometry =
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "MultiLineString"; coordinates: [number, number][][] };

export type GeocodedLocation = {
  lat: number;
  lng: number;
  display: string;
  // True when Nominatim classified the result as a road/street/highway.
  isStreet: boolean;
  // Present when Nominatim returned LineString/MultiLineString geometry for a street.
  geometry?: StreetGeometry;
  // City/town/village/county/state — used to scope follow-up Overpass queries to a city.
  addressLocality?: string;
  // State or top-level region — disambiguates same-named cities for Overpass.
  addressRegion?: string;
};

export type SuggestedPlace = {
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  display: string;
  isStreet: boolean;
  geometry?: StreetGeometry;
  // Smallest admin area Nominatim attached to the result (city/town/village → county → state).
  // Used by callers to group multiple slices of the same named street into one suggestion row.
  addressLocality?: string;
  // The broader admin region (state in the US, similar elsewhere). Pairs with `addressLocality`
  // to disambiguate same-named cities ("Boston, MA" vs. "Boston, GA") when querying Overpass.
  addressRegion?: string;
};

// --- Shared rate-limited queue (Nominatim: 1 req/sec) ---

type QueueItem = {
  run: () => Promise<void>;
};

const queue: QueueItem[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

// `priority: true` pushes to the front of the queue, so user-initiated queries
// (typing in search / autocomplete, opening a feature row) don't sit behind
// background work like address prefetches. It doesn't preempt an in-flight
// request — the worst-case wait is ~1 tick (1.1s) for the current task to finish.
function enqueue<T>(fn: () => Promise<T>, priority = false): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const item: QueueItem = {
      run: () => fn().then(resolve, reject),
    };
    if (priority) queue.unshift(item);
    else queue.push(item);
    if (!timer) {
      processQueue();
      timer = setInterval(processQueue, 1100);
    }
  });
}

async function processQueue() {
  if (queue.length === 0) {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    return;
  }
  const item = queue.shift()!;
  await item.run();
}

// --- Caches (session-scoped, in-memory, unbounded) ---
// forwardCache stores results so repeat queries don't re-hit the API.
// forwardInFlight dedupes concurrent requests for the same query.
// Reverse uses the same pattern, keyed on lat,lng rounded to 6 decimals (~0.1m).

const forwardCache = new Map<string, SuggestedPlace[]>();
const forwardInFlight = new Map<string, Promise<SuggestedPlace[]>>();
const reverseCache = new Map<string, string | null>();
const reverseInFlight = new Map<string, Promise<string | null>>();

function normQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

// Removes from `segments` any entry whose text is already represented in `titleParts`,
// then joins the rest with ", " for use as a subtitle. Pure and side-effect-free —
// kept as its own export so it's easy to unit-test fixture-by-fixture.
export function dedupeSubtitle(segments: string[], titleParts: string[]): string {
  const titleSet = new Set(titleParts.filter(Boolean));
  return segments.filter((s) => s && !titleSet.has(s)).join(", ");
}

// Builds a two-line view of a Nominatim result. Two shapes show up in practice:
//   1. Raw address: display_name starts with the house number ("40, Saint Botolph Street, …").
//      Title combines house_number + road; subtitle drops those.
//   2. POI / place: display_name starts with the place name ("Northeastern University, 360, …").
//      Title = the place name; subtitle drops it.
function splitDisplayName(raw: any): SuggestedPlace {
  const display: string = raw.display_name ?? "";
  const segments = display
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
  const a = raw.address || {};

  const first = segments[0] ?? "";
  // House numbers are short and digit-led ("40", "40A"). Anything else (place
  // names, cities) is treated as a POI/place title.
  const looksLikeHouseNumber = /^\d+[a-zA-Z]?$/.test(first);

  let title: string;
  const titleParts: string[] = [];
  if (looksLikeHouseNumber && a.road) {
    title = `${first} ${a.road}`;
    titleParts.push(first, a.road);
  } else {
    title = first || display;
    titleParts.push(first);
  }

  // Defense-in-depth: if dedupe somehow throws on a weird payload, fall back to
  // the raw remaining segments so the user still sees the address (just verbose).
  let subtitle: string;
  try {
    subtitle = dedupeSubtitle(segments, titleParts);
  } catch {
    subtitle = segments.slice(1).join(", ");
  }

  // Nominatim's `class` is "highway" for any road/street/path. We use that single
  // signal to decide whether the result should be drawn as a line vs. a point.
  const isStreet = raw.class === "highway";
  // polygon_geojson=1 returns a `geojson` field. For ways/relations that represent
  // a street, that's a LineString or MultiLineString — we only carry those forward.
  let geometry: StreetGeometry | undefined;
  const g = raw.geojson;
  if (g && (g.type === "LineString" || g.type === "MultiLineString") && Array.isArray(g.coordinates)) {
    geometry = g;
  }

  // Walk from finest-grained admin (city) outward so a merged street suggestion gets
  // the smallest meaningful grouping unit. Nominatim's `address` schema isn't fully
  // standardized — these four fields cover the common urban / suburban / rural cases.
  const addressLocality: string | undefined =
    a.city || a.town || a.village || a.county || a.state || undefined;
  // State-level region for disambiguation only; not used for grouping.
  const addressRegion: string | undefined = a.state || a.region || undefined;

  return {
    lat: parseFloat(raw.lat),
    lng: parseFloat(raw.lon),
    title,
    subtitle,
    display,
    isStreet,
    geometry,
    addressLocality,
    addressRegion,
  };
}

// Rounds viewbox coords to 1 decimal (~11 km bins) so small map pans still
// hit the same cache entry.
function roundViewbox(vb: string): string {
  return vb
    .split(",")
    .map((n) => parseFloat(n).toFixed(1))
    .join(",");
}

// Single fetcher behind both `geocode` (limit=1) and `suggestGeocode` (limit=N).
// Goes through the rate-limited queue, caches results, and dedupes in-flight.
// `viewbox` is a Nominatim soft bias ("lonMin,latMin,lonMax,latMax") that ranks
// results inside the box higher — used by the map to prefer nearby places.
function searchNominatim(
  query: string,
  limit: number,
  viewbox?: string,
  priority = false,
): Promise<SuggestedPlace[]> {
  const vbKey = viewbox ? `|${roundViewbox(viewbox)}` : "";
  const key = `${limit}:${normQuery(query)}${vbKey}`;
  const cached = forwardCache.get(key);
  if (cached) return Promise.resolve(cached);
  const pending = forwardInFlight.get(key);
  if (pending) return pending;

  const p = enqueue(async () => {
    try {
      const params = new URLSearchParams({
        format: "json",
        limit: String(limit),
        addressdetails: "1",
        // Returns the matched OSM geometry (LineString for streets) so the UI
        // can highlight the whole road rather than just the result's centroid.
        polygon_geojson: "1",
        q: query,
      });
      if (viewbox) params.set("viewbox", viewbox);
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
      const resp = await fetch(url, {
        headers: { "User-Agent": "AverageLocationCalculator/1.0" },
      });
      if (!resp.ok) return [];
      const data = await resp.json();
      const out: SuggestedPlace[] = (Array.isArray(data) ? data : []).map(splitDisplayName);
      forwardCache.set(key, out);
      return out;
    } catch {
      return [];
    }
  }, priority).finally(() => {
    forwardInFlight.delete(key);
  });

  forwardInFlight.set(key, p);
  return p;
}

// --- Forward geocode ---

// `geocode` and `suggestGeocode` are only called from user-facing typing paths —
// always priority so background prefetches don't starve the autocomplete.
export async function geocode(query: string): Promise<GeocodedLocation | null> {
  const [first] = await searchNominatim(query, 1, undefined, true);
  if (!first) return null;
  return {
    lat: first.lat,
    lng: first.lng,
    display: first.display,
    isStreet: first.isStreet,
    geometry: first.geometry,
    addressLocality: first.addressLocality,
    addressRegion: first.addressRegion,
  };
}

export async function suggestGeocode(
  query: string,
  limit = 5,
  viewbox?: string,
): Promise<SuggestedPlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  return searchNominatim(q, limit, viewbox, true);
}

// --- Reverse geocode ---

// `priority: true` lets a caller skip ahead of background prefetches — pass it
// when the user is actively waiting (e.g. opened a feature row) vs. batch warming.
export function reverseGeocode(
  lat: number,
  lng: number,
  priority = false,
): Promise<string | null> {
  const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  if (reverseCache.has(key)) return Promise.resolve(reverseCache.get(key) ?? null);
  const pending = reverseInFlight.get(key);
  if (pending) return pending;

  const p = enqueue(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const resp = await fetch(url, {
        headers: { "User-Agent": "AverageLocationCalculator/1.0" },
      });
      const data = await resp.json();
      const ans = (data.display_name as string) || null;
      reverseCache.set(key, ans);
      return ans;
    } catch {
      return null;
    }
  }, priority).finally(() => {
    reverseInFlight.delete(key);
  });

  reverseInFlight.set(key, p);
  return p;
}

// --- Distance ---

// Great-circle distance between two lat/lng points, in meters.
// Used for ordering by proximity; exact value is fine for comparisons but also
// usable directly if a UI ever wants to display the distance.
export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// --- Geographic midpoint (spherical) ---

export function geographicMidpoint(
  points: { lat: number; lng: number }[]
): { lat: number; lng: number } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  let x = 0,
    y = 0,
    z = 0;
  for (const p of points) {
    const latR = toRad(p.lat);
    const lngR = toRad(p.lng);
    x += Math.cos(latR) * Math.cos(lngR);
    y += Math.cos(latR) * Math.sin(lngR);
    z += Math.sin(latR);
  }
  x /= points.length;
  y /= points.length;
  z /= points.length;

  return {
    lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lng: toDeg(Math.atan2(y, x)),
  };
}
