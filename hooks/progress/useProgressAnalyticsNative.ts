/**
 * useProgressAnalytics Hook (React Native)
 * 
 * Orchestrates loading of progress analytics and achievements from Redux.
 * Provides unified loading/error states and refresh function.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AppState } from 'react-native';
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

export function useProgressAnalyticsNative(): UseProgressAnalyticsReturn {
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
    // Refresh data when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        dispatch(loadProgressAnalytics());
      }
    });

    return () => {
      subscription.remove();
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
