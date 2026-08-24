/**
 * UserPositionCard Component (React Native)
 *
 * Displays the user's position card with XP and rank — matches frontend design.
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UserPositionData } from '@/types/leaderboard';
import { spacing } from '@/styles/spacing';

function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return String(value);
}

export interface UserPositionCardProps {
  userPosition: UserPositionData;
  currentXpLabel?: string;
}

export function UserPositionCard({
  userPosition,
  currentXpLabel = 'Global XP',
}: UserPositionCardProps) {
  const user = userPosition.user;
  const initial = (user?.name || 'U').charAt(0).toUpperCase();
  const compactXp = formatCompactNumber(user?.xp || 0);
  const shareIcon = '✓';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left: Avatar + Name */}
        <View style={styles.leftSection}>
          {user?.profile_picture ? (
            <Image
              source={{ uri: user.profile_picture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
          <View>
            <Text style={styles.youLabel}>You</Text>
            <Text style={styles.xpSubtext}>
              {user ? `${compactXp} XP` : 'Start earning XP'}
            </Text>
          </View>
        </View>

        {/* Right: XP Value */}
        <View style={styles.rightSection}>
          <Text style={styles.xpHeader}>{currentXpLabel}</Text>
          <View style={styles.xpRow}>
            <Text style={styles.xpValue}>
              {user ? `${compactXp}XP` : '0XP'}
            </Text>
            <Ionicons
              name="share-outline"
              size={18}
              color="rgba(255,255,255,0.7)"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  youLabel: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    lineHeight: 24,
  },
  xpSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#8c8c8c',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  xpHeader: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.08,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 4,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  xpValue: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
});
