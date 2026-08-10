/**
 * Session Controls Component
 *
 * Controls for practice/call sessions
 * - Start/Stop buttons
 * - Timer display
 * - Mute controls
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface SessionControlsProps {
  isActive: boolean;
  timer: number;
  isMuted?: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleMute?: () => void;
  style?: ViewStyle;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

const SessionControls: React.FC<SessionControlsProps> = ({
  isActive,
  timer,
  isMuted = false,
  onStart,
  onStop,
  onToggleMute,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Session Time</Text>
        <Text style={styles.timer}>{formatTime(timer)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {isActive ? (
          <>
            {/* Mute Button */}
            {onToggleMute && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.muteButton,
                  isMuted && styles.mutedButton,
                ]}
                onPress={onToggleMute}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isMuted ? 'mic-off' : 'mic'}
                  size={24}
                  color={isMuted ? '#f44336' : '#fff'}
                />
              </TouchableOpacity>
            )}

            {/* Stop Button */}
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={onStop}
              activeOpacity={0.7}
            >
              <Ionicons name="stop-circle" size={24} color="#fff" />
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Start Button */}
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={onStart}
              activeOpacity={0.7}
            >
              <Ionicons name="play-circle" size={24} color="#fff" />
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timerLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'Courier New',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  button: {
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: colors.success,
    minWidth: 140,
  },
  stopButton: {
    backgroundColor: colors.error,
    minWidth: 140,
  },
  muteButton: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  mutedButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 2,
    borderColor: colors.error,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default SessionControls;
