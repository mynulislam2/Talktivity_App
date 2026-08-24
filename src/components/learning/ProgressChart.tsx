/**
 * Progress Chart Component
 *
 * Displays learning progress with visual indicators
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

export interface ProgressData {
  label: string;
  value: number;
  max: number;
  color?: string;
}

interface ProgressChartProps {
  data: ProgressData[];
  style?: ViewStyle;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data, style }) => {
  const getPercentage = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  return (
    <View style={[styles.container, style]}>
      {data.map((item, index) => {
        const percentage = getPercentage(item.value, item.max);
        const barColor = item.color || colors.primary;

        return (
          <View key={index} style={styles.progressItem}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.valueText}>
                {item.value} / {item.max}
              </Text>
            </View>

            <View style={styles.barContainer}>
              <View style={[styles.barBackground]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.percentageText}>
                {Math.round(percentage)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressItem: {
    marginBottom: spacing.lg,
  },
  progressItemLast: {
    marginBottom: 0,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.black,
  },
  valueText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.text.secondary,
    minWidth: 32,
    textAlign: 'right',
  },
});

export default ProgressChart;
