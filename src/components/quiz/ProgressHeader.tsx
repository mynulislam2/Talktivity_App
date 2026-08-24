/**
 * ProgressHeader Component (React Native)
 *
 * Header showing quiz progress and score. Token-based card treatment,
 * matching the progress block used on the Listening Quiz screen.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '@/theme/tokens';
import type { QuizType } from '@/types/quiz';

export interface ProgressHeaderProps {
  type: QuizType;
  current: number;
  total: number;
  score: number;
}

export function ProgressHeader({ current, total, score }: ProgressHeaderProps) {
  const progressPercent = total ? (current / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.questionCount}>
          Question {current} of {total}
        </Text>
        <Text style={styles.scoreDisplay}>
          Score {score} of {total}
        </Text>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={['#5d4cff', '#c765fd']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${Math.max(progressPercent, 8)}%` } as any]}
        />
        <View style={[styles.thumb, { left: `${Math.max(progressPercent, 8)}%` } as any]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 20,
    color: tokens.color.text.primary,
  },
  scoreDisplay: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 17,
    color: tokens.color.text.secondary,
  },
  track: {
    marginTop: 13,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bec6ff',
    position: 'relative',
  },
  fill: { height: '100%', borderRadius: 4 },
  thumb: {
    position: 'absolute',
    top: '50%',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8c6dff',
    shadowColor: 'rgba(140,109,255,0.85)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 16,
    elevation: 4,
    marginTop: -8,
    marginLeft: -8,
  },
});
