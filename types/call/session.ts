/**
 * Call Session Types
 * 
 * Type definitions for call session state and LiveKit connection.
 */

import { AgentState } from '@livekit/components-react';

// Session state for call page
export interface CallSessionState {
  isConnecting: boolean;
  isConnected: boolean;
  isDisconnected: boolean;
  sessionStartTime: Date | null;
  agentState: AgentState;
}
