/**
 * UserPositionCard Component (React Native)
 * 
 * Displays the user's position in the leaderboard.
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import type { UserPositionData } from '@/types/leaderboard';
import { spacing } from '@/styles/spacing';

export interface UserPositionCardProps {
  userPosition: UserPositionData;
}

export function UserPositionCard({ userPosition }: UserPositionCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Position</Text>
      <View style={styles.card}>
        <View style={styles.leftSection}>
          <Text style={styles.position}>#{userPosition.position}</Text>
          {userPosition.user?.profile_picture ? (
            <Image
              source={{ uri: userPosition.user.profile_picture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userPosition.user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.name} numberOfLines={1}>
            {userPosition.user?.name || 'Unknown'}
          </Text>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${userPosition.user?.xpProgress || 0}%` },
              ]}
            />
          </View>
          <Text style={styles.xp}>{userPosition.user?.xp || 0} XP</Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  position: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#7B70FF',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7B70FF',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    minWidth: 100,
  },
  progressBar: {
    width: 192,
    height: 24,
    backgroundColor: '#d1d5db',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6A5AE0',
    borderRadius: 12,
  },
  xp: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
