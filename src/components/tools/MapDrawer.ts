import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { inputClasses } from "../input";
import {
  reverseGeocode,
  geocode,
  suggestGeocode,
  haversineMeters,
  type StreetGeometry,
  type SuggestedPlace,
} from "../../utils/geolocation";
import {
  DEFAULT_COLOR_ID,
  PALETTE,
  SRC_DRAWINGS,
  SRC_LINE_POINT_LABELS,
  SRC_PREVIEW,
  createDrawingSourcesAndLayers,
  getFeatureCoord,
  getLineUserPoints,
  getPaletteEntryById,
  linePointLabelCollection,
  type DrawingFeature,
  type FeatureCollection,
  type FeatureProps,
  type LineFeature,
  type LngLat,
} from "../../utils/map-drawing";
import {
  readMapDrawerControlsCollapsed,
  readMapDrawerShareState,
  writeMapDrawerControlsCollapsed,
  writeMapDrawerShareState,
} from "../../utils/map-drawer-storage";
import { getRouteMatchedPath, type RouteProfile } from "../../utils/route-matching";

// MapLibre source ID for the dashed search-preview line. Local to this file —
// the shared map-drawing helpers don't know about it.
const SRC_SEARCH_PREVIEW = "search-preview";

// === DOM refs ===
const $mapEl = document.getElementById("mapdrawer-map")!;
const $modePoint = document.getElementById("md-mode-point") as HTMLButtonElement;
const $modeLine = document.getElementById("md-mode-line") as HTMLButtonElement;
const $exitMode = document.getElementById("md-exit-mode") as HTMLButtonElement;
const $finishLine = document.getElementById("md-finish-line") as HTMLButtonElement;
const $routeWalk = document.getElementById("md-route-walk") as HTMLButtonElement;
const $routeBike = document.getElementById("md-route-bike") as HTMLButtonElement;
const $routeDrive = document.getElementById("md-route-drive") as HTMLButtonElement;
const $myLocation = document.getElementById("md-my-location") as HTMLButtonElement;
const $clear = document.getElementById("md-clear") as HTMLButtonElement;
const $copyLink = document.getElementById("md-copy-link") as HTMLButtonElement;
const $toggleLabels = document.getElementById("md-toggle-labels") as HTMLButtonElement;
const $swatches = document.getElementById("md-swatches")!;
const $listPanel = document.getElementById("md-list-panel")!;
const $listToggle = document.getElementById("md-list-toggle") as HTMLButtonElement;
const $listCount = document.getElementById("md-list-count")!;
const $listBody = document.getElementById("md-list-body")!;
const $listOverflow = document.getElementById("md-list-overflow") as HTMLButtonElement;
const $listExtras = document.getElementById("md-list-extras")!;
const $detail = document.getElementById("md-list-detail")!;
const $detailHeaderRow = document.getElementById("md-list-header")!;
const $detailBack = document.getElementById("md-detail-back") as HTMLButtonElement;
const $detailName = document.getElementById("md-detail-name") as HTMLInputElement;
const $detailSwatches = document.getElementById("md-detail-swatches")!;
const $detailLabelToggle = document.getElementById("md-detail-label-toggle") as HTMLButtonElement;
const $detailAddressBlock = document.getElementById("md-detail-address-block")!;
const $detailAddress = document.getElementById("md-detail-address")!;
const $detailAddressActions = document.getElementById("md-detail-address-actions")!;
const $detailEditAddress = document.getElementById("md-detail-edit-address") as HTMLButtonElement;
const $detailCopyAddress = document.getElementById("md-detail-copy-address") as HTMLButtonElement;
const $detailPointsList = document.getElementById("md-detail-points-list")!;
const $detailDelete = document.getElementById("md-detail-delete") as HTMLButtonElement;
const $detailMode = document.getElementById("md-detail-mode")!;
const $detailModeWalk = document.getElementById("md-detail-mode-walk")!;
const $detailModeBike = document.getElementById("md-detail-mode-bike")!;
const $detailModeDrive = document.getElementById("md-detail-mode-drive")!;
const $searchInput = document.getElementById("md-search-input") as HTMLInputElement;
const $searchStatus = document.getElementById("md-search-status")!;
const $suggestions = document.getElementById("md-suggestions") as HTMLUListElement;
const $searchIcon = document.getElementById("md-search-icon")!;
const $searchSpinner = document.getElementById("md-search-spinner")!;
const $searchClear = document.getElementById("md-search-clear") as HTMLButtonElement;
const $controls = document.getElementById("md-controls")!;
const $collapseToggle = document.getElementById("md-collapse-toggle") as HTMLButtonElement;
const $hint = document.getElementById("md-hint")!;
const $searchConfirm = document.getElementById("md-search-confirm")!;
const $searchConfirmText = document.getElementById("md-search-confirm-text")!;
const $searchConfirmCancel = document.getElementById("md-search-confirm-cancel") as HTMLButtonElement;
const $searchConfirmAdd = document.getElementById("md-search-confirm-add") as HTMLButtonElement;

// === State ===
// mode is null until the user explicitly picks Point or Line — map clicks are ignored otherwise.
let mode: "point" | "line" | null = null;
let features: DrawingFeature[] = [];
// User clicks during line mode — the canonical input to OSRM. Stays sparse.
let lineWaypoints: LngLat[] = [];
// What gets rendered as the in-progress preview and saved on Finish.
// Equals lineWaypoints when unmatched; equals OSRM's snapped output when matched.
let lineDisplayPoints: LngLat[] = [];
let routeMatchMode: FeatureProps["routeMatchMode"] | null = null;
// Sequence number for OSRM fetches: discard responses where the seq has moved on
// (user clicked again, switched profile, exited mode). Paired with an AbortController
// so the in-flight request actually stops on the wire too.
let routeFetchSeq = 0;
let routeFetchAbort: AbortController | null = null;
// Which mode (if any) is currently fetching — used to dim the right button.
let routeFetchingMode: FeatureProps["routeMatchMode"] | null = null;
// Inline error message ("No walking route found") shown via the same $hint element.
// Cleared on the next mode-changing user action.
let routeError: string | null = null;
let myLocationMarker: maplibregl.Marker | null = null;
let searchMarker: maplibregl.Marker | null = null;
// True while the search-preview line layer is showing a dashed street outline.
// Cleared alongside `searchMarker` whenever the search preview is dismissed.
let searchLineActive = false;
// Populated while an "Add point/line: {title}" confirm panel is open under the search bar.
// `kind` decides whether commit creates a Point feature or a LineString feature.
// `lineCoords` is only set when kind === "line"; it's the flattened LineString to commit.
// Cleared on commit, cancel, clear-search, or Clear all.
let pendingPlace:
  | { kind: "point"; title: string; lat: number; lng: number }
  | { kind: "line"; title: string; lat: number; lng: number; lineCoords: LngLat[] }
  | null = null;
let activeColorId = DEFAULT_COLOR_ID;
// Counters are monotonic so two features never share an auto-name, even after edits.
let pointCounter = 0;
let lineCounter = 0;
let listExpanded = false;
// Reference (not index) so deletes/inserts in `features` don't strand the wrong feature.
// Resolve to an index lazily via features.indexOf when needed.
let detailFeature: DrawingFeature | null = null;
// Delete-armed state for the detail page's two-step delete, mirroring the toolbar's exit/clear pattern.
let detailDeleteArmed = false;
let detailDeleteResetTimer: ReturnType<typeof setTimeout> | null = null;
// Cleanup hook for the in-progress address edit (if any) — invoked by closeDetail().
let detailEditCleanup: (() => void) | null = null;

