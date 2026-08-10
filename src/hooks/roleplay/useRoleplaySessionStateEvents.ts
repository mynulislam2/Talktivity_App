import { useEffect } from 'react';
import {
  connectSocket,
  subscribeToSessionState,
  subscribeToCoachingNudge,
  SessionStatePayload,
  CoachingNudgePayload,
} from '@/services/socket';
import socket from '@/services/socket';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentSubscription } from '@/store/slices/subscriptionSlice';

export interface UseRoleplaySessionStateEventsOptions {
  onSaving: (message?: string) => void;
  onSaved: () => void;
  onFailed: (message?: string) => void;
  onEndSession: () => void;
  refreshStatus: () => Promise<void>;
  onCoachingNudge?: (payload: CoachingNudgePayload) => void;
}

export function useRoleplaySessionStateEvents(
  options: UseRoleplaySessionStateEventsOptions
): void {
  const {
    onSaving,
    onSaved,
    onFailed,
    onEndSession,
    refreshStatus,
    onCoachingNudge,
  } = options;
  const {
    currentSession,
    endSession: endTracking,
    sessionDuration,
  } = useSessionTracking();
  const subscription = useAppSelector(selectCurrentSubscription);

  useEffect(() => {
    if (!socket.connected) {
      connectSocket();
    }

    const handleSessionState = async (payload: SessionStatePayload) => {
      switch (payload.state) {
        case 'SAVING_CONVERSATION':
          onSaving(payload.message || 'Saving your conversationâ€¦');
          onEndSession();
          await endTracking();
          break;

        case 'SESSION_SAVED':
          await endTracking();

          let finalDuration = 0;
          if (currentSession?.startedAt) {
            const startTime = new Date(currentSession.startedAt).getTime();
            const endTime = Date.now();
            finalDuration = Math.floor((endTime - startTime) / 1000);
            if (finalDuration < 0 || !Number.isFinite(finalDuration)) {
              finalDuration = sessionDuration || 0;
            }
          } else {
            finalDuration = sessionDuration || 0;
          }

          onSaved();
          await refreshStatus();
          break;

        case 'SESSION_SAVE_FAILED':
          onFailed(payload.message || 'Failed to save conversation.');
          break;
      }
    };

    const unsubscribe = subscribeToSessionState(handleSessionState);

    const unsubNudge = onCoachingNudge
      ? subscribeToCoachingNudge((payload) => onCoachingNudge(payload))
      : () => {};

    return () => {
      unsubscribe();
      unsubNudge();
    };
  }, [
    onSaving,
    onSaved,
    onFailed,
    onEndSession,
    refreshStatus,
    endTracking,
    currentSession,
    sessionDuration,
    subscription,
    onCoachingNudge,
  ]);
}
