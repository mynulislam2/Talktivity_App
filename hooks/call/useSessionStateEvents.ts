/**
 * useSessionStateEvents Hook
 * 
 * Handles socket subscription and session state events.
 * Automatically connects socket if not connected and cleans up on unmount.
 */

import { useEffect } from 'react';
import socket, { connectSocket, subscribeToSessionState, SessionStatePayload } from '@/service/SocketService';

export interface UseSessionStateEventsOptions {
  onSaving?: (message?: string) => void;
  onSaved?: () => void;
  onFailed?: (message?: string) => void;
  onEndSession?: () => void;
}

export function useSessionStateEvents(options: UseSessionStateEventsOptions): void {
  const { onSaving, onSaved, onFailed, onEndSession } = options;

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

    const handleSessionState = (payload: SessionStatePayload) => {
      switch (payload.state) {
        case 'SAVING_CONVERSATION':
          onSaving?.(payload.message);
          onEndSession?.();
          break;
        case 'SESSION_SAVED':
          onSaved?.();
          break;
        case 'SESSION_SAVE_FAILED':
          onFailed?.(payload.message);
          break;
      }
    };

    const unsubscribe = subscribeToSessionState(handleSessionState);
    
    return () => {
      unsubscribe();
    };
  }, [onSaving, onSaved, onFailed, onEndSession]);
}
