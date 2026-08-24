/**
 * ProgressGrid Component (React Native)
 *
 * Progress stats grid — matches talktivity_frontend/components/profile/ProgressGrid.tsx exactly.
 * Shows: Current Week, Speaking Days, Quiz Days, Listening Days, Avg Quiz Score, Avg Listening Quiz
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import { selectProgressStats } from '@/store/slices/profileSlice';
import type { ProgressStats } from '@/types/profile';
import { tokens } from '@/theme/tokens';

export interface ProgressGridProps {
  progressStats?: ProgressStats | null;
}

export function ProgressGrid({
  progressStats: progressStatsProp,
}: ProgressGridProps) {
  const progressStatsFromRedux = useAppSelector(selectProgressStats);
  const progressStats = progressStatsProp ?? progressStatsFromRedux;

  if (!progressStats?.courseStatus || !progressStats?.courseProgress) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Could not load progress stats.</Text>
      </View>
    );
  }

  const currentWeek = progressStats.courseStatus?.course?.currentWeek || 0;
  const speakingDays =
    progressStats.courseProgress?.progress?.speaking_days || 0;
  const quizDays = progressStats.courseProgress?.progress?.quiz_days || 0;
  const listeningDays =
    progressStats.courseProgress?.progress?.listening_days || 0;
  const avgQuizScore =
    progressStats.courseProgress?.progress?.avg_quiz_score || 0;
  const avgListeningQuizScore =
    progressStats.courseProgress?.progress?.avg_listening_quiz_score || 0;

  const cards = [
    {
      key: 'current-week',
      label: 'Current Week',
      value: currentWeek,
      icon: 'flag',
      accent: '#79a8ff',
      gradientBg: ['rgba(35,54,122,0.4)', 'rgba(27,32,54,0.85)'],
    },
    {
      key: 'speaking-days',
      label: 'Speaking Days',
      value: speakingDays,
      icon: 'trending-up',
      accent: '#6ce6c1',
      gradientBg: ['rgba(31,58,67,0.45)', 'rgba(25,29,45,0.85)'],
    },
    {
      key: 'quiz-days',
      label: 'Quiz Days',
      value: quizDays,
      icon: 'bar-chart',
      accent: '#c798ff',
      gradientBg: ['rgba(49,36,79,0.45)', 'rgba(25,29,45,0.85)'],
    },
    {
      key: 'listening-days',
      label: 'Listening Days',
      value: listeningDays,
      icon: 'volume-high',
      accent: '#8cb9ff',
      gradientBg: ['rgba(36,52,95,0.45)', 'rgba(25,29,45,0.85)'],
    },
    {
      key: 'avg-quiz',
      label: 'Avg Quiz Score',
      value: Math.round(avgQuizScore),
      suffix: '%',
      icon: 'star',
      accent: '#ffc36c',
      gradientBg: ['rgba(68,50,36,0.45)', 'rgba(25,29,45,0.85)'],
      progress: avgQuizScore,
      fill: ['#ff9f47', '#ffd26a'],
    },
    {
      key: 'avg-listening-quiz',
      label: 'Avg Listening Quiz',
      value: Math.round(avgListeningQuizScore),
      suffix: '%',
      icon: 'book',
      accent: '#c9afff',
      gradientBg: ['rgba(50,39,82,0.45)', 'rgba(25,29,45,0.85)'],
      progress: avgListeningQuizScore,
      fill: ['#8b61ff', '#cf82ff'],
    },
  ];

  return (
    <View style={styles.grid}>
      {cards.map((card) => (
        <View
          key={card.key}
          style={[styles.card, { backgroundColor: card.gradientBg[0] }]}
        >
          <View style={styles.cardTop}>
            <View style={styles.cardTopLeft}>
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Text style={styles.cardValue}>
                {card.value}
                {card.suffix || ''}
              </Text>
            </View>
            <View style={styles.iconBox}>
              <Ionicons name={card.icon as any} size={18} color={card.accent} />
            </View>
          </View>

          {typeof card.progress === 'number' ? (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(10, card.progress)}%`,
                    backgroundColor: card.accent,
                  },
                ]}
              />
            </View>
          ) : (
            <Text style={styles.updateText}>
              Updated from your latest progress analytics.
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '46%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    borderRadius: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 8,
    backgroundColor: tokens.color.surface.card,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTopLeft: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '400', fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.55)',
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 34,
    color: '#fff',
    marginTop: 12,
  },
  iconBox: {
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 10,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  updateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
  },
});
