/**
 * ProgressErrorState Component (React Native)
 *
 * Error state for progress page with retry — matches frontend.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
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
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.2)',
    borderRadius: 6,
    backgroundColor: 'rgba(244,63,94,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fda4af',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    borderRadius: 12,
    backgroundColor: 'rgba(74,114,255,1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: 'rgba(74,114,255,0.28)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});
