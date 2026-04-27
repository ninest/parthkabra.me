import { sentenceIndexForOffset, splitIntoSentences } from "./sentence";
import { stopWords } from "../utils/language";

export type WordFinderOptions = {
  caseSensitive?: boolean;
  includeNumbers?: boolean;
  ignoreStopWords?: boolean;
  minWordLength?: number;
};

export type WordToken = {
  text: string;
  normalized: string;
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

/**
 * Normalize a word for comparison while preserving contractions and hyphenated words.
 */
export function normalizeWord(word: string, options: WordFinderOptions = {}): string {
  const resolvedOptions = withDefaults(options);
  const normalized = word.normalize("NFKC").replace(/\u2019/g, "'");
  return resolvedOptions.caseSensitive ? normalized : normalized.toLocaleLowerCase();
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
    if (!shouldKeepWord(normalized, resolvedOptions)) continue;

    tokens.push({
      text: word,
      normalized,
      start: match.index,
      end: match.index + word.length,
      sentenceIndex: sentenceIndexForOffset(sentences, match.index),
    });
  }

  return tokens;
}
