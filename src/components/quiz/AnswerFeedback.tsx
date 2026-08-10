/**
 * AnswerFeedback Component (React Native)
 *
 * Shows feedback for correct/incorrect answers.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AnswerFeedbackProps {
  show: boolean;
  correct: boolean;
  text?: string;
}

export function AnswerFeedback({ show, correct, text }: AnswerFeedbackProps) {
  if (!show) return null;

  return (
    <View
      style={[
        styles.container,
        correct ? styles.containerCorrect : styles.containerIncorrect,
      ]}
    >
      <View style={styles.content}>
        {correct ? (
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
        ) : (
          <Ionicons name="close-circle" size={20} color="#ef4444" />
        )}
        <Text style={styles.text}>{correct ? 'Correct!' : 'Not quite'}</Text>
      </View>
      {text ? <Text style={styles.subtext}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  containerCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  containerIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  subtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
});
