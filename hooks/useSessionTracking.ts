import { useState, useEffect, useCallback, useMemo } from 'react';
import { sessionTrackingService, SessionInfo } from '@/service/SessionTrackingService';

export interface SessionTrackingHook {
  currentSession: SessionInfo | null;
  isSessionActive: boolean;
  sessionDuration: number;
  startSession: (sessionType: 'call' | 'practice' | 'roleplay') => Promise<void>;
  endSession: () => Promise<void>;
  timeLimitExceeded: boolean;
  timeLimitMessage: string;
}

export const useSessionTracking = (): SessionTrackingHook => {
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [timeLimitExceeded, setTimeLimitExceeded] = useState(false);
  const [timeLimitMessage, setTimeLimitMessage] = useState('');

  // Update session state
  const updateSessionState = useCallback(() => {
    const session = sessionTrackingService.getCurrentSession();
    setCurrentSession(session);
  }, []);

  // Start session
  const startSession = useCallback(async (sessionType: 'call' | 'practice' | 'roleplay') => {
    try {
      setTimeLimitExceeded(false);
      setTimeLimitMessage('');
      
      const session = await sessionTrackingService.startSession(sessionType);
      setCurrentSession(session);
    } catch (error) {
      // Error starting session
      throw error;
    }
  }, []);

  // End session
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

  // Handle time limit exceeded event
  // Note: In React Native, we check time limits through the periodic state updates
  // instead of DOM events. Time limit checks are handled by the service and
  // will be reflected in the session state when updateSessionState is called.
  useEffect(() => {
    // Time limit exceeded state is managed through session state updates
    // The service will mark sessions as ended when time limits are exceeded
    // This will be reflected in currentSession state changes
  }, []);

  // Update session state periodically
  useEffect(() => {
    const interval = setInterval(updateSessionState, 1000);
    return () => clearInterval(interval);
  }, [updateSessionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionTrackingService.cleanup();
    };
  }, []);

  // Calculate isSessionActive and sessionDuration from currentSession state
  // Don't call service methods directly at top level (SSR issue)
  const isSessionActive = Boolean(currentSession && !currentSession.endedAt);
  const sessionDuration = useMemo(() => {
    if (!currentSession?.startedAt) return 0;
    const start = new Date(currentSession.startedAt).getTime();
    const end = currentSession.endedAt ? new Date(currentSession.endedAt).getTime() : Date.now();
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
    timeLimitMessage
  };
};
