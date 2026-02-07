/**
 * usePracticeStatus Hook
 * 
 * Manages time limits and eligibility for practice/roleplay sessions.
 * Uses TimeLimitService to check remaining time based on daily_progress.
 */

import { useState, useEffect, useCallback } from 'react';
import { timeLimitService } from '@/service/TimeLimitService';
import type { PracticeSessionType } from '@/types/practice';
import type { PracticeStatus } from '@/types/practice';

export interface UsePracticeStatusReturn extends PracticeStatus {
  refreshStatus: () => Promise<void>;
}

export function usePracticeStatus(sessionType: PracticeSessionType): UsePracticeStatusReturn {
  const [status, setStatus] = useState<PracticeStatus>({
    canStartSession: true,
    remainingTime: '5m',
    remainingTimeSeconds: 300,
    isLoading: true,
    error: null,
  });

  const fetchStatus = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      const timeStatus = await timeLimitService.getRemainingTime(undefined, sessionType);
      
      setStatus({
        canStartSession: timeStatus.canStartCall,
        remainingTime: timeStatus.remainingTimeFormatted || '0s',
        remainingTimeSeconds: timeStatus.remainingTimeSeconds,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Error fetching practice status
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load status',
      }));
    }
  }, [sessionType]);

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
