import { sentenceIndexForOffset, splitIntoSentences } from "./sentence";
import { stopWords } from "../utils/language";

export type WordFinderOptions = {
  caseSensitive?: boolean;
  includeNumbers?: boolean;
  ignoreStopWords?: boolean;
  minWordLength?: number;
  lemmatize?: (normalizedWord: string) => string;
};

export type WordToken = {
  text: string;
  normalized: string;
  countKey: string;
  start: number;
  end: number;
  sentenceIndex: number | null;
};

const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
const PURE_NUMBER_PATTERN = /^\p{N}+$/u;

const DEFAULT_OPTIONS: Required<Omit<WordFinderOptions, "lemmatize">> & Pick<WordFinderOptions, "lemmatize"> = {
  caseSensitive: false,
  includeNumbers: false,
  ignoreStopWords: false,
  minWordLength: 1,
  lemmatize: undefined,
};

type ResolvedOptions = typeof DEFAULT_OPTIONS;

function withDefaults(options: WordFinderOptions = {}): ResolvedOptions {
  return { ...DEFAULT_OPTIONS, ...options };
}

function shouldKeepWord(word: string, options: ResolvedOptions): boolean {
  if (word.length < options.minWordLength) return false;
  if (!options.includeNumbers && PURE_NUMBER_PATTERN.test(word)) return false;
  if (options.ignoreStopWords && stopWords.has(word.toLocaleLowerCase())) return false;
  return true;
}

/**
 * Normalize a word for comparison while preserving contractions and hyphenated words.
 */
export function normalizeWord(word: string, options: WordFinderOptions = {}): string {
  const resolvedOptions = withDefaults(options);
  const normalized = word.normalize("NFKC").replace(/’/g, "'");
  return resolvedOptions.caseSensitive ? normalized : normalized.toLocaleLowerCase();
}

/**
 * Return the key used for duplicate counting. Uses the supplied lemmatizer if any,
 * otherwise falls back to the normalized surface form.
 */
export function getWordCountKey(word: string, options: WordFinderOptions = {}): string {
  const resolvedOptions = withDefaults(options);
  const normalized = normalizeWord(word, resolvedOptions);
  return resolvedOptions.lemmatize ? resolvedOptions.lemmatize(normalized) : normalized;
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