// Contextual instruction shown above the toolbar. Two small helpers so adding
// a new hint is one row in HINTS + one branch in currentHintKey, with copy
// kept separate from condition logic.
// Declared before applyControlsCollapsed so the init call to updateHint() can
// see HINTS (const declarations don't hoist; they sit in TDZ until this point).
const HINTS = {
  idle: "Click Point or Line to start drawing",
  point: "Tap the map to add a point",
  lineEmpty: "Tap the map to start a line",
  lineDrawing: "Tap to add more points; click Finish when done",
} as const;

function currentHintKey(): keyof typeof HINTS | null {
  if (mode === null) return "idle";
  if (mode === "point") return "point";
  return lineWaypoints.length === 0 ? "lineEmpty" : "lineDrawing";
}

function updateHint() {
  const collapsed = $controls.getAttribute("data-collapsed") === "true";
  // routeError takes precedence over the contextual hint so a failed match is visible.
  const text = collapsed ? "" : (routeError ?? (currentHintKey() ? HINTS[currentHintKey()!] : ""));
  $hint.textContent = text;
  $hint.classList.toggle("hidden", !text);
}

// === Collapse toggle ===
// Sets data-collapsed on the bar; CSS above hides every child except the caret itself
// and rotates the caret icon 180deg. Persisted in localStorage so "view-only" survives reloads.
function applyControlsCollapsed(collapsed: boolean) {
  if (collapsed) $controls.setAttribute("data-collapsed", "true");
  else $controls.removeAttribute("data-collapsed");
  $collapseToggle.setAttribute("aria-expanded", String(!collapsed));
  $collapseToggle.setAttribute("aria-label", collapsed ? "Show controls" : "Hide controls");
  updateHint();
}
applyControlsCollapsed(readMapDrawerControlsCollapsed());
$collapseToggle.addEventListener("click", () => {
  const next = $controls.getAttribute("data-collapsed") !== "true";
  applyControlsCollapsed(next);
  writeMapDrawerControlsCollapsed(next);
});

// === Swatch rendering ===

// Build a round colored swatch button of the given hex color.
function makeSwatchButton(hex: string, label: string, active: boolean): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", label);
  btn.className =
    "w-5 h-5 rounded-md shrink-0 border border-border ring-2 ring-offset-1 ring-offset-background " +
    (active ? "ring-primary" : "ring-transparent hover:brightness-110");
  btn.style.backgroundColor = hex;
  return btn;
}

// Render the palette row in the toolbar. Tap to set the active color for new features.
// The active highlight only renders while a draw mode is engaged — outside of
// Point/Line, color picking is a no-op so we don't suggest a "current" color.
function renderSwatches() {
  $swatches.innerHTML = "";
  PALETTE.forEach((entry) => {
    const showActive = mode !== null && entry.id === activeColorId;
    const btn = makeSwatchButton(entry.hex, `Use ${entry.label}`, showActive);
    btn.addEventListener("click", () => setActiveColor(entry.id));
    $swatches.appendChild(btn);
  });
}

// Set the active color: updates the palette UI and the preview layers on the map.
function setActiveColor(colorId: string) {
  activeColorId = getPaletteEntryById(colorId).id;
  renderSwatches();
  const hex = getPaletteEntryById(activeColorId).hex;
  if (map.loaded()) {
    if (map.getLayer("preview-point")) map.setPaintProperty("preview-point", "circle-color", hex);
    if (map.getLayer("preview-line")) map.setPaintProperty("preview-line", "line-color", hex);
  }
}

// === Address cache ===

// Reverse-geocoded addresses are cached per feature (not serialized in the URL).
// Prefetched when the feature list opens so rows feel instant; the shared Nominatim
// queue in utils/geolocation caps requests at ~1/sec regardless of how we call in.
const addressCache = new WeakMap<DrawingFeature, string | null>();
const addressPending = new WeakMap<DrawingFeature, Promise<string | null>>();

// Kick off reverse geocoding for a feature if we haven't already. onUpdate fires
// synchronously (so "Resolving..." can render) and again once the result lands.
// If a prefetch is already in flight for this feature, chain onto it so a later
// caller (e.g. user opens the row) still gets notified when the result lands.
//
// `priority` marks calls where the user is actively waiting (opening a row), so
// they jump ahead of the background prefetch queue. Without this, typing into
// the per-row edit textarea stalls for ~3–4s while unrelated prefetches drain.
function ensureAddress(f: DrawingFeature, onUpdate: () => void, priority = false) {
  if (addressCache.has(f)) {
    onUpdate();
    return;
  }
  const pending = addressPending.get(f);
  if (pending) {
    pending.then(onUpdate);
    onUpdate();
    return;
  }
  const { lat, lng } = getFeatureCoord(f);
  const p = reverseGeocode(lat, lng, priority).then((result) => {
    addressCache.set(f, result ?? null);
    addressPending.delete(f);
    onUpdate();
    return result ?? null;
  });
  addressPending.set(f, p);
  onUpdate();
}

// Prefetch addresses for every feature. Safe to call repeatedly — ensureAddress
// short-circuits cached/pending entries. Runs at background priority so a user
// action (typing, opening a row) can cut in front.
function prefetchAllAddresses() {
  for (const f of features) ensureAddress(f, () => {}, false);
}

// === Feature list rendering ===

// Render the right-side list of features. One row per feature: color chip, name input,
// chevron-right that opens the detail page. The chip is also a shortcut into the same
// detail page (matches the original "tap chip to edit color" affordance).
function renderList() {
  $listPanel.classList.toggle("hidden", features.length === 0);
  $listCount.textContent = String(features.length);
  $listBody.innerHTML = "";
  features.forEach((f) => {
    const row = document.createElement("div");
    // Single hover surface for the whole row — name + chevron both open detail,
    // so two separate hover rectangles read as two distinct affordances. The chip
    // keeps its own ring styling but doesn't fight the row hover.
    row.className = "flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-muted";

    const chip = makeSwatchButton(getPaletteEntryById(f.properties.colorId).hex, "Edit feature", false);
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      openDetail(f);
    });

    // Name is a click target, not an input — editing happens on the detail page.
    // truncate prevents long names from pushing the chevron off-row.
    const name = document.createElement("button");
    name.type = "button";
    name.className = "flex-1 min-w-0 text-left text-sm px-1 py-0.5 truncate cursor-pointer";
    name.textContent = f.properties.name;
    name.addEventListener("click", (e) => {
      e.stopPropagation();
      openDetail(f);
    });

    // Mode badge: walk/bike/car glyph in a primary-tinted square. Replaces the older
    // "{mode} matched" text pill — same affordance, less width.
    const matchBadge = document.createElement("span");
    matchBadge.className =
      "hidden shrink-0 inline-flex items-center justify-center w-7 h-7 text-muted-foreground";
    if (f.geometry.type === "LineString" && f.properties.routeMatchMode) {
      matchBadge.classList.remove("hidden");
      matchBadge.innerHTML = ROUTE_MATCH_ICON_SVG[f.properties.routeMatchMode];
      matchBadge.setAttribute("aria-label", `${f.properties.routeMatchMode} matched`);
    }

    // Chevron-right opens the detail page. Same target as the color chip.
    // Inline SVG because rows are JS-constructed; the chevron-right.astro icon
    // component is available for any future static placements.
    const chevron = document.createElement("button");
    chevron.type = "button";
    chevron.setAttribute("aria-label", "Open feature details");
    chevron.className =
      "w-7 h-7 rounded flex items-center justify-center shrink-0 text-muted-foreground";
    chevron.innerHTML =
      '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m9 6 6 6-6 6"></path></svg>';
    chevron.addEventListener("click", (e) => {
      e.stopPropagation();
      openDetail(f);
    });

    row.appendChild(chip);
    row.appendChild(name);
    row.appendChild(matchBadge);
    row.appendChild(chevron);
    $listBody.appendChild(row);
  });
}

