/**
 * HomeErrorState Component (React Native)
 * 
 * Error state for home page with retry action.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface HomeErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const HomeErrorState: React.FC<HomeErrorStateProps> = ({
  error,
  onRetry,
}) => {
  // Check if it's a rate limit error
  const isRateLimit = error?.includes('429') || error?.includes('rate limit') || error?.includes('too many requests');
  
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>
        {isRateLimit 
          ? 'Too many requests. Please wait a moment and try again.'
          : error}
      </Text>
      {isRateLimit ? (
        <Text style={styles.waitText}>Wait 30-60 seconds before retrying</Text>
      ) : (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6A5AE0',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  waitText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
