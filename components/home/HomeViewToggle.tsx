/**
 * HomeViewToggle Component (React Native)
 * 
 * Toggle between 'today' and 'timeline' views.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { HomeViewMode } from '@/types/home';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface HomeViewToggleProps {
  viewMode: HomeViewMode;
  onViewModeChange: (mode: HomeViewMode) => void;
}

export const HomeViewToggle: React.FC<HomeViewToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'today' && styles.toggleButtonActive,
          ]}
          onPress={() => onViewModeChange('today')}
        >
          <Ionicons
            name="calendar"
            size={16}
            color={viewMode === 'today' ? '#fff' : 'rgba(203, 213, 225, 1)'}
          />
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === 'today' && styles.toggleButtonTextActive,
            ]}
          >
            Today's Plan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'timeline' && styles.toggleButtonActive,
          ]}
          onPress={() => onViewModeChange('timeline')}
        >
          <Ionicons
            name="bar-chart"
            size={16}
            color={viewMode === 'timeline' ? '#fff' : 'rgba(203, 213, 225, 1)'}
          />
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === 'timeline' && styles.toggleButtonTextActive,
            ]}
          >
            Full Timeline
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(55, 65, 81, 1)',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginHorizontal: spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: '#6A5AE0',
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(203, 213, 225, 1)',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
});
