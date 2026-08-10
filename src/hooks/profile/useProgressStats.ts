import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectProgressStats } from '@/store/slices/profileSlice';

export interface UseProgressStatsReturn {
  progressStats: any;
  currentWeek: number;
  speakingDays: number;
  quizDays: number;
  listeningDays: number;
  avgQuizScore: number;
  avgListeningQuizScore: number;
  monthlySessions: number;
  monthlyQuizzes: number;
  monthlyListening: number;
  monthlyListeningQuizzes: number;
  monthlyExams: number;
}

export function useProgressStats(): UseProgressStatsReturn {
  const progressStats = useAppSelector(selectProgressStats);

  const computed = useMemo(() => {
    const currentWeek = progressStats?.courseStatus?.course?.currentWeek || 0;
    const speakingDays =
      progressStats?.courseProgress?.progress?.speaking_days || 0;
    const quizDays = progressStats?.courseProgress?.progress?.quiz_days || 0;
    const listeningDays =
      progressStats?.courseProgress?.progress?.listening_days || 0;
    const avgQuizScore =
      progressStats?.courseProgress?.progress?.avg_quiz_score || 0;
    const avgListeningQuizScore =
      progressStats?.courseProgress?.progress?.avg_listening_quiz_score || 0;

    const monthlySessions = progressStats?.monthlyReport?.sessions?.length || 0;
    const monthlyQuizzes = progressStats?.monthlyReport?.quizzes?.length || 0;
    const monthlyListening =
      progressStats?.monthlyReport?.listeningSessions?.length || 0;
    const monthlyListeningQuizzes =
      progressStats?.monthlyReport?.listeningQuizzes?.length || 0;
    const monthlyExams = progressStats?.monthlyReport?.exams?.length || 0;

    return {
      currentWeek,
      speakingDays,
      quizDays,
      listeningDays,
      avgQuizScore,
      avgListeningQuizScore,
      monthlySessions,
      monthlyQuizzes,
      monthlyListening,
      monthlyListeningQuizzes,
      monthlyExams,
    };
  }, [progressStats]);

  return {
    progressStats,
    ...computed,
  };
}
