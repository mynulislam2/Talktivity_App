import { useState, useCallback } from 'react';

export type PracticeSessionSaveState =
  | 'SAVING_CONVERSATION'
  | 'SESSION_SAVE_FAILED'
  | null;

export interface UsePracticeSavingReturn {
  isSavingSession: boolean;
  sessionSaveState: PracticeSessionSaveState;
  sessionSaveMessage: string | null;
  setSaving: (message?: string) => void;
  setSaved: () => void;
  setFailed: (message?: string) => void;
  dismissError: () => void;
}

export function usePracticeSaving(): UsePracticeSavingReturn {
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionSaveState, setSessionSaveState] =
    useState<PracticeSessionSaveState>(null);
  const [sessionSaveMessage, setSessionSaveMessage] = useState<string | null>(
    null
  );

  const setSaving = useCallback((message?: string) => {
    setIsSavingSession(true);
    setSessionSaveState('SAVING_CONVERSATION');
    setSessionSaveMessage(message || null);
  }, []);

  const setSaved = useCallback(() => {
    setIsSavingSession(false);
    setSessionSaveState(null);
    setSessionSaveMessage(null);
  }, []);

  const setFailed = useCallback((message?: string) => {
    setIsSavingSession(true);
    setSessionSaveState('SESSION_SAVE_FAILED');
    setSessionSaveMessage(message || null);
  }, []);

  const dismissError = useCallback(() => {
    setIsSavingSession(false);
    setSessionSaveState(null);
    setSessionSaveMessage(null);
  }, []);

  return {
    isSavingSession,
    sessionSaveState,
    sessionSaveMessage,
    setSaving,
    setSaved,
    setFailed,
    dismissError,
  };
}
