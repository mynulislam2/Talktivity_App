/**
 * useCallSession Hook (React Native Version)
 * 
 * Manages session state, LiveKit connection, and session lifecycle.
 * Adapted from Next.js version to work without router.
 */

import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authService } from '@/service/AuthService';
import {
  setAgentState,
  setConnectionDetails,
  selectSessionState,
  selectConnectionDetails,
} from '@/store/slices/callSlice';
import { useCallStatus } from './useCallStatus';
import { ConnectionDetails } from '@/types/call';
import { AgentState } from '@livekit/components-react';
import { normalizeUrl } from '@/lib/network/urlNormalizer';

export interface UseCallSessionReturn {
  sessionState: ReturnType<typeof selectSessionState>;
  connectionDetails: ConnectionDetails | null;
  startSession: () => Promise<void>;
  endSession: () => void;
  updateAgentState: (state: AgentState) => void;
}

export function useCallSessionNative(): UseCallSessionReturn {
  const dispatch = useAppDispatch();
  const sessionState = useAppSelector(selectSessionState);
  const connectionDetails = useAppSelector(selectConnectionDetails);
  const { canStartCall } = useCallStatus();
  
  // Start session - fetch connection details
  const startSession = useCallback(async () => {
    if (!canStartCall) {
      throw new Error('Cannot start call - lifetime limit reached');
    }

    // IMPORTANT: getUser is async in React Native, we must await it
    const currentUser = await authService.getUser();
    const userId = currentUser?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    dispatch(setAgentState('connecting'));

    try {
      // Call backend directly: GET /api/livekit/connection-details
      // The backend expects: id (user ID) and sessionType as query params
      console.log(`📞 [useCallSessionNative] Requesting token from /api/livekit/connection-details for user ${userId}`);
      
      // Get API URL from env, or build from DEV_HOST_IP for real devices
      let baseApiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!baseApiUrl) {
        const devHostIp = process.env.EXPO_PUBLIC_DEV_HOST_IP;
        if (devHostIp) {
          baseApiUrl = `http://${devHostIp}:8082`;
        } else {
          baseApiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8082' : 'http://localhost:8082';
        }
      }
      
      const normalizedApiUrl = normalizeUrl(baseApiUrl);
      const url = new URL('/api/livekit/connection-details', normalizedApiUrl);
      url.searchParams.append('id', userId.toString());
      url.searchParams.append('sessionType', 'call');
      
      const fullUrl = url.toString();
      console.log('🌐 [useCallSessionNative] Making fetch request:', {
        baseApiUrl,
        normalizedApiUrl,
        fullUrl,
        platform: Platform.OS,
        userId,
      });
      
      const tokenResponse = await fetch(fullUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('📡 [useCallSessionNative] Fetch response:', {
        ok: tokenResponse.ok,
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        url: fullUrl,
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        console.error('❌ [useCallSessionNative] Token generation failed:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          errorData,
          url: fullUrl,
        });
        throw new Error(errorData.error || `Failed to get connection details (${tokenResponse.status})`);
      }

      const response = await tokenResponse.json();
      const details = response.data || response;
      
      if (!details.participantToken) {
        console.error('❌ [useCallSessionNative] No token in response:', {
          response,
          details,
        });
        throw new Error('No token in response');
      }
      
      console.log('✅ [useCallSessionNative] Got connection details', {
        roomName: details.roomName,
        serverUrl: details.serverUrl,
        participantName: details.participantName,
      });
      dispatch(setConnectionDetails(details));
      return;
    } catch (error: any) {
      console.error('❌ [useCallSessionNative] Failed to start session:', {
        error,
        message: error?.message,
        name: error?.name,
        code: error?.code,
        stack: error?.stack,
        userId,
        platform: Platform.OS,
      });
      dispatch(setAgentState('disconnected'));
      dispatch(setConnectionDetails(null));
      throw error;
    }
  }, [canStartCall, dispatch]);
  
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
