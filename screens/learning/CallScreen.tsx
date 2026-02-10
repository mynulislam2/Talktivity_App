/**
 * Call Screen
 * 
 * Direct call session with AI agent
 * Matches Next.js implementation exactly with proper hooks and components
 */

import React, { useCallback } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/store/hooks';
import { loadLifecycle } from '@/store/slices/lifecycleSlice';
import {
  useCallStatus,
  useCallSession,
  useCallLifecycle,
  useSessionSaving,
  useSessionStateEvents,
  useCallDerivedState,
} from '@/hooks/call';
import { performGlobalLogout } from '@/utils/logoutClient';
import { handleDeviceFailure } from '@/lib/call/deviceFailureHandler';
import type { CallScreenProps } from '@/navigation/types';

// Import components (to be created)
import { SessionSavingOverlay } from '@/components/call/SessionSavingOverlay';
import { CallHeader } from '@/components/call/CallHeader';
import { CallContent } from '@/components/call/CallContent';
import { CallVisualizerLayout } from '@/components/call/CallVisualizerLayout';

export interface CallScreenContentProps {
  navigation: any;
  route: any;
}

export function CallScreenContent({ navigation, route }: CallScreenContentProps) {
  const dispatch = useAppDispatch();
  const isExam = route.params?.exam === true;

  // Custom hooks (matches Next.js exactly)
  const { 
    canStartCall, 
    totalDuration,
    isLoading: statusLoading,
    refreshStatus 
  } = useCallStatus();
  
  const {
    sessionState,
    connectionDetails,
    startSession,
    endSession,
    updateAgentState,
  } = useCallSession();
  
  const { callCompleted } = useCallLifecycle();

  // Session saving state
  const {
    isSavingSession,
    sessionSaveState,
    sessionSaveMessage,
    setSaving,
    setSaved,
    setFailed,
    dismissError,
  } = useSessionSaving();

  // Derived states
  const {
    stateText,
    stateColor,
    sessionTitle,
    hasCompletedLongCall,
  } = useCallDerivedState({
    sessionState,
    totalDuration,
    isExam,
  });

  // Handle connect
  const handleConnect = useCallback(async () => {
    try {
      await startSession();
    } catch (error) {
      Alert.alert('Error', 'Failed to start call session. Please try again.');
    }
  }, [startSession]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    endSession();
    setSaving("Please wait a moment, we are saving your conversation for analysis…");
  }, [endSession, setSaving]);

  // Handle session saved
  const handleSessionSaved = useCallback(async () => {
    setSaved();
    
    // Refresh call status to get updated lifetime duration
    await refreshStatus();
    
    // Refresh lifecycle state (Python agent updated call_completed in DB)
    const lifecycleResult = await dispatch(loadLifecycle());
    
    // Check if this was the first call completion (flow: onboarding → call → report)
    // If call was just completed (was false, now true), automatically navigate to report
    if (loadLifecycle.fulfilled.match(lifecycleResult)) {
      const lifecycle = lifecycleResult.payload;
      const callCompleted = lifecycle?.milestones?.callCompleted || false;
      const reportCompleted = lifecycle?.milestones?.reportCompleted || false;
      
      // If call is completed but report is not, navigate to report (first-time flow)
      if (callCompleted && !reportCompleted) {
        // Small delay to show "saved" message before navigation
        setTimeout(() => {
          navigation.navigate('ReportScreen', {
            sessionId: 'current',
            sessionType: 'call',
          });
        }, 1500);
        return;
      }
    }
    
    // For subsequent calls, stay on call screen. User can manually go to report via the View Report button.
  }, [setSaved, refreshStatus, dispatch, navigation]);

  // Handle session state events from backend
  useSessionStateEvents({
    onSaving: (message) => {
      setSaving(message || "Saving your conversation for analysis…");
      endSession();
    },
    onSaved: handleSessionSaved,
    onFailed: (message) => {
      setFailed(message || "Failed to save conversation.");
      Alert.alert('Error', message || "Failed to save conversation");
    },
    onEndSession: endSession,
  });

  const handleViewReport = useCallback(() => {
    navigation.navigate('ReportScreen', {
      sessionId: 'current',
      sessionType: 'call',
      reportData: null, // Will be loaded from Redux
    });
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    await performGlobalLogout();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f23' }} edges={['top', 'bottom']}>
      <CallVisualizerLayout>
        <View style={{ flex: 1 }}>
          <SessionSavingOverlay
            isVisible={isSavingSession}
            state={sessionSaveState}
            message={sessionSaveMessage || undefined}
            onDismiss={sessionSaveState === 'SESSION_SAVE_FAILED' ? dismissError : undefined}
          />

          <CallHeader
            stateText={stateText}
            stateColor={stateColor}
            onLogout={handleLogout}
          />

          {!isSavingSession && (
            <CallContent
              sessionTitle={sessionTitle}
              sessionState={sessionState}
              connectionDetails={connectionDetails}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onStateChange={updateAgentState}
              canStartCall={canStartCall}
              timeLoading={statusLoading}
              onViewReport={handleViewReport}
              hasCompletedLongCall={hasCompletedLongCall}
              onDeviceFailure={handleDeviceFailure}
            />
          )}
        </View>
      </CallVisualizerLayout>
    </SafeAreaView>
  );
}

const CallScreen: React.FC<CallScreenProps> = ({ navigation, route }) => {
  return <CallScreenContent navigation={navigation} route={route} />;
};

export default CallScreen;
