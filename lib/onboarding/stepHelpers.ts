/**
 * Step Helper Functions
 * 
 * Centralized helper functions for onboarding step logic.
 * Provides reusable utilities for step navigation and validation.
 */

import { StepDefinition } from '@/types/onboarding/steps';
import { UserSelections } from '@/types/onboarding/selections';

/**
 * Check if current step has a valid selection
 * 
 * @param step - Step definition
 * @param selections - Current user selections
 * @param tempSelections - Temporary selections (for multi-select)
 * @returns true if step has a valid selection
 */
export function hasStepSelection(
  step: StepDefinition,
  selections: UserSelections,
  tempSelections: Record<string, any>
): boolean {
  if (step.type === 'multi-select') {
    const value = tempSelections[step.field] || selections[step.field];
    return Array.isArray(value) && value.length > 0;
  } else {
    const value = selections[step.field];
    return value !== null && value !== undefined && value !== '';
  }
}

/**
 * Get next step number or null if last step
 * 
 * @param currentStep - Current step number (0-indexed)
 * @param totalSteps - Total number of steps
 * @returns Next step number or null if last step
 */
export function getNextStep(currentStep: number, totalSteps: number): number | null {
  const nextStep = currentStep + 1;
  return nextStep >= totalSteps ? null : nextStep;
}
