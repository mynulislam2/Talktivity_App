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
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#9ca3af',
    marginBottom: 8,
    textAlign: 'center',
  },
});
