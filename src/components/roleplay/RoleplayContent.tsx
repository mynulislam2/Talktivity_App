import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { LiveKitRoom, AgentState, useRoomContext } from '@livekit/react-native';
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from '@expo/vector-icons';
import { DevicePermissionsModal } from '@/components/common/DevicePermissionsModal';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import type { ConnectionDetails } from '@/types/call';
import type { PracticeSessionState } from '@/types/practice';
import { SimpleVoiceAssistant, TranscriptList } from '@/components/livekit';
import { EndSessionModal } from '@/components/common/EndSessionModal';
import type { TranscriptMessage } from '@/components/livekit';
import { useVoiceVolume } from './RoleplayVisualizerLayout';
import { useLoudspeakerAudioSession } from '@/hooks/useLoudspeakerAudioSession';
import { useBackgroundSessionCleanup } from '@/hooks/useBackgroundSessionCleanup';
import { useBackHandlerConfirmation } from '@/hooks/useBackHandlerConfirmation';
import { RoleplayControlBar } from './RoleplayControlBar';

const COACH_AVATAR = require('../../../assets/figma/coach/alina-intro.png');

export interface RoleplayContentProps {
  topicTitle: string;
  sessionState: PracticeSessionState;
  connectionDetails: ConnectionDetails | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onStateChange: (state: any) => void;
  canStartSession: boolean;
  timeLoading: boolean;
  remainingTime: string;
  remainingTimeSeconds?: number;
  stateColor?: string;
  onDeviceFailure?: (error?: any) => void;
  onBack?: () => void;
}

// Inline LiveControls removed in favor of RoleplayControlBar

