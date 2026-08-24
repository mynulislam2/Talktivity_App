/**
 * TopicsErrorState Component
 *
 * Error state for topics page with retry functionality.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface TopicsErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export function TopicsErrorState({ error, onRetry }: TopicsErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.errorText}>{error || 'Failed to load topics'}</Text>
        <Text style={styles.subText}>
          If the issue persists, check your network connection or backend server
          logs.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    maxWidth: 400,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subText: {
    color: '#9ca3af',
    fontSize: 14,
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
