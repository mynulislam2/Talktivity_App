/**
 * ProgressErrorState Component (React Native)
 *
 * Error state for progress page with retry — matches frontend.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface ProgressErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export function ProgressErrorState({
  error,
  onRetry,
}: ProgressErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Text style={styles.errorText}>
          {error || 'Failed to load achievements'}
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
    minHeight: 400,
  },
  errorCard: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fda4af',
    textAlign: 'center',
    marginBottom: 16,
  },
});
