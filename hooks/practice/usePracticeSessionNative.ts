/**
 * usePracticeSession Hook (React Native Version)
 * 
 * Manages session state, LiveKit connection, and session lifecycle for practice/roleplay.
 * Handles topic loading and connection details fetching.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Platform } from 'react-native';
import { AgentState } from '@livekit/components-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authService } from '@/service/AuthService';
import { courseService } from '@/service/CourseService';
import { selectCourseStatus, loadCourseStatus } from '@/store/slices/courseSlice';
import type { ConnectionDetails } from '@/types/call';
import type { PracticeSessionType, PracticeSessionState } from '@/types/practice';
import { useSessionTracking } from '@/hooks/useSessionTracking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeUrl } from '@/lib/network/urlNormalizer';

export interface UsePracticeSessionReturn {
  sessionState: PracticeSessionState;
  connectionDetails: ConnectionDetails | null;
  topic: any | null;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  updateAgentState: (state: AgentState) => void;
}

export function usePracticeSessionNative(sessionType: PracticeSessionType): UsePracticeSessionReturn {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const courseStatus = useAppSelector(selectCourseStatus);
  const { startSession: startTracking, endSession: endTracking, currentSession, sessionDuration } = useSessionTracking();
  
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [topic, setTopic] = useState<any | null>(null);

  const sessionState: PracticeSessionState = {
    agentState,
    isConnected: agentState === 'connected',
    isConnecting: agentState === 'connecting' || agentState === 'initializing',
    connectionDetails,
  };

  // Load topic from AsyncStorage or Redux course status
  const loadTopic = useCallback(async () => {
    try {
      const storageKey = sessionType === 'roleplay' ? 'selectedRoleplayTopic' : 'selectedTopic';

      // Try to get topic from AsyncStorage first
      const topicData = await AsyncStorage.getItem(storageKey);
      if (topicData) {
        try {
          const parsed = JSON.parse(topicData);
          if (parsed && parsed.title) {
            setTopic(parsed);
            return;
          }
        } catch {
          // Invalid JSON, fetch from course
        }
      }

      // For roleplay sessions, we rely on explicit topic selection; don't
      // fall back to courseStatus todayTopic here.
      if (sessionType === 'roleplay') {
        return;
      }

      // If course status not loaded, dispatch load action
      if (!courseStatus) {
        try {
          await dispatch(loadCourseStatus());
          // The courseStatus will update on next render via useAppSelector
          // The useEffect below will handle setting the topic
          return;
        } catch (error) {
          // Error loading course status
          return;
        }
      }
      
      // Use the course status from Redux
      if (courseStatus?.course?.todayTopic) {
        setTopic(courseStatus.course.todayTopic);
        await AsyncStorage.setItem('selectedTopic', JSON.stringify(courseStatus.course.todayTopic));
      }
    } catch (error) {
      // Error loading topic
    }
  }, [dispatch, courseStatus, sessionType]);

  // Start session - fetch connection details
  const startSession = useCallback(async () => {
    const user = authService.getUser();
    if (!user?.id) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'AuthStack',
          params: {
            screen: 'SignupScreen',
          },
        })
      );
      throw new Error('User not authenticated');
    }

    // Load topic if not already loaded
    if (!topic) {
      await loadTopic();
    }

    // Start session tracking
    await startTracking(sessionType);
    setAgentState('connecting');

    try {
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
      const apiUrl = normalizeUrl(baseApiUrl);
      const url = new URL('/api/livekit/connection-details', apiUrl);
      url.searchParams.append('id', user.id.toString());
      url.searchParams.append('sessionType', sessionType);

      const storageKey = sessionType === 'roleplay' ? 'selectedRoleplayTopic' : 'selectedTopic';
      const topicData = await AsyncStorage.getItem(storageKey);
      const currentTopic = topic || (topicData ? JSON.parse(topicData) : {});
      if (currentTopic?.title) {
        url.searchParams.append('topicTitle', currentTopic.title);
      }
      if (currentTopic?.prompt) {
        url.searchParams.append('prompt', currentTopic.prompt);
      }
      if (currentTopic?.firstPrompt) {
        url.searchParams.append('firstPrompt', currentTopic.firstPrompt);
      }

      const fullUrl = url.toString();
      console.log('🌐 [usePracticeSessionNative] Making fetch request:', {
        baseApiUrl,
        normalizedApiUrl: apiUrl,
        fullUrl,
        platform: Platform.OS,
        sessionType,
        userId: user.id,
      });

      const response = await fetch(fullUrl);
      
      console.log('📡 [usePracticeSessionNative] Fetch response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [usePracticeSessionNative] Request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: fullUrl,
        });
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const details = json.data || json;
      
      if (!details.participantToken) {
        console.error('❌ [usePracticeSessionNative] No token in response:', {
          json,
          details,
        });
        throw new Error('No token in response');
      }
      
      console.log('✅ [usePracticeSessionNative] Got connection details:', {
        roomName: details.roomName,
        serverUrl: details.serverUrl,
        participantName: details.participantName,
      });
      
      setConnectionDetails(details);
    } catch (error: any) {
      console.error('❌ [usePracticeSessionNative] Failed to start session:', {
        error,
        message: error?.message,
        name: error?.name,
        code: error?.code,
        stack: error?.stack,
        sessionType,
        userId: user.id,
        platform: Platform.OS,
      });
      setAgentState('disconnected');
      setConnectionDetails(null);
      await endTracking();
      throw error;
    }
  }, [sessionType, topic, loadTopic, startTracking, endTracking, navigation]);

  // End session
  const endSession = useCallback(async () => {
    setAgentState('disconnected');
    setConnectionDetails(null);
    await endTracking();
  }, [endTracking]);

  // Update agent state
  const updateAgentState = useCallback((state: AgentState) => {
    setAgentState(state);
  }, []);

  // Load topic on mount
  useEffect(() => {
    loadTopic();
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
