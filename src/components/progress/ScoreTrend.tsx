/**
 * ScoreTrend Component (React Native)
 *
 * Score trend chart (simplified visualization).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { CourseAnalytics, UserAchievements } from '@/services/course';
import { spacing } from '@/styles/spacing';

export interface ScoreTrendProps {
  analytics: CourseAnalytics | null;
  achievements: UserAchievements | null;
}

type ScoreType = 'Quiz Scores' | 'Exam Scores';

export function ScoreTrend({ analytics, achievements }: ScoreTrendProps) {
  const [scoreType, setScoreType] = useState<ScoreType>('Quiz Scores');

  const renderChart = () => {
    if (!analytics) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      );
    }

    if (scoreType === 'Quiz Scores' && analytics.skillTrends) {
      const maxValue = 100;
      const maxHeight = 160;

      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chart}>
            {analytics.skillTrends.map((trend, index) => {
              const height = (trend.avg_score / maxValue) * maxHeight;
              return (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.chartBarFill,
                      { height: Math.max(height, 4) },
                    ]}
                  />
                  <Text style={styles.chartLabel}>
                    Week {trend.week_number}
                  </Text>
                  <Text style={styles.chartValue}>
                    {Math.round(trend.avg_score)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      );
    } else if (scoreType === 'Exam Scores' && analytics.weeklyExams) {
      const maxValue = 100;
      const maxHeight = 160;

      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chart}>
            {analytics.weeklyExams.map((exam, index) => {
              const height = (exam.exam_score / maxValue) * maxHeight;
              return (
                <View key={index} style={styles.chartBar}>
                  <View
                    style={[
                      styles.chartBarFill,
                      { height: Math.max(height, 4) },
                    ]}
                  />
                  <Text style={styles.chartLabel}>Week {exam.week_number}</Text>
                  <Text style={styles.chartValue}>
                    {Math.round(exam.exam_score)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Score Trends</Text>
          <View style={styles.selector}>
            <TouchableOpacity
              style={[
                styles.selectorButton,
                scoreType === 'Quiz Scores' && styles.selectorButtonActive,
              ]}
              onPress={() => setScoreType('Quiz Scores')}
            >
              <Text
                style={[
                  styles.selectorButtonText,
                  scoreType === 'Quiz Scores' &&
                    styles.selectorButtonTextActive,
                ]}
              >
                Quiz Scores
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.selectorButton,
                scoreType === 'Exam Scores' && styles.selectorButtonActive,
              ]}
              onPress={() => setScoreType('Exam Scores')}
            >
              <Text
                style={[
                  styles.selectorButtonText,
                  scoreType === 'Exam Scores' &&
                    styles.selectorButtonTextActive,
                ]}
              >
                Exam Scores
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.chartContainer}>{renderChart()}</View>

        {/* XP Info */}
        {achievements && (
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                XP from {scoreType === 'Quiz Scores' ? 'Quizzes' : 'Exams'}:
              </Text>
              <Text style={styles.infoValue}>
                {scoreType === 'Quiz Scores'
                  ? `${(achievements.stats.totalQuizzes || 0) * 15} XP`
                  : `${(achievements.stats.examsPassed || 0) * 50} XP`}
              </Text>
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
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  selector: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  selectorButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: '#232347',
  },
  selectorButtonActive: {
    backgroundColor: '#7B70FF',
  },
  selectorButtonText: {
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  selectorButtonTextActive: {
    color: '#fff',
  },
  chartContainer: {
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  chartBar: {
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 30,
  },
  chartBarFill: {
    width: 24,
    backgroundColor: '#7B70FF',
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 10,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  chartValue: {
    fontSize: 10,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  noDataContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  infoSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
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
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fbbf24',
  },
});
