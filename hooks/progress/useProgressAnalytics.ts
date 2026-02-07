/**
 * useProgressAnalytics Hook
 * 
 * Orchestrates loading of progress analytics and achievements from Redux.
 * Provides unified loading/error states and refresh function.
 * Handles visibility change refresh automatically.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadProgressAnalytics,
  refreshProgressAnalytics,
  selectProgressAnalytics,
  selectProgressAchievements,
  selectProgressLoading,
  selectProgressError,
} from '@/store/slices/progressAnalyticsSlice';

export interface UseProgressAnalyticsReturn {
  analytics: any;
  achievements: any;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useProgressAnalytics(): UseProgressAnalyticsReturn {
  const dispatch = useAppDispatch();
  const analytics = useAppSelector(selectProgressAnalytics);
  const achievements = useAppSelector(selectProgressAchievements);
  const isLoading = useAppSelector(selectProgressLoading);
  const error = useAppSelector(selectProgressError);

  const refresh = useCallback(async () => {
    await dispatch(refreshProgressAnalytics());
  }, [dispatch]);

  useEffect(() => {
    // Load data on mount
    dispatch(loadProgressAnalytics());
  }, [dispatch]);

  useEffect(() => {
    // Refresh data when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        dispatch(loadProgressAnalytics());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);

  return {
    analytics,
    achievements,
    isLoading,
    error,
    refresh,
  };
}
