import type { LngLat } from "./map-drawing";

// Throws when a coordinate is malformed or outside longitude/latitude bounds.
export function validatePoint(point: LngLat, label: string): void {
  const [lng, lat] = point;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw new Error(`${label} must contain finite longitude and latitude values.`);
  }
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    throw new Error(`${label} is outside valid longitude/latitude bounds.`);
  }
}
