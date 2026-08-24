/**
 * PracticeHeader Component (React Native)
 *
 * Header component for practice/roleplay page with status indicator and time remaining.
 * Matches Next.js: time badge (left), state badge (right).
 */

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export interface PracticeHeaderProps {
  stateText: string;
  stateColor: string;
  remainingTime: string;
  isLoading: boolean;
  canStartSession: boolean;
}

export function PracticeHeader({
  stateText,
  stateColor,
  remainingTime,
  isLoading,
  canStartSession,
}: PracticeHeaderProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  /**
   * Get time badge background color based on state.
   * Matches Next.js logic:
   * - isLoading: gray
   * - !canStartSession: red
   * - Else: blue gradient
   */
  const getTimeBadgeColor = (): string => {
    if (isLoading) return '#6b7280'; // gray-500
    if (!canStartSession) return 'rgba(220, 38, 38, 0.8)'; // red-600/80
    return '#6A5AE0'; // blue-500 (approximates blue-700 gradient)
  };

  /**
   * Get state dot color from Tailwind color classes.
   * Used for the pulsing indicator in the state badge.
   */
  const getStateColorValue = (): string => {
    if (stateColor.includes('emerald')) return '#10b981'; // emerald-400
    if (stateColor.includes('amber')) return '#f59e0b'; // amber-400
    return '#9ca3af'; // gray-400 (default)
  };

  // Responsive font sizing
  const fontSize = width < 480 ? 12 : 13;
  const iconSize = width < 480 ? 14 : 15;

  return (
    <View
      style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 12 }]}
    >
      {/* Time remaining badge (left) - dynamic color based on state */}
      <View
        style={[styles.timeBadge, { backgroundColor: getTimeBadgeColor() }]}
      >
        <Ionicons
          name="flash"
          size={iconSize}
          color="#fff"
          style={{ marginRight: 4 }}
        />
        <Text style={[styles.timeText, { fontSize }]}>{remainingTime}</Text>
      </View>

      {/* State badge (right) - dark background with pulsing dot */}
      <View style={styles.stateBadge}>
        <View
          style={[styles.stateDot, { backgroundColor: getStateColorValue() }]}
        />
        <Text style={[styles.stateText, { fontSize }]}>{stateText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 8,
  },

  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  timeText: {
    color: '#ffffff',
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
  },

  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  stateText: {
    color: '#ffffff',
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
  },
});
