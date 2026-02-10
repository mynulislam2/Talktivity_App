/**
 * ProgressHeader Component (React Native)
 * 
 * Header showing quiz progress and score.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { QuizType } from '@/types/quiz';

export interface ProgressHeaderProps {
  type: QuizType;
  current: number;
  total: number;
  score: number;
}

export function ProgressHeader({
  type,
  current,
  total,
  score,
}: ProgressHeaderProps) {
  const label = type === 'listening' ? 'Listening Quiz' : 'Quiz';

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{label}</Text>
        </View>
        <Text style={styles.questionInfo}>
          Question <Text style={styles.questionNumber}>{current}</Text> of{' '}
          <Text style={styles.questionNumber}>{total}</Text>
        </Text>
      </View>

      <View style={styles.scoreSection}>
        <Text style={styles.scoreLabel}>Score</Text>
        <Text style={styles.scoreValue}>
          {score}/{total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  leftSection: {
    flex: 1,
    minWidth: 0,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  questionInfo: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  questionNumber: {
    color: '#fff',
    fontWeight: '600',
  },
  scoreSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34d399',
    marginTop: 2,
  },
});
