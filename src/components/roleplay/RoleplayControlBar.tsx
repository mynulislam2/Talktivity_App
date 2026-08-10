/**
 * RoleplayControlBar Component (React Native)
 *
 * Control bar for roleplay sessions with connect/disconnect and mute controls.
 * Fully cloned from PracticeControlBar but hardcoded for roleplay only.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { AgentState } from '@livekit/react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { showErrorAlert } from '@/lib/errorHandler';
import { useLocalParticipant } from '@/hooks/livekit-native';

export interface RoleplayControlBarProps {
  onConnect: () => void;
  onDisconnect: () => void;
  agentState: AgentState;
  canStartSession: boolean;
  timeLoading: boolean;
  /**
   * When true, sync mute state with LiveKit local participant.
   * Should only be enabled when rendered inside a LiveKitRoom.
   */
  enableMicControl?: boolean;
}

export function RoleplayControlBar({
  onConnect,
  onDisconnect,
  agentState,
  canStartSession,
  timeLoading,
  enableMicControl = false,
}: RoleplayControlBarProps) {
  const { width } = useWindowDimensions();
  const [isMuted, setIsMuted] = useState(false);

  // Small helper component to sync UI mute state with LiveKit local participant
  const MicController: React.FC<{ muted: boolean }> = ({ muted }) => {
    const { localParticipant } = useLocalParticipant();

    useEffect(() => {
      try {
        if (!localParticipant) return;

        const participantAny = localParticipant as any;

        // Prefer setMicrophoneEnabled API when available
        if (typeof participantAny.setMicrophoneEnabled === 'function') {
          participantAny.setMicrophoneEnabled(!muted);
          return;
        }

        // Fallback: iterate audioTracks and disable/enable
        if (
          participantAny.audioTracks &&
          typeof participantAny.audioTracks.forEach === 'function'
        ) {
          participantAny.audioTracks.forEach((pub: any) => {
            try {
              if (typeof pub.setMuted === 'function') {
                pub.setMuted(muted);
              } else if (
                pub.track &&
                typeof pub.track.setMuted === 'function'
              ) {
                pub.track.setMuted(muted);
              }
            } catch (innerErr) {
              console.warn(
                '[RoleplayControlBar] Failed to toggle mute on track',
                innerErr
              );
            }
          });
        }
      } catch (err) {
        console.warn(
          '[RoleplayControlBar] MicController error while toggling mute',
          err
        );
      }
    }, [muted, localParticipant]);

    return null;
  };

  /**
   * Toggle microphone on/off.
   * NOTE: In React Native, this currently updates local UI state only.
   * TODO: Wire this to the LiveKit RN room local participant when available.
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleStart = () => {
    if (!canStartSession) {
      showErrorAlert('Roleplay time limit reached.', 'Limit Reached');
      return;
    }
    onConnect();
  };

  const buttonLabel = timeLoading
    ? 'Checking...'
    : !canStartSession
    ? 'Time Limit Reached'
    : 'Start Conversation';

  // Responsive button sizing
  const buttonFontSize = width < 480 ? 16 : 18;
  const iconSize = width < 480 ? 20 : 24;

  // Disconnected state - show start button
  if (agentState === 'disconnected') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleStart}
          disabled={!canStartSession || timeLoading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={
              !canStartSession || timeLoading
                ? ['#4b5563', '#4b5563']
                : ['#9333ea', '#3b82f6']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              (!canStartSession || timeLoading) && styles.disabledButton,
            ]}
          >
            {timeLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name="mic"
                  size={iconSize}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>
                  {buttonLabel}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Connected state - show disconnect and mute controls (NO View Report button)
  return (
    <View style={styles.container}>
      {/* Sync microphone with mute state while connected (only when inside LiveKitRoom) */}
      {enableMicControl && <MicController muted={isMuted} />}

      {/* Control buttons row */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.circleButton, styles.disconnectButton]}
          onPress={onDisconnect}
          activeOpacity={0.85}
        >
          <Ionicons name="close" size={iconSize} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circleButton,
            isMuted ? styles.mutedButton : styles.unmutedButton,
          ]}
          onPress={toggleMute}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={iconSize}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 32,
  },

  // Disconnected state styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  disabledButton: {
    backgroundColor: '#4b5563', // gray-600
    opacity: 0.6,
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // Connected state styles
  controlsRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },

  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  disconnectButton: {
    backgroundColor: '#ef4444', // red-500
  },

  unmutedButton: {
    backgroundColor: '#6A5AE0', // blue-500
  },

  mutedButton: {
    backgroundColor: '#6b7280', // gray-500
  },

  // Status text
  statusContainer: {
    alignItems: 'center',
    marginTop: 12,
  },

  statusText: {
    color: '#34d399', // emerald-400
    fontSize: 14,
    fontWeight: '600',
  },

  guidanceText: {
    color: '#9ca3af', // gray-400
    fontSize: 12,
    marginTop: 4,
  },
});
