import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authService } from '@/services/auth';
import {
  selectCourseStatus,
  loadCourseStatus,
} from '@/store/slices/courseSlice';
import {
  connectionDetailsService,
  type ConnectionDetailsParams,
} from '@/services/livekit/ConnectionDetailsService';
import type {
  PracticeSessionType,
  PracticeSessionState,
} from '@/types/practice';
import type { ConnectionDetails } from '@/types/call';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UsePracticeSessionReturn {
  sessionState: PracticeSessionState;
  connectionDetails: ConnectionDetails | null;
  topic: any | null;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  updateAgentState: (state: string) => void;
}

export function usePracticeSession(
  sessionType: PracticeSessionType
): UsePracticeSessionReturn {
  const dispatch = useAppDispatch();
  const courseStatus = useAppSelector(selectCourseStatus);

  const [agentState, setAgentState] = useState<string>('disconnected');
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails | null>(null);
  const [topic, setTopic] = useState<any | null>(null);
  const isStartingRef = useRef(false);
  const isMountedRef = useRef(true);
  const connectionDetailsRef = useRef(connectionDetails);

  useEffect(() => {
    connectionDetailsRef.current = connectionDetails;
  }, [connectionDetails]);

  const isConnected = agentState === 'connected';
  const isConnecting = agentState === 'connecting';

  const sessionState: PracticeSessionState = {
    agentState: agentState as any,
    isConnected,
    isConnecting,
    connectionDetails: connectionDetails as any,
  };

  const loadTopic = useCallback(async () => {
    try {
      const storageKey =
        sessionType === 'roleplay' ? 'selectedRoleplayTopic' : 'selectedTopic';

      const topicData = await AsyncStorage.getItem(storageKey);
      if (topicData) {
        try {
          const parsed = JSON.parse(topicData);
          if (parsed && parsed.title) {
            setTopic(parsed);
            return;
          }
        } catch {}
      }

      if (sessionType === 'roleplay') return;

      if (!courseStatus) {
        try {
          await dispatch(loadCourseStatus());
          return;
        } catch {
          return;
        }
      }

      if (courseStatus?.course?.todayTopic) {
        setTopic(courseStatus.course.todayTopic);
        await AsyncStorage.setItem(
          'selectedTopic',
          JSON.stringify(courseStatus.course.todayTopic)
        );
      }
    } catch {}
  }, [dispatch, courseStatus, sessionType]);

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
    const userId = typeof user.id === 'number' ? user.id : Number(user.id);
    if (Number.isNaN(userId)) {
      isStartingRef.current = false;
      throw new Error('Invalid user id');
    }

    try {
      if (!topic) {
        await loadTopic();
      }

      const storageKey =
        sessionType === 'roleplay' ? 'selectedRoleplayTopic' : 'selectedTopic';
      const rawTopic = await AsyncStorage.getItem(storageKey);
      const parsedTopic = rawTopic ? JSON.parse(rawTopic) : null;
      const currentTopic = topic || parsedTopic;

      if (isMountedRef.current) {
        setConnectionDetails(null);
        setAgentState('connecting');
      }

      const details = await connectionDetailsService.getConnectionDetails({
        userId,
        sessionType,
        topic: currentTopic,
      });

      if (sessionType === 'practice' && details.roomName) {
        await AsyncStorage.setItem('lastPracticeRoomName', details.roomName);
      }

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
  }, [sessionType, topic, loadTopic, endSession]);

  const updateAgentState = useCallback((state: string) => {
    setAgentState(state);
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
