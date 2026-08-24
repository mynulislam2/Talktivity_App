/**
 * Timeline Component (React Native)
 *
 * Shows today's plan with activity cards.
 * Matches Next.js implementation.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/auth';
import { CourseStatus } from '@/services/course';
import { useTimeLimits } from '@/hooks/useTimeLimits';
import { useDailyProgress } from '@/hooks/progress/useDailyProgress';
import { Speaking } from './Speaking';
import { QuizCard } from './QuizCard';
import { Listening } from './Listening';
import { ListeningQuizCard } from './ListeningQuizCard';
import { Report } from './Report';
import { VocabularyPopup } from './VocabularyPopup';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface TimelineProps {
  courseStatus: CourseStatus | null;
}

const Timeline: React.FC<TimelineProps> = ({ courseStatus }) => {
  const navigation = useNavigation();

  // Use time limits hook for practice (speaking) time
  const { timeStatus, remainingTime } = useTimeLimits({
    sessionType: 'practice',
    pollInterval: 0,
  });

  // Daily progress is the single source of truth for completion flags
  const {
    booleans: {
      speakingCompleted,
      reviewUnlocked,
      quizCompleted,
      listeningCompleted,
      listeningQuizCompleted,
    },
  } = useDailyProgress(courseStatus);

  // Auto-refresh progress when the hook polls — no duplicate listener needed
  // (useDailyProgress handles both app-foreground refresh and periodic polling)

  // Compute locked state based only on prerequisite completion booleans
  // Quiz is locked until a valid practice transcript is ready for review
  const quizLocked = !reviewUnlocked;
  const listeningLocked = !quizCompleted;
  const listeningQuizLocked = !listeningCompleted;

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();

  const handleActionClick = async (action: 'speaking' | 'quiz' | 'exam') => {
    if (!courseStatus) return;

    try {
      switch (action) {
        case 'speaking':
          if (courseStatus.course.todayTopic) {
            await AsyncStorage.setItem(
              'selectedTopic',
              JSON.stringify(courseStatus.course.todayTopic)
            );
            await AsyncStorage.setItem('isRoleplaySession', 'false');
            (navigation as any).navigate('LearningStack', {
              screen: 'PracticeScreen',
              params: {
                topicId: courseStatus.course.todayTopic.id,
                topicName: courseStatus.course.todayTopic.title,
              },
            });
          }
          break;
        case 'quiz':
          (navigation as any).navigate('LearningStack', {
            screen: 'QuizScreen',
            params: {
              topicId: courseStatus.course.todayTopic?.id,
              topicName: courseStatus.course.todayTopic?.title,
            },
          });
          break;
        case 'exam':
          if (courseStatus.course.todayTopic) {
            await AsyncStorage.setItem(
              'selectedTopic',
              JSON.stringify(courseStatus.course.todayTopic)
            );
            await AsyncStorage.setItem('isRoleplaySession', 'false');
            (navigation as any).navigate('LearningStack', {
              screen: 'PracticeScreen',
              params: {
                topicId: courseStatus.course.todayTopic.id,
                topicName: courseStatus.course.todayTopic.title,
              },
            });
          } else {
            (navigation as any).navigate('LearningStack', {
              screen: 'TopicsScreen',
            });
          }
          break;
      }
    } catch (err) {
      // Error handling action
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Today's Plan</Text>
        <View style={styles.authCard}>
          <Text style={styles.authText}>
            Please log in to access your course
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() =>
              (navigation as any).navigate('Auth', { screen: 'Login' })
            }
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If no courseStatus, render nothing (parent handles loading)
  if (!courseStatus) return null;

  const { course } = courseStatus;

  // Check if all activities are complete based on day type
  const todaysReportCompleted =
    course.dayType === 'all_activities'
      ? speakingCompleted &&
        quizCompleted &&
        listeningCompleted &&
        listeningQuizCompleted
      : course.dayType === 'speaking_exam'
      ? speakingCompleted && quizCompleted
      : false;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Your Today's Plan â€”{' '}
          <Text style={styles.subtitle}>
            Week {course.currentWeek} â€¢ Day {course.currentDay}
          </Text>
        </Text>
      </View>

      <View style={styles.timelineContainer}>
        {/* Timeline line */}
        <View style={styles.timelineLine} />

        {/* Vocabulary Popup */}
        <VocabularyPopup courseStatus={courseStatus} />

        {/* Day 7: Speaking Exam Only */}
        {course.dayType === 'speaking_exam' && (
          <>
            {/* Speaking Exam */}
            <View style={styles.activityCard}>
              <View
                style={[
                  styles.timelineDot,
                  speakingCompleted && styles.timelineDotCompleted,
                ]}
              />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Weekly Speaking Exam</Text>
                  {speakingCompleted && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10b981"
                    />
                  )}
                </View>
                <Text style={styles.cardDescription}>
                  Weekly assessment of your speaking progress
                </Text>
                {timeStatus &&
                  timeStatus.remainingTimeSeconds > 0 &&
                  !speakingCompleted && (
                    <Text style={styles.timeRemaining}>
                      â±ï¸ Time remaining: {remainingTime}
                    </Text>
                  )}
                {speakingCompleted ? (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark" size={16} color="#10b981" />
                    <Text style={styles.completedText}>Speaking Completed</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleActionClick('exam')}
                    disabled={speakingCompleted}
                  >
                    <Text style={styles.actionButtonText}>Start Exam</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Quiz (locked until review is ready) */}
            <QuizCard
              courseStatus={courseStatus}
              locked={!reviewUnlocked}
              completed={quizCompleted}
              lockedMessage={
                speakingCompleted
                  ? 'Review is being prepared'
                  : 'Complete Speaking Zone first'
              }
            />
          </>
        )}

        {/* Day Type: All Activities (Speaking + Quiz + Listening + Listening Quiz) */}
        {course.dayType === 'all_activities' && (
          <>
            {/* Speaking Card */}
            <Speaking
              courseStatus={courseStatus}
              completed={speakingCompleted}
              timeStatus={timeStatus}
              remainingTime={remainingTime}
            />
            {/* Regular Quiz Card */}
            <QuizCard
              courseStatus={courseStatus}
              locked={quizLocked}
              completed={quizCompleted}
              lockedMessage={
                speakingCompleted
                  ? 'Review is being prepared'
                  : 'Complete Speaking Zone first'
              }
            />
            {/* Listening Card */}
            <Listening
              courseStatus={courseStatus}
              locked={listeningLocked}
              completed={listeningCompleted}
            />
            {/* Listening Quiz Card */}
            <ListeningQuizCard
              courseStatus={courseStatus}
              locked={listeningQuizLocked}
              completed={listeningQuizCompleted}
            />
          </>
        )}

        {/* Today's Report Button - Always Show */}
        <Report completed={todaysReportCompleted} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
    maxWidth: '100%',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '400',
    fontFamily: 'Poppins',
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 4,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border,
  },
  activityCard: {
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
    borderColor: colors.brand.cardBorder,
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
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: colors.text.muted,
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
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  authCard: {
    backgroundColor: colors.dark.backgroundCard,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
  },
  authText: {
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default Timeline;
