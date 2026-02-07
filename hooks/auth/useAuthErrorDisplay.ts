/**
 * useAuthErrorDisplay Hook
 * 
 * Aggregates and manages error display logic from multiple sources:
 * - Redux state errors
 * - Google Auth errors
 * - Form validation errors
 */

import { useMemo, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { clearError } from '@/store/slices/authSlice';

export interface UseAuthErrorDisplayOptions {
  reduxError: string | null;
  googleError: string | null;
  formErrors: Record<string, string | undefined>;
}

export interface UseAuthErrorDisplayReturn {
  displayError: string | null;
  clearError: () => void;
}

export function useAuthErrorDisplay(
  options: UseAuthErrorDisplayOptions
): UseAuthErrorDisplayReturn {
  const dispatch = useAppDispatch();
  const { reduxError, googleError, formErrors } = options;

  // Aggregate errors from all sources
  const displayError = useMemo(() => {
    // Priority: Redux error > Google error > Form errors (first non-empty)
    if (reduxError) return reduxError;
    if (googleError) return googleError;
    
    // Return first form error found
    const firstFormError = Object.values(formErrors).find(
      (error) => error && error.trim() !== ''
    );
    return firstFormError || null;
  }, [reduxError, googleError, formErrors]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    displayError,
    clearError: handleClearError,
  };
}
