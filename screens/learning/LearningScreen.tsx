/**
 * Learning Screen
 * 
 * Learn section showing:
 * - Course selection
 * - Practice sessions
 * - Call sessions
 * - Roleplay scenarios
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { LearningScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadTopics, selectTopics, selectTopicsLoading, selectTopicsError } from '../../store/slices/topicsSlice';
import { loadProgressAnalytics, selectProgressAnalytics, selectProgressLoading, selectProgressError } from '../../store/slices/progressAnalyticsSlice';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

const LearningScreen: React.FC<LearningScreenProps> = () => {
  const dispatch = useAppDispatch();
  const topics = useAppSelector(selectTopics);
  const topicsLoading = useAppSelector(selectTopicsLoading);
  const topicsError = useAppSelector(selectTopicsError);
  const analytics = useAppSelector(selectProgressAnalytics);
  const analyticsLoading = useAppSelector(selectProgressLoading);
  const analyticsError = useAppSelector(selectProgressError);

  // Load topics and analytics on mount
  useEffect(() => {
    dispatch(loadTopics());
    dispatch(loadProgressAnalytics());
  }, [dispatch]);

  // Show error alerts
  useEffect(() => {
    if (topicsError) {
      Alert.alert('Error Loading Topics', topicsError);
    }
  }, [topicsError]);

  useEffect(() => {
    if (analyticsError) {
      Alert.alert('Error Loading Analytics', analyticsError);
    }
  }, [analyticsError]);

  const learningModes = [
    {
      id: 'practice',
      title: 'Practice',
      icon: 'book',
      description: 'Improve your vocabulary and grammar',
      color: '#4CAF50',
    },
    {
      id: 'call',
      title: 'Call Session',
      icon: 'call',
      description: 'Have real-time conversations',
      color: '#2196F3',
    },
    {
      id: 'roleplay',
      title: 'Roleplay',
      icon: 'theater',
      description: 'Practice real-world scenarios',
      color: '#FF9800',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Learning</Text>
          <Text style={styles.subtitle}>Choose how you want to learn</Text>
        </View>

        {/* Learning Modes */}
        <View style={styles.section}>
          {learningModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.modeCard, { borderLeftColor: mode.color }]}
            >
              <View style={styles.modeIcon}>
                <Ionicons name={mode.icon as any} size={32} color={mode.color} />
              </View>
              <View style={styles.modeContent}>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeDesc}>{mode.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommended Courses/Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Topics</Text>
          {topicsLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : topics && topics.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: spacing.lg }}
            >
              {topics.slice(0, 3).map((topic) => (
                <TouchableOpacity key={topic.id} style={styles.courseCard}>
                  <View style={styles.courseBadge}>
                    <Text style={styles.badgeText}>{topic.level.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.courseTitle}>{topic.title}</Text>
                  <Text style={styles.courseDesc}>{topic.description}</Text>
                  <View style={styles.courseFooter}>
                    <Text style={styles.courseLevel}>{topic.level}</Text>
                    <Text style={styles.courseLessons}>{topic.lessonsCount || 0} lessons</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No topics available</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          {analyticsLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{analytics?.totalSessions || 0}</Text>
                <Text style={styles.statName}>Sessions</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{Math.floor(((analytics?.practiceTime || 0) + (analytics?.roleplayTime || 0) + (analytics?.callTime || 0)) / 60)}</Text>
                <Text style={styles.statName}>Minutes</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{analytics?.vocabularyLearned || 0}</Text>
                <Text style={styles.statName}>Vocabulary</Text>
              </View>
            </View>
          )}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.md,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  modeDesc: {
    fontSize: 13,
    color: '#999',
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.sm,
  },
  courseDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  courseLevel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  courseLessons: {
    fontSize: 12,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statName: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
});

export default LearningScreen;