// Toggle the list body visible/hidden. Starts collapsed on every load to keep the map unobstructed.
// Opening the list kicks off address prefetch for every feature so rows feel instant when expanded.
function setListExpanded(open: boolean) {
  listExpanded = open;
  $listBody.classList.toggle("hidden", !open);
  $listBody.classList.toggle("flex", open);
  // Drive the caret rotation and a11y state from the same toggle that hides/shows the body.
  if (open) $listToggle.removeAttribute("data-collapsed");
  else $listToggle.setAttribute("data-collapsed", "true");
  $listToggle.setAttribute("aria-expanded", String(open));
  if (open) prefetchAllAddresses();
}
$listToggle.addEventListener("click", () => setListExpanded(!listExpanded));

// === Detail page ===
// The detail view replaces the list inside #md-list-panel — header row + body + extras
// are hidden while open; closeDetail restores them to their prior state. Only one feature
// is visible at a time, and the markup is rendered once (in the .astro template) and
// re-populated per open, so per-render cost stays flat regardless of feature count.

// Disarm the detail's two-step delete and clear its 3s reset timer.
function disarmDetailDelete() {
  detailDeleteArmed = false;
  $detailDelete.textContent = "Delete";
  if (detailDeleteResetTimer) {
    clearTimeout(detailDeleteResetTimer);
    detailDeleteResetTimer = null;
  }
}

// Build the swatch row inside the detail page. Active highlight reflects the current feature's color.
function renderDetailSwatches() {
  $detailSwatches.innerHTML = "";
  if (!detailFeature) return;
  PALETTE.forEach((entry) => {
    const btn = makeSwatchButton(
      entry.hex,
      entry.label,
      entry.id === detailFeature!.properties.colorId,
    );
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!detailFeature) return;
      detailFeature.properties.colorId = entry.id;
      rerender();
    });
    $detailSwatches.appendChild(btn);
  });
}

// Mirrors the per-row applyAddressState (now removed): paints the address text, toggles
// the Edit/Copy actions, shows "Resolving..." while a reverse-geocode is in flight.
function applyDetailAddressState() {
  if (!detailFeature || detailFeature.geometry.type !== "Point") return;
  const cached = addressCache.get(detailFeature);
  if (cached === undefined) {
    $detailAddress.textContent = addressPending.has(detailFeature) ? "Resolving..." : "";
    $detailAddressActions.classList.add("hidden");
    $detailAddressActions.classList.remove("flex");
  } else if (cached) {
    $detailAddress.textContent = cached;
    $detailAddressActions.classList.remove("hidden");
    $detailAddressActions.classList.add("flex");
  } else {
    $detailAddress.textContent = "Address unknown";
    $detailAddressActions.classList.add("hidden");
    $detailAddressActions.classList.remove("flex");
  }
}

function ensureLinePointNames(feature: LineFeature, pointCount: number): string[] {
  const existing = feature.properties.pointNames ?? [];
  const names = Array.from({ length: pointCount }, (_, i) => existing[i] ?? "");
  feature.properties.pointNames = names;
  return names;
}

// Renders editable labels for the user-added points that make up a line.
function renderDetailPointsList(feature: LineFeature) {
  const points = getLineUserPoints(feature);
  const names = feature.properties.pointNames ?? [];
  $detailPointsList.innerHTML = "";
  points.forEach((_, i) => {
    const input = document.createElement("input");
    input.type = "text";
    const placeholder =
      i === 0 ? "Start" : i === points.length - 1 ? "End" : `Point ${i + 1}`;
    input.placeholder = placeholder;
    input.setAttribute("aria-label", placeholder);
    input.value = names[i] ?? "";
    input.className = inputClasses(
      "w-full rounded px-2 py-1 text-base leading-tight bg-transparent",
    );
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("autocapitalize", "words");
    input.addEventListener("input", () => {
      const nextNames = ensureLinePointNames(feature, points.length);
      nextNames[i] = input.value;
      writeShareState();
    });
    $detailPointsList.appendChild(input);
  });
}

// Read detailFeature → write every detail DOM element. Called on open and on every rerender
// while the detail is visible, so external mutations (color/name/coord changes) stay reflected.
function populateDetail() {
  if (!detailFeature) return;
  $detailName.value = detailFeature.properties.name;
  renderDetailSwatches();
  $detailLabelToggle.textContent = detailFeature.properties.hideLabel ? "Show label" : "Hide label";
  const isPoint = detailFeature.geometry.type === "Point";
  $detailAddressBlock.classList.toggle("hidden", !isPoint);
  $detailAddressBlock.classList.toggle("flex", isPoint);
  $detailPointsList.classList.toggle("hidden", isPoint);
  $detailPointsList.classList.toggle("flex", !isPoint);
  // Edit only makes sense for Points today (single coord) — hide for lines.
  $detailEditAddress.classList.toggle("hidden", !isPoint);
  // Show the route-match glyph (walk/bike/car) only on LineStrings that have a mode set.
  // The same icon appears in the list row — keeping them in lockstep avoids a "what mode is this?" round-trip.
  const detailMode =
    detailFeature.geometry.type === "LineString" ? detailFeature.properties.routeMatchMode ?? null : null;
  $detailMode.classList.toggle("hidden", !detailMode);
  $detailModeWalk.classList.toggle("hidden", detailMode !== "walk");
  $detailModeBike.classList.toggle("hidden", detailMode !== "bike");
  $detailModeDrive.classList.toggle("hidden", detailMode !== "drive");
  if (detailMode) $detailMode.setAttribute("aria-label", `${detailMode} matched`);
  else $detailMode.removeAttribute("aria-label");
  if (isPoint) {
    $detailPointsList.innerHTML = "";
    applyDetailAddressState();
    ensureAddress(detailFeature, applyDetailAddressState, true);
  } else {
    $detailAddressActions.classList.add("hidden");
    $detailAddressActions.classList.remove("flex");
    renderDetailPointsList(detailFeature);
  }
}

// Show the detail page, hide list pieces. Does NOT mutate listExpanded so closing returns
// the list to its prior expand/collapse state.
function openDetail(f: DrawingFeature) {
  detailFeature = f;
  setListExtrasOpen(false);
  $detailHeaderRow.classList.add("hidden");
  $listExtras.classList.add("hidden");
  $listExtras.classList.remove("flex");
  $listBody.classList.add("hidden");
  $listBody.classList.remove("flex");
  $detail.classList.remove("hidden");
  $detail.classList.add("flex");
  disarmDetailDelete();
  populateDetail();
}

// Hide the detail page, restore list to its prior state. Cancels any in-progress
// address edit so it can't outlive the view it lives in.
function closeDetail() {
  if (detailEditCleanup) {
    detailEditCleanup();
    detailEditCleanup = null;
  }
  detailFeature = null;
  disarmDetailDelete();
  $detail.classList.add("hidden");
  $detail.classList.remove("flex");
  $detailHeaderRow.classList.remove("hidden");
  // Restore body visibility based on the saved listExpanded flag.
  $listBody.classList.toggle("hidden", !listExpanded);
  $listBody.classList.toggle("flex", listExpanded);
}

