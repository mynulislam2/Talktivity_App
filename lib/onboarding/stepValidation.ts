/**
 * Step-Specific Validation Rules
 * 
 * Contains validation rules specific to each onboarding step.
 * These rules are used by step definitions and validation utilities.
 */

import { UserSelections } from '@/types/onboarding/selections';

/**
 * Step validation rules map
 * Maps step ID to validation function
 */
export const STEP_VALIDATION_RULES: Record<
  number,
  (selections: UserSelections) => boolean
> = {
  // Step 0: Skill to improve
  0: (selections) => selections.skillToImprove !== null && selections.skillToImprove !== '',
  
  // Step 1: Language statement
  1: (selections) => selections.languageStatement !== null && selections.languageStatement !== '',
  
  // Step 2: Industry
  2: (selections) => selections.industry !== null && selections.industry !== '',
  
  // Step 3: Speaking feelings
  3: (selections) => selections.speakingFeelings !== null && selections.speakingFeelings !== '',
  
  // Step 4: Speaking frequency
  4: (selections) => selections.speakingFrequency !== null && selections.speakingFrequency !== '',
  
  // Step 5: Main goal
  5: (selections) => selections.mainGoal !== null && selections.mainGoal !== '',
  
  // Step 6: Gender
  6: (selections) => selections.gender !== null && selections.gender !== '',
  
  // Step 7: Current learning methods (array)
  7: (selections) => Array.isArray(selections.currentLearningMethods) && selections.currentLearningMethods.length > 0,
  
  // Step 8: Current level
  8: (selections) => selections.currentLevel !== null && selections.currentLevel !== '',
  
  // Step 9: Native language
  9: (selections) => selections.nativeLanguage !== null && selections.nativeLanguage !== '',
  
  // Step 10: Known words 1 (array)
  10: (selections) => Array.isArray(selections.knownWords1) && selections.knownWords1.length > 0,
  
  // Step 11: Known words 2 (array)
  11: (selections) => Array.isArray(selections.knownWords2) && selections.knownWords2.length > 0,
  
  // Step 12: Interests (array)
  12: (selections) => Array.isArray(selections.interests) && selections.interests.length > 0,
  
  // Step 13: English style
  13: (selections) => selections.englishStyle !== null && selections.englishStyle !== '',
  
  // Step 14: Tutor style (array)
  14: (selections) => Array.isArray(selections.tutorStyle) && selections.tutorStyle.length > 0,
};

/**
 * Validate a specific step
 */
export function validateStepById(
  stepId: number,
  selections: UserSelections
): boolean {
  const validator = STEP_VALIDATION_RULES[stepId];
  if (!validator) {
    // No validation rule found for step
    return false;
  }
  return validator(selections);
}

/**
 * Get validation error message for a step
 */
export function getStepValidationError(stepId: number): string {
  const errorMessages: Record<number, string> = {
    0: 'Please select a skill you would like to improve',
    1: 'Please indicate if you agree with the statement',
    2: 'Please select your industry',
    3: 'Please select how you feel when speaking English',
    4: 'Please select how often you speak English',
    5: 'Please select your main goal',
    6: 'Please select your gender',
    7: 'Please select at least one learning method',
    8: 'Please select your current language level',
    9: 'Please select your native language',
    10: 'Please select at least one word you know',
    11: 'Please select at least one word you know',
    12: 'Please select at least one interest',
    13: 'Please select an English style',
    14: 'Please select at least one tutor style',
  };

  return errorMessages[stepId] || 'This field is required';
}
