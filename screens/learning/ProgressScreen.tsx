/**
 * Progress Screen
 * 
 * Display user's learning progress and statistics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ProgressChart from '../../components/learning/ProgressChart';
import StatsDisplay, { StatItem } from '../../components/learning/StatsDisplay';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadProgressAnalytics, selectProgressAnalytics, selectProgressAchievements, selectProgressLoading, selectProgressError } from '../../store/slices/progressAnalyticsSlice';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface ProgressScreenProps {
  navigation: any;
}

interface ProgressMetric {
  id: string;
  label: string;
  current: number;
  max: number;
  type: 'time' | 'count' | 'percentage';
}

const mockMetrics: ProgressMetric[] = [
  {
    id: '1',
    label: 'Practice Time',
    current: 120,
    max: 300,
    type: 'time',
  },
  {
    id: '2',
    label: 'Roleplay Sessions',
    current: 8,
    max: 20,
    type: 'count',
  },
  {
    id: '3',
    label: 'Vocabulary',
    current: 650,
    max: 1000,
    type: 'count',
  },
  {
    id: '4',
    label: 'Weekly Goal',
    current: 75,
    max: 100,
    type: 'percentage',
  },
];

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Step',
    description: 'Complete first practice session',
    icon: 'star',
    unlocked: true,
    unlockedDate: '2024-01-15',
  },
  {
    id: '2',
    title: 'conversationalist',
    description: 'Complete 5 roleplay sessions',
    icon: 'people',
    unlocked: true,
    unlockedDate: '2024-01-20',
  },
  {
    id: '3',
    title: 'Word Master',
    description: 'Learn 500 words',
    icon: 'book',
    unlocked: false,
  },
  {
    id: '4',
    title: 'Streak Master',
    description: 'Maintain 10-day streak',
    icon: 'flame',
    unlocked: false,
  },
];

const ProgressScreen: React.FC<ProgressScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const analytics = useAppSelector(selectProgressAnalytics);
  const achievements = useAppSelector(selectProgressAchievements);
  const loading = useAppSelector(selectProgressLoading);
  const error = useAppSelector(selectProgressError);
  
  const [selectedMetric, setSelectedMetric] = useState<ProgressMetric | null>(null);

  // Load analytics on mount
  useEffect(() => {
    dispatch(loadProgressAnalytics());
  }, [dispatch]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  // Build metrics from analytics data
  const metricsData: ProgressMetric[] = analytics ? [
    {
      id: '1',
      label: 'Practice Time',
      current: Math.floor((analytics.practiceTime || 0) / 60),
      max: 300,
      type: 'time',
    },
    {
      id: '2',
      label: 'Roleplay Sessions',
      current: analytics.roleplaySessions || 0,
      max: 20,
      type: 'count',
    },
    {
      id: '3',
      label: 'Vocabulary',
      current: analytics.vocabularyLearned || 0,
      max: 1000,
      type: 'count',
    },
    {
      id: '4',
      label: 'Weekly Goal',
      current: Math.min(100, Math.round((analytics.weeklyProgress || 0) * 100)),
      max: 100,
      type: 'percentage',
    },
  ] : mockMetrics;

  // Set initial selected metric
  useEffect(() => {
    if (selectedMetric === null && metricsData.length > 0) {
      setSelectedMetric(metricsData[0]);
    }
  }, [metricsData, selectedMetric]);

  // Overall statistics from analytics
  const totalTime = analytics ? (analytics.practiceTime || 0) + (analytics.roleplayTime || 0) + (analytics.callTime || 0) : 255;
  const totalSessions = analytics ? (analytics.practiceSessions || 0) + (analytics.roleplaySessions || 0) + (analytics.callSessions || 0) : 25;
  const currentStreak = analytics?.streak || 7;
  const totalXP = analytics?.totalXP || 1250;

  const overallStats: StatItem[] = [
    {
      label: 'Total Time',
      value: `${totalTime} min`,
      icon: 'timer',
      color: colors.primary,
    },
    {
      label: 'Sessions',
      value: totalSessions,
      icon: 'play-circle',
      color: '#4CAF50',
    },
    {
      label: 'Streak',
      value: `${currentStreak} days`,
      icon: 'flame',
      color: '#FF9800',
    },
    {
      label: 'XP',
      value: totalXP,
      icon: 'trophy',
      color: '#9C27B0',
    },
  ];

  const formatMetricValue = (metric: ProgressMetric) => {
    if (metric.type === 'time') {
      return `${metric.current} min`;
    }
    return metric.current.toString();
  };

  const getMetricColor = (percentage: number) => {
    if (percentage >= 75) return '#4CAF50'; // green
    if (percentage >= 50) return '#FF9800'; // orange
    return '#F44336'; // red
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Progress</Text>
            <Text style={styles.subtitle}>Your learning journey</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Overall Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Stats</Text>
          <StatsDisplay stats={overallStats} columns={2} />
        </View>

        {/* Progress Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Metrics</Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : (
            <>
          {/* Metric Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricSelector}
          >
            {metricsData.map((metric) => (
              <TouchableOpacity
                key={metric.id}
                style={[
                  styles.metricButton,
                  selectedMetric?.id === metric.id && styles.metricButtonActive,
                ]}
                onPress={() => setSelectedMetric(metric)}
              >
                <Text
                  style={[
                    styles.metricButtonText,
                    selectedMetric?.id === metric.id && styles.metricButtonTextActive,
                  ]}
                >
                  {metric.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
            </>
          )}

          {/* Selected Metric Display */}
          {selectedMetric && (
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricTitle}>{selectedMetric.label}</Text>
                <Text style={styles.metricValue}>
                  {formatMetricValue(selectedMetric)}/{selectedMetric.max}
                </Text>
              </View>

              <ProgressChart
                items={[
                  {
                    label: selectedMetric.label,
                    value: selectedMetric.current,
                    max: selectedMetric.max,
                    color: getMetricColor((selectedMetric.current / selectedMetric.max) * 100),
                  },
                ]}
              />

              <Text style={styles.metricPercentage}>
                {Math.round((selectedMetric.current / selectedMetric.max) * 100)}% Complete
              </Text>
            </View>
          )}
        </View>

        {/* Activity Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity This Week</Text>

          <View style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Ionicons name="book" size={24} color={colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Practice Sessions</Text>
                <Text style={styles.activityValue}>3 sessions • 120 minutes</Text>
              </View>
              <Text style={styles.activityBadge}>8</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Ionicons name="people" size={24} color="#FF9800" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Roleplay Sessions</Text>
                <Text style={styles.activityValue}>2 sessions • 90 minutes</Text>
              </View>
              <Text style={styles.activityBadge}>5</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Ionicons name="call" size={24} color="#4CAF50" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Direct Calls</Text>
                <Text style={styles.activityValue}>5 calls • 45 minutes</Text>
              </View>
              <Text style={styles.activityBadge}>12</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>

          <View style={styles.achievementsGrid}>
            {achievements && achievements.length > 0 ? achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    !achievement.unlocked && styles.achievementIconLocked,
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={32}
                    color={achievement.unlocked ? '#FFD700' : '#ccc'}
                  />
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text
                  style={[
                    styles.achievementDesc,
                    !achievement.unlocked && styles.achievementDescLocked,
                  ]}
                >
                  {achievement.description}
                </Text>
                {achievement.unlocked && (
                  <Text style={styles.achievementDate}>{achievement.unlockedDate}</Text>
                )}
              </View>
            )) : (
              <Text style={styles.emptyText}>No achievements yet. Keep learning!</Text>
            )}
          </View>
        </View>

        {/* Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Level</Text>

          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>Intermediate</Text>
              <Text style={styles.levelSubtitle}>Level 5</Text>
            </View>

            <View style={styles.levelProgress}>
              <View style={styles.levelProgressBar}>
                <View style={[styles.levelProgressFill, { width: '65%' }]} />
              </View>
              <Text style={styles.levelProgressText}>3,250 XP to next level</Text>
            </View>

            <Text style={styles.levelDescription}>
              Great progress! You're making excellent improvements in conversation skills.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.md,
  },
  metricSelector: {
    paddingBottom: spacing.lg,
  },
  metricButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: '#eee',
  },
  metricButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  metricButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  metricButtonTextActive: {
    color: '#fff',
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  metricPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  activityValue: {
    fontSize: 12,
    color: '#999',
  },
  activityBadge: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  achievementCardLocked: {
    borderColor: '#eee',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  achievementIconLocked: {
    backgroundColor: '#f5f5f5',
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
  achievementDescLocked: {
    color: '#ccc',
  },
  achievementDate: {
    fontSize: 10,
    color: '#999',
    marginTop: spacing.sm,
  },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  levelSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  levelProgress: {
    marginBottom: spacing.lg,
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  levelProgressText: {
    fontSize: 12,
    color: '#999',
  },
  levelDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
});

export default ProgressScreen;
