/**
 * Update Daily Progress After Session
 *
 * Legacy helper to update daily_progress after practice/roleplay sessions.
 *
 * NOTE: Practice and roleplay daily progress are now handled entirely in the
 * Python agent using daily_progress. Frontend no longer calls this function
 * for practice/roleplay; quizzes still use ProgressService directly.
 */

import {
  progressService,
  type DailyProgressUpdates,
} from '@/services/progress';
import type { PracticeSessionType } from '@/types/practice';
import { getTimeLimits } from './getTimeLimits';
import type { SubscriptionStatus } from '@/services/subscription';

export interface UpdateDailyProgressOptions {
  sessionType: PracticeSessionType;
  sessionDuration: number;
  startedAt: string | null;
  subscription?: SubscriptionStatus | null;
}

/**
 * Update daily_progress after a practice or roleplay session completes
 *
 * Sets *_started_at if not already set, and only marks *_completed = true
 * when session duration >= plan time limit.
 */
export async function updateDailyProgressAfterSession(
  options: UpdateDailyProgressOptions
): Promise<void> {
  const { sessionType, sessionDuration, startedAt, subscription } = options;
  const endedAt = new Date().toISOString();

  // Get time limits based on plan
  const limits = getTimeLimits(subscription || null);

  // Determine if session reached full time limit
  const timeLimit =
    sessionType === 'roleplay' ? limits.roleplay : limits.practice;
  const isCompleted = sessionDuration >= timeLimit;

  const updates: DailyProgressUpdates = {};

  if (sessionType === 'roleplay') {
    // Always update duration and timestamps
    updates.roleplay_duration_seconds = sessionDuration || 0;
    updates.roleplay_ended_at = endedAt;

    // Only set started_at if not already set (preserve first start time)
    if (startedAt) {
      updates.roleplay_started_at = startedAt;
    }

    // Only mark completed if full time limit reached
    updates.roleplay_completed = isCompleted;
  } else {
    // Always update duration and timestamps
    updates.speaking_duration_seconds = sessionDuration || 0;
    updates.speaking_ended_at = endedAt;

    // Only set started_at if not already set (preserve first start time)
    if (startedAt) {
      updates.speaking_started_at = startedAt;
    }

    // Only mark completed if full time limit reached
    updates.speaking_completed = isCompleted;
  }

  const resp = await progressService.updateDailyProgress(updates);
  if (!resp.success) {
    throw new Error(resp.error || 'Failed to update daily progress');
  }
}
