/**
 * Stats Card Component
 *
 * Display user statistics in card format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

export interface StatItemData {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

export interface StatsCardProps {
  stats: StatItemData[];
  columns?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, columns = 3 }) => {
  const itemWidth = `${100 / columns}%`;

  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[styles.statItem, { width: itemWidth as any }]}
          >
            <View
              style={[
                styles.statIcon,
                { backgroundColor: `${stat.color || colors.primary}20` },
              ]}
            >
              <Ionicons
                name={stat.icon as any}
                size={24}
                color={stat.color || colors.primary}
              />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: colors.black,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default StatsCard;
