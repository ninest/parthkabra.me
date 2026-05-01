import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

const HASH_PARAM = "essay";
const HASH_FORMAT_VERSION = "v1.";

type DuplicateWordShareState = {
  v: 1;
  text: string;
};

function currentUrl(): URL {
  return new URL(window.location.href);
}

function hashParams(hash: string): URLSearchParams {
  return new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
}

function encodeShareText(text: string): string {
  const state: DuplicateWordShareState = { v: 1, text };
  return `${HASH_FORMAT_VERSION}${compressToEncodedURIComponent(JSON.stringify(state))}`;
}

function decodeShareText(raw: string): string | null {
  if (!raw.startsWith(HASH_FORMAT_VERSION)) return null;

  const json = decompressFromEncodedURIComponent(raw.slice(HASH_FORMAT_VERSION.length));
  if (!json) return null;

  try {
    const state = JSON.parse(json) as Partial<DuplicateWordShareState>;
    if (state.v !== 1 || typeof state.text !== "string") return null;
    return state.text;
  } catch {
    return null;
  }
}

// Reads the essay text from the URL fragment without involving server-visible
// query params.
export function readDuplicateWordShareText(): string | null {
  const raw = hashParams(window.location.hash).get(HASH_PARAM);
  return raw ? decodeShareText(raw) : null;
}

// Persists the essay text into the URL fragment, preserving other hash params
// if the page ever gains them.
export function writeDuplicateWordShareText(text: string): void {
  const url = currentUrl();
  const params = hashParams(url.hash);

  if (text.length === 0) params.delete(HASH_PARAM);
  else params.set(HASH_PARAM, encodeShareText(text));

  const nextHash = params.toString();
  url.hash = nextHash ? `#${nextHash}` : "";
  history.replaceState(null, "", url.toString());
}
