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

export default function RoleplayScreen() {
  const navigation = useNavigation();
  const { showAlert } = useAlert();

  const {
    canStartSession,
    remainingTime,
    isLoading: statusLoading,
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

  const handleDisconnect = useCallback(() => {
    endSession();
  }, [endSession]);

  const topicTitle = topic?.title || 'General Conversation';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090f' }} edges={[]}>
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
            stateColor={stateColor}
            onDeviceFailure={handleDeviceFailure}
            onBack={() => navigation.goBack()}
          />
        </View>
      </RoleplayVisualizerLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
