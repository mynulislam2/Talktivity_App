/**
 * Redux Toolkit Call Slice
 *
 * Manages global call state including call status, session state,
 * and connection details for LiveKit.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { callService } from '@/services/call';
import {
  CallStatusResponse,
  CallSessionState,
  ConnectionDetails,
} from '@/types/call';
import { AgentState } from '@livekit/components-react';
import { extractCallErrorMessage } from '@/lib/call/errorHandler';

/**
 * LiveKit's AgentState has no 'connected' member. A session is connected once
 * the agent has left the pre-session states, i.e. anything that is not
 * disconnected / connecting / pre-connect-buffering / failed.
 */
export const isAgentConnected = (state: AgentState): boolean =>
  state === 'initializing' ||
  state === 'idle' ||
  state === 'listening' ||
  state === 'thinking' ||
  state === 'speaking';

/**
 * Call state interface
 */
interface CallState {
  // Call status from GET /api/call/status
  callStatus: CallStatusResponse | null;
  callStatusLoading: boolean;
  callStatusError: string | null;
  callStatusLastFetched: number | null; // Timestamp for cache invalidation

  // Session state (local to call page)
  sessionState: CallSessionState;

  // Connection details (for LiveKit)
  connectionDetails: ConnectionDetails | null;
}

/**
 * Initial state
 */
const initialState: CallState = {
  callStatus: null,
  callStatusLoading: false,
  callStatusError: null,
  callStatusLastFetched: null,
  sessionState: {
    isConnecting: false,
    isConnected: false,
    isDisconnected: true,
    sessionStartTime: null,
    agentState: 'disconnected' as AgentState,
  },
  connectionDetails: null,
};

/**
 * Async thunk: Load call status
 * GET /api/call/status: Called on page mount and after session ends
 */
export const loadCallStatus = createAsyncThunk(
  'call/loadStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await callService.getCallStatus();
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Failed to load call status');
    } catch (error) {
      const errorMessage = extractCallErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Call slice
 */
const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    /**
     * Updates session state
     */
    setSessionState: (
      state,
      action: PayloadAction<Partial<CallSessionState>>
    ) => {
      state.sessionState = {
        ...state.sessionState,
        ...action.payload,
      };
    },

    /**
     * Updates agent state and derived connection states
     */
    setAgentState: (state, action: PayloadAction<AgentState>) => {
      const agentState = action.payload;
      state.sessionState.agentState = agentState;
      state.sessionState.isConnecting = agentState === 'connecting';
      state.sessionState.isConnected = isAgentConnected(agentState);
      state.sessionState.isDisconnected = agentState === 'disconnected';

      // Set session start time when connected
      if (isAgentConnected(agentState) && !state.sessionState.sessionStartTime) {
        state.sessionState.sessionStartTime = new Date();
      }

      // Clear session start time when disconnected
      if (agentState === 'disconnected') {
        state.sessionState.sessionStartTime = null;
      }
    },

    /**
     * Stores LiveKit connection details
     */
    setConnectionDetails: (
      state,
      action: PayloadAction<ConnectionDetails | null>
    ) => {
      state.connectionDetails = action.payload;
    },

    /**
     * Clears call state (on logout)
     */
    clearCallState: (state) => {
      state.callStatus = null;
      state.callStatusError = null;
      state.callStatusLastFetched = null;
      state.sessionState = {
        isConnecting: false,
        isConnected: false,
        isDisconnected: true,
        sessionStartTime: null,
        agentState: 'disconnected' as AgentState,
      };
      state.connectionDetails = null;
    },

    /**
     * Clears call status error
     */
    clearError: (state) => {
      state.callStatusError = null;
    },
  },
  extraReducers: (builder) => {
    // Handle loadCallStatus
    builder
      .addCase(loadCallStatus.pending, (state) => {
        state.callStatusLoading = true;
        state.callStatusError = null;
      })
      .addCase(loadCallStatus.fulfilled, (state, action) => {
        state.callStatusLoading = false;
        // Store the call status data (should have statistics, recent_sessions, lifetime)
        state.callStatus = action.payload;
        state.callStatusError = null;
        state.callStatusLastFetched = Date.now();

        // Debug log call status and eligibility
        console.log('ðŸ“Š [CallSlice] Call status loaded:', {
          hasLifetime: !!action.payload?.lifetime,
          canCall: action.payload?.lifetime?.canCall,
          remaining: action.payload?.lifetime?.remaining,
          totalDuration: action.payload?.lifetime?.totalDuration,
          fullLifetime: action.payload?.lifetime,
        });
      })
      .addCase(loadCallStatus.rejected, (state, action) => {
        state.callStatusLoading = false;
        state.callStatusError =
          (action.payload as string) || 'Failed to load call status';
      });
  },
});

// Export actions
export const {
  setSessionState,
  setAgentState,
  setConnectionDetails,
  clearCallState,
  clearError,
} = callSlice.actions;

// Export selectors
export const selectCallStatus = (state: { call: CallState }) =>
  state.call.callStatus;
export const selectCanStartCall = (state: { call: CallState }) => {
  const canCall = state.call.callStatus?.lifetime?.canCall ?? false;
  // Log when checking eligibility
  if (!canCall && state.call.callStatus) {
    console.log('âš ï¸ [CallSlice] canStartCall is false:', {
      hasCallStatus: !!state.call.callStatus,
      hasLifetime: !!state.call.callStatus?.lifetime,
      canCall: state.call.callStatus?.lifetime?.canCall,
      lifetime: state.call.callStatus?.lifetime,
    });
  }
  return canCall;
};
export const selectRemainingTime = (state: { call: CallState }) =>
  state.call.callStatus?.lifetime?.remaining ?? 0;
export const selectTotalDuration = (state: { call: CallState }) =>
  state.call.callStatus?.lifetime?.totalDuration ?? 0;
export const selectSessionState = (state: { call: CallState }) =>
  state.call.sessionState;
export const selectConnectionDetails = (state: { call: CallState }) =>
  state.call.connectionDetails;
export const selectCallStatusLoading = (state: { call: CallState }) =>
  state.call.callStatusLoading;
export const selectCallStatusError = (state: { call: CallState }) =>
  state.call.callStatusError;

// Export reducer
export default callSlice.reducer;
