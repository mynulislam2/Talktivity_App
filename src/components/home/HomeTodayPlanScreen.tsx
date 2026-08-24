import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { HomeViewToggle } from './HomeViewToggle';
import type { CourseStatus } from '@/services/course';
import type { DailyProgressBooleans } from '@/hooks/progress/useDailyProgress';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { persistListeningTopic } from '@/lib/listeningTopic';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HomeTodayPlanScreenProps {
  courseStatus: CourseStatus;
  booleans: DailyProgressBooleans;
  practiceMinutes: string;
  remainingTime: string;
  hasSpeakingTimeLeft: boolean;
  onBack: () => void;
  onSwitchMode: (mode: 'today' | 'timeline') => void;
}

type TimelineStatus = 'active' | 'locked' | 'completed';

interface TimelineActionCardData {
  id: string;
  title: string;
  description: string;
  helper: string;
  status: TimelineStatus;
  buttonLabel?: string;
  action?: () => void;
}

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;

function ScreenBackButton({ onClick }: { onClick: () => void }) {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={styles.backButton}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.8)" />
    </TouchableOpacity>
  );
}

function FigmaTimelineCard({ card }: { card: TimelineActionCardData }) {
  const isCompleted = card.status === 'completed';

  return (
    <View
      style={[
        styles.timelineCard,
        card.status === 'active' && styles.timelineCardActive,
        card.status === 'locked' && styles.timelineCardLocked,
        card.status === 'completed' && styles.timelineCardCompleted,
      ]}
    >
      <View>
        <Text style={styles.timelineCardTitle}>{card.title}</Text>
        <Text style={styles.timelineCardDesc}>{card.description}</Text>
      </View>

      <View style={styles.cardBottomRow}>
        {card.buttonLabel && card.action ? (
          <FigmaPrimaryButton
            onPress={card.action}
            style={styles.timelineCardButton}
          >
            <Text style={styles.timelineCardButtonText}>{card.buttonLabel}</Text>
          </FigmaPrimaryButton>
        ) : null}

        <View style={styles.timelineCardFooter}>
          {isCompleted ? (
            <>
              <Feather name="check" size={16} color="#34d399" />
              <Text style={styles.completedText}>Completed</Text>
            </>
          ) : (
            <>
              <Feather
                name="clock"
                size={16}
                color={card.buttonLabel ? 'rgba(255,255,255,0.7)' : '#facc15'}
              />
              <Text
                style={[
                  styles.helperText,
                  card.buttonLabel ? styles.helperTextWhite : styles.helperTextYellow,
                ]}
              >
                {card.helper}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export const HomeTodayPlanScreen: React.FC<HomeTodayPlanScreenProps> = ({
  courseStatus,
  booleans,
  practiceMinutes,
  remainingTime,
  hasSpeakingTimeLeft,
  onBack,
  onSwitchMode,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HomeNav>();
  const { course } = courseStatus;
  const allActivitiesComplete =
    course.dayType === 'all_activities'
      ? booleans.speakingCompleted &&
        booleans.quizCompleted &&
        booleans.listeningCompleted &&
        booleans.listeningQuizCompleted
      : booleans.speakingCompleted && booleans.quizCompleted;

  const startSpeaking = useCallback(async () => {
    // Clear roleplay flags so PracticeScreen treats this as a practice session
    await AsyncStorage.setItem('isRoleplaySession', 'false');
    await AsyncStorage.removeItem('selectedRoleplayTopic');
    if (course.todayTopic) {
      await AsyncStorage.setItem(
        'selectedTopic',
        JSON.stringify(course.todayTopic)
      );
      navigation.navigate('PracticeScreen', {
        topicId: course.todayTopic.id,
        topicName: course.todayTopic.title,
      });
      return;
    }
    navigation.navigate('PracticeScreen' as any);
  }, [course.todayTopic, navigation]);

  const startReview = useCallback(() => {
    navigation.navigate('ReviewScreen' as any);
  }, [navigation]);

  const startListening = useCallback(() => {
    if (course.todayListeningTopic) {
      persistListeningTopic(course.todayListeningTopic as any);
    }
    navigation.navigate('ListeningScreen' as any);
  }, [course.todayListeningTopic, navigation]);

  const startListeningQuiz = useCallback(() => {
    if (course.todayListeningTopic) {
      persistListeningTopic(course.todayListeningTopic as any);
    }
    navigation.navigate('ListeningQuizScreen' as any);
  }, [course.todayListeningTopic, navigation]);

  const cards: TimelineActionCardData[] =
    course.dayType === 'speaking_exam'
      ? [
          {
            id: 'speaking',
            title: course.todayTopic?.title || 'Weekly Speaking Exam',
            description: `${practiceMinutes} minutes of speaking practice: ${
              course.todayTopic?.title || 'Today speaking exam'
            }`,
            helper: !hasSpeakingTimeLeft
              ? 'Time limit reached'
              : booleans.speakingCompleted
              ? `${remainingTime} left`
              : `${practiceMinutes} min`,
            status: !hasSpeakingTimeLeft ? 'completed' : 'active',
            buttonLabel: !hasSpeakingTimeLeft
              ? undefined
              : booleans.speakingCompleted
              ? 'Continue Speaking'
              : 'Start Speaking',
            action: !hasSpeakingTimeLeft ? undefined : startSpeaking,
          },
          {
            id: 'review',
            title: 'Interactive Review',
            description: 'Review your conversation mistakes with AI coaching',
            helper: booleans.reviewUnlocked
              ? 'AI feedback ready'
              : booleans.speakingCompleted
              ? 'Review is being prepared'
              : 'Complete Speaking Zone first',
            status: booleans.quizCompleted
              ? 'completed'
              : booleans.reviewUnlocked
              ? 'active'
              : 'locked',
            buttonLabel:
              booleans.quizCompleted || !booleans.reviewUnlocked
                ? undefined
                : 'Start Review',
            action:
              booleans.quizCompleted || !booleans.reviewUnlocked
                ? undefined
                : startReview,
          },
          {
            id: 'report',
            title: "Today's Report",
            description: allActivitiesComplete
              ? "Get your detailed performance report for today's activities"
              : "Complete all today's activities to unlock your report",
            helper: allActivitiesComplete
              ? 'Report ready to open'
              : 'Complete all activities first',
            status: allActivitiesComplete ? 'active' : 'locked',
            buttonLabel: allActivitiesComplete ? 'View Report' : undefined,
            action: allActivitiesComplete
              ? () => navigation.navigate('TodaysReportScreen' as any)
              : undefined,
          },
        ]
      : [
          {
            id: 'speaking',
            title: course.todayTopic?.title || 'Speaking Zone',
            description: `${practiceMinutes} minutes of speaking practice: ${
              course.todayTopic?.title || 'Daily speaking topic'
            }`,
            helper: !hasSpeakingTimeLeft
              ? 'Time limit reached'
              : booleans.speakingCompleted
              ? `${remainingTime} left`
              : `${practiceMinutes} min`,
            status: !hasSpeakingTimeLeft ? 'completed' : 'active',
            buttonLabel: !hasSpeakingTimeLeft
              ? undefined
              : booleans.speakingCompleted
              ? 'Continue Speaking'
              : 'Start Speaking',
            action: !hasSpeakingTimeLeft ? undefined : startSpeaking,
          },
          {
            id: 'review',
            title: 'Interactive Review',
            description: 'Review your conversation mistakes with AI coaching',
            helper: booleans.reviewUnlocked
              ? 'AI feedback ready'
              : booleans.speakingCompleted
              ? 'Review is being prepared'
              : 'Complete Speaking Zone first',
            status: booleans.quizCompleted
              ? 'completed'
              : booleans.reviewUnlocked
              ? 'active'
              : 'locked',
            buttonLabel:
              booleans.quizCompleted || !booleans.reviewUnlocked
                ? undefined
                : 'Start Review',
            action:
              booleans.quizCompleted || !booleans.reviewUnlocked
                ? undefined
                : startReview,
          },
          {
            id: 'listening',
            title: course.todayListeningTopic?.title || 'Listening Zone',
            description: `Listening to: ${
              course.todayListeningTopic?.title || 'Today listening activity'
            }`,
            helper: booleans.quizCompleted
              ? 'Open listening practice'
              : 'Complete Quiz Practice first',
            status: booleans.listeningCompleted
              ? 'completed'
              : booleans.quizCompleted
              ? 'active'
              : 'locked',
            buttonLabel:
              booleans.listeningCompleted || !booleans.quizCompleted
                ? undefined
                : 'Start Listening',
            action:
              booleans.listeningCompleted || !booleans.quizCompleted
                ? undefined
                : startListening,
          },
          {
            id: 'listening-quiz',
            title: 'Listening Quiz',
            description: 'Take a quiz to test your listening comprehension',
            helper: booleans.listeningCompleted
              ? 'Open your listening quiz'
              : 'Complete Speaking Zone first',
            status: booleans.listeningQuizCompleted
              ? 'completed'
              : booleans.listeningCompleted
              ? 'active'
              : 'locked',
            buttonLabel:
              booleans.listeningQuizCompleted || !booleans.listeningCompleted
                ? undefined
                : 'Start Quiz',
            action:
              booleans.listeningQuizCompleted || !booleans.listeningCompleted
                ? undefined
                : startListeningQuiz,
          },
          {
            id: 'report',
            title: "Today's Report",
            description: allActivitiesComplete
              ? "Get your detailed performance report for today's activities"
              : "Complete all today's activities to unlock your report",
            helper: allActivitiesComplete
              ? 'Report ready to open'
              : 'Complete all activities first',
            status: allActivitiesComplete ? 'active' : 'locked',
            buttonLabel: allActivitiesComplete ? 'View Report' : undefined,
            action: allActivitiesComplete
              ? () => navigation.navigate('TodaysReportScreen' as any)
              : undefined,
          },
        ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <ScreenBackButton onClick={onBack} />
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Today's Plan</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.toggleContainer}>
        <HomeViewToggle
          viewMode="today"
          onViewModeChange={onSwitchMode as any}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Your Today's Plan</Text>

        <View style={styles.timelineRow}>
          <View style={styles.dotColumn}>
            {cards.map((card, index) => (
              <View key={card.id} style={styles.dotColumnItem}>
                <View
                  style={[
                    styles.dot,
                    card.status === 'completed' && styles.dotCompleted,
                    card.status === 'active' && styles.dotActive,
                    card.status === 'locked' && styles.dotLocked,
                  ]}
                />
                {index < cards.length - 1 ? (
                  <View
                    style={[
                      styles.dotLine,
                      card.status === 'locked'
                        ? styles.dotLineLocked
                        : styles.dotLineActive,
                    ]}
                  />
                ) : null}
              </View>
            ))}
          </View>

          <View style={styles.cardsColumn}>
            {cards.map((card) => (
              <FigmaTimelineCard key={card.id} card={card} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 33.6,
    color: '#fff',
  },
  toggleContainer: {
    paddingHorizontal: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 25.2,
    color: '#fff',
    marginTop: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    marginTop: 24,
  },
  dotColumn: {
    width: 12,
    alignItems: 'center',
    flexShrink: 0,
  },
  dotColumnItem: {
    flex: 1,
    minHeight: 140,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  dotCompleted: {
    borderColor: '#5d68ff',
    backgroundColor: '#5d68ff',
  },
  dotActive: {
    borderColor: '#5d68ff',
    backgroundColor: '#5d68ff',
  },
  dotLocked: {
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'transparent',
  },
  dotLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  dotLineActive: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  dotLineLocked: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  cardsColumn: {
    flex: 1,
    gap: 16,
  },
  timelineCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3e50',
    padding: 16,
  },
  timelineCardActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  timelineCardLocked: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    opacity: 0.6,
  },
  timelineCardCompleted: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  timelineCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 22.4,
    color: '#fff',
  },
  timelineCardDesc: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 19.6,
    color: '#c6c6c6',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  timelineCardButton: {
    marginTop: 0,
  },
  timelineCardButtonText: {
    fontSize: 14,
    lineHeight: 16.8,
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  timelineCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 0,
    flexShrink: 1,
  },
  completedText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 19.6,
    color: '#34d399',
  },
  helperText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 19.6,
    flexShrink: 1,
  },
  helperTextYellow: {
    color: '#facc15',
  },
  helperTextWhite: {
    color: 'rgba(255,255,255,0.7)',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
