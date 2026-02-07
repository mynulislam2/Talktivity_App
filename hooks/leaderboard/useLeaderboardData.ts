/**
 * useLeaderboardData Hook
 * 
 * Orchestrates loading of leaderboard data from Redux.
 * Provides unified loading/error states and refresh function.
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadWeeklyLeaderboard,
  loadOverallLeaderboard,
  loadUserPosition,
  selectWeeklyLeaderboard,
  selectOverallLeaderboard,
  selectCurrentLeaderboard,
  selectCurrentUserPosition,
  selectCurrentType,
  selectLeaderboardLoading,
  selectLeaderboardError,
} from '@/store/slices/leaderboardSlice';
import type { LeaderboardUser, UserPositionData, LeaderboardType } from '@/types/leaderboard';

export interface UseLeaderboardDataReturn {
  weeklyLeaderboard: LeaderboardUser[];
  overallLeaderboard: LeaderboardUser[];
  currentLeaderboard: LeaderboardUser[];
  currentUserPosition: UserPositionData | null;
  currentType: LeaderboardType;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLeaderboardData(): UseLeaderboardDataReturn {
  const dispatch = useAppDispatch();
  const weeklyLeaderboard = useAppSelector(selectWeeklyLeaderboard);
  const overallLeaderboard = useAppSelector(selectOverallLeaderboard);
  const currentLeaderboard = useAppSelector(selectCurrentLeaderboard);
  const currentUserPosition = useAppSelector(selectCurrentUserPosition);
  const currentType = useAppSelector(selectCurrentType);
  const isLoading = useAppSelector(selectLeaderboardLoading);
  const error = useAppSelector(selectLeaderboardError);

  const refresh = useCallback(async () => {
    await Promise.all([
      dispatch(loadWeeklyLeaderboard()),
      dispatch(loadOverallLeaderboard()),
      dispatch(loadUserPosition("weekly")),
      dispatch(loadUserPosition("overall")),
    ]);
  }, [dispatch]);

  // Only load data if it doesn't exist yet (prevent duplicate API calls)
  useEffect(() => {
    // Check if we already have data loaded
    const hasWeeklyData = weeklyLeaderboard.length > 0;
    const hasOverallData = overallLeaderboard.length > 0;
    const hasUserPosition = currentUserPosition !== null;
    const hasData = hasWeeklyData || hasOverallData || hasUserPosition;
    
    // Only load if no data exists and not currently loading
    if (!hasData && !isLoading) {
      refresh();
    }
  }, []); // Only run once on mount - check data existence on first render

  return {
    weeklyLeaderboard,
    overallLeaderboard,
    currentLeaderboard,
    currentUserPosition,
    currentType,
    isLoading,
    error,
    refresh,
  };
}
