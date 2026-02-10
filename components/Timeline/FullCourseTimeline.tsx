/**
 * FullCourseTimeline Component (React Native)
 * 
 * Shows full course timeline with week selector.
 * Matches Next.js implementation.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import { courseService } from '@/service/CourseService';
import { formatLocalDate } from '@/utils/timezoneUtils';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface TimelineDay {
  week: number;
  day: number;
  dayIndex: number;
  date: string;
  dayType: string;
  isCompleted: boolean;
  isCurrentDay: boolean;
  isPast: boolean;
  personalizedTopic?: {
    title: string;
    description?: string;
    prompt?: string;
    imageUrl?: string;
    category?: string;
  } | null;
  progress?: {
    speaking_duration_seconds?: number;
  };
}

interface CourseTimeline {
  timeline: TimelineDay[];
  course: {
    totalWeeks: number;
    currentWeek: number;
    progress: number;
  };
}

const FullCourseTimeline: React.FC = () => {
  const [timelineData, setTimelineData] = useState<CourseTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadTimeline();
    } else if (!isAuthenticated) {
      setLoading(false);
      hasLoadedRef.current = false;
    }
  }, [isAuthenticated]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await courseService.getFullCourseTimeline();
      setTimelineData(data);

      if (data.course?.currentWeek) {
        setSelectedWeek(data.course.currentWeek);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const getDayTypeDetails = (dayType: string) => {
    switch (dayType) {
      case 'all_activities':
        return {
          icon: 'mic',
          text: 'All Activities',
          shortText: 'All',
          color: '#6A5AE0',
        };
      case 'speaking_exam':
        return {
          icon: 'trophy',
          text: 'Weekly Exam',
          shortText: 'Exam',
          color: '#f59e0b',
        };
      default:
        return {
          icon: 'calendar',
          text: 'Unknown',
          shortText: 'Unknown',
          color: '#6b7280',
        };
    }
  };

  const getStatusDetails = (day: TimelineDay) => {
    if (day.isCompleted) {
      return {
        icon: 'checkmark-circle',
        text: 'Completed',
        color: '#10b981',
      };
    } else if (day.isCurrentDay) {
      return {
        icon: 'flash',
        text: 'Today',
        color: '#fbbf24',
      };
    } else if (day.isPast && !day.isCompleted) {
      return {
        icon: 'time',
        text: 'Missed',
        color: '#ef4444',
      };
    } else {
      return {
        icon: 'star',
        text: 'Upcoming',
        color: '#6b7280',
      };
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authCard}>
          <Ionicons name="people" size={48} color="rgba(203, 213, 225, 1)" />
          <Text style={styles.authTitle}>Authentication Required</Text>
          <Text style={styles.authText}>
            Please log in to view your personalized course timeline
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !timelineData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorText}>{error || 'Failed to load your course timeline'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTimeline}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { timeline, course } = timelineData;
  const totalWeeks = course.totalWeeks || 12;
  const timelineDays = timeline.filter((day) => day.week === selectedWeek);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Ionicons name="sparkles" size={16} color="#a855f7" />
          <Text style={styles.headerBadgeText}>Learning Journey</Text>
        </View>
        <Text style={styles.title}>Your Course Timeline</Text>
        <Text style={styles.subtitle}>
          Track your progress through personalized learning activities and see how far you've come.
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#6A5AE0' }]}>
            <Ionicons name="calendar" size={24} color="#fff" />
          </View>
          <Text style={styles.statValue}>{course.currentWeek}</Text>
          <Text style={styles.statLabel}>Current Week</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#10b981' }]}>
            <Ionicons name="trending-up" size={24} color="#fff" />
          </View>
          <Text style={styles.statValue}>{course.progress}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#a855f7' }]}>
            <Ionicons name="flag" size={24} color="#fff" />
          </View>
          <Text style={styles.statValue}>{totalWeeks}</Text>
          <Text style={styles.statLabel}>Total Weeks</Text>
        </View>
      </View>

      {/* Week Selector */}
      <View style={styles.weekSelectorContainer}>
        <View style={styles.weekSelectorHeader}>
          <View style={styles.weekSelectorTitleContainer}>
            <View style={styles.rocketIcon}>
              <Ionicons name="rocket" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.weekSelectorTitle}>Week {selectedWeek} Journey</Text>
              <Text style={styles.weekSelectorSubtitle}>
                {timelineDays.length} activities • {course.progress}% complete
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.weekSelectorButton}
            onPress={() => setIsWeekSelectorOpen(true)}
          >
            <Text style={styles.weekSelectorButtonText}>Week {selectedWeek}</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color="rgba(203, 213, 225, 1)"
            />
          </TouchableOpacity>
        </View>

        {/* Week Selector Modal */}
        <Modal
          visible={isWeekSelectorOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsWeekSelectorOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsWeekSelectorOpen(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Week</Text>
              <ScrollView>
                {Array.from({ length: totalWeeks }, (_, i) => (
                  <TouchableOpacity
                    key={i + 1}
                    style={[
                      styles.weekOption,
                      selectedWeek === i + 1 && styles.weekOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedWeek(i + 1);
                      setIsWeekSelectorOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.weekOptionText,
                        selectedWeek === i + 1 && styles.weekOptionTextSelected,
                      ]}
                    >
                      Week {i + 1}
                    </Text>
                    {selectedWeek === i + 1 && (
                      <Ionicons name="checkmark" size={16} color="#a855f7" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* Timeline */}
      {timelineDays.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book" size={48} color="rgba(203, 213, 225, 1)" />
          <Text style={styles.emptyTitle}>No Activities Found</Text>
          <Text style={styles.emptyText}>No activities available for Week {selectedWeek}</Text>
        </View>
      ) : (
        <View style={styles.timelineContainer}>
          <View style={styles.timelineLine} />
          {timelineDays.map((day, index) => {
            const dayTypeDetails = getDayTypeDetails(day.dayType);
            const statusDetails = getStatusDetails(day);

            return (
              <View key={day.dayIndex} style={styles.timelineCard}>
                <View
                  style={[
                    styles.timelineDot,
                    day.isCurrentDay && !day.isCompleted && styles.timelineDotCurrent,
                    day.isCompleted && styles.timelineDotCompleted,
                    day.isPast && !day.isCompleted && styles.timelineDotMissed,
                  ]}
                >
                  <Ionicons
                    name={dayTypeDetails.icon as any}
                    size={16}
                    color="#fff"
                  />
                </View>
                <View
                  style={[
                    styles.cardContent,
                    day.isCurrentDay &&
                      !day.isCompleted &&
                      styles.cardContentCurrent,
                    day.isCompleted && styles.cardContentCompleted,
                    day.isPast && !day.isCompleted && styles.cardContentMissed,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View
                        style={[
                          styles.dayTypeIcon,
                          { backgroundColor: dayTypeDetails.color },
                        ]}
                      >
                        <Ionicons
                          name={dayTypeDetails.icon as any}
                          size={20}
                          color="#fff"
                        />
                      </View>
                      <View>
                        <View style={styles.cardTitleRow}>
                          <Text style={styles.cardTitle}>Day {day.day}</Text>
                          <View style={styles.weekBadge}>
                            <Text style={styles.weekBadgeText}>Week {day.week}</Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: statusDetails.color + '20' },
                            ]}
                          >
                            <Ionicons
                              name={statusDetails.icon as any}
                              size={12}
                              color={statusDetails.color}
                            />
                            <Text
                              style={[styles.statusText, { color: statusDetails.color }]}
                            >
                              {statusDetails.text}
                            </Text>
                          </View>
                        </View>
                        {day.personalizedTopic?.title && (
                          <Text style={styles.topicTitle}>
                            {day.personalizedTopic.title}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar" size={14} color="rgba(203, 213, 225, 1)" />
                      <Text style={styles.metaText}>{formatLocalDate(day.date)}</Text>
                    </View>
                    {(day.dayType === 'all_activities' || day.dayType === 'speaking_exam') &&
                      typeof day.progress?.speaking_duration_seconds === 'number' &&
                      day.progress.speaking_duration_seconds > 0 && (
                        <View style={styles.metaItem}>
                          <Ionicons name="mic" size={14} color="#7B70FF" />
                          <Text style={styles.metaText}>
                            {courseService.formatSpeakingTime(
                              day.progress.speaking_duration_seconds ?? 0
                            )}{' '}
                            spoken
                          </Text>
                        </View>
                      )}
                    <View
                      style={[
                        styles.dayTypeBadge,
                        { backgroundColor: dayTypeDetails.color + '20' },
                      ]}
                    >
                      <Text style={styles.dayTypeText}>{dayTypeDetails.shortText}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    maxWidth: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    marginBottom: spacing.md,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c084fc',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(203, 213, 225, 1)',
    textAlign: 'center',
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(203, 213, 225, 1)',
  },
  weekSelectorContainer: {
    marginBottom: spacing.xl,
  },
  weekSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  weekSelectorTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  rocketIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekSelectorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  weekSelectorSubtitle: {
    fontSize: 11,
    color: 'rgba(203, 213, 225, 1)',
  },
  weekSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 1)',
  },
  weekSelectorButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 12,
    padding: spacing.md,
    width: '100%',
    maxWidth: 300,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.md,
  },
  weekOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  weekOptionSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderLeftWidth: 2,
    borderLeftColor: '#a855f7',
  },
  weekOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(203, 213, 225, 1)',
  },
  weekOptionTextSelected: {
    color: '#c084fc',
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#a855f7',
  },
  timelineCard: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  timelineDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#6b7280',
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineDotCurrent: {
    borderColor: '#fbbf24',
    backgroundColor: '#fbbf24',
  },
  timelineDotCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  timelineDotMissed: {
    borderColor: '#ef4444',
    backgroundColor: '#ef4444',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    maxWidth: '100%',
  },
  cardContentCurrent: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  cardContentCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cardContentMissed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cardHeader: {
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  dayTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  weekBadge: {
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 1)',
  },
  weekBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(203, 213, 225, 1)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  topicTitle: {
    fontSize: 14,
    color: '#c084fc',
    marginTop: spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(203, 213, 225, 1)',
  },
  dayTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(203, 213, 225, 1)',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  authCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  authTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  authText: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
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
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FullCourseTimeline;
