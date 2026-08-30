/**
 * Mobile answer-validation tests.
 *
 * The mobile port of this scorer had dropped the Double-Metaphone lane the web
 * version uses, so an accented learner was graded more harshly on a phone than
 * in the browser for the same spoken answer. These pin the phonetic lane down
 * and keep the two platforms in step.
 *
 * NOTE: since the review flow moved to server-side audio evaluation, nothing in
 * the app calls `validateAnswer` any more. It is kept (and kept correct) as the
 * offline/degraded-mode scorer. The limitations documented at the bottom of this
 * file are exactly why judging moved to the server.
 */

import { normalizeText, validateAnswer } from '../validation';

import type { ReviewItem } from '@/types/review';

const reviewItem = (overrides: Partial<ReviewItem> = {}): ReviewItem =>
  ({
    cardId: 'card-1',
    type: 'grammar',
    original: 'I want to buy car tomorrow',
    corrected: 'I want to buy a car tomorrow',
    explanation: 'Use an article before a singular countable noun',
    keywords: ['want', 'buy', 'car', 'tomorrow'],
    similarityThreshold: 0.85,
    ...overrides,
  }) as ReviewItem;

describe('normalizeText', () => {
  test('strips punctuation and casing so they cannot affect a score', () => {
    expect(normalizeText('I am ready.')).toBe(normalizeText('i am ready'));
    expect(normalizeText('Well, I think so!')).toBe(normalizeText('I think so'));
  });

  test('expands contractions the STT may have dropped apostrophes from', () => {
    expect(normalizeText("I don't know")).toBe(normalizeText('I dont know'));
    expect(normalizeText("I don't know")).toBe(normalizeText('I do not know'));
  });
});

describe('validateAnswer', () => {
  test('accepts the exact corrected sentence', () => {
    expect(validateAnswer('I want to buy a car tomorrow', reviewItem()).isValid).toBe(true);
  });

  test('rejects an empty answer', () => {
    expect(validateAnswer('', reviewItem()).isValid).toBe(false);
    expect(validateAnswer('   ', reviewItem()).isValid).toBe(false);
  });

  test('ignores punctuation and casing differences', () => {
    expect(validateAnswer('i want to buy a car tomorrow.', reviewItem()).isValid).toBe(true);
  });

  test('tolerates filler words the learner said out loud', () => {
    expect(validateAnswer('um, I want to buy a car tomorrow', reviewItem()).isValid).toBe(true);
  });

  test('rejects a genuinely different sentence', () => {
    expect(validateAnswer('I would like some coffee please', reviewItem()).isValid).toBe(false);
  });

  test('rejects a missing-verb-inflection answer', () => {
    const item = reviewItem({
      original: 'He go to school',
      corrected: 'He goes to school',
      keywords: ['goes', 'school'],
    });
    expect(validateAnswer('He go to school', item).isValid).toBe(false);
  });
});

describe('phonetic tolerance for accent-driven mishearings', () => {
  // Each of these scored BELOW threshold before the Double-Metaphone lane was
  // restored and passes with it — verified by running this file against the
  // pre-fix implementation. "through"/"thru" has an edit distance of 3, past
  // the 2-edit budget, and neither contains the other, so only a phonetic-code
  // match can rescue it. Short sentences are used deliberately: the misheard
  // token has to carry enough weight for the lane to be decisive.
  test.each([
    ['Go through it', 'Go thru it', ['go', 'it']],
    ['Look through this', 'Look thru this', ['look', 'this']],
    ['I went through it', 'I went thru it', ['went', 'it']],
  ])('accepts "%s" spoken as "%s" (phonetic lane is decisive)', (corrected, spoken, keywords) => {
    const item = reviewItem({ original: spoken, corrected, keywords: keywords as string[] });
    expect(validateAnswer(spoken as string, item).isValid).toBe(true);
  });

  test('accepts a th/d substitution, a common accent pattern', () => {
    const item = reviewItem({
      original: 'Put it dere',
      corrected: 'Put it there',
      keywords: ['put', 'it'],
    });
    expect(validateAnswer('Put it dere', item).isValid).toBe(true);
  });

  test('accepts a vowel-confusion mishearing on a non-keyword', () => {
    const item = reviewItem({
      original: 'She is filling better today',
      corrected: 'She is feeling better today',
      keywords: ['better', 'today'],
    });
    expect(validateAnswer('She is filling better today', item).isValid).toBe(true);
  });

  test('does not let the phonetic lane accept an unrelated word', () => {
    const item = reviewItem({
      original: 'I need a pen',
      corrected: 'I need a pencil',
      keywords: ['need', 'pencil'],
    });
    expect(validateAnswer('I need a helicopter', item).isValid).toBe(false);
  });
});

/**
 * Known limitations of this text scorer, asserted so they are visible rather
 * than discovered in production. Both also apply to the web implementation —
 * they are inherent to scoring a transcript by string distance, and are the
 * reason correctness now lives server-side against the actual audio.
 */
describe('known limitations of transcript-based scoring', () => {
  test('LIMITATION: omitting a short function word still passes', () => {
    // The card is specifically correcting the missing article "a", yet
    // dropping it costs only one token out of seven and the answer scores
    // 0.91 — above the 0.85 threshold. The learner repeats the exact mistake
    // and is told they got it right.
    const result = validateAnswer('I want to buy car tomorrow', reviewItem());
    expect(result.isValid).toBe(true);
    expect(result.similarity).toBeGreaterThan(0.85);
  });

  test('LIMITATION: a keyword mishearing is penalised even when it sounds right', () => {
    // "filling"/"feeling" are phonetically identical, but `checkKeywords` does
    // a literal substring test, so a misheard *keyword* drags the composite
    // below threshold no matter how well the phonetic lane scores it.
    const item = reviewItem({
      original: 'I am filling good',
      corrected: 'I am feeling good',
      keywords: ['feeling', 'good'],
    });
    expect(validateAnswer('I am filling good', item).isValid).toBe(false);
  });
});
