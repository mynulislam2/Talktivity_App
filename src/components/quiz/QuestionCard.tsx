/**
 * QuestionCard Component (React Native)
 *
 * Displays quiz question with optional pronunciation target word.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';
import type { QuizQuestion } from '@/types/quiz';

export interface QuestionCardProps {
  question: QuizQuestion;
  isAnswered?: boolean;
}

export function QuestionCard({ question, isAnswered }: QuestionCardProps) {
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
      {isAnswered && question.explanation ? (
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
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: tokens.color.text.primary,
    lineHeight: 27,
  },
  targetWordContainer: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 24,
    backgroundColor: 'rgba(41,73,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(41,73,255,0.30)',
    borderRadius: tokens.radius.md,
    alignItems: 'center',
  },
  targetWord: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: tokens.color.accent.primary,
  },
  phonetic: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  explanationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: tokens.color.surface.subtle,
    borderWidth: 1,
    borderColor: tokens.color.border.hairline,
    borderRadius: tokens.radius.md,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    lineHeight: 20,
  },
});
