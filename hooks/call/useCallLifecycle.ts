/**
 * useCallLifecycle Hook
 * 
 * Manages lifecycle data for routing after call completion.
 * Reuses existing lifecycle slice.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadLifecycle,
  selectLifecycleData,
  selectCallCompleted,
  selectLifecycleLoading,
} from '@/store/slices/lifecycleSlice';

export function useCallLifecycle() {
  const dispatch = useAppDispatch();
  const lifecycle = useAppSelector(selectLifecycleData);
  const callCompleted = useAppSelector(selectCallCompleted);
  const isLoading = useAppSelector(selectLifecycleLoading);
  
  // Load lifecycle on mount (if not already loaded)
  useEffect(() => {
    if (!lifecycle) {
      dispatch(loadLifecycle());
    }
  }, [dispatch, lifecycle]);
  
  // Refresh lifecycle (after session ends)
  const refreshLifecycle = useCallback(() => {
    dispatch(loadLifecycle());
  }, [dispatch]);
  
  return {
    lifecycle,
    callCompleted,
    isLoading,
    refreshLifecycle,
  };
}
