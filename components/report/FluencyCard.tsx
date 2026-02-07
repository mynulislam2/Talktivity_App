/**
 * Fluency Card
 * 
 * Displays fluency metrics and analysis
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface FluencyData {
  score: number;
  wpm: number;
  clarity: number;
  pace: string;
}

interface FluencyCardProps {
  data: FluencyData;
}

const FluencyCard: React.FC<FluencyCardProps> = ({ data }) => {
  const getClarity = (clarity: number): string => {
    if (clarity >= 80) return 'Excellent';
    if (clarity >= 70) return 'Good';
    if (clarity >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const recommendations = [
    'Slow down your speaking pace slightly for better clarity',
    'Focus on word stress and intonation patterns',
    'Practice pausing between sentences to emphasize ideas',
    'Record yourself and listen back for improvement areas',
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="mic" size={24} color={colors.primary} />
        <Text style={styles.title}>Fluency Analysis</Text>
      </View>

      <View style={styles.metricsContainer}>
        {/* WPM */}
        <View style={styles.metricBlock}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Words Per Minute</Text>
            <Text style={styles.metricValue}>{data.wpm}</Text>
          </View>
          <Text style={styles.metricDescription}>
            {data.wpm > 150
              ? 'Speaking at a natural pace'
              : data.wpm > 120
              ? 'Good pace with natural rhythm'
              : 'Speaking slower - focus on fluency'}
          </Text>
        </View>

        {/* Clarity */}
        <View style={styles.metricBlock}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Clarity</Text>
            <Text style={styles.metricValue}>{data.clarity}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${data.clarity}%` },
              ]}
            />
          </View>
          <Text style={styles.metricDescription}>
            {getClarity(data.clarity)} - {data.clarity >= 80 ? 'Keep it up!' : 'Work on pronunciation'}
          </Text>
        </View>

        {/* Pace */}
        <View style={styles.metricBlock}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Pace</Text>
            <Text style={styles.metricValue}>
              {data.pace.charAt(0).toUpperCase() + data.pace.slice(1)}
            </Text>
          </View>
          <Text style={styles.metricDescription}>
            Your speech rhythm and speed relative to natural English
          </Text>
        </View>
      </View>

      <View style={styles.scoreDisplay}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{data.score}</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreLabel}>Fluency Score</Text>
          <Text style={styles.scoreInterpretation}>
            {data.score >= 80
              ? 'Native-like fluency'
              : data.score >= 70
              ? 'Strong and consistent flow'
              : 'Developing fluency'}
          </Text>
        </View>
      </View>

      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>Recommendations</Text>
        {recommendations.slice(0, 2).map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
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
  metricsContainer: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metricBlock: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  metricDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
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
  recommendationsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: spacing.md,
  },
  recommendationsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginBottom: spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default FluencyCard;
