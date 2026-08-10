import { useEffect, useRef } from 'react';

export interface UsePracticeSessionStateEventsOptions {
  activeRoomName?: string | null;
  sessionType?: string;
  endSession: () => void | Promise<void>;
  onSaving: (message?: string) => void;
  onSaved: () => void;
  onFailed: (message?: string) => void;
  refreshStatus: () => Promise<void>;
}

export function usePracticeSessionStateEvents(
  options: UsePracticeSessionStateEventsOptions
): void {
  const {
    activeRoomName,
    endSession,
    onSaving,
    onSaved,
    onFailed,
    refreshStatus,
  } = options;

  const refreshStatusRef = useRef(refreshStatus);
  useEffect(() => {
    refreshStatusRef.current = refreshStatus;
  }, [refreshStatus]);

  // Room-scoped session state events handled by LiveKit room events
  // For now, this is a thin wrapper that the RN app will integrate with
  // the native LiveKit SDK
}