// In-place address editor: replaces the static address paragraph with a textarea +
// Nominatim suggestions (same flow as the search bar's autocomplete). Selecting a
// suggestion commits — typing alone never does, so a half-typed query can't bake in.
// Returns a cleanup function (also stored on detailEditCleanup) so closeDetail can
// tear it down without leaking handlers.
function beginDetailEditAddress() {
  if (!detailFeature || detailFeature.geometry.type !== "Point") return;
  const f = detailFeature;
  const current = addressCache.get(f);
  if (!current) return;

  const editArea = document.createElement("textarea");
  editArea.value = current;
  editArea.rows = 3;
  // pr-8 reserves room for the absolute-positioned spinner, matching the search bar pattern.
  editArea.className = inputClasses(
    "w-full rounded pl-2 pr-8 py-1 text-base leading-tight bg-transparent resize-none",
  );
  editArea.setAttribute("autocomplete", "off");
  editArea.setAttribute("autocorrect", "off");
  editArea.setAttribute("spellcheck", "false");

  const editAreaWrap = document.createElement("div");
  editAreaWrap.className = "relative";
  editAreaWrap.appendChild(editArea);

  const editSpinner = document.createElement("div");
  editSpinner.className =
    "hidden absolute top-2 right-2 pointer-events-none text-muted-foreground";
  editSpinner.innerHTML =
    '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="animate-spin w-4 h-4"><circle cx="12" cy="12" r="9" opacity="0.25"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg>';
  editAreaWrap.appendChild(editSpinner);
  const setEditLoading = (loading: boolean) => {
    editSpinner.classList.toggle("hidden", !loading);
  };

  const editSuggestions = document.createElement("ul");
  editSuggestions.className =
    "hidden flex-col mt-1 border border-border rounded overflow-hidden";
  let editSuggestItems: SuggestedPlace[] = [];
  let editDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  $detailAddress.classList.add("hidden");
  $detailAddressActions.classList.add("hidden");
  $detailAddressBlock.insertBefore(editAreaWrap, $detailAddress);
  $detailAddressBlock.insertBefore(editSuggestions, $detailAddress);
  editArea.focus();
  editArea.select();

  let done = false;
  const restore = () => {
    if (editDebounceTimer) clearTimeout(editDebounceTimer);
    editAreaWrap.remove();
    editSuggestions.remove();
    $detailAddress.classList.remove("hidden");
    applyDetailAddressState();
  };
  const cancel = () => {
    if (done) return;
    done = true;
    restore();
    detailEditCleanup = null;
  };
  detailEditCleanup = cancel;

  const showEditSuggestionsContainer = () => {
    editSuggestions.classList.remove("hidden");
    editSuggestions.classList.add("flex");
  };
  const hideEditSuggestions = () => {
    editSuggestItems = [];
    editSuggestions.innerHTML = "";
    editSuggestions.classList.add("hidden");
    editSuggestions.classList.remove("flex");
  };
  const renderEditSuggestions = (items: SuggestedPlace[]) => {
    editSuggestItems = items;
    editSuggestions.innerHTML = "";
    if (items.length === 0) {
      const li = document.createElement("li");
      li.className = "px-2 py-1 text-xs text-muted-foreground";
      li.textContent = "No results found";
      editSuggestions.appendChild(li);
      showEditSuggestionsContainer();
      return;
    }
    items.forEach((it, i) => {
      const li = document.createElement("li");
      li.className =
        "px-2 py-1 cursor-pointer hover:bg-muted border-b border-border last:border-b-0";
      li.innerHTML =
        `<div class="text-xs text-foreground truncate">${escapeHtml(it.title)}</div>` +
        (it.subtitle
          ? `<div class="text-xs text-muted-foreground truncate">${escapeHtml(it.subtitle)}</div>`
          : "");
      // mousedown + preventDefault keeps the textarea focused so blur doesn't cancel before the click.
      li.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        selectEditSuggestion(i);
      });
      editSuggestions.appendChild(li);
    });
    showEditSuggestionsContainer();
  };

  const selectEditSuggestion = (idx: number) => {
    if (done) return;
    const it = editSuggestItems[idx];
    if (!it) return;
    done = true;
    addressCache.set(f, it.display);
    if (f.geometry.type === "Point") {
      f.geometry.coordinates = [it.lng, it.lat];
    }
    restore();
    detailEditCleanup = null;
    rerender();
  };

  editArea.addEventListener("input", () => {
    const q = editArea.value.trim();
    if (editDebounceTimer) clearTimeout(editDebounceTimer);
    if (q.length < 2) {
      hideEditSuggestions();
      setEditLoading(false);
      return;
    }
    editDebounceTimer = setTimeout(async () => {
      setEditLoading(true);
      try {
        const items = await suggestGeocode(q, 5, currentViewbox());
        if (editArea.value.trim() !== q) return;
        renderEditSuggestions(sortByDistanceFromOrigin(items));
      } finally {
        if (editArea.value.trim() === q) setEditLoading(false);
      }
    }, 300);
  });

  editArea.addEventListener("blur", cancel);
  editArea.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      cancel();
    }
  });
}

// === Detail page event wiring (one-time) ===

$detailBack.addEventListener("click", closeDetail);

// Name input: same blur/Enter commit pattern as the row input.
$detailName.addEventListener("blur", () => {
  if (!detailFeature) return;
  const v = $detailName.value.trim();
  if (v && v !== detailFeature.properties.name) {
    detailFeature.properties.name = v;
    rerender();
  } else {
    $detailName.value = detailFeature.properties.name;
  }
});
$detailName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    $detailName.blur();
  }
});

$detailLabelToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!detailFeature) return;
  detailFeature.properties.hideLabel = !detailFeature.properties.hideLabel;
  rerender();
});

$detailCopyAddress.addEventListener("click", (e) => {
  e.stopPropagation();
  const text = $detailAddress.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text);
  const prev = $detailCopyAddress.textContent;
  $detailCopyAddress.textContent = "Copied!";
  setTimeout(() => ($detailCopyAddress.textContent = prev), 1500);
});

$detailEditAddress.addEventListener("click", (e) => {
  e.stopPropagation();
  beginDetailEditAddress();
});

$detailDelete.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!detailFeature) return;
  if (!detailDeleteArmed) {
    detailDeleteArmed = true;
    $detailDelete.textContent = "Sure?";
    detailDeleteResetTimer = setTimeout(disarmDetailDelete, 3000);
    return;
  }
  const idx = features.indexOf(detailFeature);
  if (idx >= 0) features.splice(idx, 1);
  closeDetail();
  rerender();
});

// Any click outside the delete button disarms the "Sure?" state.
document.addEventListener("click", (e) => {
  if (detailDeleteArmed && e.target !== $detailDelete) disarmDetailDelete();
});

// Toggles the list-level overflow panel (Copy link / Clear all).
// Closing always disarms the Clear button so reopening never shows a stale "Sure?" state.
function setListExtrasOpen(open: boolean) {
  $listExtras.classList.toggle("hidden", !open);
  $listExtras.classList.toggle("flex", open);
  $listOverflow.setAttribute("aria-expanded", String(open));
  if (!open) disarmClear();
}
$listOverflow.addEventListener("click", (e) => {
  e.stopPropagation();
  setListExtrasOpen($listExtras.classList.contains("hidden"));
});

// Close the list-level overflow on any click outside it.
document.addEventListener("click", (e) => {
  const target = e.target as Node;
  if (!$listExtras.contains(target) && !$listOverflow.contains(target)) {
    setListExtrasOpen(false);
  }
});

// === Storage-backed share state ===

// Parse every drawer-owned param up front (features, counters, labels flag) so map
// init can fit bounds and labels apply on the first frame — one read, one source of truth.
const initialShareState = readMapDrawerShareState();
features = initialShareState.features;
pointCounter = initialShareState.pointCounter;
lineCounter = initialShareState.lineCounter;

// Push the shareable drawer state into the current URL through the storage adapter.
function writeShareState() {
  writeMapDrawerShareState({ features, labelsVisible });
}
let initialBounds: maplibregl.LngLatBounds | null = null;
if (features.length > 0) {
  initialBounds = new maplibregl.LngLatBounds();
  for (const f of features) {
    if (f.geometry.type === "Point") {
      initialBounds.extend(f.geometry.coordinates);
    } else {
      for (const c of f.geometry.coordinates) initialBounds.extend(c);
    }
  }
}

