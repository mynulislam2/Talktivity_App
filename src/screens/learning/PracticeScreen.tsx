/**
 * PracticeScreen
 *
 * Pure practice screen — only handles daily course practice sessions.
 * No roleplay, no general practice. Single-purpose.
 */

import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  usePracticeStatus,
  usePracticeSession,
  usePracticeSaving,
  usePracticeDerivedState,
  usePracticeSessionStateEvents,
} from '@/hooks/practice';
import { PracticeContent } from '@/components/practice';
import { PracticeVisualizerLayout } from '@/components/practice/PracticeVisualizerLayout';
import { handleDeviceFailure } from '@/lib/call/deviceFailureHandlerNative';

export default function PracticeScreen() {
  const navigation = useNavigation();
  const {
    canStartSession,
    remainingTime,
    isLoading: statusLoading,
    refreshStatus,
  } = usePracticeStatus('practice');

  const {
    sessionState,
    connectionDetails,
    topic,
    startSession,
    endSession,
    updateAgentState,
  } = usePracticeSession('practice');

  const { setSaving, setSaved, setFailed } = usePracticeSaving();

  const { stateText, stateColor, sessionLabel } = usePracticeDerivedState({
    sessionState,
    sessionType: 'practice',
  });

  usePracticeSessionStateEvents({
    sessionType: 'practice',
    onSaving: (message: any) => {
      setSaving(message || 'Saving your conversation…');
      endSession();
    },
    onSaved: () => {
      setSaved();
      Alert.alert('Success', 'Session saved successfully!');
    },
    onFailed: (message: any) => {
      setFailed(message || 'Failed to save conversation.');
      Alert.alert('Error', message || 'Failed to save conversation');
    },
    endSession: endSession,
    refreshStatus,
  });

  const handleConnect = useCallback(async () => {
    if (sessionState.isConnecting) return;
    if (!canStartSession) {
      Alert.alert('Limit Reached', `${sessionLabel} time limit reached.`);
      return;
    }
    try {
      await startSession();
    } catch (error: any) {
      Alert.alert('Connection Error', error.message || 'Failed to connect');
    }
  }, [canStartSession, sessionLabel, sessionState.isConnecting, startSession]);

  const handleDisconnect = useCallback(async () => {
    try {
      await endSession();
    } finally {
      await refreshStatus();
    }
  }, [endSession, refreshStatus]);

  const topicTitle = topic?.title || 'General Conversation';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: 'transparent' }}
      edges={['top', 'bottom']}
    >
      <PracticeVisualizerLayout>
        <PracticeContent
          topicTitle={topicTitle}
          sessionState={sessionState}
          connectionDetails={connectionDetails}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onStateChange={updateAgentState}
          canStartSession={canStartSession}
          timeLoading={statusLoading}
          remainingTime={remainingTime}
          stateColor={stateColor}
          onDeviceFailure={handleDeviceFailure}
          onBack={() => navigation.goBack()}
        />
      </PracticeVisualizerLayout>
    </SafeAreaView>
  );
}
