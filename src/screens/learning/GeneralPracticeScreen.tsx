/**
 * GeneralPracticeScreen (React Native)
 *
 * Dedicated screen for General Practice — separate from Roleplay.
 * Uses roleplay hooks (same as frontend's Roleplay/page.tsx with isGeneralPractice=true).
 * Matches frontend's behavior exactly.
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
import { GeneralPracticeContent } from '@/components/generalpractice/GeneralPracticeContent';
import { PracticeVisualizerLayout } from '@/components/practice/PracticeVisualizerLayout';
import { handleDeviceFailure } from '@/lib/call/deviceFailureHandlerNative';
import { AppBackground } from '../../components/common/AppBackground';

export default function GeneralPracticeScreen() {
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
  } = useRoleplaySession({ isGeneralPractice: true });

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

  const topicTitle = topic?.title || 'General Practice';

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['left', 'right']}>
        <PracticeVisualizerLayout>
          <View style={styles.container}>
            <GeneralPracticeContent
              topicTitle={topicTitle}
              sessionState={sessionState}
              connectionDetails={connectionDetails}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onStateChange={updateAgentState}
              canStartSession={canStartSession}
              timeLoading={statusLoading}
              stateColor={stateColor}
              onDeviceFailure={handleDeviceFailure}
              onBack={() => navigation.goBack()}
            />
          </View>
        </PracticeVisualizerLayout>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

