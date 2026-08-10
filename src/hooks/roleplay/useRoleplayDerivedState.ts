import { useMemo } from 'react';
import type { PracticeSessionState } from '@/types/practice';

export interface UseRoleplayDerivedStateOptions {
  sessionState: PracticeSessionState;
}

export interface UseRoleplayDerivedStateReturn {
  stateText: string;
  stateColor: string;
  sessionTitle: string;
  sessionLabel: string;
}

export function useRoleplayDerivedState(
  options: UseRoleplayDerivedStateOptions
): UseRoleplayDerivedStateReturn {
  const { sessionState } = options;

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

  const sessionLabel = 'Roleplay';
  const sessionTitle = 'Roleplay Session';

  return {
    stateText,
    stateColor,
    sessionTitle,
    sessionLabel,
  };
}
