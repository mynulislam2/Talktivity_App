/**
 * Timeline Component (React Native)
 * 
 * Shows today's plan with activity cards.
 * Matches Next.js implementation.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, AppState, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/service/AuthService';
import { CourseStatus } from '@/service/CourseService';
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
      quizCompleted,
      listeningCompleted,
      listeningQuizCompleted,
      roleplayCompleted,
    },
    refresh: refreshProgress,
  } = useDailyProgress(courseStatus);

  // Auto-refresh progress when app becomes active (user returns from completing an activity)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && courseStatus) {
        refreshProgress();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [courseStatus, refreshProgress]);

  // Compute locked state based only on prerequisite completion booleans
  const quizLocked = !speakingCompleted;
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
            await AsyncStorage.setItem('selectedTopic', JSON.stringify(courseStatus.course.todayTopic));
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
            await AsyncStorage.setItem('selectedTopic', JSON.stringify(courseStatus.course.todayTopic));
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
          <Text style={styles.authText}>Please log in to access your course</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => (navigation as any).navigate('Auth', { screen: 'Login' })}
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
      ? speakingCompleted && quizCompleted && listeningCompleted && listeningQuizCompleted
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
          Your Today's Plan — <Text style={styles.subtitle}>Week {course.currentWeek} • Day {course.currentDay}</Text>
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
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  )}
                </View>
                <Text style={styles.cardDescription}>
                  Weekly assessment of your speaking progress
                </Text>
                {timeStatus && timeStatus.remainingTimeSeconds > 0 && !speakingCompleted && (
                  <Text style={styles.timeRemaining}>
                    ⏱️ Time remaining: {remainingTime}
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

            {/* Quiz (locked until speaking exam done) */}
            <QuizCard
              courseStatus={courseStatus}
              locked={!speakingCompleted}
              completed={quizCompleted}
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
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(203, 213, 225, 1)',
    fontWeight: '400',
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
    backgroundColor: '#111827',
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
    backgroundColor: '#fff',
    zIndex: 1,
  },
  timelineDotCompleted: {
    backgroundColor: '#10b981',
  },
  cardContent: {
    marginLeft: spacing.xl,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
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
    color: '#fff',
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(203, 213, 225, 1)',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  timeRemaining: {
    fontSize: 12,
    color: '#fbbf24',
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
    color: '#10b981',
  },
  actionButton: {
    backgroundColor: '#6A5AE0',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#7B70FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  authCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
  },
  authText: {
    color: 'rgba(203, 213, 225, 1)',
    marginBottom: spacing.md,
  },
  loginButton: {
    backgroundColor: '#6A5AE0',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: '#7B70FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Timeline;
