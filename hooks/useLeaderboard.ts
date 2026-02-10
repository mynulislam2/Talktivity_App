/**
 * useLeaderboard Hook
 * 
 * Manages leaderboard functionality:
 * - Loading rankings
 * - User position tracking
 * - Filtering by time period
 * - Real-time updates
 */

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { leaderboardService } from '@/service/LeaderboardService';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  totalTime: number;
  streak: number;
  isCurrentUser: boolean;
}

export interface LeaderboardFilters {
  period: 'daily' | 'weekly' | 'monthly' | 'allTime';
  category: 'points' | 'time' | 'streak';
}

export interface UseLeaderboardState {
  entries: LeaderboardEntry[];
  currentUserRank: number | null;
  isLoading: boolean;
  error: string | null;
}

export const useLeaderboard = (filters: LeaderboardFilters = {
  period: 'weekly',
  category: 'points',
}) => {
  const currentUserId = useSelector((state: RootState) => state.profile?.id);
  
  const [state, setState] = useState<UseLeaderboardState>({
    entries: [],
    currentUserRank: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadLeaderboard();
  }, [filters.period, filters.category]);

  const loadLeaderboard = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // TODO: Call leaderboardService.getLeaderboard(filters) when backend is ready
      const mockEntries: LeaderboardEntry[] = [
        {
          rank: 1,
          userId: '1',
          userName: 'Alice Johnson',
          points: 2500,
          totalTime: 480,
          streak: 15,
          isCurrentUser: false,
        },
        {
          rank: 2,
          userId: '2',
          userName: 'Bob Smith',
          points: 2300,
          totalTime: 420,
          streak: 12,
          isCurrentUser: false,
        },
        {
          rank: 3,
          userId: currentUserId || '3',
          userName: 'You',
          points: 1950,
          totalTime: 360,
          streak: 8,
          isCurrentUser: true,
        },
        {
          rank: 4,
          userId: '4',
          userName: 'Diana Prince',
          points: 1850,
          totalTime: 340,
          streak: 7,
          isCurrentUser: false,
        },
        {
          rank: 5,
          userId: '5',
          userName: 'Eve Wilson',
          points: 1750,
          totalTime: 320,
          streak: 6,
          isCurrentUser: false,
        },
      ];

      const currentRank = mockEntries.find((e) => e.isCurrentUser)?.rank || null;

      setState({
        entries: mockEntries,
        currentUserRank: currentRank,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load leaderboard',
        isLoading: false,
      }));
    }
  }, [currentUserId, filters]);

  const getUserPosition = useCallback((userId: string) => {
    return state.entries.find((e) => e.userId === userId) || null;
  }, [state.entries]);

  return {
    ...state,
    loadLeaderboard,
    getUserPosition,
  };
};
