/**
 * QuestionCard Component (React Native)
 *
 * Displays quiz question with optional pronunciation target word.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { QuizQuestion } from '@/types/quiz';

export interface QuestionCardProps {
  question: QuizQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const rawType = String(question.meta?.type || '').toLowerCase();
  const isPronunciation = rawType === 'pronunciation';
  const targetWord =
    question.meta?.targetWord?.text || question.meta?.target_word?.text || '';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Question</Text>
      {isPronunciation && targetWord ? (
        <>
          <Text style={styles.questionText}>{question.question}</Text>
          <View style={styles.targetWordContainer}>
            <Text style={styles.targetWord}>{targetWord}</Text>
          </View>
          {question.meta?.targetWord?.phonetic && (
            <Text style={styles.phonetic}>
              /{question.meta.targetWord.phonetic}/
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.questionText}>{question.question}</Text>
      )}
      {question.explanation ? (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationLabel}>Explanation</Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
    padding: 24,
  },
  label: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    lineHeight: 28,
  },
  targetWordContainer: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 16,
    alignItems: 'center',
  },
  targetWord: {
    fontSize: 36,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: '#7B70FF',
  },
  phonetic: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  explanationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 16,
  },
  explanationLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
});
