/**
 * PracticeControlBar Component (React Native)
 *
 * Control bar for practice/roleplay sessions with connect/disconnect and mute controls.
 * Matches Next.js implementation: NO "View Report" button (unlike Call).
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { AgentState } from '@livekit/react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PracticeSessionType } from '@/types/practice';

export interface PracticeControlBarProps {
  onConnect: () => void;
  onDisconnect: () => void;
  agentState: AgentState;
  canStartSession: boolean;
  timeLoading: boolean;
  sessionType: PracticeSessionType;
}

export function PracticeControlBar({
  onConnect,
  onDisconnect,
  agentState,
  canStartSession,
  timeLoading,
  sessionType,
}: PracticeControlBarProps) {
  const { width } = useWindowDimensions();
  const [isMuted, setIsMuted] = useState(false);

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
      const sessionLabel = sessionType === 'roleplay' ? 'Roleplay' : 'Practice';
      Alert.alert('Limit Reached', `${sessionLabel} time limit reached.`);
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
          style={[
            styles.button,
            styles.primaryButton,
            (!canStartSession || timeLoading) && styles.disabledButton,
          ]}
          onPress={handleStart}
          disabled={!canStartSession || timeLoading}
          activeOpacity={0.85}
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
        </TouchableOpacity>
      </View>
    );
  }

  // Connected state - show disconnect and mute controls (NO View Report button)
  return (
    <View style={styles.container}>
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

      {/* Status text */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Session Active</Text>
        <Text style={styles.guidanceText}>
          Speak naturally and practice your English
        </Text>
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

  primaryButton: {
    backgroundColor: '#6A5AE0', // blue-500 (approximates blue-600)
  },

  disabledButton: {
    backgroundColor: '#4b5563', // gray-600
    opacity: 0.6,
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
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
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },

  guidanceText: {
    color: '#9ca3af', // gray-400
    fontSize: 12,
    marginTop: 4,
  },
});
