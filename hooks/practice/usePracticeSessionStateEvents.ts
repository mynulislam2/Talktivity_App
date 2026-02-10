/**
 * usePracticeSessionStateEvents Hook
 * 
 * Handles Socket.IO session state events for practice/roleplay sessions.
 * Key difference from call: Does NOT navigate on SESSION_SAVED.
 * Updates daily_progress and shows toast instead.
 */

import { useEffect } from 'react';
import { Alert } from 'react-native';
import { connectSocket, subscribeToSessionState, SessionStatePayload } from '@/service/SocketService';
import socket from '@/service/SocketService';
import { updateDailyProgressAfterSession } from '@/lib/practice/updateDailyProgress';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentSubscription } from '@/store/slices/subscriptionSlice';
import type { PracticeSessionType } from '@/types/practice';

export interface UsePracticeSessionStateEventsOptions {
  sessionType: PracticeSessionType;
  onSaving: (message?: string) => void;
  onSaved: () => void;
  onFailed: (message?: string) => void;
  onEndSession: () => void;
  refreshStatus: () => Promise<void>;
}

export function usePracticeSessionStateEvents(
  options: UsePracticeSessionStateEventsOptions
): void {
  const { sessionType, onSaving, onSaved, onFailed, onEndSession, refreshStatus } = options;
  const { currentSession, endSession: endTracking, sessionDuration, startSession } = useSessionTracking();
  const subscription = useAppSelector(selectCurrentSubscription);

  useEffect(() => {
    // Connect socket if not connected
    if (!socket.connected) {
      // Use IIFE to handle async connectSocket
      (async () => {
        try {
          await connectSocket();
        } catch (error) {
          console.error('Failed to connect socket:', error);
        }
      })();
    }

    const handleSessionState = async (payload: SessionStatePayload) => {
      // Practice session state event

      switch (payload.state) {
        case 'SAVING_CONVERSATION':
          onSaving(payload.message || 'Saving your conversation…');
          onEndSession();
          await endTracking();
          break;

        case 'SESSION_SAVED':
          // End local session tracking first so duration/endedAt are final
          await endTracking();

          // Calculate duration directly from session timestamps (more reliable than hook state)
          // This avoids race conditions where hook state might not have updated yet
          let finalDuration = 0;
          if (currentSession?.startedAt) {
            const startTime = new Date(currentSession.startedAt).getTime();
            const endTime = Date.now();
            finalDuration = Math.floor((endTime - startTime) / 1000);
            // Ensure duration is valid (non-negative and reasonable)
            if (finalDuration < 0 || !Number.isFinite(finalDuration)) {
              finalDuration = sessionDuration || 0;
            }
          } else {
            // Fallback to hook state if session info is missing
            finalDuration = sessionDuration || 0;
          }

          onSaved();
          // Show success message (using Alert for React Native)
          Alert.alert('Success', 'Session saved successfully!');
          
          // Refresh time limits after session
          await refreshStatus();
          break;

        case 'SESSION_SAVE_FAILED':
          onFailed(payload.message || 'Failed to save conversation.');
          Alert.alert('Error', payload.message || 'Failed to save conversation');
          break;
      }
    };

    const unsubscribe = subscribeToSessionState(handleSessionState);
    return () => unsubscribe();
  }, [sessionType, onSaving, onSaved, onFailed, onEndSession, refreshStatus, endTracking, currentSession, sessionDuration, subscription]);
}
