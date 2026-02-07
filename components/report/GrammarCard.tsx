/**
 * Grammar Card
 * 
 * Displays grammar analysis and common errors
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface GrammarData {
  score: number;
  totalErrors: number;
  commonErrors: string[];
  suggestions: string[];
}

interface GrammarCardProps {
  data: GrammarData;
}

const GrammarCard: React.FC<GrammarCardProps> = ({ data }) => {
  const getErrorLevel = (count: number): string => {
    if (count === 0) return 'Excellent';
    if (count <= 2) return 'Good';
    if (count <= 5) return 'Needs Work';
    return 'Significant Issues';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="library" size={24} color={colors.primary} />
        <Text style={styles.title}>Grammar Analysis</Text>
      </View>

      {/* Error Count */}
      <View style={styles.errorSummary}>
        <View style={styles.errorCountBox}>
          <Text style={styles.errorCount}>{data.totalErrors}</Text>
          <Text style={styles.errorLabel}>Errors Found</Text>
        </View>
        <View style={styles.errorAssessment}>
          <Text style={styles.assessmentLabel}>Assessment</Text>
          <Text
            style={[
              styles.assessmentText,
              {
                color:
                  data.totalErrors === 0
                    ? '#4CAF50'
                    : data.totalErrors <= 2
                    ? '#8BC34A'
                    : data.totalErrors <= 5
                    ? '#FFC107'
                    : '#F44336',
              },
            ]}
          >
            {getErrorLevel(data.totalErrors)}
          </Text>
        </View>
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreBar}>
          <View
            style={[
              styles.scoreBarFill,
              { width: `${data.score}%` },
            ]}
          />
        </View>
        <Text style={styles.scoreText}>Score: {data.score}/100</Text>
      </View>

      {/* Common Errors */}
      {data.commonErrors.length > 0 && (
        <View style={styles.errorsSection}>
          <Text style={styles.sectionTitle}>Common Errors</Text>
          {data.commonErrors.slice(0, 3).map((error, index) => (
            <View key={index} style={styles.errorItem}>
              <View style={styles.errorBullet} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Suggestions */}
      {data.suggestions.length > 0 && (
        <View style={styles.suggestionsSection}>
          <Text style={styles.sectionTitle}>Suggestions for Improvement</Text>
          {data.suggestions.slice(0, 2).map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer Note */}
      <View style={styles.noteContainer}>
        <Ionicons name="information-circle" size={16} color={colors.primary} />
        <Text style={styles.noteText}>
          Focus on verb tenses and subject-verb agreement for the most improvement
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
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
  errorSummary: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  errorCountBox: {
    flex: 1,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF9800',
  },
  errorLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  errorAssessment: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: spacing.md,
    justifyContent: 'center',
  },
  assessmentLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  assessmentText: {
    fontSize: 16,
    fontWeight: '700',
  },
  scoreContainer: {
    marginBottom: spacing.lg,
  },
  scoreBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  errorsSection: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  errorBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.error,
    marginTop: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 16,
  },
  suggestionsSection: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    lineHeight: 16,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default GrammarCard;
