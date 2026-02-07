/**
 * Topics Screen
 * 
 * Browse and select learning topics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadTopics, selectTopics, selectTopicsLoading, selectTopicsError } from '../../store/slices/topicsSlice';
import TopicCard, { Topic } from '../../components/learning/TopicCard';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface TopicsScreenProps {
  navigation: any;
}

const TopicsScreen: React.FC<TopicsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const topics = useAppSelector(selectTopics);
  const loading = useAppSelector(selectTopicsLoading);
  const error = useAppSelector(selectTopicsError);
  
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  // Load topics from API on component mount
  useEffect(() => {
    dispatch(loadTopics());
  }, [dispatch]);

  // Show error alert if loading fails
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleTopicPress = (topic: Topic) => {
    // Navigate to PracticeScreen within learning stack
    navigation.navigate('PracticeScreen', { topicId: topic.id, topicName: topic.title });
  };

  const filteredTopics = selectedLevel === 'all'
    ? topics
    : topics.filter((t) => t.level === selectedLevel);

  const levelButtons = [
    { label: 'All', value: 'all' as const },
    { label: 'Beginner', value: 'beginner' as const },
    { label: 'Intermediate', value: 'intermediate' as const },
    { label: 'Advanced', value: 'advanced' as const },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Topics</Text>
        <Text style={styles.subtitle}>Choose a topic to practice</Text>
      </View>

      {/* Level Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {levelButtons.map((btn) => (
          <Pressable
            key={btn.value}
            style={[
              styles.filterButton,
              selectedLevel === btn.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedLevel(btn.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedLevel === btn.value && styles.filterButtonTextActive,
              ]}
            >
              {btn.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Topics List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredTopics.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No topics available</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.topicsScroll}
          contentContainerStyle={styles.topicsContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onPress={handleTopicPress}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// Pressable import needed
import { Pressable } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
    fontSize: 14,
    color: '#999',
  },
  filterScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  topicsScroll: {
    flex: 1,
  },
  topicsContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default TopicsScreen;
