/**
 * LeaderboardErrorState Component (React Native)
 *
 * Error state UI with retry button for the leaderboard page.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Header } from '@/components/home';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface LeaderboardErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function LeaderboardErrorState({
  error,
  onRetry,
}: LeaderboardErrorStateProps) {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load leaderboard</Text>
        <Text style={styles.errorDetails}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  errorDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.white,
  },
});
