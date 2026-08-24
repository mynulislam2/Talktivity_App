/**
 * Achievements Component (React Native)
 *
 * Achievements display showing level, streak, and badges.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { courseService } from '@/services/course';
import type { CourseAnalytics, UserAchievements } from '@/services/course';
import { spacing } from '@/styles/spacing';

export interface AchievementsProps {
  analytics: CourseAnalytics | null;
  achievements: UserAchievements | null;
}

export function Achievements({ analytics, achievements }: AchievementsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Achievements</Text>

        {/* Level Progress */}
        {achievements && (
          <View style={styles.levelCard}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{achievements.level.current}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>
                Level {achievements.level.current} -{' '}
                {courseService.getLevelName(achievements.level.current)}
              </Text>
              <Text style={styles.levelSubtext}>
                {achievements.level.xp} / {achievements.level.xpForNextLevel} XP
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${achievements.level.xpProgress}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Current Streak */}
        {analytics && (
          <View style={styles.streakCard}>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={18} color="#fff" />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>
                {analytics.progress?.current_streak ?? 0} Day Streak
              </Text>
              <Text style={styles.streakSubtext}>
                {(analytics.progress?.current_streak ?? 0) >= 7
                  ? 'Keep it up!'
                  : `${analytics.progress?.current_streak ?? 0} days`}
              </Text>
            </View>
          </View>
        )}

        {/* Achievement Badges */}
        {achievements && (
          <View style={styles.badgesSection}>
            <Text style={styles.badgesTitle}>Badges</Text>
            <View style={styles.badgesGrid}>
              {achievements.badges.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    badge.unlocked
                      ? styles.badgeCardUnlocked
                      : styles.badgeCardLocked,
                  ]}
                >
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <View style={styles.badgeInfo}>
                    <Text
                      style={[
                        styles.badgeName,
                        !badge.unlocked && styles.badgeNameLocked,
                      ]}
                    >
                      {badge.name}
                    </Text>
                    <Text style={styles.badgeDescription}>
                      {badge.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
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
    backgroundColor: '#0e112c',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 12,
    padding: spacing.sm,
  },
  levelBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  levelInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  levelSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.4)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6A5AE0',
    borderRadius: 4,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 12,
    padding: spacing.sm,
  },
  streakBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  streakSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  badgesSection: {
    marginTop: spacing.xs,
  },
  badgesTitle: {
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badgeCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 8,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgeCardUnlocked: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  badgeCardLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  badgeIcon: {
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  badgeInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fbbf24',
  },
  badgeNameLocked: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  badgeDescription: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