// === Map init ===
// Default to Boston when no drawing is loaded from the URL — users can hit "My location" to jump elsewhere.
const BOSTON: LngLat = [-71.0589, 42.3601];
const map = new maplibregl.Map({
  container: $mapEl,
  style: "https://tiles.openfreemap.org/styles/positron",
  center: initialBounds ? initialBounds.getCenter().toArray() : BOSTON,
  zoom: 12,
  dragRotate: true,
  pitchWithRotate: true,
  // Disable the default non-compact attribution so we can add a compact one below.
  attributionControl: false,
});
map.addControl(new maplibregl.AttributionControl({ compact: true }));
if (initialBounds) {
  map.fitBounds(initialBounds, { padding: 60, maxZoom: 14 });
}

// Fullscreen layouts can init the map before the container is fully laid out,
// which leaves the canvas blank. A ResizeObserver guarantees resize when size settles.
new ResizeObserver(() => map.resize()).observe($mapEl);

map.on("error", (e) => {
  console.error("[MapDrawer] map error:", e.error ?? e);
});

// === Dark mode ===
// Invert canvas when site is in dark mode.
function applyDarkMode() {
  const isDark = document.documentElement.classList.contains("dark");
  const canvas = $mapEl.querySelector("canvas");
  if (canvas) {
    canvas.style.filter = isDark ? "invert(1) hue-rotate(180deg)" : "";
  }
}
new MutationObserver(applyDarkMode).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});

// === Collection builders & rerender ===

// Build the FeatureCollection currently rendered as the committed drawings.
function collection(): FeatureCollection {
  return { type: "FeatureCollection", features };
}

// Preview collection for the in-progress line while the user is clicking points in line mode.
// Preview paint uses the active color via setPaintProperty, so these properties aren't rendered —
// we just fill them to satisfy FeatureProps.
function previewCollection(): FeatureCollection {
  const props: FeatureProps = { name: "", colorId: activeColorId };
  if (routeMatchMode) props.routeMatchMode = routeMatchMode;
  if (lineDisplayPoints.length === 0) {
    return { type: "FeatureCollection", features: [] };
  }
  if (lineDisplayPoints.length === 1) {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: lineDisplayPoints[0] },
          properties: props,
        },
      ],
    };
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "LineString", coordinates: lineDisplayPoints },
        properties: props,
      },
    ],
  };
}

// Push current state into maplibre sources + URL + list.
// If the detail page is open and its feature was deleted out from under it
// (e.g. Clear all), close the detail; otherwise refresh it in place so
// external mutations (color/coord/name from elsewhere) stay reflected.
function rerender() {
  const drawings = map.getSource(SRC_DRAWINGS) as maplibregl.GeoJSONSource | undefined;
  if (drawings) drawings.setData(collection() as any);
  const linePointLabels = map.getSource(SRC_LINE_POINT_LABELS) as maplibregl.GeoJSONSource | undefined;
  if (linePointLabels) linePointLabels.setData(linePointLabelCollection(features) as any);
  const preview = map.getSource(SRC_PREVIEW) as maplibregl.GeoJSONSource | undefined;
  if (preview) preview.setData(previewCollection() as any);
  $finishLine.classList.toggle("hidden", !(mode === "line" && lineWaypoints.length >= 2));
  updateRouteMatchControls();
  renderList();
  if (detailFeature) {
    if (features.indexOf(detailFeature) === -1) closeDetail();
    else populateDetail();
  }
  writeShareState();
}

// === Map load: add sources + layers ===
map.on("load", () => {
  applyDarkMode();
  createDrawingSourcesAndLayers(map, {
    initialDrawings: collection(),
    initialLinePointLabels: linePointLabelCollection(features),
    initialPreview: previewCollection(),
    initialPreviewHex: getPaletteEntryById(activeColorId).hex,
  });
  // Dashed-blue line shown while a street search result is previewed but not yet committed.
  // Empty collection until `previewStreet` populates it; cleared back to empty on dismiss.
  map.addSource(SRC_SEARCH_PREVIEW, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] } as any,
  });
  map.addLayer({
    id: "search-preview-line",
    type: "line",
    source: SRC_SEARCH_PREVIEW,
    paint: {
      "line-color": "#2563eb",
      "line-width": 4,
      "line-opacity": 0.85,
      "line-dasharray": [2, 1.5],
    },
    layout: { "line-cap": "round", "line-join": "round" },
  });
  renderSwatches();
  renderList();
  applyLabelsVisible();
  // Saved matched lines arrive from the URL with raw waypoints as their geometry.
  // Re-snap them via OSRM so the rendered line follows roads. Failures keep the
  // raw straight-segment fallback in place — the badge still tells the user
  // what mode it was matched against.
  void resnapMatchedFeatures();
});

// For each saved matched line, re-fetch the OSRM-snapped path from its waypoints
// and replace `geometry.coordinates`. Each line's request is independent — failures
// for one don't block the others. Runs once on load; not retriggered after edits.
async function resnapMatchedFeatures() {
  const targets = features.filter(
    (f): f is typeof f & { geometry: { type: "LineString" } } =>
      f.geometry.type === "LineString" &&
      !!f.properties.routeMatchMode &&
      !!f.properties.waypoints &&
      f.properties.waypoints.length >= 2,
  );
  await Promise.all(
    targets.map(async (f) => {
      const mode = f.properties.routeMatchMode!;
      try {
        const snapped = await getRouteMatchedPath(
          f.properties.waypoints!,
          ROUTE_MATCH_TO_PROFILE[mode],
        );
        // Feature could have been removed (Clear all) while the request was in flight.
        if (features.indexOf(f) === -1) return;
        f.geometry.coordinates = snapped;
      } catch {
        // Leave the raw waypoint geometry in place — better than a blank line.
      }
    }),
  );
  rerender();
}

// === Mode (point / line) ===

// Apply primary (active) vs secondary (inactive) styling to a mode button.
function styleButton(btn: HTMLButtonElement, active: boolean) {
  btn.classList.toggle("bg-primary", active);
  btn.classList.toggle("text-primary-foreground", active);
  btn.classList.toggle("bg-muted", !active);
}

const ROUTE_MATCH_BUTTONS: ReadonlyArray<{
  mode: NonNullable<FeatureProps["routeMatchMode"]>;
  button: HTMLButtonElement;
}> = [
  { mode: "walk", button: $routeWalk },
  { mode: "bike", button: $routeBike },
  { mode: "drive", button: $routeDrive },
];

function canRouteMatchCurrentLine() {
  return mode === "line" && lineWaypoints.length >= 2;
}

function updateRouteMatchControls() {
  const visible = canRouteMatchCurrentLine();
  for (const { mode: matchMode, button } of ROUTE_MATCH_BUTTONS) {
    const active = routeMatchMode === matchMode;
    const fetching = routeFetchingMode === matchMode;
    button.classList.toggle("hidden", !visible);
    button.setAttribute("aria-pressed", String(visible && active));
    button.setAttribute("aria-busy", String(visible && fetching));
    button.classList.toggle("opacity-60", visible && fetching);
    button.classList.toggle("pointer-events-none", visible && fetching);
    styleButton(button, visible && active);
  }
}

// UI mode tokens are shorter than the OSRM profile names; convert at the boundary.
const ROUTE_MATCH_TO_PROFILE: Record<NonNullable<FeatureProps["routeMatchMode"]>, RouteProfile> = {
  walk: "walking",
  bike: "cycling",
  drive: "driving",
};

const ROUTE_MATCH_ERROR_LABEL: Record<NonNullable<FeatureProps["routeMatchMode"]>, string> = {
  walk: "walking",
  bike: "biking",
  drive: "driving",
};

// Inline SVGs for the route-match badge in JS-constructed list rows. Mirrors the paths
// in src/components/icons/{walk,bike,car}.astro — kept in sync with those components.
const ROUTE_MATCH_ICON_SVG: Record<NonNullable<FeatureProps["routeMatchMode"]>, string> = {
  walk: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/></svg>',
  bike: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M5.5 17.5 9 9h7l2.5 8.5M9 9l3 8.5L16 9"/><path d="M7 9h3"/><path d="M16 9V7M14 7h4"/></svg>',
  drive: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
};

