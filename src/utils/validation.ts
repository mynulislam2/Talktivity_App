/**
 * Validation utilities for review answer validation (Mobile)
 */

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
function fuzzyTokenMatch(token1: string, token2: string): boolean {
  if (token1 === token2) return true;

  // Check if tokens are very similar (1-2 character difference)
  const len1 = token1.length;
  const len2 = token2.length;
  if (Math.abs(len1 - len2) > 2) return false;

  // Simple edit distance check for short tokens
  if (len1 <= 4 && len2 <= 4) {
    let diff = 0;
    const minLen = Math.min(len1, len2);
    for (let i = 0; i < minLen; i++) {
      if (token1[i] !== token2[i]) diff++;
    }
    diff += Math.abs(len1 - len2);
    return diff <= 1; // Allow 1 character difference for short words
  }

  // For longer tokens, check if one contains the other (handles partial matches)
  if (len1 >= 5 && len2 >= 5) {
    if (token1.includes(token2) || token2.includes(token1)) return true;
  }

  return false;
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

  // Exact matches count fully, fuzzy matches count as 0.7
  const totalMatches = exactMatches + fuzzyMatches * 0.7;
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

  const matrix: number[][] = [];
  const len1 = s1.length;
  const len2 = s2.length;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
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
