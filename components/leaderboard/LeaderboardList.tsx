/**
 * LeaderboardList Component (React Native)
 * 
 * Displays the leaderboard list of users.
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import type { LeaderboardUser, LeaderboardType } from '@/types/leaderboard';
import { spacing } from '@/styles/spacing';

export interface LeaderboardListProps {
  leaderboard: LeaderboardUser[];
  leaderboardType: LeaderboardType;
}

export function LeaderboardList({ leaderboard, leaderboardType }: LeaderboardListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {leaderboardType === 'weekly' ? 'This Week' : 'All Time'} leaderboard
        </Text>
        <Text style={styles.headerSubtext}>Top performers</Text>
      </View>
      <View style={styles.list}>
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No participants yet. Be the first to join!</Text>
          </View>
        ) : (
          leaderboard.map((user) => (
            <View key={user.id} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                {user.isCrown && (
                  <Text style={styles.crown}>👑</Text>
                )}
                {user.profile_picture ? (
                  <Image
                    source={{ uri: user.profile_picture }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={styles.userLevel}>Level {user.level}</Text>
                </View>
              </View>
              <View style={styles.listItemRight}>
                <View style={styles.xpContainer}>
                  <Text style={styles.xpLabel}>XP</Text>
                  <Text style={styles.xpValue}>{user.xp}</Text>
                </View>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>#{user.position}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    flex: 1,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  list: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.xs,
    gap: spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  crown: {
    position: 'absolute',
    top: -16,
    left: 24,
    fontSize: 20,
    color: '#fbbf24',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  userLevel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  xpValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#86efac',
  },
  positionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