// Cancel any in-flight OSRM call. Subsequent successful responses for older seqs are dropped
// by the seq check, but aborting saves the round-trip and makes the spinner end immediately.
function cancelRouteFetch() {
  if (routeFetchAbort) {
    routeFetchAbort.abort();
    routeFetchAbort = null;
  }
  routeFetchingMode = null;
}

// Fire an OSRM request for the current waypoints in the current mode. Latest call wins;
// stale responses are dropped via the seq guard. On failure, revert mode and surface a hint.
async function runRouteMatch() {
  if (!routeMatchMode || lineWaypoints.length < 2) return;
  cancelRouteFetch();
  const seq = ++routeFetchSeq;
  const ctrl = new AbortController();
  routeFetchAbort = ctrl;
  routeFetchingMode = routeMatchMode;
  routeError = null;
  // Re-render so the dimmed spinner state lands immediately, before the network round-trip.
  rerender();

  const targetMode = routeMatchMode;
  const waypointsAtFetch = lineWaypoints.slice();
  try {
    const snapped = await getRouteMatchedPath(
      waypointsAtFetch,
      ROUTE_MATCH_TO_PROFILE[targetMode],
      ctrl.signal,
    );
    if (seq !== routeFetchSeq) return;
    lineDisplayPoints = snapped;
    routeFetchingMode = null;
    routeFetchAbort = null;
    rerender();
  } catch (err) {
    if (seq !== routeFetchSeq) return;
    if ((err as { name?: string })?.name === "AbortError") return;
    routeMatchMode = null;
    lineDisplayPoints = lineWaypoints.slice();
    routeFetchingMode = null;
    routeFetchAbort = null;
    routeError = `No ${ROUTE_MATCH_ERROR_LABEL[targetMode]} route found`;
    rerender();
  }
}

function setRouteMatchMode(next: NonNullable<FeatureProps["routeMatchMode"]>) {
  if (!canRouteMatchCurrentLine()) return;
  routeMatchMode = next;
  routeError = null;
  void runRouteMatch();
}

// Color picking only matters while drawing — disable swatches outside Point/Line modes
// so the toolbar doesn't suggest a no-op interaction.
function setSwatchesEnabled(enabled: boolean) {
  $swatches.classList.toggle("opacity-50", !enabled);
  $swatches.classList.toggle("pointer-events-none", !enabled);
  $swatches.setAttribute("aria-disabled", enabled ? "false" : "true");
  // Re-render so the active highlight reflects the new enabled/disabled state.
  renderSwatches();
}
setSwatchesEnabled(false);

function setMode(next: "point" | "line" | null) {
  if (next === mode) return;
  if (mode === "line" && next !== "line") {
    // Switching away from line mode discards any in-progress line.
    lineWaypoints = [];
    lineDisplayPoints = [];
    routeMatchMode = null;
    routeError = null;
    cancelRouteFetch();
  }
  mode = next;
  if (mode === "line") {
    map.doubleClickZoom.disable();
  } else {
    map.doubleClickZoom.enable();
  }
  styleButton($modePoint, mode === "point");
  styleButton($modeLine, mode === "line");
  // While a mode is active, swap the inactive mode button out for an explicit X,
  // so "exit" is unambiguous and users don't accidentally discard an in-progress line
  // by clicking the other mode.
  $modePoint.classList.toggle("hidden", mode === "line");
  $modeLine.classList.toggle("hidden", mode === "point");
  $exitMode.classList.toggle("hidden", mode === null);
  disarmExit();
  setSwatchesEnabled(mode !== null);
  updateHint();
  rerender();
}

$modePoint.addEventListener("click", () => setMode("point"));
$modeLine.addEventListener("click", () => setMode("line"));
for (const { mode: matchMode, button } of ROUTE_MATCH_BUTTONS) {
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    setRouteMatchMode(matchMode);
  });
}

// Exit button: two-step "✕" → "Sure?" confirm, mirroring Clear all. Protects in-progress
// line points (setMode(null) discards them) from being dropped by a stray click.
let exitArmed = false;
let exitResetTimer: ReturnType<typeof setTimeout> | null = null;

function disarmExit() {
  exitArmed = false;
  $exitMode.textContent = "✕";
  if (exitResetTimer) {
    clearTimeout(exitResetTimer);
    exitResetTimer = null;
  }
}

$exitMode.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!exitArmed) {
    exitArmed = true;
    $exitMode.textContent = "Sure?";
    exitResetTimer = setTimeout(disarmExit, 3000);
    return;
  }
  setMode(null);
});

document.addEventListener("click", (e) => {
  if (exitArmed && e.target !== $exitMode) disarmExit();
});

// === Keyboard shortcuts ===
// Single-key shortcuts. Array (not map) so a future "Shortcuts" help panel can render
// them in a stable order. Add new entries here; the keydown handler picks them up.
const SHORTCUTS: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  action: () => void;
}> = [
  { key: "p", label: "P", description: "Start drawing a point", action: () => setMode("point") },
  { key: "l", label: "L", description: "Start drawing a line", action: () => setMode("line") },
];

// Escape closes the detail page — runs before the single-key shortcuts so it isn't
// gated by their "ignore when typing" guard. We still defer to the address-edit textarea's
// own Escape handler (which cancels the edit) and to the detail name input (so a stray
// Escape doesn't drop unsaved typing); Escape only closes detail when focus is elsewhere.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !detailFeature) return;
  const active = document.activeElement as HTMLElement | null;
  if (active && $detail.contains(active) && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
  e.preventDefault();
  closeDetail();
});

document.addEventListener("keydown", (e) => {
  // Don't hijack typing in inputs/textareas or while a modifier is held (cmd+P = print, etc.)
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const target = e.target as HTMLElement | null;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
  const match = SHORTCUTS.find((s) => s.key === e.key.toLowerCase());
  if (!match) return;
  e.preventDefault();
  match.action();
});

// === Finish line / click handlers ===

// Commit the in-progress line to features. The saved geometry is the displayed line —
// the snapped OSRM result when matched, or the user's raw clicks when not.
function finishLine() {
  if (lineWaypoints.length < 2 || lineDisplayPoints.length < 2) return;
  lineCounter++;
  const props: FeatureProps = { name: `Line ${lineCounter}`, colorId: activeColorId };
  if (routeMatchMode) {
    props.routeMatchMode = routeMatchMode;
    // Persist the user's clicks separately from the snapped render so the URL stays
    // short and the snapped path can be reconstructed on load via OSRM.
    props.waypoints = lineWaypoints.slice();
  }
  features.push({
    type: "Feature",
    geometry: { type: "LineString", coordinates: lineDisplayPoints.slice() },
    properties: props,
  });
  lineWaypoints = [];
  lineDisplayPoints = [];
  routeMatchMode = null;
  routeError = null;
  cancelRouteFetch();
  rerender();
  setMode(null);
  setListExpanded(true);
}
$finishLine.addEventListener("click", finishLine);

// Map click: add point, or append to in-progress line. No-op if no mode is active.
map.on("click", (e) => {
  if (mode === null) return;
  const coord: LngLat = [e.lngLat.lng, e.lngLat.lat];
  if (mode === "point") {
    pointCounter++;
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: coord },
      properties: { name: `Point ${pointCounter}`, colorId: activeColorId },
    });
    rerender();
    setMode(null);
    setListExpanded(true);
  } else if (mode === "line") {
    lineWaypoints.push(coord);
    routeError = null;
    if (routeMatchMode) {
      // Re-snap through all waypoints. runRouteMatch handles the seq + abort, so the latest
      // click's fetch supersedes any in-flight one. While it's loading we leave displayPoints
      // showing the previous snapped route — adding the raw click point would cause a visual
      // jolt to a straight segment that the new fetch will immediately replace.
      void runRouteMatch();
    } else {
      lineDisplayPoints = lineWaypoints.slice();
      rerender();
      updateHint();
    }
  }
});

