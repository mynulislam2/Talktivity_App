/**
 * ProfileHeroStats Component (React Native)
 *
 * XP and Streak stat cards with custom SVG icons.
 * Matches talktivity_frontend/components/profile/ProfileHeroStats.tsx exactly.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useResponsive } from '@/theme/responsive';
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
  const { narrow } = useResponsive();
  // The orb is the fixed part of the footer row; on a very narrow card it has
  // to give the label back enough width to keep "Streak" on one line.
  const orbSize = narrow ? 40 : 52;
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
    <View style={[styles.grid, narrow && styles.gridNarrow]}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <View key={card.key} style={[styles.card, narrow && styles.cardNarrow]}>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
              {card.value}
            </Text>
            <View style={[styles.cardFooter, narrow && styles.cardFooterStacked]}>
              <Text style={[styles.label, narrow ? styles.labelStacked : styles.labelInline]}>
                {card.label}
              </Text>
              <View style={[styles.icon, narrow && styles.iconStacked]}>
                <Icon size={orbSize} />
              </View>
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
  gridNarrow: {
    gap: 10,
  },
  card: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  cardNarrow: {
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  value: {
    fontSize: 28,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.14,
    color: '#fff',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 8,
  },
  cardFooterStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginTop: 16,
    gap: 4,
  },
  label: {
    // Same shape as ProfileActivityCard, and stacked on narrow screens for
    // the same reason — see the comment on `statLabelStacked` there.
    minWidth: 0,
    fontSize: 15,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: '#c6c6c6',
  },
  labelInline: {
    flex: 1,
  },
  labelStacked: {
    alignSelf: 'stretch',
    fontSize: 13,
    lineHeight: 18,
  },
  icon: {
    flexShrink: 0,
  },
  iconStacked: {
    alignSelf: 'flex-end',
  },
});
