import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadWeeklyLeaderboard,
  loadOverallLeaderboard,
  selectWeeklyLeaderboard,
  selectOverallLeaderboard,
  selectCurrentLeaderboard,
  selectCurrentUserPosition,
  selectCurrentType,
  selectUserPosition,
  selectLeaderboardLoading,
  selectLeaderboardError,
} from '@/store/slices/leaderboardSlice';
import type {
  LeaderboardUser,
  UserPositionData,
  LeaderboardType,
} from '@/types/leaderboard';

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
  const weeklyUserPosition = useAppSelector(selectUserPosition('weekly'));
  const overallUserPosition = useAppSelector(selectUserPosition('overall'));
  const currentType = useAppSelector(selectCurrentType);
  const isLoading = useAppSelector(selectLeaderboardLoading);
  const error = useAppSelector(selectLeaderboardError);
  const hasRequestedInitialLoad = useRef(false);

  const refresh = useCallback(async () => {
    await Promise.all([
      dispatch(loadWeeklyLeaderboard()),
      dispatch(loadOverallLeaderboard()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    const hasWeeklyData = weeklyLeaderboard.length > 0;
    const hasOverallData = overallLeaderboard.length > 0;
    const hasWeeklyUserPosition = weeklyUserPosition !== null;
    const hasOverallUserPosition = overallUserPosition !== null;
    const hasCompleteSnapshot =
      hasWeeklyData &&
      hasOverallData &&
      hasWeeklyUserPosition &&
      hasOverallUserPosition;

    if (hasCompleteSnapshot || isLoading || hasRequestedInitialLoad.current)
      return;

    hasRequestedInitialLoad.current = true;
    void refresh();
  }, [
    isLoading,
    overallLeaderboard.length,
    overallUserPosition,
    refresh,
    weeklyLeaderboard.length,
    weeklyUserPosition,
  ]);

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
