/**
 * Skeleton Loader Layouts
 *
 * Pre-built skeleton layouts for common content types
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { spacing } from '@/styles/spacing';

/**
 * Skeleton for a card with image, title, and description
 */
export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={180} borderRadius={12} style={styles.image} />
      <View style={styles.content}>
        <Skeleton width="80%" height={20} borderRadius={4} style={styles.title} />
        <Skeleton width="100%" height={16} borderRadius={4} style={styles.line} />
        <Skeleton width="90%" height={16} borderRadius={4} />
      </View>
    </View>
  );
};

/**
 * Skeleton for a list item with avatar and text
 */
export const SkeletonListItem: React.FC = () => {
  return (
    <View style={styles.listItem}>
      <Skeleton width={48} height={48} borderRadius={24} style={styles.avatar} />
      <View style={styles.listContent}>
        <Skeleton width="60%" height={16} borderRadius={4} style={styles.listTitle} />
        <Skeleton width="40%" height={14} borderRadius={4} />
      </View>
    </View>
  );
};

/**
 * Skeleton for text blocks
 */
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <View>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? '70%' : '100%'}
          height={16}
          borderRadius={4}
          style={styles.textLine}
        />
      ))}
    </View>
  );
};

/**
 * Skeleton for a profile header
 */
export const SkeletonProfile: React.FC = () => {
  return (
    <View style={styles.profile}>
      <Skeleton width={80} height={80} borderRadius={40} style={styles.profileAvatar} />
      <Skeleton width="50%" height={24} borderRadius={4} style={styles.profileName} />
      <Skeleton width="30%" height={16} borderRadius={4} />
    </View>
  );
};

/**
 * Skeleton for leaderboard entry
 */
export const SkeletonLeaderboardItem: React.FC = () => {
  return (
    <View style={styles.leaderboardItem}>
      <Skeleton width={32} height={32} borderRadius={16} style={styles.rank} />
      <Skeleton width={40} height={40} borderRadius={20} style={styles.avatar} />
      <View style={styles.leaderboardContent}>
        <Skeleton width="60%" height={16} borderRadius={4} style={styles.name} />
        <Skeleton width="30%" height={14} borderRadius={4} />
      </View>
      <Skeleton width={48} height={28} borderRadius={14} />
    </View>
  );
};

/**
 * Skeleton for quiz card
 */
export const SkeletonQuizCard: React.FC = () => {
  return (
    <View style={styles.quizCard}>
      <Skeleton width="100%" height={120} borderRadius={12} style={styles.quizImage} />
      <View style={styles.quizContent}>
        <Skeleton width="70%" height={20} borderRadius={4} style={styles.quizTitle} />
        <Skeleton width="100%" height={16} borderRadius={4} style={styles.line} />
        <Skeleton width="80%" height={16} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Card layout
  card: {
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    marginBottom: spacing.md,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  line: {
    marginBottom: spacing.xs,
  },

  // List item layout
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    marginRight: spacing.md,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    marginBottom: spacing.xs,
  },

  // Text layout
  textLine: {
    marginBottom: spacing.sm,
  },

  // Profile layout
  profile: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  profileAvatar: {
    marginBottom: spacing.md,
  },
  profileName: {
    marginBottom: spacing.sm,
  },

  // Leaderboard layout
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rank: {
    marginRight: spacing.md,
  },
  leaderboardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    marginBottom: spacing.xs,
  },

  // Quiz card layout
  quizCard: {
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quizImage: {
    marginBottom: spacing.md,
  },
  quizContent: {
    padding: spacing.md,
  },
  quizTitle: {
    marginBottom: spacing.sm,
  },
});
