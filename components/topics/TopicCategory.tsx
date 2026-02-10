/**
 * TopicCategory Component
 * 
 * Category section with expand/collapse functionality.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopicCard } from './TopicCard';
import type { TopicCategory as TopicCategoryType, Topic } from '@/types/topics';
import { CUSTOM_ROLE_PLAY_TOPIC } from '@/lib/topics/processCategories';

export interface TopicCategoryProps {
  category: TopicCategoryType;
  onDiscuss: (topic: Topic, categoryName: string) => void;
  onCustomClick: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function TopicCategory({
  category,
  onDiscuss,
  onCustomClick,
  isExpanded: controlledExpanded,
  onToggleExpand,
}: TopicCategoryProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggleExpanded = onToggleExpand || (() => setInternalExpanded((prev) => !prev));

  const sortedTopics = [...category.topics].sort((a, b) => {
    if (a.id === CUSTOM_ROLE_PLAY_TOPIC.id) return -1;
    if (b.id === CUSTOM_ROLE_PLAY_TOPIC.id) return 1;

    const getDate = (topic: Topic) => {
      if (topic.updated_at) return new Date(topic.updated_at);
      if (topic.created_at) return new Date(topic.created_at);
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() - 1);
      return defaultDate;
    };

    const dateA = getDate(a);
    const dateB = getDate(b);
    return dateB.getTime() - dateA.getTime();
  });

  const initialVisibleCount = 3;
  const newestTopics = sortedTopics.slice(0, initialVisibleCount);
  const displayedTopics = isExpanded ? sortedTopics : newestTopics;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.categoryTitle}>{category.category_name}</Text>
        {sortedTopics.length > initialVisibleCount && (
          <Pressable onPress={toggleExpanded} style={styles.toggleButton}>
            <Text style={styles.toggleText}>{isExpanded ? 'Show Less' : 'Show All'}</Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#d1d5db"
            />
          </Pressable>
        )}
      </View>

      <View style={styles.topicsGrid}>
        {displayedTopics.map((topic) => (
          <View key={topic.id || topic.title} style={styles.topicWrapper}>
            <TopicCard
              topic={topic}
              onDiscuss={onDiscuss}
              onCustomClick={onCustomClick}
              categoryName={category.category_name}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    color: '#d1d5db',
    fontSize: 12,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  topicWrapper: {
    width: '48%',
  },
});
