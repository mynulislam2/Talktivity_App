import { useState, useEffect } from 'react';
import {
  timeLimitService,
  TimeLimitStatus,
} from '@/services/call/TimeLimitService';

export interface TimeLimitHook {
  timeStatus: TimeLimitStatus | null;
  isLoading: boolean;
  canStartCall: boolean;
  remainingTime: string;
  refreshTimeStatus: () => Promise<void>;
  checkCanStartSession: () => Promise<boolean>;
}

export interface UseTimeLimitsOptions {
  currentSessionDurationSeconds?: number;
  sessionType?: 'practice' | 'roleplay' | 'call';
  pollInterval?: number;
}

export const useTimeLimits = (
  options?: UseTimeLimitsOptions
): TimeLimitHook => {
  const { sessionType, pollInterval } = options || {};
  const normalizedSessionType = sessionType ?? 'call';
  const [timeStatus, setTimeStatus] = useState<TimeLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeStatus = async () => {
    try {
      setIsLoading(true);
      const status = await timeLimitService.getRemainingTime(
        undefined,
        normalizedSessionType
      );
      setTimeStatus(status);
    } catch {
      setTimeStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTimeStatus = async () => {
    await fetchTimeStatus();
  };

  const checkCanStartSession = async (
    type: 'practice' | 'roleplay' = 'practice'
  ): Promise<boolean> => {
    try {
      return await timeLimitService.canStartSession(type);
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchTimeStatus();
  }, [normalizedSessionType]);

  useEffect(() => {
    if (!pollInterval || pollInterval <= 0) return;

    const interval = setInterval(() => {
      fetchTimeStatus();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, normalizedSessionType]);

  const canStartCall = timeStatus?.canStartCall || false;
  const remainingTime = timeStatus?.remainingTimeFormatted || '0s';

  return {
    timeStatus,
    isLoading,
    canStartCall,
    remainingTime,
    refreshTimeStatus,
    checkCanStartSession,
  };
};
