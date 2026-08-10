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
    dispatch(loadProgressAnalytics());
  }, [dispatch]);

  return {
    analytics,
    achievements,
    isLoading,
    error,
    refresh,
  };
}
