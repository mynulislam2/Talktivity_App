/**
 * Stats Display Component
 *
 * Displays learning statistics in a grid layout
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

export interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

interface StatsDisplayProps {
  stats: StatItem[];
  columns?: number;
  style?: ViewStyle;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  stats,
  columns = 2,
  style,
}) => {
  const columnWidth = (100 - (spacing.md / 8) * (columns - 1)) / columns;

  return (
    <View style={[styles.container, style]}>
      {stats.map((stat, index) => (
        <View
          key={index}
          style={[
            styles.statCard,
            {
              width: `${columnWidth}%`,
              marginRight: (index + 1) % columns === 0 ? 0 : spacing.md / 4,
              marginBottom: spacing.md,
            },
          ]}
        >
          {stat.icon && (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${stat.color || colors.primary}20` },
              ]}
            >
              <Ionicons
                name={stat.icon as any}
                size={24}
                color={stat.color || colors.primary}
              />
            </View>
          )}
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});

export default StatsDisplay;
