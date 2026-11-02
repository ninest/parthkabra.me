import {
  splitIntoSentences,
  type SentenceSpan,
} from "./sentence";
import { tokenizeWords, type WordFinderOptions, type WordToken } from "./words";

export type { SentenceSpan } from "./sentence";
export type { WordFinderOptions, WordToken } from "./words";

export type WordOccurrence = {
  text: string;
  start: number;
  end: number;
  sentenceIndex: number | null;
};

export type DuplicateWord = {
  word: string;
  count: number;
  variants: string[];
  occurrences: WordOccurrence[];
};

export type SentenceDuplicateWords = SentenceSpan & {
  duplicates: DuplicateWord[];
};

function duplicateSort(a: DuplicateWord, b: DuplicateWord): number {
  if (b.count !== a.count) return b.count - a.count;
  return a.word.localeCompare(b.word);
}

/**
 * Return words that appear more than once, sorted by count then alphabetically.
 */
export function findDuplicateWords(text: string, options: WordFinderOptions = {}): DuplicateWord[] {
  const groups = new Map<string, DuplicateWord>();

  for (const token of tokenizeWords(text, options)) {
    const existing = groups.get(token.countKey);
    const occurrence: WordOccurrence = {
      text: token.text,
      start: token.start,
      end: token.end,
      sentenceIndex: token.sentenceIndex,
    };

    if (existing) {
      existing.count += 1;
      existing.occurrences.push(occurrence);
      if (!existing.variants.includes(token.text)) existing.variants.push(token.text);
      continue;
    }

    groups.set(token.countKey, {
      word: token.countKey,
      count: 1,
      variants: [token.text],
      occurrences: [occurrence],
    });
  }

  return Array.from(groups.values())
    .filter((duplicate) => duplicate.count > 1)
    .sort(duplicateSort);
}

/**
 * Return duplicate words independently for each sentence in the input.
 */
export function findDuplicateWordsBySentence(
  text: string,
  options: WordFinderOptions = {},
): SentenceDuplicateWords[] {
  return splitIntoSentences(text).map((sentence) => ({
    ...sentence,
    duplicates: findDuplicateWords(sentence.text, options).map((duplicate) => ({
      ...duplicate,
      occurrences: duplicate.occurrences.map((occurrence) => ({
        ...occurrence,
        start: occurrence.start + sentence.start,
        end: occurrence.end + sentence.start,
        sentenceIndex: sentence.index,
      })),
    })),
  }));
}