// Double-click finishes a line in line mode.
map.on("dblclick", (e) => {
  if (mode !== "line") return;
  e.preventDefault();
  finishLine();
});

// === Clear all (two-step) ===
// First click arms the button ("Sure?"); a second click within the timeout performs the wipe.
// Clicking anywhere else, or waiting 3s, disarms it.
let clearArmed = false;
let clearResetTimer: ReturnType<typeof setTimeout> | null = null;

function disarmClear() {
  clearArmed = false;
  $clear.textContent = "Clear all";
  if (clearResetTimer) {
    clearTimeout(clearResetTimer);
    clearResetTimer = null;
  }
}

$clear.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!clearArmed) {
    clearArmed = true;
    $clear.textContent = "Sure?";
    clearResetTimer = setTimeout(disarmClear, 3000);
    return;
  }
  disarmClear();
  features = [];
  lineWaypoints = [];
  lineDisplayPoints = [];
  routeMatchMode = null;
  routeError = null;
  cancelRouteFetch();
  pointCounter = 0;
  lineCounter = 0;
  if (myLocationMarker) {
    myLocationMarker.remove();
    myLocationMarker = null;
  }
  clearSearchPreview();
  hideSearchConfirm();
  setListExtrasOpen(false);
  rerender();
});

// Any click outside the clear button disarms it.
document.addEventListener("click", (e) => {
  if (clearArmed && e.target !== $clear) disarmClear();
});

// === Map labels visibility ===
// Toggles every symbol layer in the base style except our own drawing labels.
// Persists as ?hl=1 in the URL (absent = labels shown, the default).
const CUSTOM_LABEL_LAYER_IDS = new Set([
  "drawings-point-labels",
  "drawings-line-labels",
  "drawings-line-point-labels",
]);
let labelsVisible = initialShareState.labelsVisible;

function applyLabelsVisible() {
  // Don't gate on map.isStyleLoaded(): adding our drawing sources inside the load handler
  // flips isStyleLoaded() false while they settle, which used to make the reload path bail
  // out and leave hl=1 unrespected. The base symbol layers already exist in getStyle().layers
  // by the time load fires, and setLayoutProperty queues the change safely either way.
  const layers = map.getStyle()?.layers || [];
  for (const layer of layers) {
    if (layer.type !== "symbol") continue;
    if (CUSTOM_LABEL_LAYER_IDS.has(layer.id)) continue;
    map.setLayoutProperty(layer.id, "visibility", labelsVisible ? "visible" : "none");
  }
}

function updateLabelsButton() {
  $toggleLabels.textContent = labelsVisible ? "Hide map labels" : "Show map labels";
}
updateLabelsButton();

$toggleLabels.addEventListener("click", (e) => {
  e.stopPropagation();
  labelsVisible = !labelsVisible;
  updateLabelsButton();
  applyLabelsVisible();
  writeShareState();
});

// === Copy link ===
$copyLink.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    const prev = $copyLink.textContent;
    $copyLink.textContent = "Copied!";
    setTimeout(() => ($copyLink.textContent = prev), 1500);
  } catch {
    setSearchStatus("Copy failed");
    setTimeout(() => setSearchStatus(""), 1500);
  }
});

// === My location ===
// Non-persistent blue marker + flyTo. Second click clears the marker.
// Button visual state mirrors the marker's presence via data-active.
function setMyLocationActive(active: boolean) {
  $myLocation.setAttribute("aria-pressed", active ? "true" : "false");
}
$myLocation.addEventListener("click", () => {
  if (myLocationMarker) {
    myLocationMarker.remove();
    myLocationMarker = null;
    setMyLocationActive(false);
    return;
  }
  if (!navigator.geolocation) {
    setSearchStatus("Geolocation unavailable");
    return;
  }
  setSearchStatus("Locating...");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const el = document.createElement("div");
      el.style.cssText =
        "width:1.125rem;height:1.125rem;background:rgba(37,99,235,.55);border:0.156rem solid rgba(255,255,255,.85);border-radius:50%;box-shadow:0 0.125rem 0.375rem rgba(0,0,0,.25);";
      myLocationMarker = new maplibregl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .addTo(map);
      map.flyTo({ center: [longitude, latitude], zoom: 14 });
      setMyLocationActive(true);
      setSearchStatus("");
    },
    () => {
      setSearchStatus("Location denied");
      setTimeout(() => setSearchStatus(""), 2000);
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
});

// === Search (geocode) ===
// Forward-geocode a query and fly the map to it with an ephemeral dashed pin.
// The pin is deliberately a dashed ring (not a solid marker) so it reads as "temporary /
// where you just looked" rather than a committed point. Replaced on each search; cleared by Clear all.
function setSearchStatus(text: string) {
  $searchStatus.textContent = text;
  $searchStatus.classList.toggle("hidden", !text);
}

// Show the inline "Add point/line: {title}" confirmation panel under the search bar.
// Stores the pending target (with geometry, for streets) so the ✓ button commits
// without re-geocoding.
function showSearchConfirmPoint(title: string, lat: number, lng: number) {
  pendingPlace = { kind: "point", title, lat, lng };
  $searchConfirmText.textContent = `Add point: ${title}`;
  $searchConfirm.classList.remove("hidden");
  $searchConfirm.classList.add("flex");
}

function showSearchConfirmLine(title: string, lat: number, lng: number, lineCoords: LngLat[]) {
  pendingPlace = { kind: "line", title, lat, lng, lineCoords };
  $searchConfirmText.textContent = `Add line: ${title}`;
  $searchConfirm.classList.remove("hidden");
  $searchConfirm.classList.add("flex");
}

function hideSearchConfirm() {
  pendingPlace = null;
  $searchConfirm.classList.add("hidden");
  $searchConfirm.classList.remove("flex");
}

$searchConfirmCancel.addEventListener("click", () => {
  // Preview pin stays so the user can keep exploring the same place.
  hideSearchConfirm();
});

$searchConfirmAdd.addEventListener("click", () => {
  if (!pendingPlace) return;
  if (pendingPlace.kind === "point") {
    pointCounter++;
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [pendingPlace.lng, pendingPlace.lat] },
      properties: { name: pendingPlace.title, colorId: activeColorId },
    });
  } else {
    lineCounter++;
    features.push({
      type: "Feature",
      geometry: { type: "LineString", coordinates: pendingPlace.lineCoords.slice() },
      properties: { name: pendingPlace.title, colorId: activeColorId },
    });
  }
  // The committed feature now renders at the same spot — drop the dashed preview.
  clearSearchPreview();
  hideSearchConfirm();
  rerender();
  setListExpanded(true);
});

// Clears both the dashed point marker and the dashed line layer used as search previews.
function clearSearchPreview() {
  if (searchMarker) {
    searchMarker.remove();
    searchMarker = null;
  }
  if (searchLineActive) {
    const src = map.getSource(SRC_SEARCH_PREVIEW) as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData({ type: "FeatureCollection", features: [] } as any);
    searchLineActive = false;
  }
}

// Drops the ephemeral dashed ring at the given coord and flies the camera.
// Shared between Enter-to-geocode and suggestion selection so both paths look identical.
function goToPlace(lat: number, lng: number) {
  clearSearchPreview();
  const el = document.createElement("div");
  el.style.cssText =
    "width:1.75rem;height:1.75rem;border:0.156rem dashed #2563eb;background:rgba(37,99,235,0.15);border-radius:50%;box-sizing:border-box;";
  searchMarker = new maplibregl.Marker({ element: el })
    .setLngLat([lng, lat])
    .addTo(map);
  map.flyTo({ center: [lng, lat], zoom: 14 });
}

