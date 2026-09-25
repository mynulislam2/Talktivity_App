import React, { useMemo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation } from '@react-navigation/native';

import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { getUtcToday } from '@/utils/timezoneUtils';
import { useResponsive } from '@/theme/responsive';
import { useAppSelector } from '@/store/hooks';
import type { CourseStatus } from '@/services/course';
import type { DailyProgressBooleans } from '@/hooks/progress/useDailyProgress';
import { persistListeningTopic } from '@/lib/listeningTopic';
import { HomeTrackSelector, IeltsHomeMode } from './HomeTrackSelector';

interface HomeDashboardScreenProps {
  practiceMinutes: string;
  onOpenTodayPlan: () => void;
  courseStatus?: CourseStatus | null;
  booleans?: DailyProgressBooleans;
}

const SPEAKING_DRILLS: { part: 1 | 2 | 3; title: string; description: string }[] = [
  {
    part: 1,
    title: 'Speaking Part 1 Drill',
    description: 'Interview call: short questions about familiar topics.',
  },
  {
    part: 2,
    title: 'Speaking Part 2 Drill',
    description: 'Cue card: prepare for 1 minute, then speak for up to 2.',
  },
  {
    part: 3,
    title: 'Speaking Part 3 Drill',
    description: 'Discussion call: deeper questions on abstract ideas.',
  },
];

function getWeekdayItems() {
  const [y, m, d] = getUtcToday().split('-').map(Number);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(y, m - 1, d + index));
    return {
      key: date.toISOString(),
      label: date.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      }),
      isToday: index === 0,
    };
  });
}

