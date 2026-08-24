/**
 * SummerySection Component (React Native)
 *
 * Progress summary section showing speaking sessions, quizzes, listening, etc.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { courseService } from '@/services/course';
import type { CourseAnalytics, UserAchievements } from '@/services/course';
import { spacing } from '@/styles/spacing';

export interface SummerySectionProps {
  analytics: CourseAnalytics | null;
  achievements: UserAchievements | null;
}

export function SummerySection({
  analytics,
  achievements,
}: SummerySectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          {analytics && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>
                {analytics.progress?.current_streak ?? 0} Day Streak
              </Text>
            </View>
          )}
        </View>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={[styles.gridValue, styles.valueGreen]}>
              {analytics ? analytics.progress?.speaking_days : '...'}
            </Text>
            <Text style={styles.gridLabel}>Speaking Sessions</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridValue, styles.valuePink]}>
              {analytics ? analytics.progress?.quiz_days : '...'}
            </Text>
            <Text style={styles.gridLabel}>Quizzes</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridValue, styles.valueBlue]}>
              {analytics ? analytics.progress?.listening_days : '...'}
            </Text>
            <Text style={styles.gridLabel}>Listening</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridValue, styles.valuePurple]}>
              {analytics ? analytics.progress?.listening_quiz_days : '...'}
            </Text>
            <Text style={styles.gridLabel}>Listening Quiz</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridValue, styles.valueYellow]}>
              {analytics ? analytics.weeklyExams?.length : '...'}
            </Text>
            <Text style={styles.gridLabel}>Exams</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridValue, styles.valuePurpleLight]}>
              {analytics
                ? courseService.formatSpeakingTime(
                    analytics.progress?.total_speaking_time ?? 0
                  )
                : '...'}
            </Text>
            <Text style={styles.gridLabel}>Speaking Time</Text>
          </View>
        </View>

        {/* XP Information Section */}
        {achievements && (
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpTitle}>Health Points</Text>
              <Text style={styles.xpValue}>{achievements.level.xp} XP</Text>
            </View>
            <View style={styles.xpProgress}>
              <View style={styles.xpProgressLabels}>
                <Text style={styles.xpProgressLabel}>
                  Level {achievements.level.current}
                </Text>
                <Text style={styles.xpProgressLabel}>
                  {achievements.level.xpProgress}% to Level{' '}
                  {achievements.level.current + 1}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${achievements.level.xpProgress}%` },
                  ]}
                />
              </View>
            </View>

            {/* XP Breakdown */}
            <View style={styles.xpBreakdown}>
              <View style={styles.xpBreakdownItem}>
                <Text style={styles.xpBreakdownLabel}>Speaking Time</Text>
                <Text style={[styles.xpBreakdownValue, styles.valueGreen]}>
                  {Math.floor((achievements.stats.totalSpeakingTime || 0) / 60)}{' '}
                  min
                </Text>
                <Text style={styles.xpBreakdownXP}>
                  {Math.floor(
                    (achievements.stats.totalSpeakingTime || 0) / 60
                  ) * 2}{' '}
                  XP
                </Text>
              </View>
              <View style={styles.xpBreakdownItem}>
                <Text style={styles.xpBreakdownLabel}>Full Sessions</Text>
                <Text style={[styles.xpBreakdownValue, styles.valueBlue]}>
                  {achievements.stats.fullSessions || 0}
                </Text>
                <Text style={styles.xpBreakdownXP}>
                  {(achievements.stats.fullSessions || 0) * 10} XP
                </Text>
              </View>
              <View style={styles.xpBreakdownItem}>
                <Text style={styles.xpBreakdownLabel}>Quizzes</Text>
                <Text style={[styles.xpBreakdownValue, styles.valuePink]}>
                  {achievements.stats.totalQuizzes || 0}
                </Text>
                <Text style={styles.xpBreakdownXP}>
                  {(achievements.stats.totalQuizzes || 0) * 15} XP
                </Text>
              </View>
              <View style={styles.xpBreakdownItem}>
                <Text style={styles.xpBreakdownLabel}>Exams</Text>
                <Text style={[styles.xpBreakdownValue, styles.valueYellow]}>
                  {achievements.stats.examsPassed || 0}
                </Text>
                <Text style={styles.xpBreakdownXP}>
                  {(achievements.stats.examsPassed || 0) * 50} XP
                </Text>
              </View>
            </View>
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
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#181837',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fbbf24',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
  },
  valueGreen: {
    color: '#86efac',
  },
  valuePink: {
    color: '#f9a8d4',
  },
  valueBlue: {
    color: '#93c5fd',
  },
  valuePurple: {
    color: '#c4b5fd',
  },
  valueYellow: {
    color: '#fde047',
  },
  valuePurpleLight: {
    color: '#e9d5ff',
  },
  gridLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  xpSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  xpTitle: {
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  xpValue: {
    fontSize: 16,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: '#fbbf24',
  },
  xpProgress: {
    marginBottom: spacing.sm,
  },
  xpProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  xpProgressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.4)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6A5AE0',
    borderRadius: 4,
  },
  xpBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  xpBreakdownItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  xpBreakdownLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  xpBreakdownValue: {
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
  xpBreakdownXP: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
