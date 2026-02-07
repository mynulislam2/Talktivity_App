/**
 * useProfileData Hook
 * 
 * Orchestrates loading of profile and progress stats from Redux.
 * Provides unified loading/error states and refresh function.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadProfile,
  loadProgressStats,
  selectProfile,
  selectProgressStats,
  selectProfileLoading,
  selectProfileError,
} from '@/store/slices/profileSlice';

export interface UseProfileDataReturn {
  profile: any;
  progressStats: any;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useProfileData(): UseProfileDataReturn {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const progressStats = useAppSelector(selectProgressStats);
  const isLoading = useAppSelector(selectProfileLoading);
  const error = useAppSelector(selectProfileError);

  const refresh = useCallback(async () => {
    await Promise.all([
      dispatch(loadProfile()),
      dispatch(loadProgressStats()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    profile,
    progressStats,
    isLoading,
    error,
    refresh,
  };
}
