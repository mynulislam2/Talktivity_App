/**
 * RoleplayScreen
 *
 * Pure roleplay screen — only handles roleplay scenario sessions.
 * No practice mixing. Single-purpose.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from '@/contexts/AlertContext';

import {
  useRoleplayStatus,
  useRoleplaySession,
  useRoleplayDerivedState,
} from '@/hooks/roleplay';
import { RoleplayContent } from '@/components/roleplay/RoleplayContent';
import { RoleplayVisualizerLayout } from '@/components/roleplay/RoleplayVisualizerLayout';
import { handleDeviceFailure } from '@/lib/call/deviceFailureHandlerNative';
import { AppBackground } from '../../components/common/AppBackground';

export default function RoleplayScreen() {
  const navigation = useNavigation();
  const { showAlert } = useAlert();

  const {
    canStartSession,
    remainingTime,
    remainingTimeSeconds,
    isLoading: statusLoading,
    refreshStatus,
  } = useRoleplayStatus();

  const {
    sessionState,
    connectionDetails,
    topic,
    startSession,
    endSession,
    updateAgentState,
  } = useRoleplaySession();

  const { stateColor, sessionLabel } = useRoleplayDerivedState({
    sessionState,
  });

  const handleConnect = useCallback(async () => {
    if (!canStartSession) {
      showAlert({
        title: 'Limit Reached',
        message: `${sessionLabel} time limit reached.`,
        type: 'warning',
      });
      return;
    }

    try {
      await startSession();
    } catch (error: any) {
      showAlert({
        title: 'Connection Error',
        message: error.message || 'Failed to connect',
        type: 'error',
      });
    }
  }, [canStartSession, sessionLabel, startSession, showAlert]);

  const handleDisconnect = useCallback(async () => {
    try {
      await endSession();
    } finally {
      await refreshStatus();
    }
  }, [endSession, refreshStatus]);

  const topicTitle = topic?.title || 'General Conversation';

  return (
    <AppBackground>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <RoleplayVisualizerLayout>
          <View style={styles.container}>
            <RoleplayContent
              topicTitle={topicTitle}
              sessionState={sessionState}
              connectionDetails={connectionDetails}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onStateChange={updateAgentState}
              canStartSession={canStartSession}
              timeLoading={statusLoading}
              remainingTime={remainingTime}
              remainingTimeSeconds={remainingTimeSeconds}
              stateColor={stateColor}
              onDeviceFailure={handleDeviceFailure}
              onBack={() => navigation.goBack()}
            />
          </View>
        </RoleplayVisualizerLayout>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

