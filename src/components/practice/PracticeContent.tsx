/**
 * PracticeContent Component
 *
 * Practice session UI — matches frontend's ConversationSessionShell.
 */

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  useWindowDimensions,
  Platform,
  PermissionsAndroid,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LiveKitRoom, AgentState, useRoomContext } from '@livekit/react-native';
import Feather from '@expo/vector-icons/Feather';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import type { ConnectionDetails } from '@/types/call';
import type {
  PracticeSessionState,
} from '@/types/practice';
import { SimpleVoiceAssistant, TranscriptList } from '@/components/livekit';
import type { TranscriptMessage } from '@/components/livekit';
import { useVoiceVolume } from './PracticeVisualizerLayout';
import { useLoudspeakerAudioSession } from '@/hooks/useLoudspeakerAudioSession';
import { useBackgroundSessionCleanup } from '@/hooks/useBackgroundSessionCleanup';
import { useBackHandlerConfirmation } from '@/hooks/useBackHandlerConfirmation';

export interface PracticeContentProps {
  topicTitle: string;
  sessionState: PracticeSessionState;
  connectionDetails: ConnectionDetails | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onStateChange: (state: any) => void;
  canStartSession: boolean;
  timeLoading: boolean;
  remainingTime: string;
  stateColor?: string;
  onDeviceFailure?: (error?: any) => void;
  onBack?: () => void;
}

