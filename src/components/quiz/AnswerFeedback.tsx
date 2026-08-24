/**
 * AnswerFeedback Component (React Native)
 *
 * Shows feedback for correct/incorrect answers.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/theme/tokens';

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
        <Ionicons
          name={correct ? 'checkmark-circle' : 'close-circle'}
          size={20}
          color={correct ? tokens.color.state.success : tokens.color.state.danger}
        />
        <Text style={styles.text}>{correct ? 'Correct!' : 'Not quite'}</Text>
      </View>
      {text ? <Text style={styles.subtext}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: tokens.radius.sm,
    padding: 16,
    borderWidth: 1,
  },
  containerCorrect: {
    backgroundColor: 'rgba(35,255,122,0.10)',
    borderColor: tokens.color.state.success,
  },
  containerIncorrect: {
    backgroundColor: 'rgba(255,35,35,0.10)',
    borderColor: tokens.color.state.danger,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: tokens.color.text.primary,
  },
  subtext: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '400', fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    lineHeight: 20,
  },
});
