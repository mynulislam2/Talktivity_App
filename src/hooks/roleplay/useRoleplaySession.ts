import { useState, useCallback, useEffect, useRef } from 'react';
import { authService } from '@/services/auth';
import { connectionDetailsService } from '@/services/livekit/ConnectionDetailsService';
import type { ConnectionDetails } from '@/types/call';
import type { PracticeSessionState } from '@/types/practice';
import { isAgentConnected } from '@/store/slices/callSlice';
import type { AgentState } from '@livekit/components-react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UseRoleplaySessionReturn {
  sessionState: PracticeSessionState;
  connectionDetails: ConnectionDetails | null;
  topic: any | null;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  updateAgentState: (state: string) => void;
}

export interface UseRoleplaySessionOptions {
  isGeneralPractice?: boolean;
}

export function useRoleplaySession(options?: UseRoleplaySessionOptions): UseRoleplaySessionReturn {
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails | null>(null);
  const [topic, setTopic] = useState<any | null>(null);
  const isStartingRef = useRef(false);
  const isMountedRef = useRef(true);
  const connectionDetailsRef = useRef(connectionDetails);

  useEffect(() => {
    connectionDetailsRef.current = connectionDetails;
  }, [connectionDetails]);

  const isConnected = isAgentConnected(agentState);
  const isConnecting = agentState === 'connecting';

  const sessionState: PracticeSessionState = {
    agentState,
    isConnected,
    isConnecting,
    connectionDetails: connectionDetails as any,
  };

  const loadTopic = useCallback(async () => {
    if (options?.isGeneralPractice) return;
    try {
      const topicData = await AsyncStorage.getItem('selectedRoleplayTopic');
      if (topicData) {
        try {
          const parsed = JSON.parse(topicData);
          if (parsed && parsed.title) {
            setTopic(parsed);
            return;
          }
        } catch {}
      }
    } catch {}
  }, [options?.isGeneralPractice]);

  const endSession = useCallback(async () => {
    isStartingRef.current = false;
    if (isMountedRef.current) {
      setAgentState('disconnected');
      setConnectionDetails(null);
    }
  }, []);

  const startSession = useCallback(async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    const user = await authService.getUser();
    if (!user?.id) {
      isStartingRef.current = false;
      throw new Error('User not authenticated');
    }

    try {
      let currentTopic = topic;
      if (!options?.isGeneralPractice) {
        if (!topic) {
          await loadTopic();
        }

        const rawTopic = await AsyncStorage.getItem('selectedRoleplayTopic');
        const parsedTopic = rawTopic ? JSON.parse(rawTopic) : null;
        currentTopic = topic || parsedTopic;

        if (!currentTopic?.title) {
          throw new Error('Please select a roleplay topic and try again.');
        }
      }

      if (isMountedRef.current) {
        setConnectionDetails(null);
        setAgentState('connecting');
      }

      const details = await connectionDetailsService.getConnectionDetails({
        userId: typeof user.id === 'string' ? parseInt(user.id, 10) : user.id,
        sessionType: options?.isGeneralPractice ? 'practice' : 'roleplay',
        topic: currentTopic,
      });

      if (isMountedRef.current) {
        setConnectionDetails(details);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setAgentState('disconnected');
        setConnectionDetails(null);
      }
      throw error;
    } finally {
      isStartingRef.current = false;
    }
  }, [topic, loadTopic, endSession]);

  const updateAgentState = useCallback((state: string) => {
    setAgentState(state as AgentState);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadTopic();
    return () => {
      isMountedRef.current = false;
      isStartingRef.current = false;
    };
  }, [loadTopic]);

  return {
    sessionState,
    connectionDetails,
    topic,
    startSession,
    endSession,
    updateAgentState,
  };
}
