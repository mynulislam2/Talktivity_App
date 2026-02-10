/**
 * ProgressGrid Component (React Native)
 * 
 * Progress stats grid showing Current Week, Speaking Days, Quiz Days, etc.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import { selectProgressStats } from '@/store/slices/profileSlice';
import type { ProgressStats } from '@/types/profile';
import { spacing } from '@/styles/spacing';

export interface ProgressGridProps {
  progressStats?: ProgressStats | null;
}

export function ProgressGrid({ progressStats: progressStatsProp }: ProgressGridProps) {
  const progressStatsFromRedux = useAppSelector(selectProgressStats);
  const progressStats = progressStatsProp ?? progressStatsFromRedux;
  
  if (!progressStats?.courseStatus || !progressStats?.courseProgress) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load progress stats.</Text>
      </View>
    );
  }

  const currentWeek = progressStats.courseStatus?.course?.currentWeek || 0;
  const speakingDays = progressStats.courseProgress?.progress?.speaking_days || 0;
  const quizDays = progressStats.courseProgress?.progress?.quiz_days || 0;
  const listeningDays = progressStats.courseProgress?.progress?.listening_days || 0;
  const avgQuizScore = progressStats.courseProgress?.progress?.avg_quiz_score || 0;
  const avgListeningQuizScore = progressStats.courseProgress?.progress?.avg_listening_quiz_score || 0;

  return (
    <View style={styles.container}>
      {/* Current Week */}
      <View style={[styles.card, styles.cardBlue]}>
        <View style={styles.cardHeader}>
          <Ionicons name="flag" size={24} color="#7B70FF" />
          <Text style={styles.cardLabel}>Current Week</Text>
        </View>
        <Text style={styles.cardValue}>{currentWeek}</Text>
      </View>

      {/* Speaking Days */}
      <View style={[styles.card, styles.cardGreen]}>
        <View style={styles.cardHeader}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <Text style={styles.cardLabel}>Speaking Days</Text>
        </View>
        <Text style={styles.cardValue}>{speakingDays}</Text>
      </View>

      {/* Quiz Days */}
      <View style={[styles.card, styles.cardPurple]}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart" size={24} color="#a855f7" />
          <Text style={styles.cardLabel}>Quiz Days</Text>
        </View>
        <Text style={styles.cardValue}>{quizDays}</Text>
      </View>

      {/* Listening Days */}
      <View style={[styles.card, styles.cardIndigo]}>
        <View style={styles.cardHeader}>
          <Ionicons name="volume-high" size={24} color="#6A5AE0" />
          <Text style={styles.cardLabel}>Listening Days</Text>
        </View>
        <Text style={styles.cardValue}>{listeningDays}</Text>
      </View>

      {/* Avg Quiz Score */}
      <View style={[styles.card, styles.cardYellow]}>
        <View style={styles.cardHeader}>
          <Ionicons name="star" size={24} color="#fbbf24" />
          <Text style={styles.cardLabel}>Avg Quiz Score</Text>
        </View>
        <View style={styles.scoreContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(8, avgQuizScore))}%` },
                { backgroundColor: '#fbbf24' },
              ]}
            />
          </View>
          <Text style={styles.scoreText}>{Math.round(avgQuizScore)}%</Text>
        </View>
      </View>

      {/* Avg Listening Quiz Score */}
      <View style={[styles.card, styles.cardViolet]}>
        <View style={styles.cardHeader}>
          <Ionicons name="book" size={24} color="#8b5cf6" />
          <Text style={styles.cardLabel}>Avg Listening Quiz</Text>
        </View>
        <View style={styles.scoreContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(8, avgListeningQuizScore))}%` },
                { backgroundColor: '#8b5cf6' },
              ]}
            />
          </View>
          <Text style={[styles.scoreText, { color: '#a78bfa' }]}>
            {Math.round(avgListeningQuizScore)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  cardBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  cardGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cardPurple: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  cardIndigo: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  cardYellow: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  cardViolet: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: spacing.xs,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 8,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
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
