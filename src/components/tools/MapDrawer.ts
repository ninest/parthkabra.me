import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { inputClasses } from "../input";
import { reverseGeocode, geocode, suggestGeocode, type SuggestedPlace } from "../../utils/geolocation";
import {
  PALETTE,
  SRC_DRAWINGS,
  SRC_PREVIEW,
  getFeatureCoord,
  createDrawingSourcesAndLayers,
  type DrawingFeature,
  type FeatureCollection,
  type FeatureProps,
  type LngLat,
} from "../../utils/map-drawing";
import {
  readUrlState,
  writeDrawingsParam,
  writeLabelsParam,
} from "../../utils/map-drawing-url";

// === DOM refs ===
const $mapEl = document.getElementById("mapdrawer-map")!;
const $modePoint = document.getElementById("md-mode-point") as HTMLButtonElement;
const $modeLine = document.getElementById("md-mode-line") as HTMLButtonElement;
const $exitMode = document.getElementById("md-exit-mode") as HTMLButtonElement;
const $finishLine = document.getElementById("md-finish-line") as HTMLButtonElement;
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
const $detailDelete = document.getElementById("md-detail-delete") as HTMLButtonElement;
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
let linePoints: LngLat[] = [];
let myLocationMarker: maplibregl.Marker | null = null;
let searchMarker: maplibregl.Marker | null = null;
// Populated while an "Add point: {title}" confirm panel is open under the search bar.
// Cleared on commit, cancel, clear-search, or Clear all.
let pendingPlace: { title: string; lat: number; lng: number } | null = null;
let activeColorIdx = 0;
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
  return linePoints.length === 0 ? "lineEmpty" : "lineDrawing";
}

function updateHint() {
  const collapsed = $controls.getAttribute("data-collapsed") === "true";
  const key = collapsed ? null : currentHintKey();
  $hint.textContent = key ? HINTS[key] : "";
  $hint.classList.toggle("hidden", !key);
}

// === Collapse toggle ===
// Sets data-collapsed on the bar; CSS above hides every child except the caret itself
// and rotates the caret icon 180deg. Persisted in localStorage so "view-only" survives reloads.
const COLLAPSE_STORAGE_KEY = "md-controls-collapsed";
function applyControlsCollapsed(collapsed: boolean) {
  if (collapsed) $controls.setAttribute("data-collapsed", "true");
  else $controls.removeAttribute("data-collapsed");
  $collapseToggle.setAttribute("aria-expanded", String(!collapsed));
  $collapseToggle.setAttribute("aria-label", collapsed ? "Show controls" : "Hide controls");
  updateHint();
}
applyControlsCollapsed(localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
$collapseToggle.addEventListener("click", () => {
  const next = $controls.getAttribute("data-collapsed") !== "true";
  applyControlsCollapsed(next);
  localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
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
  PALETTE.forEach(([label, hex], i) => {
    const showActive = mode !== null && i === activeColorIdx;
    const btn = makeSwatchButton(hex, `Use ${label}`, showActive);
    btn.addEventListener("click", () => setActiveColor(i));
    $swatches.appendChild(btn);
  });
}

// Set the active color: updates the palette UI and the preview layers on the map.
function setActiveColor(idx: number) {
  activeColorIdx = idx;
  renderSwatches();
  const hex = PALETTE[idx][1];
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

    const chip = makeSwatchButton(PALETTE[f.properties.colorIdx][1], "Edit feature", false);
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
  PALETTE.forEach(([label, hex], i) => {
    const btn = makeSwatchButton(hex, label, i === detailFeature!.properties.colorIdx);
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!detailFeature) return;
      detailFeature.properties.colorIdx = i;
      rerender();
    });
    $detailSwatches.appendChild(btn);
  });
}

