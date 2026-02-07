/**
 * useReportNavigation Hook
 * 
 * Manages step navigation through report cards.
 * Prevents skipping steps and handles continue/finish actions.
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseReportNavigationOptions {
  reportData: any;
  totalSteps?: number;
}

export interface UseReportNavigationReturn {
  currentStep: number;
  handleContinue: () => void;
  handleFinish: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goToStep: (step: number) => void;
}

const DEFAULT_TOTAL_STEPS = 5; // EnglishScore, Fluency, Grammar, Vocabulary, Discourse

export function useReportNavigation(
  options: UseReportNavigationOptions
): UseReportNavigationReturn {
  const { reportData, totalSteps = DEFAULT_TOTAL_STEPS } = options;
  const [currentStep, setCurrentStep] = useState(0);

  const canGoNext = useMemo(() => {
    return currentStep < totalSteps - 1 && reportData !== null;
  }, [currentStep, totalSteps, reportData]);

  const canGoPrevious = useMemo(() => {
    return currentStep > 0;
  }, [currentStep]);

  const handleContinue = useCallback(() => {
    if (canGoNext) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [canGoNext]);

  const handleFinish = useCallback(() => {
    // Finish is handled by useReportCompletion hook
    // This just moves to the last step if not already there
    if (currentStep < totalSteps - 1) {
      setCurrentStep(totalSteps - 1);
    }
  }, [currentStep, totalSteps]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  return {
    currentStep,
    handleContinue,
    handleFinish,
    canGoNext,
    canGoPrevious,
    goToStep,
  };
}
