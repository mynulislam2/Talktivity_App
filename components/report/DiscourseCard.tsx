/**
 * DiscourseCard Component (React Native)
 * 
 * Displays discourse analysis.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DiscourseReport } from '@/types/report';

export interface DiscourseCardProps {
  discourse: DiscourseReport;
  onFinish: () => void;
  onContinue?: () => void;
}

export function DiscourseCard({ discourse, onFinish, onContinue }: DiscourseCardProps) {
  const handleAction = onFinish || onContinue;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="link" size={24} color="#6366f1" />
          </View>
          <View>
            <Text style={styles.title}>Discourse Analysis</Text>
            <Text style={styles.subtitle}>Level {discourse.discourseLevel}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {/* Discourse Score */}
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Discourse Score</Text>
            <Text style={styles.statValue}>{discourse.discourseScore}%</Text>
            {discourse.improvementTarget ? (
              <Text style={styles.statDescription}>
                You're {discourse.improvementTarget.percentToNextLevel}% away from {discourse.improvementTarget.nextLevel}
              </Text>
            ) : (
              <Text style={styles.statDescription}>Improvement target not available</Text>
            )}
          </View>

          {/* Cohesion */}
          {discourse.cohesion && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Cohesion</Text>
              <Text style={styles.statValue}>{discourse.cohesion.score || 0}%</Text>
              {discourse.cohesion.feedback && (
                <Text style={styles.statDescription}>{discourse.cohesion.feedback}</Text>
              )}
            </View>
          )}

          {/* Organization */}
          {discourse.organization && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Organization</Text>
              <Text style={styles.statValue}>{discourse.organization.score || 0}%</Text>
              {discourse.organization.feedback && (
                <Text style={styles.statDescription}>{discourse.organization.feedback}</Text>
              )}
            </View>
          )}

          {/* Feedback */}
          {discourse.feedback && discourse.feedback.length > 0 && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Feedback</Text>
              {discourse.feedback.map((item, idx) => (
                <View key={idx} style={styles.feedbackItem}>
                  <Text style={styles.feedbackText}>• {item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleAction}
        >
          <Text style={styles.finishButtonText}>Complete Report</Text>
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
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
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
  feedbackItem: {
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 12,
    color: 'rgba(203, 213, 225, 1)',
    lineHeight: 18,
  },
  finishButton: {
    backgroundColor: '#6A5AE0',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
