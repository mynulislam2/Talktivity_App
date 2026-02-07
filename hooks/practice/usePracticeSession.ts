/**
 * usePracticeSession Hook
 * 
 * Manages session state, LiveKit connection, and session lifecycle for practice/roleplay.
 * Handles topic loading and connection details fetching.
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AgentState } from '@livekit/components-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authService } from '@/service/AuthService';
import { courseService } from '@/service/CourseService';
import { selectCourseStatus, loadCourseStatus } from '@/store/slices/courseSlice';
import type { ConnectionDetails } from '@/app/api/connection-details/route';
import type { PracticeSessionType, PracticeSessionState } from '@/types/practice';
import { useSessionTracking } from '@/Hooks/useSessionTracking';

export interface UsePracticeSessionReturn {
  sessionState: PracticeSessionState;
  connectionDetails: ConnectionDetails | null;
  topic: any | null;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  updateAgentState: (state: AgentState) => void;
}

export function usePracticeSession(sessionType: PracticeSessionType): UsePracticeSessionReturn {
  const router = useRouter();
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

  // Load topic from localStorage or Redux course status
  const loadTopic = useCallback(async () => {
    try {
      const storageKey = sessionType === 'roleplay' ? 'selectedRoleplayTopic' : 'selectedTopic';

      // Try to get topic from localStorage first
      const topicData = localStorage.getItem(storageKey);
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
        localStorage.setItem('selectedTopic', JSON.stringify(courseStatus.course.todayTopic));
      }
    } catch (error) {
      // Error loading topic
    }
  }, [dispatch, courseStatus, sessionType]);

  // Start session - fetch connection details
  const startSession = useCallback(async () => {
    const user = authService.getUser();
    if (!user?.id) {
      router.push('/signup');
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
      const url = new URL(
        process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details',
        window.location.origin
      );
      url.searchParams.append('UserId', user.id.toString());
      url.searchParams.append('sessionType', sessionType);

      const storageKey = sessionType === 'roleplay' ? 'selectedRoleplayTopic' : 'selectedTopic';
      const currentTopic = topic || JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (currentTopic?.title) {
        url.searchParams.append('topicTitle', currentTopic.title);
      }
      if (currentTopic?.prompt) {
        url.searchParams.append('prompt', currentTopic.prompt);
      }
      if (currentTopic?.firstPrompt) {
        url.searchParams.append('firstPrompt', currentTopic.firstPrompt);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const details: ConnectionDetails = await response.json();
      setConnectionDetails(details);
    } catch (error) {
      setAgentState('disconnected');
      setConnectionDetails(null);
      await endTracking();
      throw error;
    }
  }, [sessionType, topic, loadTopic, startTracking, endTracking, router]);

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
