export type GeocodedLocation = { lat: number; lng: number; display: string };

export type SuggestedPlace = {
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  display: string;
};

// --- Shared rate-limited queue (Nominatim: 1 req/sec) ---

type QueueItem = {
  run: () => Promise<void>;
};

const queue: QueueItem[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push({
      run: () => fn().then(resolve, reject),
    });
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

  return { lat: parseFloat(raw.lat), lng: parseFloat(raw.lon), title, subtitle, display };
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
  }).finally(() => {
    forwardInFlight.delete(key);
  });

  forwardInFlight.set(key, p);
  return p;
}

// --- Forward geocode ---

export async function geocode(query: string): Promise<GeocodedLocation | null> {
  const [first] = await searchNominatim(query, 1);
  return first ? { lat: first.lat, lng: first.lng, display: first.display } : null;
}

export async function suggestGeocode(
  query: string,
  limit = 5,
  viewbox?: string,
): Promise<SuggestedPlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  return searchNominatim(q, limit, viewbox);
}

// --- Reverse geocode ---

export function reverseGeocode(lat: number, lng: number): Promise<string | null> {
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
  }).finally(() => {
    reverseInFlight.delete(key);
  });

  reverseInFlight.set(key, p);
  return p;
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
