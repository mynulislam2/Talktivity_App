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
import { spacing } from '@/styles/spacing';

export interface MonthActivityProps {
  progressStats?: ProgressStats | null;
}

export function MonthActivity({ progressStats: progressStatsProp }: MonthActivityProps) {
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
  const monthlyListening = progressStats.monthlyReport?.listeningSessions?.length || 0;
  const monthlyListeningQuizzes = progressStats.monthlyReport?.listeningQuizzes?.length || 0;
  const monthlyExams = progressStats.monthlyReport?.exams?.length || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Month's Activity</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, styles.badgeBlue]}>
            <Text style={[styles.statValue, styles.valueBlue]}>{monthlySessions}</Text>
          </View>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, styles.badgePurple]}>
            <Text style={[styles.statValue, styles.valuePurple]}>{monthlyQuizzes}</Text>
          </View>
          <Text style={styles.statLabel}>Quizzes</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, styles.badgeBlue]}>
            <Text style={[styles.statValue, styles.valueBlue]}>{monthlyListening}</Text>
          </View>
          <Text style={styles.statLabel}>Listening</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, styles.badgeViolet]}>
            <Text style={[styles.statValue, styles.valueViolet]}>{monthlyListeningQuizzes}</Text>
          </View>
          <Text style={styles.statLabel}>L. Quiz</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statBadge, styles.badgeYellow]}>
            <Text style={[styles.statValue, styles.valueYellow]}>{monthlyExams}</Text>
          </View>
          <Text style={styles.statLabel}>Exams</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.1)',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
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
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  badgePurple: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  badgeViolet: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  badgeYellow: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  valueBlue: {
    color: '#7B70FF',
  },
  valuePurple: {
    color: '#a855f7',
  },
  valueViolet: {
    color: '#8b5cf6',
  },
  valueYellow: {
    color: '#fbbf24',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
});
