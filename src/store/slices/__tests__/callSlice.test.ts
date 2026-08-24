/**
 * Call Slice Tests
 *
 * Regression coverage for the isConnected bug: LiveKit's AgentState has no
 * 'connected' member, so `agentState === 'connected'` could never be true.
 * See isAgentConnected in ../callSlice.
 */

import { configureStore } from '@reduxjs/toolkit';
import type { AgentState } from '@livekit/components-react';
import callReducer, { isAgentConnected, setAgentState } from '../callSlice';

describe('isAgentConnected', () => {
  const activeStates: AgentState[] = [
    'initializing',
    'idle',
    'listening',
    'thinking',
    'speaking',
  ];

  const inactiveStates: AgentState[] = [
    'disconnected',
    'connecting',
    'pre-connect-buffering',
    'failed',
  ];

  it.each(activeStates)('treats %s as connected', (state) => {
    expect(isAgentConnected(state)).toBe(true);
  });

  it.each(inactiveStates)('treats %s as not connected', (state) => {
    expect(isAgentConnected(state)).toBe(false);
  });
});

describe('callSlice setAgentState reducer', () => {
  it('sets isConnected and populates sessionStartTime when the agent starts listening', () => {
    const store = configureStore({ reducer: { call: callReducer } });

    expect(store.getState().call.sessionState.isConnected).toBe(false);
    expect(store.getState().call.sessionState.sessionStartTime).toBeNull();

    store.dispatch(setAgentState('listening'));

    const { sessionState } = store.getState().call;
    expect(sessionState.isConnected).toBe(true);
    expect(sessionState.sessionStartTime).not.toBeNull();
    expect(sessionState.sessionStartTime).toBeInstanceOf(Date);
  });

  it('does not overwrite an existing sessionStartTime on subsequent active states', () => {
    const store = configureStore({ reducer: { call: callReducer } });

    store.dispatch(setAgentState('listening'));
    const firstStartTime = store.getState().call.sessionState.sessionStartTime;

    store.dispatch(setAgentState('speaking'));
    const secondStartTime = store.getState().call.sessionState.sessionStartTime;

    expect(secondStartTime).toEqual(firstStartTime);
  });

  it('clears isConnected and sessionStartTime when disconnected', () => {
    const store = configureStore({ reducer: { call: callReducer } });

    store.dispatch(setAgentState('listening'));
    expect(store.getState().call.sessionState.isConnected).toBe(true);

    store.dispatch(setAgentState('disconnected'));

    const { sessionState } = store.getState().call;
    expect(sessionState.isConnected).toBe(false);
    expect(sessionState.isDisconnected).toBe(true);
    expect(sessionState.sessionStartTime).toBeNull();
  });

  it('sets isConnecting for the connecting state without marking it connected', () => {
    const store = configureStore({ reducer: { call: callReducer } });

    store.dispatch(setAgentState('connecting'));

    const { sessionState } = store.getState().call;
    expect(sessionState.isConnecting).toBe(true);
    expect(sessionState.isConnected).toBe(false);
    expect(sessionState.isDisconnected).toBe(false);
  });
});
