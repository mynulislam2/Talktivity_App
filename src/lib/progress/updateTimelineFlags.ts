import { progressService } from '@/services/progress';

/**
 * Internal helper to refresh today's daily_progress from the backend.
 * This warms ProgressService's cache so Timeline/useDailyProgress
 * will see the latest completion flags without adding extra Home fetches.
 */
async function refreshTodayProgress(context: string): Promise<void> {
  try {
    await progressService.getTodayProgress();
    console.log(
      '[updateTimelineFlags] Refreshed daily progress after',
      context
    );
  } catch (error) {
    console.warn(
      '[updateTimelineFlags] Failed to refresh daily progress after',
      context,
      error
    );
  }
}

// Speaking (practice) step in today's plan
export function markSpeakingCompleted(): Promise<void> {
  return refreshTodayProgress('speaking');
}

// Speaking quiz step in today's plan
export function markQuizCompleted(): Promise<void> {
  return refreshTodayProgress('speaking-quiz');
}

// Listening step in today's plan
export function markListeningCompleted(): Promise<void> {
  return refreshTodayProgress('listening');
}

// Listening quiz step in today's plan
export function markListeningQuizCompleted(): Promise<void> {
  return refreshTodayProgress('listening-quiz');
}

// Today's report step in today's plan
export function markDailyReportCompleted(): Promise<void> {
  return refreshTodayProgress('today-report');
}
