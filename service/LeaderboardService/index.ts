/**
 * Leaderboard Service
 * 
 * Service for managing leaderboard API calls.
 * Uses the single /api/leaderboard endpoint with period query parameter.
 */

import { httpService } from "../httpservice";
import type { LeaderboardResponse, UserPositionResponse, LeaderboardType, LeaderboardUser, UserPositionData } from '@/types/leaderboard';

// Export types for backward compatibility
export type { LeaderboardUser, UserPositionData, UserPositionResponse, LeaderboardType } from '@/types/leaderboard';

class LeaderboardService {
  private static instance: LeaderboardService;
  private constructor() {}

  public static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  /**
   * Get weekly leaderboard
   * Uses GET /api/leaderboard?period=week
   */
  async getWeeklyLeaderboard(): Promise<LeaderboardResponse> {
    try {
      const response = await httpService.get("/leaderboard", {
        params: { period: 'week' }
      });
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: {
            period: response.data.data.period || 'week',
            leaderboard: response.data.data.leaderboard || [],
            totalParticipants: response.data.data.totalParticipants || 0,
            userRank: response.data.data.userRank || null,
            weekStart: response.data.data.weekStart,
            weekEnd: response.data.data.weekEnd,
          },
        };
      }
      throw new Error(response.data?.error || 'Failed to fetch weekly leaderboard');
    } catch (error: any) {
      // Error in LeaderboardService.getWeeklyLeaderboard
      return {
        success: false,
        data: {
          period: 'week',
          leaderboard: [],
          totalParticipants: 0,
          userRank: null,
        },
        error: error.response?.data?.error || error.message || 'Failed to load weekly leaderboard',
      };
    }
  }

  /**
   * Get overall leaderboard
   * Uses GET /api/leaderboard?period=all
   */
  async getOverallLeaderboard(): Promise<LeaderboardResponse> {
    try {
      const response = await httpService.get("/leaderboard", {
        params: { period: 'all' }
      });
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: {
            period: response.data.data.period || 'all',
            leaderboard: response.data.data.leaderboard || [],
            totalParticipants: response.data.data.totalParticipants || 0,
            userRank: response.data.data.userRank || null,
          },
        };
      }
      throw new Error(response.data?.error || 'Failed to fetch overall leaderboard');
    } catch (error: any) {
      // Error in LeaderboardService.getOverallLeaderboard
      return {
        success: false,
        data: {
          period: 'all',
          leaderboard: [],
          totalParticipants: 0,
          userRank: null,
        },
        error: error.response?.data?.error || error.message || 'Failed to load overall leaderboard',
      };
    }
  }

  /**
   * Get user position in leaderboard
   * The userRank is included in the leaderboard response, so we fetch the leaderboard
   * and extract the userRank from it
   */
  async getMyPosition(type: LeaderboardType): Promise<UserPositionResponse> {
    try {
      const period = type === 'weekly' ? 'week' : 'all';
      const response = await httpService.get("/leaderboard", {
        params: { period }
      });
      if (response.data?.success && response.data?.data) {
        const userRank = response.data.data.userRank;
        if (userRank) {
          return {
            success: true,
            data: {
              ...userRank,
              type,
            },
          };
        }
        return {
          success: true,
          data: null,
        };
      }
      throw new Error(response.data?.error || 'Failed to fetch user position');
    } catch (error: any) {
      // Error in LeaderboardService.getMyPosition
      // Don't treat position fetch failure as error - it's optional
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message || 'Failed to load user position',
      };
    }
  }

  // Legacy method for backward compatibility
  async getLeaderboard(): Promise<any> {
    const response = await httpService.get("/leaderboard");
    return response.data;
  }
}

export const leaderboardService = LeaderboardService.getInstance();
