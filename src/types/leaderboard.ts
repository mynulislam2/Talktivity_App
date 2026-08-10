/**
 * Leaderboard Types
 */

export interface LeaderboardUser {
  id: number;
  name: string;
  profile_picture?: string;
  level: number;
  xp: number;
  position: number;
  isCrown?: boolean;
}

export interface LeaderboardResponse {
  success: boolean;
  data: {
    period: string;
    leaderboard: LeaderboardUser[];
    totalParticipants: number;
    userRank?: UserPositionData | null;
    weekStart?: string;
    weekEnd?: string;
  };
  error?: string;
}

export interface UserPositionData {
  position: number;
  user: {
    id: number;
    name: string;
    profile_picture?: string;
    level: number;
    xp: number;
    xpForNextLevel: number;
    xpProgress: number;
  };
  type: 'weekly' | 'overall';
}

export interface UserPositionResponse {
  success: boolean;
  data: UserPositionData | null;
  error?: string;
}

export type LeaderboardType = 'weekly' | 'overall';
