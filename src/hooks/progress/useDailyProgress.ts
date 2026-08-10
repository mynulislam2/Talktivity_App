import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import type { CourseStatus } from '@/services/course';
import { progressService, type DailyProgressData } from '@/services/progress';

export interface DailyProgressBooleans {
  speakingCompleted: boolean;
  reviewUnlocked: boolean;
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
    reviewUnlocked: false,
    quizCompleted: false,
    listeningCompleted: false,
    listeningQuizCompleted: false,
    roleplayCompleted: false,
  };
}

/**
 * Polls the daily progress API every POLL_MS while the app is foregrounded.
 * Once all activities are complete, polling stops to save resources.
 */
const POLL_MS = 30_000; // 30 seconds

function isFullyComplete(b: DailyProgressBooleans, dayType?: string): boolean {
  if (!dayType || dayType === 'all_activities') {
    return (
      b.speakingCompleted &&
      b.quizCompleted &&
      b.listeningCompleted &&
      b.listeningQuizCompleted
    );
  }
  // speaking_exam
  return b.speakingCompleted && b.quizCompleted;
}

export function useDailyProgress(
  courseStatus: CourseStatus | null
): UseDailyProgressResult {
  const [data, setData] = useState<DailyProgressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await progressService.getTodayProgress();
      if (!result.success || !result.data) {
        setData(null);
        setError(result.error || 'Failed to load daily progress');
        return;
      }
      setData(result.data);
    } catch (e: any) {
      setData(null);
      setError(e?.message || 'Failed to load daily progress');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when courseStatus changes
  useEffect(() => {
    if (!courseStatus) return;
    refresh();
  }, [courseStatus, refresh]);

  // Derive booleans
  const booleans = useMemo<DailyProgressBooleans>(() => {
    const p = data?.progress;
    if (!p) return getDefaultBooleans();

    const speakingCompleted = Boolean(p.speaking_completed);
    const speakingDurationSec = Number(p.speaking_duration_seconds || 0);

    // Review unlocks when speaking is done AND user spoke for at least 5 minutes
    // (same as backend condition REVIEW_UNLOCK_SECONDS = 300).
    // We derive this frontend-side so the card enables immediately once the
    // session duration threshold is met, without waiting for the backend's
    // hasCurrentPracticeConversation() check (which requires a matching
    // conversations row that may not exist yet or ever).
    const reviewUnlocked =
      speakingCompleted && speakingDurationSec >= 300;

    return {
      speakingCompleted,
      reviewUnlocked,
      quizCompleted: Boolean(p.speaking_quiz_completed),
      listeningCompleted: Boolean(p.listening_completed),
      listeningQuizCompleted: Boolean(p.listening_quiz_completed),
      roleplayCompleted: Boolean(p.roleplay_completed),
    };
  }, [data]);

  // -------- Polling logic: poll every POLL_MS while app is foregrounded --------
  useEffect(() => {
    const dayType = courseStatus?.course?.dayType;

    // Stop polling if everything is already complete
    if (isFullyComplete(booleans, dayType)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    function startPolling() {
      if (intervalRef.current) return; // already running
      intervalRef.current = setInterval(() => {
        // Don't set loading=true during background polls to avoid UI flash
        progressService.getTodayProgress().then((result) => {
          if (result.success && result.data) {
            setData(result.data);
          }
        }).catch(() => {
          // Silently ignore poll errors
        });
      }, POLL_MS);
    }

    function stopPolling() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Start polling if app is active
    if (appStateRef.current === 'active') {
      startPolling();
    }

    // Listen to app state changes
    const subscription = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState;
      if (nextState === 'active') {
        // Refresh immediately on foreground, then start polling
        refresh();
        startPolling();
      } else {
        stopPolling();
      }
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [booleans, courseStatus?.course?.dayType, refresh]);

  return { data, booleans, loading, error, refresh };
}
