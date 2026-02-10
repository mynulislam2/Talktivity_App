/**
 * UserPositionEmpty Component (React Native)
 * 
 * Displays empty state when user has no position in leaderboard.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '@/styles/spacing';

export function UserPositionEmpty() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Position</Text>
      <View style={styles.card}>
        <Text style={styles.emptyText}>No position yet</Text>
        <Text style={styles.emptySubtext}>
          Complete lessons and earn XP to appear on the leaderboard!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
