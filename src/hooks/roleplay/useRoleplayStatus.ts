import { useState, useEffect, useCallback } from 'react';
import { timeLimitService } from '@/services/call/TimeLimitService';
import type { PracticeStatus } from '@/types/practice';

export interface UseRoleplayStatusReturn extends PracticeStatus {
  refreshStatus: () => Promise<void>;
}

export function useRoleplayStatus(): UseRoleplayStatusReturn {
  const [status, setStatus] = useState<PracticeStatus>({
    canStartSession: true,
    remainingTime: '5m',
    remainingTimeSeconds: 300,
    isLoading: true,
    error: null,
  });

  const fetchStatus = useCallback(async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true, error: null }));

      const timeStatus = await timeLimitService.getRemainingTime(
        undefined,
        'roleplay'
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
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const refreshStatus = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  return {
    ...status,
    refreshStatus,
  };
}