// Flattens MultiLineString → single LineString by concatenating segments end-to-end.
// MapLibre will draw straight connectors across any disjoint segments — acceptable since
// Nominatim usually returns a single connected way for a named street; the alternative
// (drop all but the longest part) loses real street geometry, which is worse.
function flattenStreetGeometry(g: StreetGeometry): LngLat[] {
  if (g.type === "LineString") return g.coordinates as LngLat[];
  const out: LngLat[] = [];
  for (const seg of g.coordinates) {
    for (const c of seg) out.push(c as LngLat);
  }
  return out;
}

// Renders the street as a dashed-blue preview line and zooms to its bounds.
function goToStreet(coords: LngLat[]) {
  clearSearchPreview();
  if (coords.length < 2) return;
  const src = map.getSource(SRC_SEARCH_PREVIEW) as maplibregl.GeoJSONSource | undefined;
  if (!src) return;
  src.setData({
    type: "FeatureCollection",
    features: [
      { type: "Feature", geometry: { type: "LineString", coordinates: coords }, properties: {} },
    ],
  } as any);
  searchLineActive = true;
  const bounds = new maplibregl.LngLatBounds();
  for (const c of coords) bounds.extend(c);
  map.fitBounds(bounds, { padding: 80, maxZoom: 17, duration: 600 });
}

async function runSearch() {
  const q = $searchInput.value.trim();
  if (!q) return;
  setSearchStatus("Searching...");
  const result = await geocode(q);
  if (!result) {
    setSearchStatus("No results");
    return;
  }
  setSearchStatus("");
  // geocode() returns the full Nominatim display_name; the first comma-segment
  // is the short label (e.g. "Boston Common" from "Boston Common, Boston, MA, USA").
  const title = result.display.split(",")[0].trim() || q;
  if (result.isStreet && result.geometry) {
    const coords = flattenStreetGeometry(result.geometry);
    if (coords.length >= 2) {
      goToStreet(coords);
      showSearchConfirmLine(title, result.lat, result.lng, coords);
      return;
    }
  }
  goToPlace(result.lat, result.lng);
  showSearchConfirmPoint(title, result.lat, result.lng);
}

// === Search suggestions (autocomplete) ===
let suggestItems: SuggestedPlace[] = [];
let suggestActiveIdx = -1;
let suggestDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function renderSuggestions(items: SuggestedPlace[]) {
  suggestItems = items;
  suggestActiveIdx = -1;
  $suggestions.innerHTML = "";
  if (items.length === 0) {
    $suggestions.classList.add("hidden");
    $searchInput.setAttribute("aria-expanded", "false");
    return;
  }
  items.forEach((it, i) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.className =
      "px-3 py-2 cursor-pointer hover:bg-muted border-b border-border last:border-b-0";
    // Street results commit as a LineString — the inline diagonal-line icon flags that
    // ahead of click so users know they're picking a road segment, not a single pin.
    const streetIcon = it.isStreet && it.geometry
      ? `<svg viewBox="0 0 16 16" class="inline-block shrink-0 mr-1.5 -mt-0.5 align-middle" width="12" height="12" aria-label="street"><line x1="2" y1="13" x2="14" y2="3" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 2"/></svg>`
      : "";
    li.innerHTML =
      `<div class="text-sm text-foreground truncate">${streetIcon}${escapeHtml(it.title)}</div>` +
      (it.subtitle
        ? `<div class="text-xs text-muted-foreground">${escapeHtml(it.subtitle)}</div>`
        : "");
    // mousedown fires before the input's blur, so the dropdown doesn't close before the click lands.
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectSuggestion(i);
    });
    $suggestions.appendChild(li);
  });
  $suggestions.classList.remove("hidden");
  $searchInput.setAttribute("aria-expanded", "true");
}

function highlightActive() {
  [...$suggestions.children].forEach((el, i) => {
    el.classList.toggle("bg-muted", i === suggestActiveIdx);
  });
}

function selectSuggestion(idx: number) {
  const it = suggestItems[idx];
  if (!it) return;
  $searchInput.value = it.title;
  setSearchClearVisible(true);
  renderSuggestions([]);
  setSearchStatus("");
  if (it.isStreet && it.geometry) {
    const coords = flattenStreetGeometry(it.geometry);
    if (coords.length >= 2) {
      goToStreet(coords);
      showSearchConfirmLine(it.title, it.lat, it.lng, coords);
      return;
    }
  }
  goToPlace(it.lat, it.lng);
  showSearchConfirmPoint(it.title, it.lat, it.lng);
}

// Swaps the magnifier for a spinning loader while a suggestion request is in flight.
function setSearchLoading(loading: boolean) {
  $searchIcon.classList.toggle("hidden", loading);
  $searchSpinner.classList.toggle("hidden", !loading);
}

function setSearchClearVisible(visible: boolean) {
  $searchClear.classList.toggle("hidden", !visible);
}

$searchClear.addEventListener("click", () => {
  $searchInput.value = "";
  if (suggestDebounceTimer) clearTimeout(suggestDebounceTimer);
  setSearchLoading(false);
  renderSuggestions([]);
  setSearchClearVisible(false);
  setSearchStatus("");
  clearSearchPreview();
  hideSearchConfirm();
  $searchInput.focus();
});

// Current map bounds → Nominatim viewbox, for soft "prefer nearby" ranking.
function currentViewbox(): string {
  const b = map.getBounds();
  return `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
}

// Origin used to rank search suggestions by distance. Defaults to where the
// user is *looking* (map center). If "My location" is active, prefer the
// physical location the user explicitly placed.
function currentSortOrigin(): { lat: number; lng: number } {
  if (myLocationMarker) {
    const { lat, lng } = myLocationMarker.getLngLat();
    return { lat, lng };
  }
  const c = map.getCenter();
  return { lat: c.lat, lng: c.lng };
}

// Returns a copy sorted by ascending distance from `currentSortOrigin()`.
// Copies first so we never mutate arrays held in the geocode cache.
function sortByDistanceFromOrigin(items: SuggestedPlace[]): SuggestedPlace[] {
  const origin = currentSortOrigin();
  return items
    .slice()
    .sort((a, b) => haversineMeters(origin, a) - haversineMeters(origin, b));
}

$searchInput.addEventListener("input", () => {
  const q = $searchInput.value.trim();
  setSearchClearVisible($searchInput.value.length > 0);
  // Clear a lingering "No results" as soon as the user starts editing again.
  if ($searchStatus.textContent === "No results") setSearchStatus("");
  if (suggestDebounceTimer) clearTimeout(suggestDebounceTimer);
  if (q.length < 2) {
    setSearchLoading(false);
    renderSuggestions([]);
    return;
  }
  suggestDebounceTimer = setTimeout(async () => {
    setSearchLoading(true);
    try {
      const items = await suggestGeocode(q, 5, currentViewbox());
      // The user may have kept typing while we awaited; only render if still the same query.
      if ($searchInput.value.trim() !== q) return;
      renderSuggestions(sortByDistanceFromOrigin(items));
    } finally {
      if ($searchInput.value.trim() === q) setSearchLoading(false);
    }
  }, 300);
});

$searchInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" && suggestItems.length) {
    e.preventDefault();
    suggestActiveIdx = (suggestActiveIdx + 1) % suggestItems.length;
    highlightActive();
  } else if (e.key === "ArrowUp" && suggestItems.length) {
    e.preventDefault();
    suggestActiveIdx = (suggestActiveIdx - 1 + suggestItems.length) % suggestItems.length;
    highlightActive();
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (suggestActiveIdx >= 0) selectSuggestion(suggestActiveIdx);
    else runSearch();
  } else if (e.key === "Escape") {
    renderSuggestions([]);
  }
});
