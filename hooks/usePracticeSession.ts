/**
 * usePracticeSession Hook
 * 
 * Manages practice and roleplay sessions
 * - Gets connection details from backend
 * - Connects to LiveKit room
 * - Tracks session time
 * - Saves transcript and results
 */

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { callService } from '../../service/CallService';
import { asyncStorageManager } from '../../lib/auth/asyncStorageManager';

interface SessionConfig {
  sessionType: 'practice' | 'roleplay';
  topicId?: string;
  topic?: string;
  userLevel?: string;
}

interface SessionState {
  roomToken: string | null;
  roomName: string | null;
  liveKitUrl: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  sessionTime: number;
  isTimeUp: boolean;
}

export const usePracticeSession = (config: SessionConfig) => {
  const dispatch = useDispatch<AppDispatch>();
  const [state, setState] = useState<SessionState>({
    roomToken: null,
    roomName: null,
    liveKitUrl: null,
    isConnecting: false,
    isConnected: false,
    error: null,
    sessionTime: 0,
    isTimeUp: false,
  });

  const startSession = async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Get user token from AsyncStorage to include in request
      const userToken = await asyncStorageManager.getToken();
      if (!userToken) {
        throw new Error('No authentication token found');
      }

      // Call backend to get connection details
      // This endpoint should return: { roomToken, roomName, liveKitUrl }
      const response = await callService.getConnectionDetails({
        sessionType: config.sessionType,
        topicId: config.topicId,
        topic: config.topic,
        userLevel: config.userLevel || 'beginner',
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
      const errorMsg = error instanceof Error ? error.message : 'Failed to start session';
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMsg,
      }));
      return false;
    }
  };

  const endSession = async (transcript?: string, results?: any) => {
    try {
      // Save transcript and results to backend
      if (transcript) {
        await callService.saveTranscript({
          sessionType: config.sessionType,
          transcript,
          topic: config.topic,
          duration: state.sessionTime,
        });
      }

      // Generate report if results provided
      if (results) {
        await callService.generateReport({
          sessionType: config.sessionType,
          results,
        });
      }

      setState((prev) => ({
        ...prev,
        isConnected: false,
        roomToken: null,
        roomName: null,
      }));
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // Timer for session time
  useEffect(() => {
    if (!state.isConnected) return;

    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        sessionTime: prev.sessionTime + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isConnected]);

  return {
    ...state,
    startSession,
    endSession,
  };
};
