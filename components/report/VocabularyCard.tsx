/**
 * VocabularyCard Component (React Native)
 * 
 * Displays vocabulary analysis.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { VocabularyReport } from '@/types/report';

export interface VocabularyCardProps {
  vocabulary: VocabularyReport;
  onContinue: () => void;
}

export function VocabularyCard({ vocabulary, onContinue }: VocabularyCardProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="layers" size={24} color="#f97316" />
          </View>
          <View>
            <Text style={styles.title}>Vocabulary Analysis</Text>
            <Text style={styles.subtitle}>Level {vocabulary.vocabularyLevel}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {/* Vocabulary Score */}
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Vocabulary Score</Text>
            <Text style={styles.statValue}>{vocabulary.vocabularyScore}%</Text>
            {vocabulary.improvementTarget ? (
              <Text style={styles.statDescription}>
                You're {vocabulary.improvementTarget.percentToNextLevel}% away from {vocabulary.improvementTarget.nextLevel}
              </Text>
            ) : (
              <Text style={styles.statDescription}>Improvement target not available</Text>
            )}
          </View>

          {/* Word Usage */}
          {vocabulary.lexicalDiversity && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Word Usage</Text>
              <Text style={styles.statValue}>{vocabulary.activeVocabulary || 0} words</Text>
              <Text style={styles.statDescription}>{vocabulary.uniqueWords || 0} unique words</Text>
              {typeof vocabulary.lexicalDiversity.score === 'number' && (
                <Text style={styles.statDescription}>Diversity: {vocabulary.lexicalDiversity.score}</Text>
              )}
              {vocabulary.lexicalDiversity.feedback && (
                <Text style={styles.statDescription}>{vocabulary.lexicalDiversity.feedback}</Text>
              )}
            </View>
          )}

          {/* Level Breakdown */}
          {vocabulary.levelBreakdown && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Level Breakdown</Text>
              {Object.entries(vocabulary.levelBreakdown).map(([level, count]) => (
                <View key={level} style={styles.levelRow}>
                  <Text style={styles.levelLabel}>{level}</Text>
                  <Text style={styles.levelValue}>{count || 0}</Text>
                </View>
              ))}
            </View>
          )}

          {/* New Words */}
          {vocabulary.newWords && vocabulary.newWords.length > 0 && (
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>New Words</Text>
              <View style={styles.wordsContainer}>
                {vocabulary.newWords.slice(0, 10).map((word, idx) => (
                  <View key={idx} style={styles.wordTag}>
                    <Text style={styles.wordText}>{word}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Discourse</Text>
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
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(156, 163, 175, 1)',
  },
  statsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 14,
  },
  statTitle: {
    fontSize: 13,
    color: '#cbd5e1',
    marginBottom: 6,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  statDescription: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  levelLabel: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  levelValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  wordTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  wordText: {
    fontSize: 13,
    color: '#7B70FF',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#6A5AE0',
    paddingVertical: 11,
    borderRadius: 24,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
