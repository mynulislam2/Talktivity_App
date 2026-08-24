/**
 * CommunityErrorState Component (React Native)
 *
 * Error state UI with retry button for the community page.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface CommunityErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function CommunityErrorState({
  error,
  onRetry,
}: CommunityErrorStateProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#b91c1c', '#dc2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <Ionicons name="alert-circle" size={40} color="#fff" />
      </LinearGradient>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={onRetry} activeOpacity={0.8}>
        <LinearGradient
          colors={['#2563eb', '#9333ea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#9ca3af',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});
