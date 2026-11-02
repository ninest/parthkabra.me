export type SentenceSpan = {
  index: number;
  text: string;
  start: number;
  end: number;
};

const SENTENCE_END_PATTERN = /[.!?]+(?:["')\]}]+)?(?=\s+|$)/gu;

function isWhitespace(char: string): boolean {
  return /\s/u.test(char);
}

function toTrimmedSentence(text: string, start: number, end: number, index: number): SentenceSpan | null {
  let trimmedStart = start;
  let trimmedEnd = end;

  while (trimmedStart < trimmedEnd && isWhitespace(text[trimmedStart])) trimmedStart += 1;
  while (trimmedEnd > trimmedStart && isWhitespace(text[trimmedEnd - 1])) trimmedEnd -= 1;

  if (trimmedStart === trimmedEnd) return null;

  return {
    index,
    text: text.slice(trimmedStart, trimmedEnd),
    start: trimmedStart,
    end: trimmedEnd,
  };
}

/**
 * Split plain text into sentence spans while preserving source offsets.
 */
export function splitIntoSentences(text: string): SentenceSpan[] {
  const sentences: SentenceSpan[] = [];
  let sentenceStart = 0;
  let match: RegExpExecArray | null;

  SENTENCE_END_PATTERN.lastIndex = 0;
  while ((match = SENTENCE_END_PATTERN.exec(text)) !== null) {
    const sentenceEnd = match.index + match[0].length;
    const sentence = toTrimmedSentence(text, sentenceStart, sentenceEnd, sentences.length);
    if (sentence) sentences.push(sentence);
    sentenceStart = sentenceEnd;
  }

  const finalSentence = toTrimmedSentence(text, sentenceStart, text.length, sentences.length);
  if (finalSentence) sentences.push(finalSentence);

  return sentences;
}

/**
 * Return the containing sentence index for a source offset.
 */
export function sentenceIndexForOffset(sentences: SentenceSpan[], offset: number): number | null {
  const sentence = sentences.find((item) => offset >= item.start && offset < item.end);
  return sentence?.index ?? null;
}
