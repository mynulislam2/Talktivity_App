/**
 * Overall Score Card
 *
 * Displays overall English proficiency score with breakdown
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface OverallScoreCardProps {
  data: {
    overallScore: number;
    fluency: { score: number };
    grammar: { score: number };
    vocabulary: { score: number };
    discourse: { score: number };
  };
}

const OverallScoreCard: React.FC<OverallScoreCardProps> = ({ data }) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 70) return '#8BC34A'; // Light Green
    if (score >= 60) return '#FFC107'; // Amber
    if (score >= 50) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const scoreColor = getScoreColor(data.overallScore);

  const metrics = [
    { label: 'Fluency', value: data.fluency.score },
    { label: 'Grammar', value: data.grammar.score },
    { label: 'Vocabulary', value: data.vocabulary.score },
    { label: 'Discourse', value: data.discourse.score },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {data.overallScore.toFixed(0)}
          </Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackTitle}>Overall Performance</Text>
          <Text style={styles.feedbackText}>
            {data.overallScore >= 80
              ? "Excellent! You're performing at a high level."
              : data.overallScore >= 70
              ? 'Great job! Keep practicing to improve further.'
              : data.overallScore >= 60
              ? 'Good progress! Focus on weak areas.'
              : "Keep practicing! You'll improve with consistency."}
          </Text>
        </View>
      </View>

      <Text style={styles.metricsTitle}>Skill Breakdown</Text>
      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricItem}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <View style={styles.metricBar}>
              <View
                style={[
                  styles.metricFill,
                  {
                    width: `${metric.value}%`,
                    backgroundColor: getScoreColor(metric.value),
                  },
                ]}
              />
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tipsContainer}>
        <Ionicons name="bulb" size={20} color={colors.primary} />
        <Text style={styles.tipsText}>
          Regular practice for 15-30 minutes daily will significantly improve
          your skills.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
  },
  scoreMax: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: colors.text.secondary,
  },
  feedbackContainer: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: colors.text.secondary,
    lineHeight: 18,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  metricsGrid: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricItem: {
    marginBottom: spacing.sm,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  metricBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  metricFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: colors.primary,
  },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  tipsText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 16,
  },
});

export default OverallScoreCard;
