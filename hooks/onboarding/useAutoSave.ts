/**
 * useAutoSave Hook
 * 
 * Handles debounced auto-save of onboarding data.
 * Saves to backend after a delay when selections change.
 */

import { useCallback, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSelections, selectIsSaving, saveOnboarding } from '@/store/slices/onboardingSlice';
import { UserSelections } from '@/types/onboarding/selections';

const AUTO_SAVE_DELAY = 1000; // 1 second

export interface UseAutoSaveReturn {
  handleSave: () => Promise<void>;
  isSaving: boolean;
  triggerAutoSave: () => void;
}

export function useAutoSave(): UseAutoSaveReturn {
  const dispatch = useAppDispatch();
  const selections = useAppSelector(selectSelections);
  const isSaving = useAppSelector(selectIsSaving);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedSelectionsRef = useRef<UserSelections | null>(null);

  // Manual save trigger
  const handleSave = useCallback(async () => {
    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    // Save immediately
    await dispatch(saveOnboarding());
    lastSavedSelectionsRef.current = { ...selections };
  }, [dispatch, selections]);

  // Trigger auto-save (debounced)
  const triggerAutoSave = useCallback(() => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(async () => {
      // Check if selections have changed
      const currentSelectionsStr = JSON.stringify(selections);
      const lastSavedStr = JSON.stringify(lastSavedSelectionsRef.current);
      
      if (currentSelectionsStr !== lastSavedStr) {
        await dispatch(saveOnboarding());
        lastSavedSelectionsRef.current = { ...selections };
      }
      
      autoSaveTimeoutRef.current = null;
    }, AUTO_SAVE_DELAY);
  }, [dispatch, selections]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleSave,
    isSaving,
    triggerAutoSave,
  };
}