export const HomeDashboardScreen: React.FC<HomeDashboardScreenProps> = ({
  practiceMinutes,
  onOpenTodayPlan,
  courseStatus,
  booleans,
}) => {
  const weekdayItems = useMemo(() => getWeekdayItems(), []);
  const { narrow, s } = useResponsive();
  const dayCircle = s(26);
  const subscriptionState = useAppSelector((state) => state.subscription);
  const authUser = useAppSelector((state) => state.auth?.user);
  const isExpired = subscriptionState?.currentSubscription?.active === false;

  const isIelts = authUser?.learning_track === 'ielts';

  // Land on the tab for the user's saved focus (foundation/missing → Daily
  // Plan), and follow it when the refreshed /auth/me user arrives.
  const defaultFocus = authUser?.ielts_default_focus;
  const focusMode: IeltsHomeMode =
    defaultFocus === 'drills' || defaultFocus === 'mock_exam' ? defaultFocus : 'daily';
  const [ieltsMode, setIeltsMode] = useState<IeltsHomeMode>(focusMode);
  useEffect(() => {
    setIeltsMode(focusMode);
  }, [focusMode]);

  const navigation = useNavigation<any>();
  const todayListeningTopic = courseStatus?.course?.todayListeningTopic;
  const isListeningCompleted = Boolean(booleans?.listeningCompleted);
  const isQuizCompleted = Boolean(booleans?.listeningQuizCompleted);
  const isAllListeningDone = isListeningCompleted && isQuizCompleted;

  const handleOpenListening = useCallback(() => {
    if (todayListeningTopic) {
      persistListeningTopic(todayListeningTopic as any);
    }
    navigation.navigate('ListeningScreen');
  }, [navigation, todayListeningTopic]);

  const openSpeaking = (mode: 'drill' | 'mock', part?: 1 | 2 | 3) =>
    navigation.navigate('IeltsSpeakingScreen', { mode, part });
  const openListening = (mode: 'drill' | 'mock') =>
    navigation.navigate('IeltsListeningScreen', { mode });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 7-Day Tracker */}
      <View style={styles.weekdaysRowContainer}>
        <View style={styles.weekdaysRow}>
          {weekdayItems.map((item) => (
            <View key={item.key} style={styles.weekdayItem}>
              <View
                style={[
                  styles.weekdayCircle,
                  {
                    width: dayCircle,
                    height: dayCircle,
                    borderRadius: dayCircle / 2,
                  },
                  item.isToday
                    ? styles.weekdayCircleActive
                    : styles.weekdayCircleInactive,
                ]}
              >
                {item.isToday && (
                  <Feather
                    name="check"
                    size={s(16)}
                    color="#fff"
                    strokeWidth={2.5}
                  />
                )}
              </View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={[
                  styles.weekdayLabel,
                  narrow && styles.weekdayLabelNarrow,
                  item.isToday
                    ? styles.weekdayLabelActive
                    : styles.weekdayLabelInactive,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* IELTS Track Selector */}
      {isIelts && (
        <HomeTrackSelector
          currentMode={ieltsMode}
          onSelectMode={setIeltsMode}
        />
      )}

      {/* Mode 1: Daily Plan (Standard) */}
      {(!isIelts || ieltsMode === 'daily') && (
        <>
          <LinearGradient
            colors={['rgba(210,131,255,0.23)', 'rgba(40,32,110,0.01)']}
            style={styles.todayPlanCard}
          >
            <View style={styles.todayPlanContent}>
              <Text style={styles.todayPlanTitle}>Your Today's Plan</Text>
              <Text style={styles.todayPlanDesc}>
                {practiceMinutes}-minute speaking practice on your daily topic.
              </Text>
              <FigmaPrimaryButton
                onPress={onOpenTodayPlan}
                style={styles.todayPlanButton}
                disabled={isExpired}
              >
                <Text style={styles.todayPlanButtonText}>Continue</Text>
                <Feather name="arrow-right" size={14} color="#fff" />
              </FigmaPrimaryButton>
            </View>
            <ExpoImage
              source={require('../../../assets/avatar_intro.svg')}
              style={[styles.todayPlanHero, { width: s(170), height: s(170) }]}
              contentFit="contain"
              pointerEvents="none"
            />
          </LinearGradient>

          <LinearGradient
            colors={['rgba(93,76,255,0.22)', 'rgba(40,32,110,0.02)']}
            style={[styles.todayPlanCard, { marginTop: 16 }]}
          >
            <View style={styles.todayPlanContent}>
              <Text style={styles.todayPlanTitle}>Listening Practice</Text>
              <Text style={styles.todayPlanDesc}>
                5-minute listening practice on your daily topic.
              </Text>
              <FigmaPrimaryButton
                onPress={handleOpenListening}
                style={styles.todayPlanButton}
                disabled={isExpired || isAllListeningDone}
              >
                <Text style={styles.todayPlanButtonText}>
                  {isAllListeningDone
                    ? 'Completed'
                    : isListeningCompleted
                    ? 'Continue'
                    : 'Start Listening'}
                </Text>
                {isAllListeningDone ? (
                  <Feather name="check" size={14} color="#fff" />
                ) : (
                  <Feather name="arrow-right" size={14} color="#fff" />
                )}
              </FigmaPrimaryButton>
            </View>
            <ExpoImage
              source={require('../../../assets/listening_hero.png')}
              style={[styles.todayPlanHero, { width: s(170), height: s(170) }]}
              contentFit="contain"
              pointerEvents="none"
            />
          </LinearGradient>
        </>
      )}

      {/* Mode 2: IELTS Targeted Drills */}
      {isIelts && ieltsMode === 'drills' && (
        <>
          {SPEAKING_DRILLS.map(({ part, title, description }, index) => (
            <LinearGradient
              key={part}
              colors={['rgba(168,85,247,0.22)', 'rgba(40,32,110,0.02)']}
              style={[styles.todayPlanCard, index > 0 && { marginTop: 16 }]}
            >
              <View style={{ width: '100%', zIndex: 1 }}>
                <Text style={styles.todayPlanTitle}>{title}</Text>
                <Text style={styles.todayPlanDesc}>{description}</Text>
                <FigmaPrimaryButton
                  onPress={() => openSpeaking('drill', part)}
                  style={styles.todayPlanButton}
                >
                  <Text style={styles.todayPlanButtonText}>Start Part {part} Drill</Text>
                  <Feather name="arrow-right" size={14} color="#fff" />
                </FigmaPrimaryButton>
              </View>
            </LinearGradient>
          ))}

          <LinearGradient
            colors={['rgba(93,76,255,0.22)', 'rgba(40,32,110,0.02)']}
            style={[styles.todayPlanCard, { marginTop: 16 }]}
          >
            <View style={{ width: '100%', zIndex: 1 }}>
              <Text style={styles.todayPlanTitle}>IELTS Listening Drill</Text>
              <Text style={styles.todayPlanDesc}>
                5–7 min practice questions with instant feedback.
              </Text>
              <FigmaPrimaryButton
                onPress={() => openListening('drill')}
                style={styles.todayPlanButton}
              >
                <Text style={styles.todayPlanButtonText}>Start Listening Drill</Text>
                <Feather name="arrow-right" size={14} color="#fff" />
              </FigmaPrimaryButton>
            </View>
          </LinearGradient>
        </>
      )}

      {/* Mode 3: IELTS Full Mock Exam Hub */}
      {isIelts && ieltsMode === 'mock_exam' && (
        <>
          <LinearGradient
            colors={['rgba(168,85,247,0.22)', 'rgba(40,32,110,0.02)']}
            style={styles.todayPlanCard}
          >
            <View style={{ width: '100%', zIndex: 1 }}>
              <Text style={styles.todayPlanTitle}>IELTS Speaking Mock Test</Text>
              <Text style={styles.todayPlanDesc}>
                Full 11–14 min test with AI examiner & band score.
              </Text>
              <FigmaPrimaryButton
                onPress={() => openSpeaking('mock')}
                style={styles.todayPlanButton}
              >
                <Text style={styles.todayPlanButtonText}>Take Speaking Mock</Text>
                <Feather name="arrow-right" size={14} color="#fff" />
              </FigmaPrimaryButton>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(93,76,255,0.22)', 'rgba(40,32,110,0.02)']}
            style={[styles.todayPlanCard, { marginTop: 16 }]}
          >
            <View style={{ width: '100%', zIndex: 1 }}>
              <Text style={styles.todayPlanTitle}>IELTS Listening Mock Test</Text>
              <Text style={styles.todayPlanDesc}>
                All 4 parts timed test with estimated band score.
              </Text>
              <FigmaPrimaryButton
                onPress={() => openListening('mock')}
                style={styles.todayPlanButton}
              >
                <Text style={styles.todayPlanButtonText}>Take Listening Mock</Text>
                <Feather name="arrow-right" size={14} color="#fff" />
              </FigmaPrimaryButton>
            </View>
          </LinearGradient>
        </>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  weekdaysRowContainer: {
    marginTop: 16,
  },
  weekdaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekdayItem: {
    // Share the row evenly instead of claiming a fixed 38pt each, so seven
    // chips always fit whatever the screen width is.
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 4,
  },
  weekdayCircle: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayCircleActive: {
    borderColor: '#5d4cff',
    backgroundColor: '#5d4cff',
  },
  weekdayCircleInactive: {
    borderColor: '#a0a0a1',
    backgroundColor: 'transparent',
  },
  weekdayLabel: {
    fontSize: 16,
    fontFamily: 'Poppins',
    lineHeight: 22.4,
    textAlign: 'center',
  },
  weekdayLabelNarrow: {
    fontSize: 14,
    lineHeight: 19.6,
  },
  weekdayLabelActive: {
    color: '#fff',
  },
  weekdayLabelInactive: {
    color: '#c6c6c6',
  },
  todayPlanCard: {
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minHeight: 148,
    padding: 16,
    overflow: 'hidden',
  },
  todayPlanContent: {
    // Was a fixed 228pt, which on a 360pt phone left the copy 100pt narrower
    // than the card. A share of the card keeps the same relationship to the
    // hero illustration at every width.
    maxWidth: '62%',
    zIndex: 1,
  },
  todayPlanTitle: {
    fontSize: 22,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 25.3,
    letterSpacing: 0.12,
    color: '#fff',
  },
  todayPlanDesc: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: 'Poppins',
    lineHeight: 20.25,
    color: '#fff',
  },
  todayPlanButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  todayPlanButtonText: {
    fontSize: 14,
    lineHeight: 16.8,
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  todayPlanHero: {
    position: 'absolute',
    bottom: -20,
    right: -18,
  },
  coachSection: {
    marginTop: 28,
  },
  coachSectionTitle: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 28.8,
    letterSpacing: 0.12,
    color: '#fff',
  },
  coachSectionDesc: {
    marginTop: 6,
    fontSize: 16,
    fontFamily: 'Poppins',
    lineHeight: 22.4,
    color: '#c6c6c6',
  },
  coachCard: {
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    overflow: 'hidden',
    minHeight: 128,
  },
  coachCardContent: {
    justifyContent: 'space-between',
    zIndex: 1,
  },
  coachCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '72%',
  },
  coachCardTitle: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 24,
    letterSpacing: 0.12,
    color: '#fff',
  },
  lockChip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 4,
  },
  coachCardDesc: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: 'Poppins',
    lineHeight: 21,
    color: '#c6c6c6',
    maxWidth: '66%',
  },
  coachCardButton: {
    marginTop: 16,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  coachCardButtonLocked: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  coachCardButtonText: {
    fontSize: 14,
    lineHeight: 16.8,
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  coachCardButtonTextLocked: {
    color: 'rgba(255,255,255,0.8)',
  },
  coachImage: {
    position: 'absolute',
    bottom: 16,
    right: 6,
  },
  listeningCard: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minHeight: 148,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  listeningContent: {
    maxWidth: '65%',
    zIndex: 1,
  },
  listeningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listeningIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(197,93,254,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningCategoryText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    fontWeight: '600',
    letterSpacing: 0.8,
    color: '#c55dfe',
  },
  completedChip: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52,211,153,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  completedChipText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    color: '#34d399',
  },
  inProgressChip: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(250,204,21,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  inProgressChipText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    color: '#facc15',
  },
  listeningTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 24,
    color: '#fff',
    letterSpacing: 0.12,
  },
  listeningDesc: {
    marginTop: 5,
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 19.5,
    color: '#c6c6c6',
  },
  listeningButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  listeningButtonText: {
    fontSize: 14,
    lineHeight: 16.8,
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  listeningHero: {
    position: 'absolute',
    bottom: -15,
    right: -10,
  },
});
