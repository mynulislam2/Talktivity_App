/**
 * Step Definitions
 * 
 * Data-driven step configuration replacing hardcoded switch statement.
 * Each step is defined with its type, field, title, options, and validation.
 */

import { StepDefinition, TOTAL_STEPS } from '@/types/onboarding/steps';
import {
  SKILL_OPTIONS,
  LANGUAGE_STATEMENT_OPTIONS,
  INDUSTRY_OPTIONS,
  SPEAKING_FEELINGS_OPTIONS,
  SPEAKING_FREQUENCY_OPTIONS,
  MAIN_GOAL_OPTIONS,
  GENDER_OPTIONS,
  LEARNING_METHODS_OPTIONS,
  CURRENT_LEVEL_OPTIONS,
  NATIVE_LANGUAGE_OPTIONS,
  KNOWN_WORDS_1,
  KNOWN_WORDS_2,
  INTERESTS_OPTIONS,
  ENGLISH_STYLE_OPTIONS,
  TUTOR_STYLE_OPTIONS,
} from './stepOptions';

/**
 * All 15 onboarding step definitions
 */
export const STEP_DEFINITIONS: StepDefinition[] = [
  // Step 0: Skill to improve (custom - special handling)
  {
    id: 0,
    type: 'custom',
    field: 'skillToImprove',
    title: 'What would you like to improve?',
    options: SKILL_OPTIONS,
    validation: (value) => value !== null && value !== undefined && value !== '',
    gridCols: 'sm:grid-cols-2',
    showIcon: true,
  },
  // Step 1: Language statement (custom - has subtitle)
  {
    id: 1,
    type: 'custom',
    field: 'languageStatement',
    title: 'Do you agree with the statement below?',
    subtitle: '"I know exactly what to say in my head, but can\'t find the right words."',
    options: LANGUAGE_STATEMENT_OPTIONS,
    validation: (value) => value !== null && value !== undefined && value !== '',
    gridCols: 'sm:grid-cols-3',
    showIcon: true,
  },
  // Step 2: Industry
  {
    id: 2,
    type: 'single-select',
    field: 'industry',
    title: 'What field do you work in?',
    options: INDUSTRY_OPTIONS,
    validation: (value) => value !== null && value !== undefined && value !== '',
    gridCols: 'sm:grid-cols-2',
    showIcon: true,
  },
  // Step 3: Speaking feelings (custom - different layout)
  {
    id: 3,
    type: 'custom',
    field: 'speakingFeelings',
    title: 'How do you feel when you need to speak English?',
    options: SPEAKING_FEELINGS_OPTIONS,
    validation: (value) => value !== null && value !== undefined && value !== '',
    gridCols: 'sm:grid-cols-2 lg:grid-cols-3',
    showIcon: true,
  },
  // Step 4: Speaking frequency
  {
    id: 4,
    type: 'single-select',
    field: 'speakingFrequency',
    title: 'How often do you speak English in your daily life?',
    options: SPEAKING_FREQUENCY_OPTIONS,
    validation: (value) => value !== null && value !== undefined && value !== '',
    gridCols: 'sm:grid-cols-2',
    showIcon: true,
  },
  // Step 5: Main goal
  {
    id: 5,
    type: 'single-select',
    field: 'mainGoal',
    title: 'What is your main goal for improving your English?',
    options: MAIN_GOAL_OPTIONS,
    validation: (value) => value !== null && value !== undefined && value !== '',
    gridCols: 'sm:grid-cols-2',
    showIcon: true,
  },
  // Step 6: Gender
  {
    id: 6,
    type: 'single-select',
    field: 'gender',
    title: 'What is your gender?',
    options: GENDER_OPTIONS,
    validation: (value) => value !== null && value !== undefined && value !== '',
    gridCols: 'sm:grid-cols-1 max-w-sm mx-auto',
    showIcon: true,
  },
  // Step 7: Current learning methods
  {
    id: 7,
    type: 'multi-select',
    field: 'currentLearningMethods',
    title: 'How are you currently improving your English?',
    subtitle: 'Select all that apply',
    options: LEARNING_METHODS_OPTIONS,
    validation: (value) => Array.isArray(value) && value.length > 0,
    gridCols: 'sm:grid-cols-1 max-w-md mx-auto',
    showIcon: true,
  },
  // Step 8: Current level
  {
    id: 8,
    type: 'single-select',
    field: 'currentLevel',
    title: 'What\'s your current language level?',
    options: CURRENT_LEVEL_OPTIONS,
    validation: (value) => value !== null && value !== undefined && value !== '',
    gridCols: 'sm:grid-cols-1 max-w-lg mx-auto',
    showIcon: true,
  },
  // Step 9: Native language
  {
    id: 9,
    type: 'single-select',
    field: 'nativeLanguage',
    title: 'What is your native language?',
    options: NATIVE_LANGUAGE_OPTIONS,
    validation: (value) => value !== null && value !== undefined && value !== '',
    gridCols: 'sm:grid-cols-3',
    showIcon: false,
  },
  // Step 10: Known words 1
  {
    id: 10,
    type: 'multi-select',
    field: 'knownWords1',
    title: 'Select all the words you know. (1/2)',
    options: KNOWN_WORDS_1,
    validation: (value) => Array.isArray(value) && value.length > 0,
    gridCols: 'sm:grid-cols-2',
    showIcon: false,
  },
  // Step 11: Known words 2
  {
    id: 11,
    type: 'multi-select',
    field: 'knownWords2',
    title: 'Select all the words you know. (2/2)',
    options: KNOWN_WORDS_2,
    validation: (value) => Array.isArray(value) && value.length > 0,
    gridCols: 'sm:grid-cols-2',
    showIcon: false,
  },
  // Step 12: Interests
  {
    id: 12,
    type: 'multi-select',
    field: 'interests',
    title: 'What topics interest you?',
    subtitle: 'Select all that apply',
    options: INTERESTS_OPTIONS,
    validation: (value) => Array.isArray(value) && value.length > 0,
    gridCols: 'sm:grid-cols-2',
    showIcon: false,
  },
  // Step 13: English style
  {
    id: 13,
    type: 'single-select',
    field: 'englishStyle',
    title: 'What style of English would you like to practice?',
    options: ENGLISH_STYLE_OPTIONS,
    validation: (value) => value !== null && value !== undefined && value !== '',
    gridCols: 'sm:grid-cols-1 max-w-md mx-auto',
    showIcon: true,
  },
  // Step 14: Tutor style
  {
    id: 14,
    type: 'multi-select',
    field: 'tutorStyle',
    title: 'Build your ideal tutor style',
    subtitle: 'Select all that apply',
    options: TUTOR_STYLE_OPTIONS,
    validation: (value) => Array.isArray(value) && value.length > 0,
    gridCols: 'sm:grid-cols-3',
    showIcon: false,
  },
];

/**
 * Get step definition by ID
 */
export function getStepDefinition(stepId: number): StepDefinition | undefined {
  return STEP_DEFINITIONS.find(step => step.id === stepId);
}

/**
 * Validate step completion
 */
export function validateStepCompletion(
  stepId: number,
  selections: import('@/types/onboarding/selections').UserSelections
): boolean {
  const step = getStepDefinition(stepId);
  if (!step) return false;

  const fieldValue = selections[step.field];
  return step.validation(fieldValue);
}

/**
 * Find next incomplete step
 */
export function findNextIncompleteStep(
  startStep: number,
  selections: import('@/types/onboarding/selections').UserSelections
): number {
  for (let step = startStep; step < TOTAL_STEPS; step++) {
    if (!validateStepCompletion(step, selections)) {
      return step;
    }
  }
  return -1; // All steps completed
}
