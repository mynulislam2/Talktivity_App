import { useState, useEffect } from 'react';
import { timeLimitService, TimeLimitStatus } from '@/service/TimeLimitService';

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
  pollInterval?: number; // Poll interval in milliseconds (0 to disable polling)
}

export const useTimeLimits = (options?: UseTimeLimitsOptions): TimeLimitHook => {
  const { sessionType, pollInterval } = options || {};
  // Default to 'call' so the call page is never blocked before connecting
  const normalizedSessionType = sessionType ?? 'call';
  const [timeStatus, setTimeStatus] = useState<TimeLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeStatus = async () => {
    try {
      setIsLoading(true);
      // For limits, we only care about sessionType; duration is handled on the server.
      const status = await timeLimitService.getRemainingTime(undefined, normalizedSessionType);
      setTimeStatus(status);
    } catch (error) {
      // Error fetching time status
      setTimeStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTimeStatus = async () => {
    await fetchTimeStatus();
  };

  // Allow checking a specific session type dynamically
  const checkCanStartSession = async (type: 'practice' | 'roleplay' = 'practice'): Promise<boolean> => {
    try {
      return await timeLimitService.canStartSession(type);
    } catch (error) {
      // Error checking if can start session
      return false;
    }
  };

  useEffect(() => {
    fetchTimeStatus();
  }, [normalizedSessionType]);

  // Poll for updates if pollInterval is set and > 0
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
    checkCanStartSession
  };
};
