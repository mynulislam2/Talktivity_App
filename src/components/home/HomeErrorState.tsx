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
  const isRateLimit =
    error?.includes('429') ||
    error?.includes('rate limit') ||
    error?.includes('too many requests');

  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>
        {isRateLimit
          ? 'Too many requests. Please wait a moment and try again.'
          : error}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontFamily: 'Poppins',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
