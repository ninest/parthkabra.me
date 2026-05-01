export type TextareaHighlightRange = {
  start: number;
  end: number;
};

type HighlightOptions = {
  markClass?: string;
};

const DEFAULT_MARK_CLASS = "rounded-sm bg-amber-200/80 text-transparent dark:bg-amber-500/35";

function escapeHtml(text: string) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function normalizeRanges(text: string, ranges: TextareaHighlightRange[]) {
  return ranges
    .map((range) => ({
      start: Math.max(0, Math.min(text.length, range.start)),
      end: Math.max(0, Math.min(text.length, range.end)),
    }))
    .filter((range) => range.end > range.start)
    .toSorted((a, b) => a.start - b.start || a.end - b.end);
}

/**
 * Build overlay markup for textarea highlights while preserving original text
 * offsets and whitespace.
 */
export function renderTextareaHighlights(
  text: string,
  ranges: TextareaHighlightRange[],
  options: HighlightOptions = {},
) {
  const markClass = options.markClass ?? DEFAULT_MARK_CLASS;
  const normalizedRanges = normalizeRanges(text, ranges);
  let cursor = 0;
  let html = "";

  for (const range of normalizedRanges) {
    if (range.start < cursor) continue;
    html += escapeHtml(text.slice(cursor, range.start));
    html += `<mark class="${markClass}">${escapeHtml(text.slice(range.start, range.end))}</mark>`;
    cursor = range.end;
  }

  html += escapeHtml(text.slice(cursor));
  return html;
}

/**
 * Keep the non-interactive highlight layer aligned with the textarea scroll.
 */
export function syncTextareaHighlights(
  $input: HTMLTextAreaElement | null,
  $highlights: HTMLElement | null,
) {
  if (!$input || !$highlights) return;
  $highlights.scrollTop = $input.scrollTop;
  $highlights.scrollLeft = $input.scrollLeft;
}

/**
 * Render highlight ranges into a TextareaWithHighlights overlay.
 */
export function setTextareaHighlights(
  $input: HTMLTextAreaElement | null,
  $highlights: HTMLElement | null,
  ranges: TextareaHighlightRange[],
  options: HighlightOptions = {},
) {
  if (!$input || !$highlights) return;
  const $content = $highlights.querySelector<HTMLElement>("[data-textarea-highlight-content]");
  if (!$content) return;
  $content.innerHTML = renderTextareaHighlights($input.value, ranges, options);
  syncTextareaHighlights($input, $highlights);
}
