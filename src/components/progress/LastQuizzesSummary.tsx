/**
 * LastQuizzesSummary Component (React Native)
 *
 * Shows recent quiz results summary.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import {
  selectLastListeningQuiz,
  selectLastQuiz,
} from '@/store/slices/quizSlice';
import { formatLocalDate, formatLocalTime } from '@/utils/timezoneUtils';

export function LastQuizzesSummary() {
  const lastQuiz = useAppSelector(selectLastQuiz);
  const lastListeningQuiz = useAppSelector(selectLastListeningQuiz);

  if (!lastQuiz && !lastListeningQuiz) {
    return null;
  }

  const renderItem = (
    label: string,
    typeLabel: string,
    result: typeof lastQuiz
  ) => {
    if (!result) return null;

    const date = formatLocalDate(result.completedAt);
    const time = formatLocalTime(result.completedAt);
    const percentage = result.total
      ? Math.round((result.score / result.total) * 100)
      : 0;

    return (
      <View style={styles.quizCard}>
        <View style={styles.quizContent}>
          <Text style={styles.quizLabel}>{label}</Text>
          <Text style={styles.quizType}>{typeLabel}</Text>
          <Text style={styles.quizDate}>
            {date} · {time}
          </Text>
        </View>
        <View style={styles.quizScore}>
          <Text style={styles.scoreValue}>
            {result.score}/{result.total}
          </Text>
          <Text style={styles.scorePercent}>{percentage}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Quizzes</Text>
      <View style={styles.quizzesList}>
        {renderItem('Speaking Quiz', 'Pronunciation Practice', lastQuiz)}
        {renderItem('Listening Quiz', 'Active Listening', lastListeningQuiz)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quizzesList: {
    gap: 12,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quizContent: {
    flex: 1,
    gap: 4,
  },
  quizLabel: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quizType: {
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  quizDate: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  quizScore: {
    alignItems: 'flex-end',
    gap: 4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#34d399',
  },
  scorePercent: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