function LiveControls({
  agentState,
}: {
  agentState: AgentState;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const room = useRoomContext();

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (room?.localParticipant) {
        room.localParticipant.setMicrophoneEnabled(!nextMuted).catch((err) => {
          console.warn('[PracticeControls] Mute toggle error:', err);
        });
      }
      return nextMuted;
    });
  }, [room]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const outerPulseAnim = useRef(new Animated.Value(1)).current;
  const { agentVolumeStrength, userVolumeStrength } = useVoiceVolume();
  const isAssistantSpeaking =
    agentState === 'speaking' || agentVolumeStrength > 0.08;
  const isUserSpeaking = userVolumeStrength > 0.08;
  const activityStrength = Math.max(
    userVolumeStrength,
    agentVolumeStrength,
    isAssistantSpeaking ? 0.26 : 0,
    isUserSpeaking ? 0.18 : 0
  );
  const visualHeights = [8, 14, 20, 26, 20, 14, 8];

  useEffect(() => {
    if (isAssistantSpeaking || isUserSpeaking) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 850,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 850,
            useNativeDriver: true,
          }),
        ])
      );
      const outerAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(outerPulseAnim, {
            toValue: 1.18,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(outerPulseAnim, {
            toValue: 1,
            duration: 1100,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
      outerAnim.start();
      return () => {
        anim.stop();
        outerAnim.stop();
      };
    } else {
      pulseAnim.setValue(1);
      outerPulseAnim.setValue(1);
    }
  }, [isAssistantSpeaking, isUserSpeaking, pulseAnim, outerPulseAnim]);

  return (
    <View style={styles.liveControls}>
      <View style={styles.muteSection}>
        <Text style={styles.muteLabel}>Speak with Alina</Text>
        <TouchableOpacity
          onPress={handleToggleMute}
          style={styles.muteButton}
          activeOpacity={0.85}
        >
          {!isMuted && (
            <>
              <Animated.View
                style={[
                  styles.muteRingInner,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: isAssistantSpeaking || isUserSpeaking ? 0.42 : 0.2,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.muteRingOuter,
                  {
                    transform: [{ scale: outerPulseAnim }],
                    opacity:
                      isAssistantSpeaking || isUserSpeaking ? 0.24 : 0.12,
                  },
                ]}
              />
            </>
          )}
          <View style={styles.muteGlow} />
          {isMuted ? (
            <Feather
              name="mic-off"
              size={28}
              color="#fff"
              style={{ zIndex: 1 }}
            />
          ) : (
            <Feather name="mic" size={28} color="#fff" style={{ zIndex: 1 }} />
          )}
        </TouchableOpacity>
        <View style={styles.volumeBars}>
          {visualHeights.map((height, index) => (
            <View
              key={index}
              style={[
                styles.volumeBar,
                {
                  height: isMuted
                    ? 6
                    : height + activityStrength * (10 + (index % 3) * 4),
                  opacity: isMuted ? 0.35 : 0.48 + activityStrength * 0.52,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
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
  remainingTime,
  stateColor,
  onDeviceFailure,
  onBack,
}: PracticeContentProps) {
  const { width } = useWindowDimensions();
  const hasLiveConversation =
    sessionState.agentState !== 'disconnected' || Boolean(connectionDetails);
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);

  // Configure AudioSession for loudspeaker output during LiveKit session
  useLoudspeakerAudioSession(hasLiveConversation);

  // Auto-disconnect active session when app is backgrounded
  useBackgroundSessionCleanup(hasLiveConversation, onDisconnect);

  // Intercept Android hardware back button mid-practice
  useBackHandlerConfirmation(hasLiveConversation, onDisconnect);

  const s = {
    headline: 'Ready to Practice',
    headlineGradient: 'English?',
    description:
      'Have a natural conversation with Alina. Speak freely, build confidence, and practice your English in real time.',
  };

  const normalizedServerUrl = React.useMemo(() => {
    if (!connectionDetails?.serverUrl) return '';
    let url = connectionDetails.serverUrl.replace(/\/+$/, '');
    try {
      const { normalizeUrl } = require('@/lib/network/urlNormalizer');
      url = normalizeUrl(url);
    } catch {}
    return url;
  }, [connectionDetails?.serverUrl]);

  const handleDeviceFailure = (error?: any) => {
    if (onDeviceFailure) {
      onDeviceFailure(error);
    } else {
      Alert.alert('Device Error', 'Error accessing camera or microphone.');
    }
  };

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS !== 'android' || !connectionDetails) return;
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
      } catch {}
    };
    requestPermission();
  }, [connectionDetails]);

  const startButtonLabel = timeLoading
    ? 'Checking...'
    : !canStartSession
    ? 'Practice Limit Reached'
    : 'Start Conversation';
  const livePrompt = `Let's practice ${topicTitle}. Tell me what you think about this topic and I'll guide the conversation.`;
  const heroHeight = hasLiveConversation ? 260 : 300;

  if (!hasLiveConversation) {
    return (
      <View style={styles.shell}>
        <View style={[styles.sessionHero, { height: heroHeight }]}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
              <Feather name="chevron-left" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}
          <Image
            source={require('../../../assets/figma/coach/alina-intro.png')}
            style={styles.coachImage}
            resizeMode="contain"
          />
        </View>
        <ScrollView
          style={styles.introScroll}
          contentContainerStyle={styles.introScrollContent}
        >
          <View>
            <Text style={styles.introHeadline}>
              {s.headline}{' '}
              <Text style={styles.gradientText}>{s.headlineGradient}</Text>
            </Text>
            <Text style={styles.introDescription}>{s.description}</Text>
            {/* No time remaining shown */}
          </View>
        </ScrollView>
        <View style={styles.buttonSection}>
          <FigmaPrimaryButton
            onPress={onConnect}
            disabled={!canStartSession || timeLoading}
            style={{ height: 50, borderRadius: 10, width: '100%' }}
          >
            <Feather name="mic" size={20} color="#fff" />
            <Text style={styles.startButtonText}>{startButtonLabel}</Text>
          </FigmaPrimaryButton>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <LiveKitRoom
        token={connectionDetails?.participantToken || ''}
        serverUrl={normalizedServerUrl}
        connect={Boolean(
          connectionDetails?.participantToken && normalizedServerUrl
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
          onStateChange={setAgentState}
          onTranscriptsChange={setTranscripts}
        />
        <View
          style={[
            styles.sessionHero,
            styles.sessionHeroCompact,
            { height: heroHeight },
          ]}
        >
          <TouchableOpacity onPress={onDisconnect} style={styles.backButton} activeOpacity={0.7}>
            <Feather name="x" size={18} color="#ff3434" />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/figma/coach/alina-intro.png')}
            style={styles.coachImage}
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
        <LiveControls
          agentState={sessionState.agentState}
        />
      </LiveKitRoom>
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
  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    zIndex: 99,
    width: 36,
    height: 36,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 33.6,
    letterSpacing: 0.14,
    color: '#fff',
    textAlign: 'center',
  },
  gradientText: { fontWeight: '700', fontFamily: 'Poppins-Bold', color: '#c55dfe' },
  introDescription: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 16.8,
    color: '#c6c6c6',
    textAlign: 'center',
  },
  introMeta: {
    marginTop: 16,
    fontSize: 14,
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
  promptText: { fontSize: 13, lineHeight: 18.85, color: '#fdfdfd' },
  liveControls: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
  },
  muteSection: { alignItems: 'center', gap: 12 },
  muteLabel: { fontSize: 12, lineHeight: 16.8, color: '#fff', opacity: 0.7 },
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
