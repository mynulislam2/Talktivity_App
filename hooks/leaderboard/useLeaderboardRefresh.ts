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
    // Refresh when app becomes active (React Native uses AppState instead of document.hidden)
    const { AppState } = require('react-native');
    
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        refresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [refresh]);

  return {
    refresh,
  };
}
