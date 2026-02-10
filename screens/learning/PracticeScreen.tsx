/**
 * Practice Screen
 * 
 * Practice speaking session with AI agent - matches Next.js /Practice page
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import {
  usePracticeSessionType,
  usePracticeStatus,
  usePracticeSession,
  usePracticeSaving,
  usePracticeDerivedState,
  usePracticeSessionStateEvents,
} from '@/hooks/practice';
import { SessionSavingOverlay } from '@/components/call/SessionSavingOverlay';
import { PracticeHeader, PracticeContent } from '@/components/practice';
import { PracticeVisualizerLayout } from '@/components/practice/PracticeVisualizerLayout';
import { handleDeviceFailure } from '@/lib/call/deviceFailureHandlerNative';

export default function PracticeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Detect session type from AsyncStorage
  const sessionType = usePracticeSessionType();

  // Custom hooks
  const {
    canStartSession,
    remainingTime,
    isLoading: statusLoading,
    refreshStatus,
  } = usePracticeStatus(sessionType);

  const {
    sessionState,
    connectionDetails,
    topic,
    startSession,
    endSession,
    updateAgentState,
  } = usePracticeSession(sessionType);

  const {
    isSavingSession,
    sessionSaveState,
    sessionSaveMessage,
    setSaving,
    setSaved,
    setFailed,
    dismissError,
  } = usePracticeSaving();

  const { stateText, stateColor, sessionLabel } = usePracticeDerivedState({
    sessionState,
    sessionType,
  });

  // Session state events (NO navigation on SESSION_SAVED)
  usePracticeSessionStateEvents({
    sessionType,
    onSaving: (message) => {
      setSaving(message || 'Saving your conversation…');
      endSession();
    },
    onSaved: () => {
      setSaved();
      // Toast would be shown in the hook, but we'll use Alert for RN
      Alert.alert('Success', 'Session saved successfully!');
    },
    onFailed: (message) => {
      setFailed(message || 'Failed to save conversation.');
      Alert.alert('Error', message || 'Failed to save conversation');
    },
    onEndSession: endSession,
    refreshStatus,
  });

  // Handle connect
  const handleConnect = useCallback(async () => {
    if (!canStartSession) {
      Alert.alert('Limit Reached', `${sessionLabel} time limit reached.`);
      return;
    }

    try {
      await startSession();
    } catch (error: any) {
      Alert.alert('Connection Error', error.message || 'Failed to connect');
    }
  }, [canStartSession, sessionLabel, startSession]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    endSession();
    setSaving('Saving your conversation…');
  }, [endSession, setSaving]);

  const topicTitle = topic?.title || 'General Conversation';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f23' }} edges={['top', 'bottom']}>
      {/* Navigation Header */}
      <View style={[styles.navHeader, { paddingTop: Math.max(insets.top, 8) + 8 }]}>
        <View style={styles.navContent}>
          <View style={styles.navLeftSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                (navigation as any).navigate('MainTabs', { screen: 'Home' });
              }}
            >
              <Ionicons name="chevron-back" size={20} color="#d1d5db" />
            </TouchableOpacity>
            <View style={styles.iconContainer}>
              <Ionicons name="mic" size={20} color="#fff" />
            </View>
            <View style={styles.titleSection}>
              <Text style={styles.navTitle}>Practice</Text>
              <Text style={styles.navSubtitle}>Roleplay & Speaking Practice</Text>
            </View>
          </View>
        </View>
      </View>

      <PracticeVisualizerLayout>
        <View style={styles.container}>
          {/* Session Saving Overlay */}
          <SessionSavingOverlay
            isVisible={isSavingSession}
            state={sessionSaveState || undefined}
            message={sessionSaveMessage || undefined}
            onDismiss={sessionSaveState === 'SESSION_SAVE_FAILED' ? dismissError : undefined}
          />

          {/* Header */}
          <PracticeHeader
            stateText={stateText}
            stateColor={stateColor}
            remainingTime={remainingTime}
            isLoading={statusLoading}
            canStartSession={canStartSession}
          />

          {/* Content - Hidden when saving */}
          {!isSavingSession && (
            <PracticeContent
              topicTitle={topicTitle}
              sessionState={sessionState}
              connectionDetails={connectionDetails}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onStateChange={updateAgentState}
              canStartSession={canStartSession}
              timeLoading={statusLoading}
              sessionType={sessionType}
              remainingTime={remainingTime}
              onDeviceFailure={handleDeviceFailure}
            />
          )}
        </View>
      </PracticeVisualizerLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  navHeader: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
    paddingBottom: 12,
    backgroundColor: 'rgba(26, 27, 60, 0.9)',
  },
  navContent: {
    width: '100%',
    paddingHorizontal: 16,
  },
  navLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  titleSection: {
    flex: 1,
    minWidth: 0,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7B70FF',
  },
  navSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});
