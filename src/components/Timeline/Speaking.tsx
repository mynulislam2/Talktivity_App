/**
 * Speaking Activity Card Component (React Native)
 *
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { CourseStatus } from '@/services/course';
import { TimeLimitStatus } from '@/services/call/TimeLimitService';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface SpeakingProps {
  courseStatus: CourseStatus;
  completed: boolean;
  timeStatus?: TimeLimitStatus | null;
  remainingTime?: string;
}

export const Speaking: React.FC<SpeakingProps> = ({
  courseStatus,
  completed,
  timeStatus,
  remainingTime,
}) => {
  const navigation = useNavigation();
  const { course } = courseStatus;

  const handleStart = async () => {
    try {
      await AsyncStorage.setItem('isRoleplaySession', 'false');
      if (course.todayTopic) {
        await AsyncStorage.setItem(
          'selectedTopic',
          JSON.stringify(course.todayTopic)
        );
        (navigation as any).navigate('LearningStack', {
          screen: 'PracticeScreen',
          params: {
            topicId: course.todayTopic.id,
            topicName: course.todayTopic.title,
          },
        });
      } else {
        (navigation as any).navigate('LearningStack', {
          screen: 'TopicsScreen',
        });
      }
    } catch (_err) {
      // Error navigating
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.timelineDot, completed && styles.timelineDotCompleted]}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {course.todayTopic ? course.todayTopic.title : 'Speaking Zone'}
          </Text>
          {completed && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.success}
            />
          )}
        </View>
        <Text style={styles.cardDescription}>
          {course.todayTopic
            ? `5 minutes of speaking practice: ${course.todayTopic.title}`
            : '5 minutes of speaking practice with Aleena'}
        </Text>
        {!completed && timeStatus && timeStatus.remainingTimeSeconds > 0 && (
          <Text style={styles.timeRemaining}>
            â±ï¸ Time remaining: {remainingTime}
          </Text>
        )}
        {completed ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark" size={16} color={colors.success} />
            <Text style={styles.completedText}>Speaking Completed</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStart}
            disabled={completed}
          >
            <Text style={styles.actionButtonText}>Start Speaking (5 min)</Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
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
  timeRemaining: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: colors.success,
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
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});
