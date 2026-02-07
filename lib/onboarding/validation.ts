/**
 * Validation Utilities
 * 
 * Centralized validation logic for onboarding form fields.
 * Provides reusable validation functions and error messages.
 */

import { UserSelections } from '@/types/onboarding/selections';
import { OnboardingValidationError } from '@/types/onboarding/errors';
import { validateStepCompletion } from './stepDefinitions';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  field?: keyof UserSelections;
}

/**
 * Validate a single field value
 */
export function validateField(
  field: keyof UserSelections,
  value: any
): { isValid: boolean; error?: string } {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return {
        isValid: false,
        error: `${getFieldDisplayName(field)} is required`,
      };
    }
    return { isValid: true };
  }

  if (value === null || value === undefined || value === '') {
    return {
      isValid: false,
      error: `${getFieldDisplayName(field)} is required`,
    };
  }

  return { isValid: true };
}

/**
 * Validate all onboarding selections
 */
export function validateSelections(selections: UserSelections): ValidationResult {
  const errors: string[] = [];
  let errorField: keyof UserSelections | undefined;

  const requiredFields: Array<keyof UserSelections> = [
    'skillToImprove',
    'languageStatement',
    'industry',
    'speakingFeelings',
    'speakingFrequency',
    'mainGoal',
    'gender',
    'currentLearningMethods',
    'currentLevel',
    'nativeLanguage',
    'knownWords1',
    'knownWords2',
    'interests',
    'englishStyle',
    'tutorStyle',
  ];

  requiredFields.forEach((field) => {
    const validation = validateField(field, selections[field]);
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
      if (!errorField) errorField = field;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    field: errorField,
  };
}

/**
 * Validate a specific step
 */
export function validateStep(
  stepId: number,
  selections: UserSelections
): { isValid: boolean; error?: string } {
  const isValid = validateStepCompletion(stepId, selections);
  
  if (!isValid) {
    // Get field name for error message
    const stepDefinitions = require('./stepDefinitions').STEP_DEFINITIONS;
    const step = stepDefinitions.find((s: any) => s.id === stepId);
    const fieldName = step ? getFieldDisplayName(step.field) : 'This field';
    
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return { isValid: true };
}

/**
 * Get user-friendly field display name
 */
function getFieldDisplayName(field: keyof UserSelections): string {
  const displayNames: Record<keyof UserSelections, string> = {
    skillToImprove: 'Skill to improve',
    languageStatement: 'Language statement',
    industry: 'Industry',
    speakingFeelings: 'Speaking feelings',
    speakingFrequency: 'Speaking frequency',
    mainGoal: 'Main goal',
    gender: 'Gender',
    currentLearningMethods: 'Current learning methods',
    currentLevel: 'Current level',
    nativeLanguage: 'Native language',
    knownWords1: 'Known words (set 1)',
    knownWords2: 'Known words (set 2)',
    interests: 'Interests',
    englishStyle: 'English style',
    tutorStyle: 'Tutor style',
    userName: 'User name',
  };

  return displayNames[field] || field;
}

/**
 * Check if all steps are completed
 */
export function areAllStepsCompleted(selections: UserSelections): boolean {
  const validation = validateSelections(selections);
  return validation.isValid;
}

/**
 * Get count of completed steps
 * 
 * @param selections - UserSelections object
 * @returns Number of completed steps (0-15)
 */
export function getCompletedStepsCount(selections: UserSelections): number {
  const requiredFields: Array<keyof UserSelections> = [
    'skillToImprove',
    'languageStatement',
    'industry',
    'speakingFeelings',
    'speakingFrequency',
    'mainGoal',
    'gender',
    'currentLearningMethods',
    'currentLevel',
    'nativeLanguage',
    'knownWords1',
    'knownWords2',
    'interests',
    'englishStyle',
    'tutorStyle',
  ];

  let completedCount = 0;
  requiredFields.forEach((field) => {
    const value = selections[field];
    if (Array.isArray(value)) {
      if (value.length > 0) completedCount++;
    } else if (value !== null && value !== undefined && value !== '') {
      completedCount++;
    }
  });

  return completedCount;
}

/**
 * Calculate progress percentage based on filled fields
 * 
 * @param selections - UserSelections object
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(selections: UserSelections): number {
  const requiredFields: Array<keyof UserSelections> = [
    'skillToImprove',
    'languageStatement',
    'industry',
    'speakingFeelings',
    'speakingFrequency',
    'mainGoal',
    'gender',
    'currentLearningMethods',
    'currentLevel',
    'nativeLanguage',
    'knownWords1',
    'knownWords2',
    'interests',
    'englishStyle',
    'tutorStyle',
  ];

  let filledCount = 0;
  requiredFields.forEach((field) => {
    const value = selections[field];
    if (Array.isArray(value)) {
      if (value.length > 0) filledCount++;
    } else if (value !== null && value !== undefined && value !== '') {
      filledCount++;
    }
  });

  return requiredFields.length > 0
    ? Math.round((filledCount / requiredFields.length) * 100)
    : 0;
}
