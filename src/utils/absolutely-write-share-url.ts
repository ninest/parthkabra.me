import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

const HASH_PARAM = "doc";
const HASH_FORMAT_VERSION = "v1.";

export type AbsolutelyWriteComment = {
  id: string;
  body: string;
};

export type AbsolutelyWriteShareState = {
  doc: string;
  title: string;
  comments: AbsolutelyWriteComment[];
};

type EncodedState = {
  v: 1;
  doc: string;
  title: string;
  comments: AbsolutelyWriteComment[];
};

function currentUrl(): URL {
  return new URL(window.location.href);
}

function hashParams(hash: string): URLSearchParams {
  return new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
}

function isEmptyState(state: AbsolutelyWriteShareState): boolean {
  return state.doc === "" && state.title === "" && state.comments.length === 0;
}

function encodeShareState(state: AbsolutelyWriteShareState): string {
  const payload: EncodedState = {
    v: 1,
    doc: state.doc,
    title: state.title,
    comments: state.comments,
  };
  return `${HASH_FORMAT_VERSION}${compressToEncodedURIComponent(JSON.stringify(payload))}`;
}

function decodeShareState(raw: string): AbsolutelyWriteShareState | null {
  if (!raw.startsWith(HASH_FORMAT_VERSION)) return null;

  try {
    const json = decompressFromEncodedURIComponent(raw.slice(HASH_FORMAT_VERSION.length));
    if (!json) return null;

    const parsed = JSON.parse(json) as Partial<EncodedState>;
    if (parsed.v !== 1) return null;
    if (typeof parsed.doc !== "string") return null;
    if (typeof parsed.title !== "string") return null;
    if (!Array.isArray(parsed.comments)) return null;

    const comments: AbsolutelyWriteComment[] = [];
    for (const c of parsed.comments) {
      if (!c || typeof c.id !== "string" || typeof c.body !== "string") return null;
      comments.push({ id: c.id, body: c.body });
    }

    return { doc: parsed.doc, title: parsed.title, comments };
  } catch {
    return null;
  }
}

// Read the absolutely-write state from the URL fragment. Returns null when
// nothing has been encoded yet so callers can keep their default state.
export function readAbsolutelyWriteShareState(): AbsolutelyWriteShareState | null {
  const raw = hashParams(window.location.hash).get(HASH_PARAM);
  return raw ? decodeShareState(raw) : null;
}

// Persist the state into the URL fragment, preserving any other hash params.
// Empty state removes the param entirely so a fresh page link stays clean.
export function writeAbsolutelyWriteShareState(state: AbsolutelyWriteShareState): void {
  const url = currentUrl();
  const params = hashParams(url.hash);

  if (isEmptyState(state)) params.delete(HASH_PARAM);
  else params.set(HASH_PARAM, encodeShareState(state));

  const nextHash = params.toString();
  url.hash = nextHash ? `#${nextHash}` : "";
  history.replaceState(null, "", url.toString());
}
