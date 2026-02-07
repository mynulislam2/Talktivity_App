/**
 * useStepNavigation Hook
 * 
 * Manages step navigation logic including next/previous step navigation,
 * step validation, and progress tracking.
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectCurrentStep,
  selectCompletedSteps,
  selectProgress,
  selectSelections,
  setCurrentStep,
} from '@/store/slices/onboardingSlice';
import { validateStepCompletion, findNextIncompleteStep } from '@/lib/onboarding/stepDefinitions';
import { UserSelections } from '@/types/onboarding/selections';

export interface UseStepNavigationReturn {
  currentStep: number;
  completedSteps: number;
  progress: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoBack: boolean;
}

export function useStepNavigation(): UseStepNavigationReturn {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector(selectCurrentStep);
  const completedSteps = useAppSelector(selectCompletedSteps);
  const progress = useAppSelector(selectProgress);
  const selections = useAppSelector(selectSelections);

  // Note: Step initialization is handled in onboardingSlice when loadOnboarding.fulfilled
  // No need for useEffect here as it causes race conditions and step flashing

  // Navigate to next step (only if current step is completed)
  const goToNextStep = useCallback(() => {
    // Validate current step is completed before allowing navigation
    const isCurrentStepComplete = validateStepCompletion(currentStep, selections);
    if (!isCurrentStepComplete) {
      return; // Prevent forward navigation if step not completed
    }

    // Find next incomplete step
    const nextStep = findNextIncompleteStep(currentStep + 1, selections);
    if (nextStep !== -1) {
      dispatch(setCurrentStep(nextStep));
    } else {
      // All steps completed, stay on current step (will trigger completion flow)
      // This should be handled by the page component
    }
  }, [dispatch, currentStep, selections]);

  // Navigate to previous step (only to completed steps)
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      // Find last completed step before current
      let previousStep = currentStep - 1;
      while (previousStep >= 0 && !validateStepCompletion(previousStep, selections)) {
        previousStep--;
      }
      if (previousStep >= 0) {
        dispatch(setCurrentStep(previousStep));
      }
    }
  }, [dispatch, currentStep, selections]);

  // Check if previous button should be shown
  const canGoBack = currentStep > 0;

  return {
    currentStep,
    completedSteps,
    progress,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
  };
}
