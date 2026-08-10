/**
 * HomeFullTimelineScreen Component (React Native)
 *
 * Full timeline view showing course weeks, stats, and daily timeline cards.
 * Matches talktivity_frontend/components/home/HomeFullTimelineScreen.tsx exactly.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { courseService } from '@/services/course';
import { formatLocalDate } from '@/utils/timezoneUtils';
import { HomeViewToggle } from './HomeViewToggle';

interface HomeFullTimelineScreenProps {
  currentWeek: number;
  onBack: () => void;
  onSwitchMode: (mode: 'today' | 'timeline') => void;
}

function ScreenBackButton({ onClick }: { onClick: () => void }) {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={styles.backButton}
      activeOpacity={0.7}
      aria-label="Go back"
    >
      <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.8)" />
    </TouchableOpacity>
  );
}

function TimelineWeekCard({
  title,
  subtitle,
  week,
  statusText,
  date,
  actionText,
  isCurrent,
}: {
  title: string;
  subtitle: string;
  week: number;
  statusText: string;
  date: string;
  actionText: string;
  isCurrent: boolean;
}) {
  return (
    <View
      style={[
        styles.weekCard,
        isCurrent ? styles.weekCardCurrent : styles.weekCardDimmed,
      ]}
    >
      <View style={styles.weekCardTop}>
        <View style={styles.weekCardIcon}>
          <Feather name="mic" size={22} color="#fff" />
        </View>
        <View style={styles.weekCardInfo}>
          <View style={styles.weekCardBadges}>
            <Text style={styles.weekCardTitle}>{title}</Text>
            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>W{week}</Text>
            </View>
            {statusText === 'Completed' && (
              <View style={styles.statusBadgeCompleted}>
                <Text style={styles.statusBadgeCompletedText}>
                  {statusText}
                </Text>
              </View>
            )}
            {statusText === 'Today' && (
              <View style={styles.statusBadgeToday}>
                <Text style={styles.statusBadgeTodayText}>{statusText}</Text>
              </View>
            )}
            {statusText === 'Missed' && (
              <View style={styles.statusBadgeMissed}>
                <Text style={styles.statusBadgeMissedText}>{statusText}</Text>
              </View>
            )}
            {statusText === 'Upcoming' && (
              <View style={styles.statusBadgeUpcoming}>
                <Text style={styles.statusBadgeUpcomingText}>{statusText}</Text>
              </View>
            )}
          </View>
          <Text style={styles.weekCardSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.weekCardFooter}>
        <View style={styles.weekCardDateRow}>
          <Feather name="calendar" size={18} color="#c6c6c6" />
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <Text style={styles.actionText}>{actionText}</Text>
      </View>
    </View>
  );
}

export const HomeFullTimelineScreen: React.FC<HomeFullTimelineScreenProps> = ({
  currentWeek,
  onBack,
  onSwitchMode,
}) => {
  const insets = useSafeAreaInsets();
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getFullCourseTimeline();
        if (!cancelled) setTimelineData(data);
      } catch (err: any) {
        if (!cancelled)
          setError(err?.message || 'Failed to load full timeline');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentWeekDays = useMemo(() => {
    if (!timelineData) return [];
    return timelineData.timeline.filter(
      (day: any) => day.week === timelineData.course.currentWeek
    );
  }, [timelineData]);

  const stats = timelineData?.course ?? {
    currentWeek,
    progress: 0,
    totalWeeks: 8,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 20) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with back button */}
      <View style={styles.header}>
        <ScreenBackButton onClick={onBack} />
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Full Timeline</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Mode Tabs */}
      <View style={styles.toggleContainer}>
        <HomeViewToggle
          viewMode="timeline"
          onViewModeChange={onSwitchMode as any}
        />
      </View>

      {/* Learning Journey Badge */}
      <View style={styles.journeyBadge}>
        <Feather name="zap" size={16} color="#fff" />
        <Text style={styles.journeyBadgeText}>Learning Journey</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Your Course Timeline</Text>
        <Text style={styles.heroDesc}>
          Track your progress through personalized learning activities and see
          how far you've come.
        </Text>
      </View>

      {/* Stats Grid - 3 columns */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statCardContent}>
            <Text style={styles.statValue}>{stats.currentWeek}</Text>
            <View style={[styles.statIcon, { backgroundColor: '#2879ff' }]}>
              <Feather name="calendar" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.statLabel}>Current Week</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statCardContent}>
            <Text style={styles.statValue}>{stats.progress}%</Text>
            <View style={[styles.statIcon, { backgroundColor: '#12b896' }]}>
              <Feather name="message-square" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statCardContent}>
            <Text style={styles.statValue}>{stats.totalWeeks}</Text>
            <View style={[styles.statIcon, { backgroundColor: '#bb51dc' }]}>
              <Feather name="file-text" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.statLabel}>Total Weeks</Text>
        </View>
      </View>

      {/* Current Week Timeline */}
      <View style={styles.timelineSection}>
        <Text style={styles.timelineTitle}>Current Week</Text>

        {loading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading your timeline...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.timelineRow}>
            {/* Dot column */}
            <View style={styles.dotColumn}>
              {currentWeekDays.map((day: any, index: number) => {
                let dotColor = '#2949ff';
                if (day.isCompleted) dotColor = '#22c55e';
                else if (day.isCurrentDay) dotColor = '#fb7185';
                else if (day.isPast) dotColor = '#fbbf24';

                return (
                  <View
                    key={`${day.week}-${day.day}`}
                    style={styles.dotColumnItem}
                  >
                    <View style={[styles.dot, { backgroundColor: dotColor }]} />
                    {index < currentWeekDays.length - 1 ? (
                      <View style={styles.dotLine} />
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* Card column */}
            <View style={styles.cardColumn}>
              {currentWeekDays.map((day: any, index: number) => {
                let statusText = 'Upcoming';
                if (day.isCompleted) statusText = 'Completed';
                else if (day.isCurrentDay) statusText = 'Today';
                else if (day.isPast) statusText = 'Missed';

                const actionText =
                  day.dayType === 'speaking_exam'
                    ? 'Weekly Exam'
                    : 'All Activities';

                return (
                  <TimelineWeekCard
                    key={`${day.week}-${day.day}`}
                    title={`Day ${day.day}`}
                    subtitle={
                      day.personalizedTopic?.title || 'Personalized activity'
                    }
                    week={day.week}
                    statusText={statusText}
                    date={formatLocalDate(day.date)}
                    actionText={actionText}
                    isCurrent={day.isCurrentDay || index === 0}
                  />
                );
              })}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
  },
  headerSpacer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 33.6,
    color: '#fff',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleContainer: {
    marginTop: 24,
  },
  journeyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 32,
    backgroundColor: '#133395',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },
  journeyBadgeText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22.4,
    color: '#fff',
  },
  heroSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 33.6,
    letterSpacing: 0.14,
    color: '#fff',
    textAlign: 'center',
  },
  heroDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#c6c6c6',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 28.8,
    letterSpacing: 0.12,
    color: '#fff',
  },
  statIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    marginTop: 24,
    fontSize: 12,
    lineHeight: 16.8,
    color: '#c6c6c6',
  },
  timelineSection: {
    marginTop: 32,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
    color: '#fff',
  },
  timelineRow: {
    flexDirection: 'row',
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
    minHeight: 148,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  cardColumn: {
    flex: 1,
    gap: 16,
  },
  weekCard: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    padding: 14,
  },
  weekCardCurrent: {
    backgroundColor: 'rgba(251,113,133,0.15)',
  },
  weekCardDimmed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  weekCardTop: {
    flexDirection: 'row',
    gap: 8,
  },
  weekCardIcon: {
    width: 43,
    height: 43,
    borderRadius: 6,
    backgroundColor: '#2949ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekCardInfo: {
    flex: 1,
    minWidth: 0,
  },
  weekCardBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  weekCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22.4,
    color: '#fff',
  },
  weekBadge: {
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  weekBadgeText: {
    fontSize: 12,
    lineHeight: 16.8,
    color: '#fff',
  },
  statusBadgeCompleted: {
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeCompletedText: {
    fontSize: 12,
    lineHeight: 16.8,
    color: '#22c55e',
  },
  statusBadgeToday: {
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(251,113,133,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeTodayText: {
    fontSize: 12,
    lineHeight: 16.8,
    color: '#fb7185',
  },
  statusBadgeMissed: {
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,67,15,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeMissedText: {
    fontSize: 12,
    lineHeight: 16.8,
    color: '#ff3a3a',
  },
  statusBadgeUpcoming: {
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(41,73,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeUpcomingText: {
    fontSize: 12,
    lineHeight: 16.8,
    color: '#2949ff',
  },
  weekCardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16.8,
    color: '#c6c6c6',
  },
  weekCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  weekCardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    lineHeight: 16.8,
    color: '#c6c6c6',
  },
  actionText: {
    fontSize: 14,
    lineHeight: 19.6,
    color: '#fff',
  },
  loadingCard: {
    marginTop: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#c6c6c6',
  },
  errorCard: {
    marginTop: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#fda4af',
  },
});
