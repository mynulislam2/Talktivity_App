/**
 * Call Session Types
 *
 * Type definitions for call session state and LiveKit connection.
 */

import { AgentState } from '@livekit/components-react';

// LiveKit connection details
export interface ConnectionDetails {
  participantToken: string;
  serverUrl: string;
  roomName: string;
  participantName: string;
  sessionType: string;
  userId: string;
  createdAt: string;
}

// Session state for call page
export interface CallSessionState {
  isConnecting: boolean;
  isConnected: boolean;
  isDisconnected: boolean;
  sessionStartTime: Date | null;
  agentState: AgentState;
}
