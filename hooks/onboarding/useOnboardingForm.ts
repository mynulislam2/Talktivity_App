/**
 * useOnboardingForm Hook
 * 
 * Manages onboarding form state and selection updates using Redux.
 * Provides methods to update selections and handle form interactions.
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectSelections,
  selectTempSelections,
  updateSelection,
  updateTempSelections,
  clearTempSelections,
} from '@/store/slices/onboardingSlice';
import { UserSelections } from '@/types/onboarding/selections';

export interface UseOnboardingFormReturn {
  selections: UserSelections;
  tempSelections: Record<string, any>;
  updateSelection: (field: keyof UserSelections, value: any) => void;
  updateTempSelection: (field: string, value: any) => void;
  clearTempSelections: () => void;
}

export function useOnboardingForm(): UseOnboardingFormReturn {
  const dispatch = useAppDispatch();
  const selections = useAppSelector(selectSelections);
  const tempSelections = useAppSelector(selectTempSelections);

  const handleUpdateSelection = useCallback(
    (field: keyof UserSelections, value: any) => {
      dispatch(updateSelection({ field, value }));
    },
    [dispatch]
  );

  const handleUpdateTempSelection = useCallback(
    (field: string, value: any) => {
      dispatch(updateTempSelections({ field, value }));
    },
    [dispatch]
  );

  const handleClearTempSelections = useCallback(() => {
    dispatch(clearTempSelections());
  }, [dispatch]);

  return {
    selections,
    tempSelections,
    updateSelection: handleUpdateSelection,
    updateTempSelection: handleUpdateTempSelection,
    clearTempSelections: handleClearTempSelections,
  };
}
