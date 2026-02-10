/**
 * GrammarCard Component (React Native)
 * 
 * Displays grammar analysis.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { GrammarReport } from '@/types/report';

export interface GrammarCardProps {
  grammar: GrammarReport;
  onContinue: () => void;
}

export function GrammarCard({ grammar, onContinue }: GrammarCardProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="book" size={24} color="#a855f7" />
          </View>
          <View>
            <Text style={styles.title}>Grammar Analysis</Text>
            <Text style={styles.subtitle}>Level {grammar.grammarLevel}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {/* Grammar Score */}
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Grammar Score</Text>
            <Text style={styles.statValue}>{grammar.grammarScore}%</Text>
            {grammar.improvementTarget ? (
              <Text style={styles.statDescription}>
                You're {grammar.improvementTarget.percentToNextLevel}% away from {grammar.improvementTarget.nextLevel}
              </Text>
            ) : (
              <Text style={styles.statDescription}>Improvement target not available</Text>
            )}
          </View>

          {/* Growth Areas */}
          {grammar.growthPoints && grammar.growthPoints.length > 0 && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Growth Areas</Text>
              {grammar.growthPoints.map((point, idx) => (
                <Text key={idx} style={styles.growthPoint}>• {point}</Text>
              ))}
            </View>
          )}

          {/* Sentence Complexity */}
          {grammar.sentenceComplexity && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Sentence Complexity</Text>
              <Text style={styles.statValue}>{grammar.sentenceComplexity.score}%</Text>
              {grammar.sentenceComplexity.feedback && (
                <Text style={styles.statDescription}>{grammar.sentenceComplexity.feedback}</Text>
              )}
            </View>
          )}

          {/* Grammar Errors */}
          {grammar.grammarErrors && Object.keys(grammar.grammarErrors).length > 0 && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Common Errors</Text>
              {Object.entries(grammar.grammarErrors).slice(0, 3).map(([key, errors]) => (
                <View key={key} style={styles.errorItem}>
                  <Text style={styles.errorType}>{key}</Text>
                  {errors.slice(0, 2).map((error, idx) => (
                    <View key={idx} style={styles.errorDetail}>
                      <Text style={styles.errorText}>{error.description}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Vocabulary</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#050110',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(156, 163, 175, 1)',
  },
  statsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 16,
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statDescription: {
    fontSize: 12,
    color: 'rgba(156, 163, 175, 1)',
    lineHeight: 16,
  },
  growthPoint: {
    fontSize: 12,
    color: '#7B70FF',
    marginBottom: 4,
  },
  errorItem: {
    marginBottom: 12,
  },
  errorType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  errorDetail: {
    marginLeft: 8,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 11,
    color: 'rgba(156, 163, 175, 1)',
    lineHeight: 16,
  },
  continueButton: {
    backgroundColor: '#6A5AE0',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
