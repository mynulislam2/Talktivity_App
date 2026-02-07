/**
 * useProfileRefresh Hook
 * 
 * Handles visibility change refresh and provides manual refresh function.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { loadProfile, loadProgressStats } from '@/store/slices/profileSlice';

export interface UseProfileRefreshReturn {
  refresh: () => Promise<void>;
}

export function useProfileRefresh(): UseProfileRefreshReturn {
  const dispatch = useAppDispatch();

  const refresh = useCallback(async () => {
    await Promise.all([
      dispatch(loadProfile()),
      dispatch(loadProgressStats()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refresh]);

  return {
    refresh,
  };
}
