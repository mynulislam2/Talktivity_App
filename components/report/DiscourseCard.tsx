/**
 * Discourse Card
 * 
 * Displays discourse/communication analysis
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface DiscourseData {
  score: number;
  coherence: number;
  organization: number;
  feedback: string[];
}

interface DiscourseCardProps {
  data: DiscourseData;
}

const DiscourseCard: React.FC<DiscourseCardProps> = ({ data }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles" size={24} color={colors.primary} />
        <Text style={styles.title}>Discourse Analysis</Text>
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{data.score}</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Discourse Score</Text>
          <Text style={styles.scoreInterpretation}>
            {data.score >= 80
              ? 'Excellent communication clarity'
              : data.score >= 70
              ? 'Good message delivery'
              : 'Developing communication skills'}
          </Text>
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.metricsContainer}>
        {/* Coherence */}
        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Coherence</Text>
            <Text style={styles.metricValue}>{data.coherence}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${data.coherence}%` },
              ]}
            />
          </View>
          <Text style={styles.metricDescription}>
            How well your ideas connect and flow together
          </Text>
        </View>

        {/* Organization */}
        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Organization</Text>
            <Text style={styles.metricValue}>{data.organization}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${data.organization}%` },
              ]}
            />
          </View>
          <Text style={styles.metricDescription}>
            Clarity of structure and logical sequence
          </Text>
        </View>
      </View>

      {/* Feedback */}
      {data.feedback && data.feedback.length > 0 && (
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Detailed Feedback</Text>
          {data.feedback.map((item, index) => (
            <View key={index} style={styles.feedbackItem}>
              <View style={styles.feedbackNumber}>
                <Text style={styles.feedbackNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.feedbackContent}>
                <Text style={styles.feedbackText}>{item}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Ionicons name="lightbulb" size={20} color={colors.primary} />
        <View style={styles.tipsContent}>
          <Text style={styles.tipsTitle}>Improvement Tips</Text>
          <Text style={styles.tipsText}>
            Use transition words like "firstly", "also", "in conclusion" to improve
            coherence and guide your listener through your thoughts.
          </Text>
        </View>
      </View>

      {/* Practice Suggestion */}
      <View style={styles.practiceBox}>
        <View style={styles.practiceIcon}>
          <Ionicons name="play-circle" size={24} color={colors.primary} />
        </View>
        <View style={styles.practiceContent}>
          <Text style={styles.practiceTitle}>Practice Suggestion</Text>
          <Text style={styles.practiceText}>
            Record a 1-2 minute monologue on a familiar topic and transcribe it to
            self-evaluate your discourse.
          </Text>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight || '#E8F5E9',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  scoreInterpretation: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  metricsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metricBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  metricDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  feedbackSection: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  feedbackItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  feedbackNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackNumberText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  feedbackContent: {
    flex: 1,
    justifyContent: 'center',
  },
  feedbackText: {
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 16,
    fontWeight: '500',
  },
  tipsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  tipsText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    lineHeight: 16,
  },
  practiceBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  practiceIcon: {
    marginTop: spacing.xs,
  },
  practiceContent: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  practiceText: {
    fontSize: 12,
    color: colors.secondaryDark,
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default DiscourseCard;
