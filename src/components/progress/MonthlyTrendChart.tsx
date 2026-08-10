/**
 * MonthlyTrendChart Component (React Native)
 *
 * Monthly trend chart (simplified visualization since Chart.js is not available).
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { courseService } from '@/services/course';
import type { CourseAnalytics, UserAchievements } from '@/services/course';
import { spacing } from '@/styles/spacing';

export interface MonthlyTrendChartProps {
  analytics: CourseAnalytics | null;
  achievements: UserAchievements | null;
}

export function MonthlyTrendChart({
  analytics,
  achievements,
}: MonthlyTrendChartProps) {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  if (!analytics?.monthlyTrends || analytics.monthlyTrends.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Monthly Activity Trends</Text>

        {/* Simplified chart representation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chartContainer}
        >
          <View style={styles.chart}>
            {analytics.monthlyTrends.map((trend, index) => {
              const maxValue = Math.max(
                trend.speaking_days,
                trend.quiz_days,
                trend.listening_days,
                trend.listening_quiz_days
              );
              const maxHeight = 120;

              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barsContainer}>
                    <View
                      style={[
                        styles.bar,
                        styles.barGreen,
                        {
                          height:
                            (trend.speaking_days / Math.max(maxValue, 1)) *
                            maxHeight,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        styles.barPurple,
                        {
                          height:
                            (trend.quiz_days / Math.max(maxValue, 1)) *
                            maxHeight,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        styles.barBlue,
                        {
                          height:
                            (trend.listening_days / Math.max(maxValue, 1)) *
                            maxHeight,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        styles.barViolet,
                        {
                          height:
                            (trend.listening_quiz_days /
                              Math.max(maxValue, 1)) *
                            maxHeight,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel} numberOfLines={1}>
                    {monthNames[trend.month - 1]} {trend.year}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.barGreen]} />
            <Text style={styles.legendText}>Speaking</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.barPurple]} />
            <Text style={styles.legendText}>Quiz</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.barBlue]} />
            <Text style={styles.legendText}>Listening</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.barViolet]} />
            <Text style={styles.legendText}>L. Quiz</Text>
          </View>
        </View>

        {/* Speaking Time Info */}
        {achievements && (
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Speaking Time:</Text>
              <Text style={styles.infoValue}>
                {courseService.formatSpeakingTime(
                  achievements.stats.totalSpeakingTime
                )}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Sessions:</Text>
              <Text style={styles.infoValue}>
                {achievements.stats.fullSessions}
              </Text>
            </View>
            <Text style={styles.infoText}>
              XP:{' '}
              {Math.floor((achievements.stats.totalSpeakingTime || 0) / 60) * 2}{' '}
              from time + {(achievements.stats.fullSessions || 0) * 10} from
              full sessions ={' '}
              {Math.floor((achievements.stats.totalSpeakingTime || 0) / 60) *
                2 +
                (achievements.stats.fullSessions || 0) * 10}{' '}
              XP
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.xs,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: '#0e112c',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartContainer: {
    marginVertical: spacing.sm,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    gap: spacing.xs,
  },
  chartBar: {
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 40,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 120,
  },
  bar: {
    width: 8,
    minHeight: 4,
    borderRadius: 2,
  },
  barGreen: {
    backgroundColor: '#22c55e',
  },
  barPurple: {
    backgroundColor: '#a855f7',
  },
  barBlue: {
    backgroundColor: '#6A5AE0',
  },
  barViolet: {
    backgroundColor: '#9333ea',
  },
  chartLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    maxWidth: 60,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#fff',
  },
  infoSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#86efac',
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: spacing.xs,
  },
});
