/**
 * SmartInsight Component (React Native)
 *
 * Smart insight section showing personalized insights based on user progress.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CourseAnalytics, UserAchievements } from '@/services/course';
import { spacing } from '@/styles/spacing';

export interface SmartInsightProps {
  analytics: CourseAnalytics | null;
  achievements: UserAchievements | null;
}

export function SmartInsight({ analytics, achievements }: SmartInsightProps) {
  const generateSmartInsight = () => {
    if (!analytics || !achievements) {
      return 'Start your learning journey today to see your progress insights!';
    }

    const streak = analytics.progress?.current_streak || 0;
    const totalSpeakingTime = achievements.stats.totalSpeakingTime || 0;
    const fullSessions = achievements.stats.fullSessions || 0;
    const totalQuizzes = achievements.stats.totalQuizzes || 0;
    const examsPassed = achievements.stats.examsPassed || 0;

    if (streak >= 7) {
      return `ðŸ”¥ Amazing! You're on a ${streak}-day streak. Consistency is key to language learning success!`;
    }

    if (totalSpeakingTime >= 3600) {
      return `ðŸŽ™ï¸ You've practiced speaking for over an hour! That's dedication. Keep it up to unlock higher levels!`;
    }

    if (fullSessions >= 5) {
      return `ðŸ† You've completed ${fullSessions} full 5-minute speaking sessions. You're earning bonus XP for your commitment!`;
    }

    if (totalQuizzes >= 10) {
      return `ðŸ§  You've completed ${totalQuizzes} quizzes! Your knowledge is growing. Try to maintain your streak!`;
    }

    if (examsPassed >= 1) {
      return `ðŸ… Great job passing your first exam! You've earned 50 XP. Aim for more to level up faster!`;
    }

    if (streak > 0) {
      return `ðŸŒŸ You're on a ${streak}-day streak. Keep practicing daily to build momentum and earn streak bonuses!`;
    }

    return 'Start your learning journey today to see your progress insights! Practice speaking to earn XP based on your actual time.';
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="bulb" size={20} color="#fbbf24" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Smart Insights</Text>
          <Text style={styles.insight}>{generateSmartInsight()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.xs,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: '#7B70FF',
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  insight: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
