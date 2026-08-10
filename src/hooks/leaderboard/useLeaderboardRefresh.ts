import { useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import {
  loadWeeklyLeaderboard,
  loadOverallLeaderboard,
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
    ]);
  }, [dispatch]);

  return {
    refresh,
  };
}
