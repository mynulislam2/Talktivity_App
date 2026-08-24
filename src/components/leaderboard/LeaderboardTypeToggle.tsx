/**
 * LeaderboardTypeToggle Component (React Native)
 *
 * Toggle component for switching between weekly and overall leaderboard.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { LeaderboardType } from '@/types/leaderboard';
import { spacing } from '@/styles/spacing';

export interface LeaderboardTypeToggleProps {
  currentType: LeaderboardType;
  onTypeChange: (type: LeaderboardType) => void;
}

export function LeaderboardTypeToggle({
  currentType,
  onTypeChange,
}: LeaderboardTypeToggleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            currentType === 'weekly' && styles.toggleButtonActive,
          ]}
          onPress={() => onTypeChange('weekly')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.toggleButtonText,
              currentType === 'weekly' && styles.toggleButtonTextActive,
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            currentType === 'overall' && styles.toggleButtonActive,
          ]}
          onPress={() => onTypeChange('overall')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.toggleButtonText,
              currentType === 'overall' && styles.toggleButtonTextActive,
            ]}
          >
            Overall
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#5A4BC0',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#9ca3af',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
});
