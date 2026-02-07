/**
 * Usage Service
 * 
 * Handles usage tracking, limits checking, and free trial management.
 * Manages daily usage limits, scenario creation limits, and roleplay session limits.
 */

import { httpService } from '../httpservice';

export interface UsageStatus {
  success: boolean;
  hasSubscription: boolean;
  subscription?: {
    id: number;
    plan_type: string;
    status: string;
    is_free_trial: boolean;
    isFreeTrial?: boolean; // Alias for compatibility
    trial_ends_at?: string;
    trialEndsAt?: string; // Alias for compatibility
  };
  usage?: {
    dailyLimit: number;
    used: number;
    remaining: number;
    canUse: boolean;
  };
  canStartFreeTrial?: boolean;
}

export interface SessionLimits {
  success: boolean;
  canCreate: boolean;
  limit: number;
  used: number;
  remaining: number;
}

export interface RoleplayLimits {
  success: boolean;
  canPlay: boolean;
  limit: number;
  used: number;
  remaining: number;
}

export interface FreeTrialResponse {
  success: boolean;
  trialEndsAt?: string;
  error?: string;
}

class UsageService {
  /**
   * @deprecated Frontend no longer calls GET /usage/status.
   * Keep this method to avoid breaking old imports, but do not use it.
   */
  async getUsageStatus(): Promise<UsageStatus> {
    return {
      success: false,
      hasSubscription: false,
      usage: {
        dailyLimit: 0,
        used: 0,
        remaining: 0,
        canUse: true,
      },
    };
  }

  /**
   * Start free trial
   * POST /usage/start-free-trial
   */
  async startFreeTrial(): Promise<FreeTrialResponse> {
    try {
      const response = await httpService.post('/usage/start-free-trial', {});
      return response.data;
    } catch (error: any) {
      // Failed to start free trial
      throw error;
    }
  }

  /**
   * Check scenario creation limit
   * POST /usage/check-scenario-limit
   */
  async checkScenarioLimit(): Promise<SessionLimits> {
    try {
      const response = await httpService.post('/usage/check-scenario-limit', {});
      return response.data;
    } catch (error: any) {
      // Failed to check scenario limit
      throw error;
    }
  }

  /**
   * Record scenario creation
   * POST /usage/record-scenario-creation
   */
  async recordScenarioCreation(): Promise<boolean> {
    try {
      const response = await httpService.post('/usage/record-scenario-creation', {});
      return response.data?.success || false;
    } catch (error: any) {
      // Failed to record scenario creation
      return false;
    }
  }

  /**
   * Check roleplay limit for a section
   * POST /usage/check-roleplay-limit
   */
  async checkRoleplayLimit(sectionName: string): Promise<RoleplayLimits> {
    try {
      const response = await httpService.post('/usage/check-roleplay-limit', {
        sectionName,
      });
      return response.data;
    } catch (error: any) {
      // Failed to check roleplay limit
      throw error;
    }
  }

  /**
   * Record roleplay session
   * POST /usage/record-roleplay-session
   */
  async recordRoleplaySession(sectionName: string): Promise<boolean> {
    try {
      const response = await httpService.post('/usage/record-roleplay-session', {
        sectionName,
      });
      return response.data?.success || false;
    } catch (error: any) {
      // Failed to record roleplay session
      return false;
    }
  }

  /**
   * Check if user can use a feature
   * Uses usage status to determine feature access
   */
  async canUseFeature(feature: 'call' | 'practice' | 'roleplay' | 'scenario_creation'): Promise<boolean> {
    try {
      if (feature === 'scenario_creation') {
        const limits = await this.checkScenarioLimit();
        return limits.canCreate;
      }

      // For call, practice, roleplay - server enforces limits; UI should not block.
      return true;
    } catch (error) {
      // Failed to check feature access
      return false;
    }
  }

  /**
   * Format time remaining in human-readable format
   */
  formatTimeRemaining(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  }
}

export const usageService = new UsageService();
