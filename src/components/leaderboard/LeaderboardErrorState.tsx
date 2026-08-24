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
        <TouchableOpacity onPress={onRetry} activeOpacity={0.8}>
          <LinearGradient
            colors={['#3b82f6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </LinearGradient>
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
  errorTitle: {
    fontSize: 16,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
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
  retryButton: {
    borderRadius: 12,
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
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
});
