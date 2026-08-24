/**
 * Quiz Card Component (React Native)
 *
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CourseStatus } from '@/services/course';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface QuizCardProps {
  courseStatus: CourseStatus;
  locked: boolean;
  completed: boolean;
  lockedMessage?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  courseStatus,
  locked,
  completed,
  lockedMessage,
}) => {
  const navigation = useNavigation();
  const { course } = courseStatus;

  const handleStart = () => {
    (navigation as any).navigate('LearningStack', {
      screen: 'QuizScreen',
      params: {
        topicId: course.todayTopic?.id,
        topicName: course.todayTopic?.title,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.timelineDot, completed && styles.timelineDotCompleted]}
      />
      <View
        style={[
          styles.cardContent,
          locked && !completed && styles.cardContentLocked,
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Quiz Practice</Text>
          {completed && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.success}
            />
          )}
        </View>
        <Text style={styles.cardDescription}>
          Take a quiz to reinforce your learning
        </Text>
        {completed ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={16} color={colors.success} />
            <Text style={styles.completedText}>Quiz Completed</Text>
          </View>
        ) : locked ? (
          <View style={styles.lockedBadge}>
            <Ionicons name="time-outline" size={16} color={colors.warning} />
            <Text style={styles.lockedText}>
              {lockedMessage || 'Complete Speaking Zone first'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStart}
            disabled={locked || completed}
          >
            <Text style={styles.actionButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    zIndex: 1,
  },
  timelineDotCompleted: {
    backgroundColor: colors.success,
  },
  cardContent: {
    marginLeft: spacing.xl,
    backgroundColor: colors.dark.backgroundCard,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '100%',
    flex: 1,
  },
  cardContentLocked: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.white,
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: colors.success,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: colors.warning,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
});
