/**
 * Review types for the interactive review flow (Mobile)
 */

export interface ReviewItem {
  cardId: string;
  type: 'grammar' | 'vocabulary' | 'sentence';
  original: string; // "YOU SAID" text
  corrected: string; // "BETTER WAY" text
  keywords: string[];
  similarityThreshold: number; // default 0.85
  explanation: string;
}

export interface ReviewItemsResponse {
  success: boolean;
  reviewItems: ReviewItem[]; // Always exactly 5 items
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  similarity: number;
  feedback?: string;
  userAnswer?: string;
  corrected?: string;
  original?: string;
}
