import { useMemo } from 'react';
import type {
  PracticeSessionState,
  PracticeSessionType,
} from '@/types/practice';

export interface UsePracticeDerivedStateOptions {
  sessionState: PracticeSessionState;
  sessionType: PracticeSessionType;
}

export interface UsePracticeDerivedStateReturn {
  stateText: string;
  stateColor: string;
  sessionTitle: string;
  sessionLabel: string;
}

export function usePracticeDerivedState(
  options: UsePracticeDerivedStateOptions
): UsePracticeDerivedStateReturn {
  const { sessionState, sessionType } = options;

  const stateText = useMemo(() => {
    if (sessionState.isConnected) return 'Connected';
    if (sessionState.isConnecting) return 'Connecting';
    return 'Not Connected';
  }, [sessionState.isConnected, sessionState.isConnecting]);

  const stateColor = useMemo(() => {
    if (sessionState.isConnected) return 'bg-emerald-400';
    if (sessionState.isConnecting) return 'bg-amber-400';
    return 'bg-gray-400';
  }, [sessionState.isConnected, sessionState.isConnecting]);

  const sessionLabel = useMemo(() => {
    return sessionType === 'roleplay' ? 'Roleplay' : 'Practice';
  }, [sessionType]);

  const sessionTitle = useMemo(() => {
    return sessionType === 'roleplay' ? 'Roleplay Session' : 'Practice Session';
  }, [sessionType]);

  return {
    stateText,
    stateColor,
    sessionTitle,
    sessionLabel,
  };
}
