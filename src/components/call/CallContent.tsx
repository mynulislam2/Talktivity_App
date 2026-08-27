/**
 * CallContent Component (React Native)
 *
 * Encapsulates main content area including title, description, visualizer, and LiveKit room.
 * Matches Next.js implementation pixel-perfect.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { LiveKitRoom } from '@livekit/react-native';
import { AgentState } from '@livekit/react-native';
import { PermissionsAndroid } from 'react-native';
import { ConnectionDetails } from '@/types/call';
import { CallSessionState } from '@/types/call/session';
import { SimpleVoiceAssistant } from '@/components/livekit';
import { useVoiceVolume } from './CallVisualizerLayout';
import { ControlBar } from './ControlBar';
import { normalizeUrl } from '@/lib/network/urlNormalizer';
import { DevicePermissionsModal } from '@/components/common/DevicePermissionsModal';
import { colors } from '@/styles/colors';
import { useLoudspeakerAudioSession } from '@/hooks/useLoudspeakerAudioSession';
import { useBackgroundSessionCleanup } from '@/hooks/useBackgroundSessionCleanup';
import { useBackHandlerConfirmation } from '@/hooks/useBackHandlerConfirmation';

export interface CallContentProps {
  sessionTitle: string;
  sessionState: CallSessionState;
  connectionDetails: ConnectionDetails | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onStateChange: (state: AgentState) => void;
  canStartCall: boolean;
  timeLoading: boolean;
  onViewReport: () => void;
  hasCompletedLongCall: boolean;
  onDeviceFailure?: (error?: any) => void;
}

export function CallContent({
  sessionTitle,
  sessionState,
  connectionDetails,
  onConnect,
  onDisconnect,
  onStateChange,
  canStartCall,
  timeLoading,
  onViewReport,
  hasCompletedLongCall,
  onDeviceFailure,
}: CallContentProps) {
  const { width } = useWindowDimensions();
  const { setUserVolumeStrength, setAgentVolumeStrength } = useVoiceVolume();
  const [showPermModal, setShowPermModal] = useState(false);

  // Configure AudioSession for loudspeaker output during LiveKit call
  useLoudspeakerAudioSession(!!connectionDetails);

  // Auto-disconnect active call when app is backgrounded
  useBackgroundSessionCleanup(!!connectionDetails, onDisconnect);

  // Intercept Android hardware back button mid-call
  useBackHandlerConfirmation(!!connectionDetails, onDisconnect);

  // Responsive font sizing to match web breakpoints
  const titleFontSize = width < 480 ? 24 : width < 768 ? 28 : 32;
  const subtitleFontSize = width < 480 ? 14 : width < 768 ? 16 : 18;
  const durationFontSize = width < 480 ? 13 : width < 768 ? 14 : 16;

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

  const normalizedServerUrl = React.useMemo(() => {
    if (!connectionDetails?.serverUrl) return '';

    // Trim trailing slashes
    let url = connectionDetails.serverUrl.replace(/\/+$/, '');

    // Normalize localhost/127.0.0.1 for emulator or real device
    url = normalizeUrl(url);

    return url;
  }, [connectionDetails?.serverUrl]);

  // Debug logging
  React.useEffect(() => {
    if (connectionDetails) {
      console.log('🔍 [CallContent] Connection details:', {
        hasToken: !!connectionDetails.participantToken,
        tokenType: typeof connectionDetails.participantToken,
        tokenLength: connectionDetails.participantToken?.length,
        serverUrl: normalizedServerUrl,
        roomName: connectionDetails.roomName,
        hasServerUrl: !!normalizedServerUrl,
      });
    }
  }, [connectionDetails, normalizedServerUrl]);

  const handleStartCall = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (!hasPermission) {
        setShowPermModal(true);
        return;
      }
    }
    onConnect();
  };

  return (
    <View style={styles.container}>
      {/* Header section with title, subtitle, duration */}
      <View style={styles.headerSection}>
        <Text style={[styles.title, { fontSize: titleFontSize }]}>
          {sessionTitle}
        </Text>
        <Text
          style={[styles.subtitle, { fontSize: subtitleFontSize, fontFamily: 'Poppins' }]}
        >
          Speak naturally to generate your personalized learning report!
        </Text>
        <Text style={[styles.duration, { fontSize: durationFontSize }]}>
          Assessment Duration: 5 minutes
        </Text>
      </View>

      {/* Main content area with avatar and controls */}
      <View style={styles.contentSection}>
        {/* Avatar container - grows to fill available space */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar} />
        </View>

        {/* LiveKit Room + ControlBar */}
        <View style={styles.livekitContainer}>
          {connectionDetails &&
          normalizedServerUrl &&
          connectionDetails.participantToken ? (
            <>
              {console.log('🚀 [CallContent] Connecting to LiveKit:', {
                token:
                  typeof connectionDetails.participantToken === 'string'
                    ? connectionDetails.participantToken.substring(0, 50) +
                      '...'
                    : 'NOT A STRING',
                serverUrl: normalizedServerUrl,
                connect: true,
              })}
              <LiveKitRoom
                token={connectionDetails.participantToken}
                serverUrl={normalizedServerUrl}
                connect={true}
                audio={true}
                video={false}
                onMediaDeviceFailure={handleDeviceFailure}
                onDisconnected={onDisconnect}
              >
                {/* Voice assistant for detecting audio levels */}
                <SimpleVoiceAssistant
                  onStateChange={onStateChange}
                  onUserVolumeStrength={setUserVolumeStrength}
                  onAgentVolumeStrength={setAgentVolumeStrength}
                />

                <ControlBar
                  onConnect={handleStartCall}
                  onDisconnect={onDisconnect}
                  agentState={sessionState.agentState}
                  canStartCall={canStartCall}
                  timeLoading={timeLoading}
                  onViewReport={onViewReport}
                  hasCompletedLongCall={hasCompletedLongCall}
                />
              </LiveKitRoom>
            </>
          ) : (
            // Show control bar even before we have connection details so user can start the call
            <ControlBar
              onConnect={handleStartCall}
              onDisconnect={onDisconnect}
              agentState={sessionState.agentState}
              canStartCall={canStartCall}
              timeLoading={timeLoading}
              onViewReport={onViewReport}
              hasCompletedLongCall={hasCompletedLongCall}
            />
          )}
        </View>
      </View>
      <DevicePermissionsModal
        visible={showPermModal}
        onClose={() => setShowPermModal(false)}
        onGranted={onConnect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  title: {
    fontWeight: '800',
    fontFamily: 'Poppins-Bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  duration: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  contentSection: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  avatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 120,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brand.inputBg,
  },
  livekitContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
});
