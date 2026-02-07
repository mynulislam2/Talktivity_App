/**
 * Practice Session Types
 * 
 * Type definitions for practice and roleplay session state.
 */

import type { AgentState } from '@livekit/components-react';
import type { ConnectionDetails } from '@/app/api/connection-details/route';

export type PracticeSessionType = 'practice' | 'roleplay';

export interface PracticeSessionState {
  agentState: AgentState;
  isConnected: boolean;
  isConnecting: boolean;
  connectionDetails: ConnectionDetails | null;
}

export interface PracticeStatus {
  canStartSession: boolean;
  remainingTime: string;
  remainingTimeSeconds: number;
  isLoading: boolean;
  error: string | null;
}
