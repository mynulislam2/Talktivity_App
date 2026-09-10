/**
 * Time Limit Service
 *
 * Handles time limit checking for practice, roleplay, and call sessions.
 *
 * NOTE: Time limits are enforced server-side by the Python agent.
 * This service provides UI state only - it checks daily_progress to determine
 * if practice/roleplay sessions have been completed today.
 *
 * IMPORTANT: This service does NOT track "call" sessions (5-minute lifetime limit).
 * Call sessions are tracked separately in call modules and user_lifecycle.call_completed.
 */

import { progressService } from '../progress';
import { callService } from './index';

export interface TimeLimitStatus {
  canStartCall: boolean;
  remainingTimeSeconds: number | null;
  remainingTimeFormatted: string;
}

class TimeLimitService {
  /**
   * Get remaining time for a session type
   *
   * For practice/roleplay: Checks daily_progress to see if session is completed.
   * If not completed, assumes time is available (server will enforce actual limits).
   *
   * For call: Checks real lifetime onboarding call status from GET /api/call/status.
   *
   * @param currentSessionDurationSeconds - Optional current session duration (not used, kept for compatibility)
   * @param sessionType - Type of session: 'practice', 'roleplay', or 'call'
   */
  async getRemainingTime(
    currentSessionDurationSeconds?: number,
    sessionType: 'practice' | 'roleplay' | 'call' = 'practice'
  ): Promise<TimeLimitStatus> {
    if (sessionType === 'call') {
      try {
        const callStatusResponse = await callService.getCallStatus();
        const lifetime = callStatusResponse.data?.lifetime;
        const canStart = lifetime?.canCall ?? false;
        const remainingSeconds = lifetime?.remaining ?? 0;
        const remainingTimeFormatted =
          remainingSeconds >= 60
            ? `${Math.round(remainingSeconds / 60)}m`
            : `${remainingSeconds}s`;

        return {
          canStartCall: canStart,
          remainingTimeSeconds: remainingSeconds,
          remainingTimeFormatted,
        };
      } catch {
        return {
          canStartCall: false,
          remainingTimeSeconds: 0,
          remainingTimeFormatted: '0s',
        };
      }
    }

    // For practice/roleplay, check daily_progress to see if session is completed
    try {
      const progressResponse = await progressService.getTodayProgress();

      if (!progressResponse.success || !progressResponse.data) {
        return {
          canStartCall: false,
          remainingTimeSeconds: 0,
          remainingTimeFormatted: '0s',
        };
      }

      const { remaining } = progressResponse.data;
      const speakingRemaining =
        remaining?.speaking_seconds !== undefined
          ? remaining.speaking_seconds
          : null;
      const roleplayRemaining =
        remaining?.roleplay_seconds !== undefined
          ? remaining.roleplay_seconds
          : null;

      if (sessionType === 'practice') {
        if (speakingRemaining === null) {
          return {
            canStartCall: true,
            remainingTimeSeconds: null,
            remainingTimeFormatted: 'Unlimited',
          };
        }

        const rawRemaining = Math.max(0, speakingRemaining);
        const canStart = rawRemaining > 30;
        const remainingSeconds = canStart ? rawRemaining : 0;
        const remainingTimeFormatted =
          remainingSeconds >= 60
            ? `${Math.round(remainingSeconds / 60)}m`
            : `${remainingSeconds}s`;

        return {
          canStartCall: canStart,
          remainingTimeSeconds: remainingSeconds,
          remainingTimeFormatted,
        };
      }

      if (sessionType === 'roleplay') {
        if (roleplayRemaining === null) {
          return {
            canStartCall: true,
            remainingTimeSeconds: null,
            remainingTimeFormatted: 'Unlimited',
          };
        }

        const rawRemaining = Math.max(0, roleplayRemaining);
        const canStart = rawRemaining > 30;
        const remainingSeconds = canStart ? rawRemaining : 0;
        const remainingTimeFormatted =
          remainingSeconds >= 60
            ? `${Math.round(remainingSeconds / 60)}m`
            : `${remainingSeconds}s`;

        return {
          canStartCall: canStart,
          remainingTimeSeconds: remainingSeconds,
          remainingTimeFormatted,
        };
      }
    } catch (error) {
      return {
        canStartCall: false,
        remainingTimeSeconds: 0,
        remainingTimeFormatted: '0s',
      };
    }

    return {
      canStartCall: false,
      remainingTimeSeconds: 0,
      remainingTimeFormatted: '0s',
    };
  }

  /**
   * Check if user can start a session of a specific type
   * @param sessionType - Type of session: 'practice' or 'roleplay'
   */
  async canStartSession(
    sessionType: 'practice' | 'roleplay' = 'practice'
  ): Promise<boolean> {
    try {
      const status = await this.getRemainingTime(undefined, sessionType);
      return status.canStartCall;
    } catch (error) {
      // Default: allow (server will enforce limits)
      return true;
    }
  }
}

export const timeLimitService = new TimeLimitService();
