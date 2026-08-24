/**
 * LeaderboardErrorState Component (React Native)
 *
 * Error state UI with retry button for the leaderboard page.
 * Matches the /progress error card (docs/design/web-page-specs.md:
 * "*error* the same rose card + blue→purple retry as /progress").
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>Unable to load leaderboard</Text>
        <Text style={styles.errorText}>{error}</Text>
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
  errorTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fda4af',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
});
