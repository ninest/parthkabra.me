/**
 * Shorten `text` to at most `max` characters. When shortened, ends with `…`.
 *
 * Example: `truncate("hello world", 8)` → `"hello w…"`
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Return the first sentence of plain text — everything up to (and including)
 * the first `.`, `!`, or `?`. Returns the whole input trimmed when no
 * sentence-ending punctuation is present. Use on text that has already been
 * stripped of markdown.
 *
 * Example: `firstSentence("Hi there. Second bit.")` → `"Hi there."`
 */
export function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : text).trim();
}
