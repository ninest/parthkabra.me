import type { LngLat } from "./map-drawing";
import { validatePoint } from "./point";

export type RouteProfile = "driving" | "walking" | "cycling";

type OsrmRouteResponse = {
  code: string;
  message?: string;
  routes?: Array<{
    geometry?: {
      type: "LineString";
      coordinates: LngLat[];
    };
  }>;
};

const OSRM_ENDPOINTS: Record<RouteProfile, { baseUrl: string; osrmProfile: string }> = {
  driving: {
    baseUrl: "https://routing.openstreetmap.de/routed-car/route/v1",
    osrmProfile: "driving",
  },
  walking: {
    baseUrl: "https://routing.openstreetmap.de/routed-foot/route/v1",
    osrmProfile: "foot",
  },
  cycling: {
    baseUrl: "https://routing.openstreetmap.de/routed-bike/route/v1",
    osrmProfile: "bike",
  },
};

function roundPoint(point: LngLat): string {
  const [lng, lat] = point;
  return `${lng.toFixed(6)},${lat.toFixed(6)}`;
}

function buildOsrmRouteUrl(start: LngLat, end: LngLat, profile: RouteProfile): string {
  const endpoint = OSRM_ENDPOINTS[profile];
  const coordinates = `${roundPoint(start)};${roundPoint(end)}`;
  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    steps: "false",
    generate_hints: "false",
    skip_waypoints: "true",
  });
  return `${endpoint.baseUrl}/${endpoint.osrmProfile}/${coordinates}?${params.toString()}`;
}

function parseOsrmRouteResponse(data: OsrmRouteResponse): LngLat[] {
  if (data.code !== "Ok") {
    throw new Error(data.message || `OSRM route request failed with code ${data.code}.`);
  }

  const coordinates = data.routes?.[0]?.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) {
    throw new Error("OSRM did not return a route geometry.");
  }

  coordinates.forEach((point, idx) => validatePoint(point, `route point ${idx + 1}`));
  return coordinates;
}

// Returns the full road-following geometry between two points for the selected travel profile.
export async function getRouteMatchedPoints(
  start: LngLat,
  end: LngLat,
  profile: RouteProfile,
): Promise<LngLat[]> {
  validatePoint(start, "start");
  validatePoint(end, "end");

  const resp = await fetch(buildOsrmRouteUrl(start, end, profile));
  if (!resp.ok) {
    throw new Error(`OSRM route request failed with HTTP ${resp.status}.`);
  }
  const data = (await resp.json()) as OsrmRouteResponse;
  return parseOsrmRouteResponse(data);
}
