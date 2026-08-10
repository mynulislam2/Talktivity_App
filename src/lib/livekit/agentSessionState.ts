import type { AgentState } from '@livekit/components-react';

const CONNECTING_STATES = new Set<AgentState>([
  'connecting',
  'pre-connect-buffering',
  'initializing',
]);

const LIVE_STATES = new Set<AgentState>([
  'listening',
  'thinking',
  'speaking',
  'idle',
]);

export function deriveAgentConnectionFlags(agentState: AgentState): {
  isConnected: boolean;
  isConnecting: boolean;
} {
  return {
    isConnected: LIVE_STATES.has(agentState),
    isConnecting: CONNECTING_STATES.has(agentState),
  };
}