// Mirrors the per-row applyAddressState (now removed): paints the address text, toggles
// the Edit/Copy actions, shows "Resolving..." while a reverse-geocode is in flight.
function applyDetailAddressState() {
  if (!detailFeature) return;
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

// Read detailFeature → write every detail DOM element. Called on open and on every rerender
// while the detail is visible, so external mutations (color/name/coord changes) stay reflected.
function populateDetail() {
  if (!detailFeature) return;
  $detailName.value = detailFeature.properties.name;
  renderDetailSwatches();
  $detailLabelToggle.textContent = detailFeature.properties.hideLabel ? "Show label" : "Hide label";
  // Edit only makes sense for Points today (single coord) — hide for lines.
  $detailEditAddress.classList.toggle("hidden", detailFeature.geometry.type !== "Point");
  applyDetailAddressState();
  ensureAddress(detailFeature, applyDetailAddressState, true);
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
  if (!detailFeature) return;
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
        renderEditSuggestions(items);
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

// === URL state (wraps utils/map-drawing-url) ===

// Parse every drawer-owned param up front (features, counters, labels flag) so map
// init can fit bounds and labels apply on the first frame — one read, one source of truth.
const initialUrlState = readUrlState(new URLSearchParams(window.location.search));
features = initialUrlState.features;
pointCounter = initialUrlState.pointCounter;
lineCounter = initialUrlState.lineCounter;

// Push `features` into the URL's drawings params.
function writeUrl() {
  const url = new URL(window.location.href);
  writeDrawingsParam(url, features);
  history.replaceState(null, "", url.toString());
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
  const props: FeatureProps = { name: "", colorIdx: activeColorIdx };
  if (linePoints.length === 0) {
    return { type: "FeatureCollection", features: [] };
  }
  if (linePoints.length === 1) {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: linePoints[0] },
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
        geometry: { type: "LineString", coordinates: linePoints },
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
  const preview = map.getSource(SRC_PREVIEW) as maplibregl.GeoJSONSource | undefined;
  if (preview) preview.setData(previewCollection() as any);
  $finishLine.classList.toggle("hidden", !(mode === "line" && linePoints.length >= 2));
  renderList();
  if (detailFeature) {
    if (features.indexOf(detailFeature) === -1) closeDetail();
    else populateDetail();
  }
  writeUrl();
}

// === Map load: add sources + layers ===
map.on("load", () => {
  applyDarkMode();
  createDrawingSourcesAndLayers(map, {
    initialDrawings: collection(),
    initialPreview: previewCollection(),
    initialPreviewHex: PALETTE[activeColorIdx][1],
  });
  renderSwatches();
  renderList();
  applyLabelsVisible();
});

// === Mode (point / line) ===

// Apply primary (active) vs secondary (inactive) styling to a mode button.
function styleButton(btn: HTMLButtonElement, active: boolean) {
  btn.classList.toggle("bg-primary", active);
  btn.classList.toggle("text-primary-foreground", active);
  btn.classList.toggle("bg-muted", !active);
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
    linePoints = [];
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

// Commit the in-progress line to features.
function finishLine() {
  if (linePoints.length < 2) return;
  lineCounter++;
  features.push({
    type: "Feature",
    geometry: { type: "LineString", coordinates: linePoints },
    properties: { name: `Line ${lineCounter}`, colorIdx: activeColorIdx },
  });
  linePoints = [];
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
      properties: { name: `Point ${pointCounter}`, colorIdx: activeColorIdx },
    });
    rerender();
    setMode(null);
    setListExpanded(true);
  } else if (mode === "line") {
    linePoints.push(coord);
    rerender();
    updateHint();
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
  linePoints = [];
  pointCounter = 0;
  lineCounter = 0;
  if (myLocationMarker) {
    myLocationMarker.remove();
    myLocationMarker = null;
  }
  if (searchMarker) {
    searchMarker.remove();
    searchMarker = null;
  }
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
const CUSTOM_LABEL_LAYER_IDS = new Set(["drawings-point-labels", "drawings-line-labels"]);
let labelsVisible = initialUrlState.labelsVisible;

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
  const url = new URL(window.location.href);
  writeLabelsParam(url, labelsVisible);
  history.replaceState(null, "", url.toString());
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

// Show the inline "Add point: {title}" confirmation panel under the search bar.
// Stores the pending target so the ✓ button can commit without re-geocoding.
function showSearchConfirm(title: string, lat: number, lng: number) {
  pendingPlace = { title, lat, lng };
  $searchConfirmText.textContent = `Add point: ${title}`;
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
  pointCounter++;
  features.push({
    type: "Feature",
    geometry: { type: "Point", coordinates: [pendingPlace.lng, pendingPlace.lat] },
    properties: { name: pendingPlace.title, colorIdx: activeColorIdx },
  });
  // The committed point now renders at the same spot — drop the dashed preview.
  if (searchMarker) {
    searchMarker.remove();
    searchMarker = null;
  }
  hideSearchConfirm();
  rerender();
  setListExpanded(true);
});

// Drops the ephemeral dashed ring at the given coord and flies the camera.
// Shared between Enter-to-geocode and suggestion selection so both paths look identical.
function goToPlace(lat: number, lng: number) {
  if (searchMarker) searchMarker.remove();
  const el = document.createElement("div");
  el.style.cssText =
    "width:1.75rem;height:1.75rem;border:0.156rem dashed #2563eb;background:rgba(37,99,235,0.15);border-radius:50%;box-sizing:border-box;";
  searchMarker = new maplibregl.Marker({ element: el })
    .setLngLat([lng, lat])
    .addTo(map);
  map.flyTo({ center: [lng, lat], zoom: 14 });
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
  goToPlace(result.lat, result.lng);
  // geocode() returns the full Nominatim display_name; the first comma-segment
  // is the short label (e.g. "Boston Common" from "Boston Common, Boston, MA, USA").
  const title = result.display.split(",")[0].trim() || q;
  showSearchConfirm(title, result.lat, result.lng);
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
    li.innerHTML =
      `<div class="text-sm text-foreground truncate">${escapeHtml(it.title)}</div>` +
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
  goToPlace(it.lat, it.lng);
  showSearchConfirm(it.title, it.lat, it.lng);
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
  hideSearchConfirm();
  $searchInput.focus();
});

// Current map bounds → Nominatim viewbox, for soft "prefer nearby" ranking.
function currentViewbox(): string {
  const b = map.getBounds();
  return `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
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
      renderSuggestions(items);
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
