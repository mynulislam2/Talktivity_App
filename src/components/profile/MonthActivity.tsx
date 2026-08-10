/**
 * MonthActivity Component (React Native)
 *
 * Monthly activity summary showing Sessions, Quizzes, Listening, etc.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import { selectProgressStats } from '@/store/slices/profileSlice';
import type { ProgressStats } from '@/types/profile';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface MonthActivityProps {
  progressStats?: ProgressStats | null;
}

export function MonthActivity({
  progressStats: progressStatsProp,
}: MonthActivityProps) {
  const progressStatsFromRedux = useAppSelector(selectProgressStats);
  const progressStats = progressStatsProp ?? progressStatsFromRedux;

  if (!progressStats?.monthlyReport) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load monthly activity.</Text>
      </View>
    );
  }

  const monthlySessions = progressStats.monthlyReport?.sessions?.length || 0;
  const monthlyQuizzes = progressStats.monthlyReport?.quizzes?.length || 0;
  const monthlyListening =
    progressStats.monthlyReport?.listeningSessions?.length || 0;
  const monthlyListeningQuizzes =
    progressStats.monthlyReport?.listeningQuizzes?.length || 0;
  const monthlyExams = progressStats.monthlyReport?.exams?.length || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Month's Activity</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, styles.badgeBlue]}>
            <Text style={[styles.statValue, styles.valueBlue]}>
              {monthlySessions}
            </Text>
          </View>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, styles.badgePurple]}>
            <Text style={[styles.statValue, styles.valuePurple]}>
              {monthlyQuizzes}
            </Text>
          </View>
          <Text style={styles.statLabel}>Quizzes</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, styles.badgeBlue]}>
            <Text style={[styles.statValue, styles.valueBlue]}>
              {monthlyListening}
            </Text>
          </View>
          <Text style={styles.statLabel}>Listening</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, styles.badgeViolet]}>
            <Text style={[styles.statValue, styles.valueViolet]}>
              {monthlyListeningQuizzes}
            </Text>
          </View>
          <Text style={styles.statLabel}>L. Quiz</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, styles.badgeYellow]}>
            <Text style={[styles.statValue, styles.valueYellow]}>
              {monthlyExams}
            </Text>
          </View>
          <Text style={styles.statLabel}>Exams</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brand.cardBorder,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.brand.cardBorder,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginBottom: spacing.xs,
  },
  badgeBlue: {
    backgroundColor: colors.brand.cardBorder,
  },
  badgePurple: {
    backgroundColor: colors.brand.cardBorder,
  },
  badgeViolet: {
    backgroundColor: colors.brand.cardBorder,
  },
  badgeYellow: {
    backgroundColor: colors.brand.cardBorder,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  valueBlue: {
    color: colors.primaryLight,
  },
  valuePurple: {
    color: colors.purple[500],
  },
  valueViolet: {
    color: colors.purple[500],
  },
  valueYellow: {
    color: colors.warning,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
});