export function RoleplayContent({
  topicTitle,
  sessionState,
  connectionDetails,
  onConnect,
  onDisconnect,
  onStateChange,
  canStartSession,
  timeLoading,
  remainingTime,
  remainingTimeSeconds,
  stateColor,
  onDeviceFailure,
  onBack,
}: RoleplayContentProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [isSessionInitiated, setIsSessionInitiated] = useState(false);
  const hasLiveConversation =
    isSessionInitiated ||
    sessionState.agentState !== 'disconnected' ||
    Boolean(connectionDetails);
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const wasActiveRef = useRef(false);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Auto-finish session when the remaining time runs down to 30 seconds or 0
  useEffect(() => {
    const isLive =
      sessionState.agentState === 'connected' ||
      sessionState.agentState === 'speaking' ||
      sessionState.agentState === 'listening';

    if (!isLive) {
      sessionStartTimeRef.current = null;
      return;
    }

    if (sessionStartTimeRef.current === null) {
      sessionStartTimeRef.current = Date.now();
    }

    if (!remainingTimeSeconds || remainingTimeSeconds <= 0) return;

    const allowedSessionMs = Math.max(5, remainingTimeSeconds - 30) * 1000;
    const elapsedMs = Date.now() - sessionStartTimeRef.current;
    const remainingTimerMs = Math.max(500, allowedSessionMs - elapsedMs);

    const timer = setTimeout(() => {
      onDisconnect();
    }, remainingTimerMs);

    return () => clearTimeout(timer);
  }, [sessionState.agentState, remainingTimeSeconds, onDisconnect]);

  useEffect(() => {
    if (
      Boolean(connectionDetails) ||
      (sessionState.agentState !== 'disconnected' && sessionState.agentState !== 'connecting')
    ) {
      wasActiveRef.current = true;
    } else if (
      wasActiveRef.current &&
      sessionState.agentState === 'disconnected' &&
      !sessionState.isConnecting &&
      !connectionDetails
    ) {
      setIsSessionInitiated(false);
      wasActiveRef.current = false;
    }
  }, [sessionState.agentState, sessionState.isConnecting, connectionDetails]);

  // Configure AudioSession for loudspeaker output during LiveKit roleplay
  useLoudspeakerAudioSession(hasLiveConversation);

  // Auto-disconnect active roleplay session when app is backgrounded
  useBackgroundSessionCleanup(hasLiveConversation, onDisconnect);

  const requestEndSession = useCallback(() => {
    if (hasLiveConversation) {
      setShowEndModal(true);
    } else {
      setIsSessionInitiated(false);
      onBack?.();
    }
  }, [hasLiveConversation, onBack]);

  // Intercept Android hardware back button mid-roleplay
  useBackHandlerConfirmation(hasLiveConversation, requestEndSession);

  const livePrompt = topicTitle
    ? `Hi! So today we're going to practice ${topicTitle.replace(/[.?! ]+$/, '')}. Does that sound good?`
    : "Hi! So today we're going to practice English. Does that sound good?";
  const startButtonLabel = timeLoading
    ? 'Checking...'
    : !canStartSession
    ? 'Roleplay Limit Reached'
    : 'Start Conversation';
  const heroHeight = hasLiveConversation
    ? Math.min(258, Math.max(188, windowHeight * 0.29))
    : Math.min(292, Math.max(216, windowHeight * 0.34));

  const handleDeviceFailure = (error?: any) => {
    if (onDeviceFailure) {
      onDeviceFailure(error);
    } else {
      Alert.alert('Device Error', 'Error accessing camera or microphone.');
    }
  };

  const handleStartSession = async () => {
    setIsSessionInitiated(true);
    if (Platform.OS === 'android') {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (!hasPermission) {
          setIsSessionInitiated(false);
          setShowPermModal(true);
          return;
        }
      } catch {
        // Continue if check fails
      }
    }
    onConnect();
  };

  if (!hasLiveConversation) {
    return (
      <View style={styles.shell}>
        <View style={[styles.sessionHero, { height: heroHeight }]}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          <Image
            source={COACH_AVATAR}
            style={styles.coachImageAbsolute}
            resizeMode="contain"
          />
        </View>

        <ScrollView
          style={styles.introScroll}
          contentContainerStyle={styles.introScrollContent}
        >
          <View>
            <Text style={styles.introHeadline}>
              Ready for <Text style={styles.gradientText}>Roleplay?</Text>
            </Text>
            <Text style={styles.introDescription}>
              Step into a guided real-world scenario with Alina and respond
              naturally as the conversation unfolds.
            </Text>
            {!timeLoading && (
              <Text style={styles.introMeta}>
                Time remaining today: {remainingTime}
              </Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonSection}>
          <FigmaPrimaryButton
            onPress={handleStartSession}
            disabled={!canStartSession || timeLoading}
            style={{ height: 50, borderRadius: 10, width: '100%' }}
          >
            <Feather name="mic" size={20} color="#fff" />
            <Text style={styles.startButtonText}>{startButtonLabel}</Text>
          </FigmaPrimaryButton>
        </View>

        <DevicePermissionsModal
          visible={showPermModal}
          onClose={() => setShowPermModal(false)}
          onGranted={onConnect}
        />
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <LiveKitRoom
        token={connectionDetails?.participantToken || ''}
        serverUrl={connectionDetails?.serverUrl?.replace(/\/+$/, '') || ''}
        connect={Boolean(
          connectionDetails?.participantToken && connectionDetails?.serverUrl
        )}
        audio={true}
        video={false}
        onMediaDeviceFailure={handleDeviceFailure}
        onDisconnected={onDisconnect}
        onError={(err: any) => {
          if (err?.message?.includes('WebSocket') || err?.type === 'error')
            return;
          console.error('LiveKit error:', err);
        }}
      >
        <SimpleVoiceAssistant
          onStateChange={(state) => {
            if (state === 'disconnected' && isSessionInitiated && !connectionDetails) {
              return;
            }
            setAgentState(state);
            onStateChange(state);
          }}
          onTranscriptsChange={setTranscripts}
        />

        <View
          style={[
            styles.sessionHero,
            styles.sessionHeroCompact,
            { height: heroHeight },
          ]}
        >

          <Image
            source={COACH_AVATAR}
            style={styles.coachImageAbsolute}
            resizeMode="contain"
          />
        </View>

        <View style={styles.liveSection}>
          {transcripts.length === 0 ? (
            <View style={styles.promptBubble}>
              <Text style={styles.promptText}>{livePrompt}</Text>
            </View>
          ) : (
            <TranscriptList messages={transcripts} />
          )}
        </View>

        <View style={styles.liveControls}>
          <RoleplayControlBar
            onConnect={handleStartSession}
            onDisconnect={requestEndSession}
            agentState={
              isSessionInitiated && sessionState.agentState === 'disconnected'
                ? 'connecting'
                : sessionState.agentState
            }
            canStartSession={canStartSession}
            timeLoading={timeLoading}
            enableMicControl={true}
          />
        </View>
      </LiveKitRoom>

      <EndSessionModal
        visible={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={() => {
          setShowEndModal(false);
          onDisconnect();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: 'transparent' },
  sessionHero: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1d224e',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sessionHeroCompact: {},
  coachImage: { width: '100%', height: '100%' },
  coachImageAbsolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 99,
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endSessionButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 99,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introScroll: { flex: 1 },
  introScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
    alignItems: 'center',
  },
  introHeadline: {
    fontSize: 28,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 33.6,
    letterSpacing: 0.14,
    color: '#fff',
    textAlign: 'center',
  },
  gradientText: { fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#c55dfe' },
  introDescription: {
    marginTop: 16,
    fontSize: 12,
    fontFamily: 'Poppins',
    lineHeight: 16.8,
    color: '#c6c6c6',
    textAlign: 'center',
  },
  introMeta: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 19.6,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
  },
  buttonSection: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16 },
  startButtonText: { fontSize: 16, fontWeight: '500', fontFamily: 'Poppins-Medium', color: '#fff' },
  liveSection: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  promptBubble: {
    maxWidth: 292,
    borderRadius: 10,
    borderBottomLeftRadius: 4,
    backgroundColor: 'rgba(47,65,145,0.22)',
    padding: 12,
  },
  promptText: { fontSize: 13, fontFamily: 'Poppins', lineHeight: 18.85, color: '#fdfdfd' },
  liveControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 32,
  },

  muteSection: { alignItems: 'center', gap: 12 },
  muteLabel: { fontSize: 12, fontFamily: 'Poppins', lineHeight: 16.8, color: '#fff', opacity: 0.7 },
  muteButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#2949ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(167,115,255,0.55)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  muteRingInner: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(143,120,255,0.4)',
  },
  muteRingOuter: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: 'rgba(111,147,255,0.2)',
  },
  muteGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(167,115,255,0.48)',
  },
  volumeBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 32,
  },
  volumeBar: { width: 3, borderRadius: 2, backgroundColor: '#4c78ff' },
});
