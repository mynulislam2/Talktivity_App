/**
 * ControlBar Component (React Native)
 *
 * Control bar for call session (start/stop, mute, disconnect).
 * Matches Next.js implementation exactly.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { AgentState, useRoomContext } from '@livekit/react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';

export interface ControlBarProps {
  onConnect: () => void;
  onDisconnect: () => void;
  agentState: AgentState;
  canStartCall: boolean;
  timeLoading: boolean;
  onViewReport: () => void;
  hasCompletedLongCall: boolean;
}

export function ControlBar({
  onConnect,
  onDisconnect,
  agentState,
  canStartCall,
  timeLoading,
  onViewReport,
  hasCompletedLongCall,
}: ControlBarProps) {
  const { width } = useWindowDimensions();
  const [isMuted, setIsMuted] = useState(false);
  const room = useRoomContext();

  /**
   * Toggle microphone on/off on the active LiveKit room local participant
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (room?.localParticipant) {
        room.localParticipant.setMicrophoneEnabled(!nextMuted).catch((err) => {
          console.warn('[ControlBar] Mute toggle error:', err);
        });
      }
      return nextMuted;
    });
  }, [room]);

  const handleStart = () => {
    if (!canStartCall) {
      Alert.alert(
        'Limit Reached',
        'Lifetime call limit reached. Please upgrade your plan for more time.'
      );
      return;
    }
    onConnect();
  };

  const buttonLabel = timeLoading
    ? 'Checking...'
    : !canStartCall
    ? 'Limit Reached'
    : hasCompletedLongCall
    ? 'Resume Call'
    : 'Start Call';

  // Responsive button sizing
  const buttonFontSize = width < 480 ? 16 : 18;
  const iconSize = width < 480 ? 20 : 24;

  // Disconnected state - show start button(s)
  if (agentState === 'disconnected') {
    return (
      <View style={styles.container}>
        {hasCompletedLongCall ? (
          // Two-button layout: Resume Call + View Report
          <View style={styles.twoButtonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                (!canStartCall || timeLoading) && styles.disabledButton,
              ]}
              onPress={handleStart}
              disabled={!canStartCall || timeLoading}
              activeOpacity={0.85}
            >
              {timeLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="call"
                    size={iconSize}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[styles.buttonText, { fontSize: buttonFontSize }]}
                  >
                    {buttonLabel}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onViewReport}
              activeOpacity={0.85}
            >
              <Ionicons
                name="checkmark-circle"
                size={iconSize}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>
                View Report
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Single large button: Start Call
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              styles.singleButton,
              (!canStartCall || timeLoading) && styles.disabledButton,
            ]}
            onPress={handleStart}
            disabled={!canStartCall || timeLoading}
            activeOpacity={0.85}
          >
            {timeLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name="call"
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
        )}
      </View>
    );
  }

  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn((prev) => {
      const nextSpeakerOn = !prev;
      // AudioSession is not directly exported in the top scope, it's inside @livekit/react-native
      // We need to import it or use the context, but wait we imported AgentState and useRoomContext.
      // Let's require it locally if not imported.
      const { AudioSession } = require('@livekit/react-native');
      const { Platform } = require('react-native');
      const setOutput = async () => {
        try {
          if (Platform.OS === 'ios') {
            await AudioSession.selectAudioOutput(nextSpeakerOn ? 'force_speaker' : 'default');
          } else {
            await AudioSession.selectAudioOutput(nextSpeakerOn ? 'speaker' : 'earpiece');
          }
        } catch (err) {
          console.warn('[ControlBar] Speaker toggle error:', err);
        }
      };
      setOutput();
      return nextSpeakerOn;
    });
  }, []);

  // Connected state - show disconnect and mute controls
  return (
    <View style={styles.container}>
      {/* Control buttons row */}
      <View style={styles.connectedControls}>
        <TouchableOpacity
          style={[styles.squircleButton, styles.controlButton]}
          onPress={toggleMute}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isMuted ? 'mic-off-outline' : 'mic-outline'}
            size={iconSize + 4}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endCallButton}
          onPress={onDisconnect}
          activeOpacity={0.85}
        >
          <Ionicons
            name="call"
            size={iconSize + 6}
            color="#93000a"
            style={{ transform: [{ rotate: '135deg' }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.squircleButton, styles.controlButton]}
          onPress={toggleSpeaker}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isSpeakerOn ? 'volume-high-outline' : 'volume-mute-outline'}
            size={iconSize + 4}
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
    paddingVertical: 16,
  },

  // Disconnected state styles
  twoButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    gap: 12,
    paddingHorizontal: 16,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  singleButton: {
    paddingHorizontal: 48,
  },

  primaryButton: {
    backgroundColor: colors.primary,
  },

  secondaryButton: {
    backgroundColor: colors.brand.inputBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  disabledButton: {
    backgroundColor: '#4b5563', // gray-600
    opacity: 0.6,
  },

  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },

  // Connected state styles
  connectedControls: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  squircleButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  endCallButton: {
    width: 80,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#ffb4ab',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  controlButton: {
    backgroundColor: '#3b404a',
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
    fontFamily: 'Poppins-SemiBold',
  },

  guidanceText: {
    color: '#9ca3af', // gray-400
    fontSize: 12,
    fontFamily: 'Poppins',
    marginTop: 4,
  },
});
