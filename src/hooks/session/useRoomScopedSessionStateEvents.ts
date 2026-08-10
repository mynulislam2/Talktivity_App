import { useEffect, useRef } from 'react';
import { isEventForActiveRoom } from '@/lib/session/sessionLifecycle';
import socket, {
  connectSocket,
  subscribeToSessionState,
  type SessionStatePayload,
} from '@/services/socket';

export interface UseRoomScopedSessionStateEventsOptions {
  activeRoomName: string | null;
  onSaving?: (message?: string) => void;
  onSaved?: () => void;
  onFailed?: (message?: string) => void;
}

export function useRoomScopedSessionStateEvents(
  options: UseRoomScopedSessionStateEventsOptions
): void {
  const { activeRoomName, onSaving, onSaved, onFailed } = options;

  const activeRoomNameRef = useRef(activeRoomName);
  const onSavingRef = useRef(onSaving);
  const onSavedRef = useRef(onSaved);
  const onFailedRef = useRef(onFailed);

  useEffect(() => {
    activeRoomNameRef.current = activeRoomName;
  }, [activeRoomName]);

  useEffect(() => {
    onSavingRef.current = onSaving;
    onSavedRef.current = onSaved;
    onFailedRef.current = onFailed;
  }, [onSaving, onSaved, onFailed]);

  useEffect(() => {
    if (!socket.connected) {
      connectSocket();
    }

    const handleSessionState = (payload: SessionStatePayload) => {
      if (!isEventForActiveRoom(payload, activeRoomNameRef.current)) {
        return;
      }

      switch (payload.state) {
        case 'SAVING_CONVERSATION':
          onSavingRef.current?.(payload.message);
          break;
        case 'SESSION_SAVED':
          onSavedRef.current?.();
          break;
        case 'SESSION_SAVE_FAILED':
          onFailedRef.current?.(payload.message);
          break;
      }
    };

    const unsubscribe = subscribeToSessionState(handleSessionState);
    return () => unsubscribe();
  }, []);
}
