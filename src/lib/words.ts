import { sentenceIndexForOffset, splitIntoSentences } from "./sentence";
import { stopWords } from "../utils/language";

export type WordFinderOptions = {
  caseSensitive?: boolean;
  includeNumbers?: boolean;
  ignoreStopWords?: boolean;
  minWordLength?: number;
  wordForm?: "exact" | "simple";
};

export type WordToken = {
  text: string;
  normalized: string;
  countKey: string;
  start: number;
  end: number;
  sentenceIndex: number | null;
};

const WORD_PATTERN = /[\p{L}\p{N}]+(?:['\u2019-][\p{L}\p{N}]+)*/gu;
const PURE_NUMBER_PATTERN = /^\p{N}+$/u;

const DEFAULT_OPTIONS: Required<WordFinderOptions> = {
  caseSensitive: false,
  includeNumbers: false,
  ignoreStopWords: false,
  minWordLength: 1,
  wordForm: "exact",
};

function withDefaults(options: WordFinderOptions = {}): Required<WordFinderOptions> {
  return { ...DEFAULT_OPTIONS, ...options };
}

function shouldKeepWord(word: string, options: Required<WordFinderOptions>): boolean {
  if (word.length < options.minWordLength) return false;
  if (!options.includeNumbers && PURE_NUMBER_PATTERN.test(word)) return false;
  if (options.ignoreStopWords && stopWords.has(word.toLocaleLowerCase())) return false;
  return true;
}

function trimSuffix(word: string, suffix: string): string {
  return word.slice(0, -suffix.length);
}

function toSimpleNounForm(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return trimSuffix(word, "ies") + "y";
  if (/(ches|shes|xes|zes|sses)$/u.test(word)) return trimSuffix(word, "es");
  if (word.endsWith("s") && !word.endsWith("ss")) return trimSuffix(word, "s");
  return word;
}

function toSimpleVerbForm(word: string): string {
  if (word.length <= 4) return word;

  if (word.endsWith("ying") && word.length > 5) return trimSuffix(word, "ing") + "ie";
  if (word.endsWith("ing") && word.length > 5) {
    const base = trimSuffix(word, "ing");
    if (base.endsWith("iz")) return base + "e";
    if (/([bcdfghjklmnpqrstvwxyz])\1$/u.test(base)) return base.slice(0, -1);
    return base;
  }

  if (word.endsWith("ied") && word.length > 4) return trimSuffix(word, "ied") + "y";
  if (word.endsWith("ed")) {
    const base = trimSuffix(word, "ed");
    if (base.endsWith("iz")) return base + "e";
    if (/([bcdfghjklmnpqrstvwxyz])\1$/u.test(base)) return base.slice(0, -1);
    return base;
  }

  return word;
}

/**
 * Convert a word to a conservative count key for grouping simple inflections.
 */
export function toSimpleWordForm(word: string): string {
  return toSimpleNounForm(toSimpleVerbForm(word));
}

/**
 * Normalize a word for comparison while preserving contractions and hyphenated words.
 */
export function normalizeWord(word: string, options: WordFinderOptions = {}): string {
  const resolvedOptions = withDefaults(options);
  const normalized = word.normalize("NFKC").replace(/\u2019/g, "'");
  return resolvedOptions.caseSensitive ? normalized : normalized.toLocaleLowerCase();
}

/**
 * Return the key used for duplicate counting.
 */
export function getWordCountKey(word: string, options: WordFinderOptions = {}): string {
  const resolvedOptions = withDefaults(options);
  const normalized = normalizeWord(word, resolvedOptions);
  return resolvedOptions.wordForm === "simple" ? toSimpleWordForm(normalized) : normalized;
}

/**
 * Extract normalized word tokens from text and keep their original offsets.
 */
export function tokenizeWords(text: string, options: WordFinderOptions = {}): WordToken[] {
  const resolvedOptions = withDefaults(options);
  const sentences = splitIntoSentences(text);
  const tokens: WordToken[] = [];
  let match: RegExpExecArray | null;

  WORD_PATTERN.lastIndex = 0;
  while ((match = WORD_PATTERN.exec(text)) !== null) {
    const word = match[0];
    const normalized = normalizeWord(word, resolvedOptions);
    const countKey = getWordCountKey(word, resolvedOptions);
    if (!shouldKeepWord(normalized, resolvedOptions)) continue;

    tokens.push({
      text: word,
      normalized,
      countKey,
      start: match.index,
      end: match.index + word.length,
      sentenceIndex: sentenceIndexForOffset(sentences, match.index),
    });
  }

  return tokens;
}
