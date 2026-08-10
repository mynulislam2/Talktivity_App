import { useMemo } from 'react';

export interface TimelineStepState {
  speakingCompleted: boolean;
  quizCompleted: boolean;
  listeningCompleted: boolean;
  listeningQuizCompleted: boolean;
  todaysReportCompleted: boolean;
}

export interface TimeLimitStatus {
  isPracticeCompleted?: boolean;
  quizCompleted?: boolean;
  listeningCompleted?: boolean;
  listeningQuizCompleted?: boolean;
}

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
      todaysReportCompleted:
        isPracticeCompleted &&
        quizCompleted &&
        listeningCompleted &&
        listeningQuizCompleted,
    };
  }, [timeStatus]);
};
