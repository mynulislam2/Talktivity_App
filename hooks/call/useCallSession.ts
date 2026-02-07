/**
 * useCallSession Hook
 * 
 * Manages session state, LiveKit connection, and session lifecycle.
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authService } from '@/service/AuthService';
import {
  setAgentState,
  setConnectionDetails,
  selectSessionState,
  selectConnectionDetails,
} from '@/store/slices/callSlice';
import { useCallStatus } from './useCallStatus';
import { ConnectionDetails } from '@/app/api/connection-details/route';
import { AgentState } from '@livekit/components-react';

export function useCallSession() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const sessionState = useAppSelector(selectSessionState);
  const connectionDetails = useAppSelector(selectConnectionDetails);
  const { canStartCall } = useCallStatus();
  
  // Start session - fetch connection details
  const startSession = useCallback(async () => {
    if (!canStartCall) {
      throw new Error('Cannot start call - lifetime limit reached');
    }
    
    const currentUser = authService.getUser();
    const userId = currentUser?.id;
    
    if (!userId) {
      router.push('/signup');
      throw new Error('User not authenticated');
    }
    
    dispatch(setAgentState('connecting'));
    
    try {
      // Get connection details from API
      const url = new URL(
        process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
        typeof window !== 'undefined' ? window.location.origin : ''
      );
      url.searchParams.append("id", userId.toString());
      url.searchParams.append("sessionType", "call");
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Lifetime call limit reached');
        }
        throw new Error('Failed to get connection details');
      }
      
      const details: ConnectionDetails = await response.json();
      dispatch(setConnectionDetails(details));
    } catch (error) {
      dispatch(setAgentState('disconnected'));
      dispatch(setConnectionDetails(null));
      throw error;
    }
  }, [canStartCall, dispatch, router]);
  
  // End session
  const endSession = useCallback(() => {
    dispatch(setAgentState('disconnected'));
    dispatch(setConnectionDetails(null));
  }, [dispatch]);
  
  // Update agent state
  const updateAgentState = useCallback((state: AgentState) => {
    dispatch(setAgentState(state));
  }, [dispatch]);
  
  return {
    sessionState,
    connectionDetails,
    startSession,
    endSession,
    updateAgentState,
  };
}
