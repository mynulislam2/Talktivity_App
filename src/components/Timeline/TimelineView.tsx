/**
 * Timeline View Component - Past learning activities
 *
 * Shows:
 * - Activities from last 7 days
 * - Topic, duration, score
 * - Date grouping
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface TimelineActivity {
  id: string;
  date: string;
  topic: string;
  type: 'practice' | 'call' | 'roleplay';
  duration: number; // in seconds
  score: number; // 0-100
  scenarios?: number;
}

interface TimelineViewProps {
  activities: TimelineActivity[];
  loading?: boolean;
  onActivityPress?: (activity: TimelineActivity) => void;
  onSeeAllPress?: () => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  activities,
  loading = false,
  onActivityPress,
  onSeeAllPress,
}) => {
  const [groupedActivities, setGroupedActivities] = useState<
    Record<string, TimelineActivity[]>
  >({});

  useEffect(() => {
    if (activities && activities.length > 0) {
      const grouped = activities.reduce((acc, activity) => {
        const date = new Date(activity.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(activity);
        return acc;
      }, {} as Record<string, TimelineActivity[]>);

      setGroupedActivities(grouped);
    }
  }, [activities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'practice':
        return 'school';
      case 'call':
        return 'call';
      case 'roleplay':
        return 'theater';
      default:
        return 'book';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'practice':
        return '#6A5AE0'; // blue
      case 'call':
        return '#10b981'; // emerald
      case 'roleplay':
        return '#f59e0b'; // amber
      default:
        return colors.primary;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getDurationText = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return `${seconds}s`;
    return `${minutes}m`;
  };

  const renderActivityItem = ({ item }: { item: TimelineActivity }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => onActivityPress?.(item)}
      activeOpacity={0.7}
    >
      {/* Icon and content */}
      <View style={styles.activityContent}>
        <View
          style={[
            styles.activityIcon,
            { backgroundColor: getActivityColor(item.type) + '20' },
          ]}
        >
          <Ionicons
            name={getActivityIcon(item.type) as any}
            size={20}
            color={getActivityColor(item.type)}
          />
        </View>

        <View style={styles.activityDetails}>
          <Text style={styles.activityTitle}>{item.topic}</Text>
          <View style={styles.activityMeta}>
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={12}
                color={colors.text.secondary}
              />
              <Text style={styles.metaText}>
                {getDurationText(item.duration)}
              </Text>
            </View>
            {item.scenarios && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="layers-outline"
                  size={12}
                  color={colors.text.secondary}
                />
                <Text style={styles.metaText}>{item.scenarios} scenarios</Text>
              </View>
            )}
            <Text
              style={[
                styles.activityType,
                { color: getActivityColor(item.type) },
              ]}
            >
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Score badge */}
      <View
        style={[
          styles.scoreBadge,
          { backgroundColor: getScoreColor(item.score) + '20' },
        ]}
      >
        <Text style={[styles.scoreText, { color: getScoreColor(item.score) }]}>
          {item.score}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderDateGroup = (date: string, items: TimelineActivity[]) => (
    <View key={date} style={styles.dateGroup}>
      {/* Date header */}
      <View style={styles.dateHeader}>
        <View style={styles.dateLine} />
        <Text style={styles.dateText}>{date}</Text>
        <View style={styles.dateLine} />
      </View>

      {/* Activities for this date */}
      <FlatList
        data={items}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={'history' as any}
          size={48}
          color={colors.text.tertiary}
        />
        <Text style={styles.emptyTitle}>No activities yet</Text>
        <Text style={styles.emptyText}>
          Start your first lesson to see your learning timeline
        </Text>
      </View>
    );
  }

  const dateGroups = Object.entries(groupedActivities);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Activity</Text>
        {activities.length > 5 && (
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={dateGroups}
        renderItem={({ item: [date, items] }) =>
          renderDateGroup(date, items as TimelineActivity[])
        }
        keyExtractor={([date]) => date}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        contentContainerStyle={styles.listContent}
      />

      {/* Summary stats */}
      {activities.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Time</Text>
            <Text style={styles.summaryValue}>
              {Math.floor(
                activities.reduce((acc, act) => acc + act.duration, 0) / 60
              )}
              m
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Activities</Text>
            <Text style={styles.summaryValue}>{activities.length}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Avg Score</Text>
            <Text style={styles.summaryValue}>
              {Math.round(
                activities.reduce((acc, act) => acc + act.score, 0) /
                  activities.length
              )}
              %
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: colors.primary,
  },
  listContent: {
    gap: spacing.lg,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  dateGroup: {
    gap: spacing.md,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: colors.text.secondary,
    paddingHorizontal: spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
  },
  activityContent: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: colors.text.primary,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  activityType: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreBadge: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.dark.backgroundCard,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: colors.primary,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.brand.cardBorder,
  },
});

export default TimelineView;
