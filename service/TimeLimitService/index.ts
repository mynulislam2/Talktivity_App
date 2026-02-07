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

import { progressService } from '../ProgressService';

export interface TimeLimitStatus {
  canStartCall: boolean;
  remainingTimeSeconds: number;
  remainingTimeFormatted: string;
}

class TimeLimitService {
  /**
   * Get remaining time for a session type
   * 
   * For practice/roleplay: Checks daily_progress to see if session is completed.
   * If not completed, assumes time is available (server will enforce actual limits).
   * 
   * For call: Always returns true (call limits are handled separately).
   * 
   * @param currentSessionDurationSeconds - Optional current session duration (not used, kept for compatibility)
   * @param sessionType - Type of session: 'practice', 'roleplay', or 'call'
   */
  async getRemainingTime(
    currentSessionDurationSeconds?: number,
    sessionType: 'practice' | 'roleplay' | 'call' = 'practice'
  ): Promise<TimeLimitStatus> {
    // Call sessions are tracked separately - always allow (server enforces lifetime limit)
    if (sessionType === 'call') {
      return {
        canStartCall: true,
        remainingTimeSeconds: 300, // Show 5 minutes (server will enforce actual lifetime limit)
        remainingTimeFormatted: '5m',
      };
    }

    // For practice/roleplay, check daily_progress to see if session is completed
    try {
      const progressResponse = await progressService.getTodayProgress();
      
      if (!progressResponse.success || !progressResponse.data) {
        // If we can't fetch progress, assume time is available (server will enforce)
        return {
          canStartCall: true,
          remainingTimeSeconds: 300,
          remainingTimeFormatted: '5m',
        };
      }

      const { progress, remaining } = progressResponse.data;
      const speakingRemaining = typeof remaining?.speaking_seconds === 'number'
        ? remaining.speaking_seconds
        : 300;
      const roleplayRemaining = typeof remaining?.roleplay_seconds === 'number'
        ? remaining.roleplay_seconds
        : 300;

      if (sessionType === 'practice') {
        const remainingSeconds = Math.max(0, speakingRemaining);
        const canStart = remainingSeconds > 0;
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
        const remainingSeconds = Math.max(0, roleplayRemaining);
        const canStart = remainingSeconds > 0;
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
      // Error checking time limits
      // On error, assume time is available (server will enforce)
      return {
        canStartCall: true,
        remainingTimeSeconds: 300,
        remainingTimeFormatted: '5m',
      };
    }

    // Default: assume time is available
    return {
      canStartCall: true,
      remainingTimeSeconds: 300,
      remainingTimeFormatted: '5m',
    };
  }

  /**
   * Check if user can start a session of a specific type
   * @param sessionType - Type of session: 'practice' or 'roleplay'
   */
  async canStartSession(sessionType: 'practice' | 'roleplay' = 'practice'): Promise<boolean> {
    // Check daily_progress to see if session is already completed
    try {
      const progressResponse = await progressService.getTodayProgress();
      if (!progressResponse.success || !progressResponse.data) {
        return true; // Can't check, assume yes (server will enforce)
      }

      const progress = progressResponse.data.progress;
      if (sessionType === 'practice') {
        return progress?.speaking_completed !== true;
      }
      if (sessionType === 'roleplay') {
        return progress?.roleplay_completed !== true;
      }
    } catch (error) {
      // Error checking if can start session
    }
    
    // Default: allow (server will enforce limits)
    return true;
  }
}

export const timeLimitService = new TimeLimitService();
