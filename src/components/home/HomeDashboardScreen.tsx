import React, { useMemo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation } from '@react-navigation/native';

import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { getUtcToday } from '@/utils/timezoneUtils';
import { useResponsive } from '@/theme/responsive';
import { useAppSelector } from '@/store/hooks';
import type { CourseStatus } from '@/services/course';
import type { DailyProgressBooleans } from '@/hooks/progress/useDailyProgress';
import { persistListeningTopic } from '@/lib/listeningTopic';

interface HomeDashboardScreenProps {
  practiceMinutes: string;
  onOpenTodayPlan: () => void;
  courseStatus?: CourseStatus | null;
  booleans?: DailyProgressBooleans;
}


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
  const isExpired = subscriptionState?.currentSubscription?.active === false;

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

      {/* Your Today's Plan Card */}
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

      {/* Listening Practice Card */}
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

      {/* Today's Report Card (3rd Option) */}
      <LinearGradient
        colors={['rgba(16,185,129,0.20)', 'rgba(40,32,110,0.02)']}
        style={[styles.todayPlanCard, { marginTop: 16 }]}
      >
        <View style={styles.todayPlanContent}>
          <Text style={styles.todayPlanTitle}>Today's Report</Text>
          <Text style={styles.todayPlanDesc}>
            View your detailed score breakdown, band radar, and action plan.
          </Text>
          <FigmaPrimaryButton
            onPress={() => navigation.navigate('TodaysReportScreen')}
            style={[styles.todayPlanButton, { backgroundColor: '#059669' }]}
          >
            <Text style={styles.todayPlanButtonText}>View Report</Text>
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

      {/* Pick your coach Section */}
      <View style={styles.coachSection}>
        <Text style={styles.coachSectionTitle}>Pick your coach</Text>

        {/* Grammar Coach Card */}
        <TouchableOpacity
          style={styles.coachCard}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('GrammarHubScreen')}
        >
          <View style={styles.coachIconBoxGrammar}>
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={22}
              color="#a78bfa"
            />
          </View>
          <View style={styles.coachInfo}>
            <Text style={styles.coachTitle}>Grammar Coach</Text>
            <Text style={styles.coachSubtitle} numberOfLines={1}>
              Your personalised journey to master grammar
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        {/* Vocabulary Coach Card (Coming Soon) */}
        <View style={[styles.coachCard, styles.coachCardDisabled]}>
          <View style={styles.coachIconBoxVocab}>
            <MaterialCommunityIcons name="translate" size={22} color="#60a5fa" />
          </View>
          <View style={styles.coachInfo}>
            <View style={styles.coachTitleRow}>
              <Text style={styles.coachTitle}>Vocabulary Coach</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>
            <Text style={styles.coachSubtitle} numberOfLines={1}>
              Expand your lexical resource with smart drills
            </Text>
          </View>
        </View>

        {/* Shadowing Card (Coming Soon) */}
        <View style={[styles.coachCard, styles.coachCardDisabled]}>
          <View style={styles.coachIconBoxShadowing}>
            <MaterialCommunityIcons name="waveform" size={22} color="#34d399" />
          </View>
          <View style={styles.coachInfo}>
            <View style={styles.coachTitleRow}>
              <Text style={styles.coachTitle}>Shadowing</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>
            <Text style={styles.coachSubtitle} numberOfLines={1}>
              Mimic native speech to master rhythm, pace, and accent
            </Text>
          </View>
        </View>
      </View>

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
  coachSection: {
    marginTop: 20,
    gap: 12,
  },
  coachSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginBottom: 2,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 14,
  },
  coachCardDisabled: {
    opacity: 0.75,
  },
  coachIconBoxGrammar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachIconBoxVocab: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachIconBoxShadowing: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachInfo: {
    flex: 1,
    minWidth: 0,
  },
  coachTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coachTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    lineHeight: 20,
  },
  coachSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Poppins',
    lineHeight: 17,
    marginTop: 2,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.7)',
  },
});
