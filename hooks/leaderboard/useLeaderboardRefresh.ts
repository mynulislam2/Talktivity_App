/**
 * useLeaderboardRefresh Hook
 * 
 * Handles automatic refresh of leaderboard data when page becomes visible.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import {
  loadWeeklyLeaderboard,
  loadOverallLeaderboard,
  loadUserPosition,
} from '@/store/slices/leaderboardSlice';

export interface UseLeaderboardRefreshReturn {
  refresh: () => Promise<void>;
}

export function useLeaderboardRefresh(): UseLeaderboardRefreshReturn {
  const dispatch = useAppDispatch();

  const refresh = useCallback(async () => {
    await Promise.all([
      dispatch(loadWeeklyLeaderboard()),
      dispatch(loadOverallLeaderboard()),
      dispatch(loadUserPosition("weekly")),
      dispatch(loadUserPosition("overall")),
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
