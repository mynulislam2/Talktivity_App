/**
 * useCallSession Hook
 * 
 * Manages direct call sessions with AI agent
 * - Gets connection details from backend
 * - Connects to LiveKit room
 * - Handles real-time audio
 * - Saves transcript after call
 */

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { callService } from '../../service/CallService';
import { asyncStorageManager } from '../../lib/auth/asyncStorageManager';

interface CallSessionState {
  roomToken: string | null;
  roomName: string | null;
  liveKitUrl: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  callTime: number;
  isMuted: boolean;
}

export const useCallSession = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [state, setState] = useState<CallSessionState>({
    roomToken: null,
    roomName: null,
    liveKitUrl: null,
    isConnecting: false,
    isConnected: false,
    error: null,
    callTime: 0,
    isMuted: false,
  });

  const startCall = async (topic?: string, userLevel: string = 'beginner') => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Get user token from AsyncStorage
      const userToken = await asyncStorageManager.getToken();
      if (!userToken) {
        throw new Error('No authentication token found');
      }

      // Call backend to get connection details
      const response = await callService.getConnectionDetails({
        sessionType: 'call',
        topic,
        userLevel,
      });

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          roomToken: response.data.roomToken,
          roomName: response.data.roomName,
          liveKitUrl: response.data.liveKitUrl,
          isConnecting: false,
          isConnected: true,
          error: null,
        }));

        return true;
      } else {
        throw new Error('Failed to get connection details');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start call';
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMsg,
      }));
      return false;
    }
  };

  const endCall = async (transcript?: string) => {
    try {
      // Save transcript to backend
      if (transcript) {
        await callService.saveTranscript({
          sessionType: 'call',
          transcript,
          duration: state.callTime,
        });
      }

      setState((prev) => ({
        ...prev,
        isConnected: false,
        roomToken: null,
        roomName: null,
        callTime: 0,
      }));
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const toggleMute = () => {
    setState((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  // Timer for call duration
  useEffect(() => {
    if (!state.isConnected) return;

    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        callTime: prev.callTime + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isConnected]);

  return {
    ...state,
    startCall,
    endCall,
    toggleMute,
  };
};
