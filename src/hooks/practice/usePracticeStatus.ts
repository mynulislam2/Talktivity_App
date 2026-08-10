import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { timeLimitService } from '@/services/call/TimeLimitService';
import type { PracticeSessionType, PracticeStatus } from '@/types/practice';

export interface UsePracticeStatusReturn extends PracticeStatus {
  refreshStatus: () => Promise<void>;
}

const POLL_MS = 30_000; // 30 seconds

export function usePracticeStatus(
  sessionType: PracticeSessionType
): UsePracticeStatusReturn {
  const [status, setStatus] = useState<PracticeStatus>({
    canStartSession: true,
    remainingTime: '5m',
    remainingTimeSeconds: 300,
    isLoading: true,
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const fetchStatus = useCallback(async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

      const currentSessionType = sessionType;

      const timeStatus = await timeLimitService.getRemainingTime(
        undefined,
        currentSessionType
      );

      setStatus({
        canStartSession: timeStatus.canStartCall,
        remainingTime: timeStatus.remainingTimeFormatted || '0s',
        remainingTimeSeconds: timeStatus.remainingTimeSeconds,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load status',
      }));
    }
  }, [sessionType]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Poll every POLL_MS while app is foregrounded
  useEffect(() => {
    function startPolling() {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        timeLimitService.getRemainingTime(undefined, sessionType).then((timeStatus) => {
          setStatus((prev) => ({
            ...prev,
            canStartSession: timeStatus.canStartCall,
            remainingTime: timeStatus.remainingTimeFormatted || '0s',
            remainingTimeSeconds: timeStatus.remainingTimeSeconds,
          }));
        }).catch(() => {});
      }, POLL_MS);
    }

    function stopPolling() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    if (appStateRef.current === 'active') {
      startPolling();
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState;
      if (nextState === 'active') {
        fetchStatus();
        startPolling();
      } else {
        stopPolling();
      }
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [sessionType, fetchStatus]);

  const refreshStatus = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  return {
    ...status,
    refreshStatus,
  };
}
