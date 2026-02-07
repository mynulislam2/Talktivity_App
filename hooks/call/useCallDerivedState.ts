/**
 * useCallDerivedState Hook
 * 
 * Calculates derived states from session state and call status.
 * Provides computed values for UI display.
 */

import { useMemo } from 'react';
import { CallSessionState } from '@/types/call';

export interface UseCallDerivedStateOptions {
  sessionState: CallSessionState;
  totalDuration: number;
  isExam?: boolean;
}

export interface UseCallDerivedStateReturn {
  stateText: string;
  stateColor: string;
  sessionTitle: string;
  hasCompletedLongCall: boolean;
}

export function useCallDerivedState(
  options: UseCallDerivedStateOptions
): UseCallDerivedStateReturn {
  const { sessionState, totalDuration, isExam = false } = options;

  const stateText = useMemo(() => {
    if (sessionState.isConnected) return 'Live';
    if (sessionState.isConnecting) return 'Connecting';
    return 'Ready';
  }, [sessionState.isConnected, sessionState.isConnecting]);

  const stateColor = useMemo(() => {
    if (sessionState.isConnected) return 'bg-emerald-400';
    if (sessionState.isConnecting) return 'bg-amber-400';
    return 'bg-gray-400';
  }, [sessionState.isConnected, sessionState.isConnecting]);

  const sessionTitle = useMemo(() => {
    return isExam ? 'Weekly Speaking Exam' : 'Speaking Assessment';
  }, [isExam]);

  const hasCompletedLongCall = useMemo(() => {
    return totalDuration >= 5 * 60; // 5 minutes in seconds
  }, [totalDuration]);

  return {
    stateText,
    stateColor,
    sessionTitle,
    hasCompletedLongCall,
  };
}
