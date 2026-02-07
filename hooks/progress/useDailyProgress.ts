import { useCallback, useEffect, useMemo, useState } from "react";
import type { CourseStatus } from "@/service/CourseService";
import { progressService, type DailyProgressData } from "@/service/ProgressService";

export interface DailyProgressBooleans {
  speakingCompleted: boolean;
  quizCompleted: boolean;
  listeningCompleted: boolean;
  listeningQuizCompleted: boolean;
  roleplayCompleted: boolean;
}

export interface UseDailyProgressResult {
  data: DailyProgressData | null;
  booleans: DailyProgressBooleans;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function getDefaultBooleans(): DailyProgressBooleans {
  return {
    speakingCompleted: false,
    quizCompleted: false,
    listeningCompleted: false,
    listeningQuizCompleted: false,
    roleplayCompleted: false,
  };
}

export function useDailyProgress(courseStatus: CourseStatus | null): UseDailyProgressResult {
  const [data, setData] = useState<DailyProgressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await progressService.getTodayProgress();
      if (!result.success || !result.data) {
        setData(null);
        setError(result.error || "Failed to load daily progress");
        return;
      }
      setData(result.data);
    } catch (e: any) {
      setData(null);
      setError(e?.message || "Failed to load daily progress");
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh when course context changes (new day / new course).
  useEffect(() => {
    if (!courseStatus) return;
    refresh();
  }, [courseStatus, refresh]);

  const booleans = useMemo<DailyProgressBooleans>(() => {
    const p = data?.progress;
    if (!p) return getDefaultBooleans();

    return {
      speakingCompleted: Boolean(p.speaking_completed),
      quizCompleted: Boolean(p.speaking_quiz_completed),
      listeningCompleted: Boolean(p.listening_completed),
      listeningQuizCompleted: Boolean(p.listening_quiz_completed),
      roleplayCompleted: Boolean(p.roleplay_completed),
    };
  }, [data]);

  return { data, booleans, loading, error, refresh };
}

