import type { DrawingFeature } from "./map-drawing";
import { readUrlState, writeUrlState, type UrlState } from "./map-drawing-url";

const CONTROLS_COLLAPSE_STORAGE_KEY = "md-controls-collapsed";

function currentUrl(): URL {
  return new URL(window.location.href);
}

// Reads the shareable drawer state from the current location so the UI can boot
// from a single browser-facing storage boundary rather than direct URL parsing.
export function readMapDrawerShareState(): UrlState {
  return readUrlState(new URLSearchParams(window.location.search));
}

// Persists the shareable drawer state back into the current URL, preserving any
// unrelated query params owned by the rest of the page.
export function writeMapDrawerShareState(state: {
  features: DrawingFeature[];
  labelsVisible: boolean;
}): void {
  const url = currentUrl();
  writeUrlState(url, state);
  history.replaceState(null, "", url.toString());
}

// Reads the toolbar collapse preference from localStorage.
export function readMapDrawerControlsCollapsed(): boolean {
  return localStorage.getItem(CONTROLS_COLLAPSE_STORAGE_KEY) === "1";
}

// Persists the toolbar collapse preference to localStorage.
export function writeMapDrawerControlsCollapsed(collapsed: boolean): void {
  localStorage.setItem(CONTROLS_COLLAPSE_STORAGE_KEY, collapsed ? "1" : "0");
}
