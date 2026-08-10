import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  sessionTrackingService,
  SessionInfo,
} from '@/services/call/SessionTrackingService';

export interface SessionTrackingHook {
  currentSession: SessionInfo | null;
  isSessionActive: boolean;
  sessionDuration: number;
  startSession: (
    sessionType: 'call' | 'practice' | 'roleplay'
  ) => Promise<void>;
  endSession: () => Promise<void>;
  timeLimitExceeded: boolean;
  timeLimitMessage: string;
}

export const useSessionTracking = (): SessionTrackingHook => {
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(
    null
  );
  const [timeLimitExceeded, setTimeLimitExceeded] = useState(false);
  const [timeLimitMessage, setTimeLimitMessage] = useState('');

  const updateSessionState = useCallback(async () => {
    const session = await sessionTrackingService.getCurrentSession();
    setCurrentSession(session);
  }, []);

  const startSession = useCallback(
    async (sessionType: 'call' | 'practice' | 'roleplay') => {
      try {
        setTimeLimitExceeded(false);
        setTimeLimitMessage('');

        const session = await sessionTrackingService.startSession(sessionType);
        setCurrentSession(session);
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const endSession = useCallback(async () => {
    try {
      await sessionTrackingService.endSession();
      setCurrentSession(null);
      setTimeLimitExceeded(false);
      setTimeLimitMessage('');
    } catch (error) {
      // Error ending session
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      void updateSessionState();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateSessionState]);

  useEffect(() => {
    return () => {
      sessionTrackingService.cleanup();
    };
  }, []);

  const isSessionActive = Boolean(currentSession && !currentSession.endedAt);
  const sessionDuration = useMemo(() => {
    if (!currentSession?.startedAt) return 0;
    const start = new Date(currentSession.startedAt).getTime();
    const end = currentSession.endedAt
      ? new Date(currentSession.endedAt).getTime()
      : Date.now();
    const seconds = Math.floor((end - start) / 1000);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  }, [currentSession]);

  return {
    currentSession,
    isSessionActive,
    sessionDuration,
    startSession,
    endSession,
    timeLimitExceeded,
    timeLimitMessage,
  };
};
