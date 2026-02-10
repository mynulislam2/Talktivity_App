import { useMemo } from 'react';
import type { TimeLimitStatus } from '@/service/TimeLimitService';

/**
 * @deprecated
 * Timeline completion state must come from `daily_progress` via `useDailyProgress`.
 * This hook is kept temporarily for backwards compatibility but should not be used.
 */
export interface TimelineStepState {
  speakingCompleted: boolean;
  quizCompleted: boolean;
  listeningCompleted: boolean;
  listeningQuizCompleted: boolean;
  todaysReportCompleted: boolean;
}

/**
 * Derive per-step enabled/disabled state for today's timeline
 * from the /usage/today-timeline booleans.
 *
 * Flow:
 * - Speaking (practice) -> Quiz -> Listening -> Listening Quiz
 */
export const useTimelineSteps = (
  timeStatus: TimeLimitStatus | null
): TimelineStepState => {
  return useMemo(() => {
    const isPracticeCompleted = timeStatus?.isPracticeCompleted ?? false;
    const quizCompleted = timeStatus?.quizCompleted ?? false;
    const listeningCompleted = timeStatus?.listeningCompleted ?? false;
    const listeningQuizCompleted = timeStatus?.listeningQuizCompleted ?? false;

    return {
      speakingCompleted: isPracticeCompleted,
      quizCompleted,
      listeningCompleted,
      listeningQuizCompleted,
      // Bug fix (but still deprecated): required all 4 flags, not double listeningQuizCompleted
      todaysReportCompleted: isPracticeCompleted && quizCompleted && listeningCompleted && listeningQuizCompleted,
    };
  }, [timeStatus]);
};

