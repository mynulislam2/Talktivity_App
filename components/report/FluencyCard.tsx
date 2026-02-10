/**
 * FluencyCard Component (React Native)
 * 
 * Displays fluency analysis.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FluencyReport } from '@/types/report';

export interface FluencyCardProps {
  fluency: FluencyReport;
  onContinue: () => void;
}

export function FluencyCard({ fluency, onContinue }: FluencyCardProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubbles" size={24} color="#7B70FF" />
          </View>
          <View>
            <Text style={styles.title}>Fluency Analysis</Text>
            <Text style={styles.subtitle}>Level {fluency.fluencyLevel}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {/* Fluency Score */}
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Fluency Score</Text>
            <Text style={styles.statValue}>{fluency.fluencyScore}%</Text>
            {fluency.improvementTarget ? (
              <Text style={styles.statDescription}>
                You are {fluency.improvementTarget.percentToNextLevel}% away from {fluency.improvementTarget.nextLevel}
              </Text>
            ) : (
              <Text style={styles.statDescription}>Improvement target not available</Text>
            )}
          </View>

          {/* Speaking Pace */}
          {fluency.wordsPerMinute && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Speaking Pace</Text>
              <Text style={styles.statValue}>{fluency.wordsPerMinute.value || 0} WPM</Text>
              {fluency.wordsPerMinute.emoji && (
                <Text style={styles.emoji}>{fluency.wordsPerMinute.emoji}</Text>
              )}
              {fluency.wordsPerMinute.feedback && (
                <Text style={styles.statDescription}>{fluency.wordsPerMinute.feedback}</Text>
              )}
              {typeof fluency.wordsPerMinute.speedBarPercent === 'number' && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${fluency.wordsPerMinute.speedBarPercent}%`, backgroundColor: '#10b981' }
                    ]}
                  />
                </View>
              )}
            </View>
          )}

          {/* Filler Words */}
          {fluency.fillerWords && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Filler Words</Text>
              <Text style={styles.statValue}>{fluency.fillerWords.percentage || 0}%</Text>
              {fluency.fillerWords.feedback && (
                <Text style={styles.statDescription}>{fluency.fillerWords.feedback}</Text>
              )}
            </View>
          )}

          {/* Hesitations */}
          {fluency.hesitationsAndCorrections && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Hesitations</Text>
              <Text style={styles.statValue}>{fluency.hesitationsAndCorrections.rate || 0}/min</Text>
              {fluency.hesitationsAndCorrections.feedback && (
                <Text style={styles.statDescription}>{fluency.hesitationsAndCorrections.feedback}</Text>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Grammar</Text>
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
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
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
  emoji: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
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
