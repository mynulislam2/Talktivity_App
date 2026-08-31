/**
 * Validation utilities for review answer validation (Mobile)
 */

import { doubleMetaphone } from 'double-metaphone';

import type { ReviewItem, ValidationResult } from '@/types/review';

/**
 * Remove filler words and common STT artifacts
 */
function removeFillerWords(text: string): string {
  const fillers = [
    'um',
    'uh',
    'er',
    'ah',
    'like',
    'you know',
    'well',
    'so',
    'actually',
  ];
  let cleaned = text.toLowerCase();
  fillers.forEach((filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });
  return cleaned;
}

/**
 * Normalize contractions to handle STT variations
 * "doesn't" = "does not" = "doesn t" = "doesnt"
 */
function normalizeContractions(text: string): string {
  const contractions: Record<string, string> = {
    "don't": 'do not',
    "doesn't": 'does not',
    "didn't": 'did not',
    "won't": 'will not',
    "can't": 'cannot',
    "couldn't": 'could not',
    "shouldn't": 'should not',
    "wouldn't": 'would not',
    "isn't": 'is not',
    "aren't": 'are not',
    "wasn't": 'was not',
    "weren't": 'were not',
    "haven't": 'have not',
    "hasn't": 'has not',
    "hadn't": 'had not',
    "i'm": 'i am',
    "you're": 'you are',
    "he's": 'he is',
    "she's": 'she is',
    "it's": 'it is',
    "we're": 'we are',
    "they're": 'they are',
    "i've": 'i have',
    "you've": 'you have',
    "we've": 'we have',
    "they've": 'they have',
    "i'll": 'i will',
    "you'll": 'you will',
    "he'll": 'he will',
    "she'll": 'she will',
    "we'll": 'we will',
    "they'll": 'they will',
    "i'd": 'i would',
    "you'd": 'you would',
    "he'd": 'he would',
    "she'd": 'she would',
    "we'd": 'we would',
    "they'd": 'they would',
  };

  let normalized = text.toLowerCase();

  // Replace contractions
  Object.entries(contractions).forEach(([contraction, expanded]) => {
    // Handle with apostrophe: "don't"
    normalized = normalized.replace(
      new RegExp(`\\b${contraction}\\b`, 'gi'),
      expanded
    );
    // Handle without apostrophe: "dont"
    const noApostrophe = contraction.replace(/'/g, '');
    normalized = normalized.replace(
      new RegExp(`\\b${noApostrophe}\\b`, 'gi'),
      expanded
    );
    // Handle with space: "don t"
    const withSpace = contraction.replace(/'/g, ' ');
    normalized = normalized.replace(
      new RegExp(`\\b${withSpace}\\b`, 'gi'),
      expanded
    );
  });

  return normalized;
}

/**
 * Normalize text for comparison (lowercase, remove punctuation, trim, handle STT errors)
 */
export function normalizeText(text: string): string {
  // Remove filler words first
  let normalized = removeFillerWords(text);

  // Normalize contractions
  normalized = normalizeContractions(normalized);

  // Remove punctuation and normalize
  normalized = normalized
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .trim()
    .replace(/\s+/g, ' '); // Normalize whitespace

  // Normalize STT variations ("ok" vs "okay" sound the same)
  const sttVariations: Record<string, string> = {
    ok: 'okay',
    okay: 'okay',
  };
  normalized = normalized
    .split(/\s+/)
    .map((w) => sttVariations[w] || w)
    .join(' ');

  return normalized;
}

/**
 * Fuzzy token match - handles similar words and STT errors
 */
/**
 * Levenshtein edit distance between two raw tokens. Kept separate from
 * `computeLevenshteinSimilarity` (which normalizes whole sentences first) so
 * `fuzzyTokenMatch` can measure single tokens without re-normalizing them.
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Cheap phonetic equality. Two words match if their Double-Metaphone
 * primary or secondary codes overlap. Catches accent-driven STT
 * mishearings ("feeling"/"filling" → both `FLNK`, "v"/"w" swaps,
 * "th"/"d" swaps). Skips words shorter than 3 chars where Metaphone
 * produces too many collisions.
 */
function phoneticTokenMatch(token1: string, token2: string): boolean {
  if (token1.length < 3 || token2.length < 3) return false;
  const [p1, s1] = doubleMetaphone(token1);
  const [p2, s2] = doubleMetaphone(token2);
  if (!p1 || !p2) return false;
  // Compare every pairing — Metaphone returns primary + secondary codes
  // and a phonetic match against either side counts.
  return p1 === p2 || p1 === s2 || s1 === p2 || (s1 !== '' && s1 === s2);
}

/**
 * Fuzzy token match — accepts the token as a match if any of:
 *   1. Exact equality.
 *   2. Length-proportional Levenshtein distance (catches single-vowel
 *      swaps and short consonant slips).
 *   3. Substring containment for long tokens (handles plural / suffix
 *      stripping by the STT, "running" / "run").
 *   4. Identical phonetic code (handles accent-driven mishearings
 *      where edit distance is too high but the word sounds the same).
 *
 * Kept in step with the web implementation (talktivity_frontend
 * Utils/validation.ts) — a learner should not be graded more harshly for
 * having an accent just because they are on a phone.
 */
function fuzzyTokenMatch(token1: string, token2: string): boolean {
  if (token1 === token2) return true;

  const len1 = token1.length;
  const len2 = token2.length;
  // Reject obvious length mismatches early.
  if (Math.abs(len1 - len2) > 3) {
    // Long words can still phonetically match even if lengths drift.
    return phoneticTokenMatch(token1, token2);
  }

  const maxLen = Math.max(len1, len2);
  // Length-proportional edit-distance budget:
  //   1-2 chars  → exact only (short words are too ambiguous)
  //   3-4 chars  → 1 edit
  //   5+ chars   → 2 edits
  //   8+ chars   → 2 edits OR substring containment
  let allowedDistance: number;
  if (maxLen <= 2) allowedDistance = 0;
  else if (maxLen <= 4) allowedDistance = 1;
  else allowedDistance = 2;

  if (allowedDistance > 0 && levenshteinDistance(token1, token2) <= allowedDistance) {
    return true;
  }

  if (maxLen >= 8 && (token1.includes(token2) || token2.includes(token1))) {
    return true;
  }

  // Phonetic fallback last — the most generous lane, but still narrow
  // enough that genuinely different words don't slip through.
  return phoneticTokenMatch(token1, token2);
}

/**
 * Compute token match score between two texts (with fuzzy matching)
 */
function computeTokenMatch(userText: string, targetText: string): number {
  const userNormalized = normalizeText(userText);
  const targetNormalized = normalizeText(targetText);

  const userTokens = userNormalized.split(/\s+/).filter((t) => t.length > 0);
  const targetTokens = targetNormalized
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (targetTokens.length === 0) return 0;

  let exactMatches = 0;
  let fuzzyMatches = 0;

  for (const targetToken of targetTokens) {
    if (userTokens.includes(targetToken)) {
      exactMatches++;
    } else {
      // Try fuzzy matching
      const hasFuzzyMatch = userTokens.some((userToken) =>
        fuzzyTokenMatch(userToken, targetToken)
      );
      if (hasFuzzyMatch) {
        fuzzyMatches++;
      }
    }
  }

  // Exact matches count fully, fuzzy matches count as 0.85 — same weighting
  // as web, so the two platforms score an identical answer identically.
  const totalMatches = exactMatches + fuzzyMatches * 0.85;
  return totalMatches / targetTokens.length;
}

/**
 * Compute Levenshtein distance similarity
 */
function computeLevenshteinSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (s1 === s2) return 1.0;
  if (s1.length === 0) return 0.0;
  if (s2.length === 0) return 0.0;

  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - distance / maxLen;
}

/**
 * Check if all required keywords are present
 */
function checkKeywords(userText: string, keywords: string[]): boolean {
  const normalizedUser = normalizeText(userText);
  const normalizedKeywords = keywords.map((k) => normalizeText(k));

  // Check if at least 80% of keywords are present
  const foundKeywords = normalizedKeywords.filter((keyword) =>
    normalizedUser.includes(keyword)
  );

  return foundKeywords.length >= Math.ceil(normalizedKeywords.length * 0.8);
}

/**
 * Compute multi-metric similarity score
 */
function computeSimilarity(
  userAnswer: string,
  corrected: string,
  keywords: string[]
): number {
  const tokenScore = computeTokenMatch(userAnswer, corrected);
  const levenshteinScore = computeLevenshteinSimilarity(userAnswer, corrected);
  const keywordScore = checkKeywords(userAnswer, keywords) ? 1.0 : 0.5;

  // Weighted average: 40% token match, 40% Levenshtein, 20% keywords
  const similarity =
    tokenScore * 0.4 + levenshteinScore * 0.4 + keywordScore * 0.2;

  return Math.min(1.0, Math.max(0.0, similarity));
}

/**
 * Validate user's answer against review item
 */
export function validateAnswer(
  userAnswer: string,
  reviewItem: ReviewItem
): ValidationResult {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return {
      isValid: false,
      similarity: 0,
      feedback: 'Please say something.',
    };
  }

  const similarity = computeSimilarity(
    userAnswer,
    reviewItem.corrected,
    reviewItem.keywords
  );

  // Use a slightly lower threshold to account for STT errors
  // If similarity is very close (within 5%), be more lenient
  const baseThreshold = reviewItem.similarityThreshold || 0.85;
  const lenientThreshold = Math.max(0.75, baseThreshold - 0.05); // Lower by 5% but not below 0.75

  // If similarity is close to threshold, check if it's likely an STT error
  let isValid = similarity >= baseThreshold;

  if (!isValid && similarity >= lenientThreshold) {
    // Additional check: if most tokens match, accept it (likely STT error)
    // Recompute token score for lenient check
    const userNormalized = normalizeText(userAnswer);
    const targetNormalized = normalizeText(reviewItem.corrected);
    const userTokens = userNormalized.split(/\s+/).filter((t) => t.length > 0);
    const targetTokens = targetNormalized
      .split(/\s+/)
      .filter((t) => t.length > 0);

    if (targetTokens.length > 0) {
      const matchingTokens = targetTokens.filter((t) =>
        userTokens.includes(t)
      ).length;
      const tokenScore = matchingTokens / targetTokens.length;

      if (tokenScore >= 0.8) {
        isValid = true;
        console.log(
          `[Validation] Accepted with lenient threshold: similarity=${similarity.toFixed(
            2
          )}, tokenScore=${tokenScore.toFixed(2)}`
        );
      }
    }
  }

  return {
    isValid,
    similarity,
    feedback: isValid
      ? 'Great job! That matches the correct version.'
      : `Your answer is close but needs some adjustments. Similarity: ${Math.round(
          similarity * 100
        )}%`,
  };
}
