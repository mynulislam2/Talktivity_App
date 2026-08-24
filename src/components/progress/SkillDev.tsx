/**
 * SkillDev Component (React Native)
 *
 * Skill development chart (simplified visualization).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { courseService } from '@/services/course';
import type { CourseAnalytics, UserAchievements } from '@/services/course';
import { spacing } from '@/styles/spacing';

export interface SkillDevProps {
  analytics: CourseAnalytics | null;
  achievements: UserAchievements | null;
}

type SkillType =
  | 'Skill Development'
  | 'Fluency'
  | 'Grammar'
  | 'Vocabulary'
  | 'Speaking Time';

export function SkillDev({ analytics, achievements }: SkillDevProps) {
  const [skillType, setSkillType] = useState<SkillType>('Skill Development');

  const skillTypes: SkillType[] = [
    'Skill Development',
    'Fluency',
    'Grammar',
    'Vocabulary',
    'Speaking Time',
  ];

  const renderChart = () => {
    if (!analytics) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      );
    }

    if (skillType === 'Skill Development' && analytics.progress) {
      // Radar chart representation (simplified)
      const skills = [
        { label: 'Speaking', value: analytics.progress.avg_quiz_score },
        {
          label: 'Listening',
          value: analytics.progress.avg_listening_quiz_score,
        },
        { label: 'Grammar', value: analytics.progress.avg_quiz_score },
        { label: 'Vocabulary', value: analytics.progress.avg_quiz_score },
      ];

      return (
        <View style={styles.radarContainer}>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <Text style={styles.skillLabel}>{skill.label}</Text>
              <View style={styles.skillBar}>
                <View
                  style={[
                    styles.skillBarFill,
                    { width: `${skill.value}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.skillValue}>
                {Math.round(skill.value ?? 0)}%
              </Text>
            </View>
          ))}
        </View>
      );
    } else if (skillType === 'Speaking Time' && analytics.monthlyTrends) {
      const maxValue = Math.max(
        ...analytics.monthlyTrends.map((t) =>
          Math.floor(t.total_speaking_time / 60)
        )
      );
      const maxHeight = 200;

      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.lineChart}>
            {analytics.monthlyTrends.map((trend, index) => {
              const height =
                (Math.floor(trend.total_speaking_time / 60) /
                  Math.max(maxValue, 1)) *
                maxHeight;
              return (
                <View key={index} style={styles.lineChartBar}>
                  <View
                    style={[
                      styles.lineChartBarFill,
                      { height: Math.max(height, 4) },
                    ]}
                  />
                  <Text style={styles.lineChartLabel}>
                    {trend.year}-{String(trend.month).padStart(2, '0')}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      );
    } else if (
      skillType !== 'Skill Development' &&
      skillType !== 'Speaking Time' &&
      analytics.skillTrends
    ) {
      const maxValue = Math.max(
        ...analytics.skillTrends.map((t) => t.avg_score)
      );
      const maxHeight = 200;

      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.lineChart}>
            {analytics.skillTrends.map((trend, index) => {
              const height =
                (trend.avg_score / Math.max(maxValue, 1)) * maxHeight;
              return (
                <View key={index} style={styles.lineChartBar}>
                  <View
                    style={[
                      styles.lineChartBarFill,
                      { height: Math.max(height, 4) },
                    ]}
                  />
                  <Text style={styles.lineChartLabel}>
                    Week {trend.week_number}
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
          <Text style={styles.title}>Skill Development</Text>
          <View style={styles.selector}>
            {skillTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.selectorButton,
                  skillType === type && styles.selectorButtonActive,
                ]}
                onPress={() => setSkillType(type)}
              >
                <Text
                  style={[
                    styles.selectorButtonText,
                    skillType === type && styles.selectorButtonTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.chartContainer}>{renderChart()}</View>

        {/* Speaking Time Info */}
        {skillType === 'Speaking Time' && achievements && (
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
              <Text style={styles.infoLabel}>Full 5-Minute Sessions:</Text>
              <Text style={styles.infoValue}>
                {achievements.stats.fullSessions}
              </Text>
            </View>
            <Text style={styles.infoText}>
              XP is calculated based on actual speaking time: 2 XP per minute +
              10 XP bonus for each full 5-minute session.
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
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  selectorButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: '#232347',
  },
  selectorButtonActive: {
    backgroundColor: '#6A5AE0',
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
    minHeight: 224,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarContainer: {
    width: '100%',
    gap: spacing.md,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skillLabel: {
    width: 80,
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#fff',
  },
  skillBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#232347',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%',
    backgroundColor: '#6A5AE0',
    borderRadius: 4,
  },
  skillValue: {
    width: 40,
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textAlign: 'right',
  },
  lineChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  lineChartBar: {
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 30,
  },
  lineChartBarFill: {
    width: 20,
    backgroundColor: '#22c55e',
    borderRadius: 2,
    minHeight: 4,
  },
  lineChartLabel: {
    fontSize: 10,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#86efac',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: spacing.xs,
  },
});
