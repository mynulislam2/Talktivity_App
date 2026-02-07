/**
 * useCallStatus Hook
 * 
 * Manages call status loading, eligibility checks, and refresh logic.
 * Replaces useTimeLimits hook for call page.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadCallStatus,
  selectCallStatus,
  selectCanStartCall,
  selectRemainingTime,
  selectTotalDuration,
  selectCallStatusLoading,
  selectCallStatusError,
} from '@/store/slices/callSlice';

export function useCallStatus() {
  const dispatch = useAppDispatch();
  const callStatus = useAppSelector(selectCallStatus);
  const isLoading = useAppSelector(selectCallStatusLoading);
  const error = useAppSelector(selectCallStatusError);
  const canStartCall = useAppSelector(selectCanStartCall);
  const remainingTime = useAppSelector(selectRemainingTime);
  const totalDuration = useAppSelector(selectTotalDuration);
  
  // Load call status on mount
  useEffect(() => {
    dispatch(loadCallStatus());
  }, [dispatch]);
  
  // Refresh call status
  const refreshStatus = useCallback(() => {
    dispatch(loadCallStatus());
  }, [dispatch]);
  
  return {
    callStatus,
    isLoading,
    error,
    canStartCall,
    remainingTime,
    totalDuration,
    refreshStatus,
  };
}
