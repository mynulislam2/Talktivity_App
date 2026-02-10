/**
 * Leaderboard Screen (React Native)
 * 
 * Rankings and user leaderboard display
 * Matches Next.js /leaderboard page implementation.
 */

import React from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setLeaderboardType } from '@/store/slices/leaderboardSlice';
import {
  LeaderboardList,
  UserPositionCard,
  UserPositionEmpty,
  LeaderboardLoadingState,
  LeaderboardErrorState,
  LeaderboardShell,
} from '@/components/leaderboard';
import {
  useLeaderboardData,
  useLeaderboardRefresh,
} from '@/hooks/leaderboard';
import type { LeaderboardScreenProps } from '@/navigation/types';

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = () => {
  const dispatch = useAppDispatch();

  // Custom hooks - useLeaderboardData handles initial loading
  const {
    currentLeaderboard,
    currentUserPosition,
    currentType,
    isLoading,
    error,
    refresh,
  } = useLeaderboardData();

  useLeaderboardRefresh(); // Handles visibility change refresh

  const handleTypeChange = (type: 'weekly' | 'overall') => {
    dispatch(setLeaderboardType(type));
  };

  if (isLoading) {
    return <LeaderboardLoadingState />;
  }

  if (error) {
    return <LeaderboardErrorState error={error} onRetry={refresh} />;
  }

  return (
    <LeaderboardShell
      currentType={currentType}
      onTypeChange={handleTypeChange}
      userPositionSlot={
        currentUserPosition ? (
          <UserPositionCard userPosition={currentUserPosition} />
        ) : (
          <UserPositionEmpty />
        )
      }
      listSlot={
        <LeaderboardList
          leaderboard={currentLeaderboard}
          leaderboardType={currentType}
        />
      }
    />
  );
};

export default LeaderboardScreen;
