/**
 * ProfileHeroStats Component (React Native)
 *
 * XP and Streak stat cards with custom SVG icons.
 * Matches talktivity_frontend/components/profile/ProfileHeroStats.tsx exactly.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ProgressStats } from '@/types/profile';
import { PointsOrbIcon, StreakOrbIcon } from './ProfileVisualIcons';

interface ProfileHeroStatsProps {
  progressStats: ProgressStats | null;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  }
  return String(value);
}

export function ProfileHeroStats({ progressStats }: ProfileHeroStatsProps) {
  const totalXP = Math.max(
    0,
    Number(progressStats?.courseProgress?.progress?.total_xp || 0)
  );
  const currentStreak = Math.max(
    0,
    Number(progressStats?.courseProgress?.progress?.current_streak || 0)
  );

  const cards = [
    {
      key: 'points',
      label: 'All-time XP',
      value: formatNumber(totalXP),
      icon: PointsOrbIcon,
    },
    {
      key: 'streak',
      label: 'Streak',
      value: String(currentStreak),
      icon: StreakOrbIcon,
    },
  ];

  return (
    <View style={styles.grid}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <View key={card.key} style={styles.card}>
            <Text style={styles.value}>{card.value}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.label}>{card.label}</Text>
              <Icon />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 16,
    // marginTop: 24,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  value: {
    fontSize: 28,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    letterSpacing: 0.14,
    color: '#fff',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: '#c6c6c6',
    maxWidth: 88,
  },
});
