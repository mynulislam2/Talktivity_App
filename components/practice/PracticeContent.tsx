/**
 * PracticeContent Component (React Native)
 * 
 * Main content area for practice/roleplay sessions including title, visualizer, and LiveKit room.
 * Matches Next.js implementation: minimal header, no subtitle/duration.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  useWindowDimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { LiveKitRoom } from '@livekit/react-native';
import { AgentState } from 'livekit-react-native';
import type { ConnectionDetails } from '@/types/call';
import type { PracticeSessionState, PracticeSessionType } from '@/types/practice';
import { SimpleVoiceAssistant } from '@/components/livekit';
import { useVoiceVolume } from './PracticeVisualizerLayout';
import { PracticeControlBar } from './PracticeControlBar';
import { normalizeUrl } from '@/lib/network/urlNormalizer';

export interface PracticeContentProps {
  topicTitle: string;
  sessionState: PracticeSessionState;
  connectionDetails: ConnectionDetails | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onStateChange: (state: AgentState) => void;
  canStartSession: boolean;
  timeLoading: boolean;
  sessionType: PracticeSessionType;
  remainingTime: string;
  onDeviceFailure?: (error?: any) => void;
}

export function PracticeContent({
  topicTitle,
  sessionState,
  connectionDetails,
  onConnect,
  onDisconnect,
  onStateChange,
  canStartSession,
  timeLoading,
  sessionType,
  remainingTime,
  onDeviceFailure,
}: PracticeContentProps) {
  const { width } = useWindowDimensions();
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const { setUserVolumeStrength, setAgentVolumeStrength } = useVoiceVolume();

  // Responsive font sizing
  const titleFontSize = width < 480 ? 24 : (width < 768 ? 28 : 32);

  const handleDeviceFailure = (error?: any) => {
    if (onDeviceFailure) {
      onDeviceFailure(error);
    } else {
      Alert.alert(
        'Device Error',
        "Error accessing camera or microphone. Please ensure you've granted the necessary permissions."
      );
    }
  };

  // Normalize serverUrl for emulator or real device
  const normalizedServerUrl = React.useMemo(() => {
    if (!connectionDetails?.serverUrl) return '';

    let url = connectionDetails.serverUrl.replace(/\/+$/, '');

    // Normalize localhost/127.0.0.1 for emulator or real device
    url = normalizeUrl(url);

    return url;
  }, [connectionDetails?.serverUrl]);

  const sessionLabel = sessionType === 'roleplay' ? 'Roleplay' : 'Practice';

  // Request microphone permission on Android
  React.useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS !== 'android') {
        console.log('ℹ️  [PracticeContent] Platform is', Platform.OS, '- skipping Android permission request');
        return;
      }

      if (!connectionDetails) {
        console.log('ℹ️  [PracticeContent] No connection details yet - skipping permission request');
        return;
      }

      try {
        console.log('📱 [PracticeContent] Requesting microphone permission on Android');
        
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission Required',
            message: 'This app needs access to your microphone to listen to you during practice sessions.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        console.log('📱 [PracticeContent] Permission result:', granted);
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ [PracticeContent] Microphone permission granted');
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          console.warn('⚠️  [PracticeContent] Microphone permission denied');
          Alert.alert(
            'Permission Denied',
            'Microphone permission is required for practice sessions. Please enable it in app settings.'
          );
        }
      } catch (err) {
        console.error('❌ [PracticeContent] Permission request error:', err);
      }
    };

    requestPermission();
  }, [connectionDetails]);

  return (
    <View style={styles.container}>
      {/* Minimal header section - just the topic title, no subtitle or duration */}
      <View style={styles.headerSection}>
        <Text 
          style={[
            styles.title,
            { fontSize: titleFontSize }
          ]}
        >
          {topicTitle}
        </Text>
      </View>

      {/* Main content area */}
      <View style={styles.contentSection}>
        {/* Avatar container - grows to fill available space */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar} />
        </View>

        {/* LiveKit Room + ControlBar */}
        {connectionDetails && (
          <View style={styles.livekitContainer}>
            <LiveKitRoom
              token={connectionDetails.participantToken || ''}
              serverUrl={normalizedServerUrl}
              connect={
                !!connectionDetails &&
                !!connectionDetails.participantToken &&
                !!normalizedServerUrl
              }
              audio={true}
              video={false}
              onMediaDeviceFailure={handleDeviceFailure}
              onDisconnected={onDisconnect}
            >
              {/* Voice assistant for detecting audio levels */}
              <SimpleVoiceAssistant 
                onUserVolumeStrength={setUserVolumeStrength}
                onAgentVolumeStrength={setAgentVolumeStrength}
              />

              <PracticeControlBar
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                agentState={sessionState.agentState}
                canStartSession={canStartSession}
                timeLoading={timeLoading}
                sessionType={sessionType}
              />
            </LiveKitRoom>
          </View>
        )}
        
        {/* Show control bar if no connection details yet */}
        {!connectionDetails && (
          <View style={styles.livekitContainer}>
            <PracticeControlBar
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              agentState={sessionState.agentState}
              canStartSession={canStartSession}
              timeLoading={timeLoading}
              sessionType={sessionType}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  
  // Minimal header section
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  
  title: {
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  contentSection: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  avatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 100,
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  livekitContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
});
