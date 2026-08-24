import React, { useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TopicCard } from './TopicCard';
import type { TopicCategory as TopicCategoryType, Topic } from '@/types/topics';

export interface TopicCategoryProps {
  category: TopicCategoryType;
  onDiscuss: (topic: Topic, categoryName: string) => void;
  onCustomClick: () => void;
}

export function TopicCategory({
  category,
  onDiscuss,
  onCustomClick,
}: TopicCategoryProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [scrolledFromStart, setScrolledFromStart] = useState(false);

  const SCROLL_AMOUNT = 144 * 3;

  const isRoleplayCategory = category.category_name === 'Role Play Scenarios';

  const handleScrollBack = useCallback(() => {
    scrollRef.current?.scrollTo({ x: 0, animated: true });
  }, []);

  const handleScrollForward = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleScroll = useCallback((e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const atEnd =
      contentOffset.x + layoutMeasurement.width >= contentSize.width - 8;
    setScrolledToEnd(atEnd);
    setScrolledFromStart(contentOffset.x > 8);
  }, []);

  const sortedTopics = [...category.topics]
    .filter((t) => !t.isCustom)
    .sort((a, b) => {
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
  const displayedTopics = sortedTopics;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.categoryTitle}>{category.category_name}</Text>
        {isRoleplayCategory ? (
          <Pressable onPress={onCustomClick} style={styles.plusButton}>
            <LinearGradient
              colors={['#2949ff', '#b55cff']}
              style={styles.plusGradient}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </LinearGradient>
          </Pressable>
        ) : sortedTopics.length > initialVisibleCount ? (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable
              onPress={handleScrollBack}
              disabled={!scrolledFromStart}
              style={[
                styles.scrollArrow,
                !scrolledFromStart && styles.scrollArrowDisabled,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={
                  scrolledFromStart
                    ? 'rgba(255,255,255,0.8)'
                    : 'rgba(255,255,255,0.3)'
                }
              />
            </Pressable>
            <Pressable
              onPress={handleScrollForward}
              disabled={scrolledToEnd}
              style={[
                styles.scrollArrow,
                scrolledToEnd && styles.scrollArrowDisabled,
              ]}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={
                  scrolledToEnd
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(255,255,255,0.8)'
                }
              />
            </Pressable>
          </View>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {displayedTopics.map((topic) => (
          <View key={topic.id || topic.title} style={styles.cardWrapper}>
            <TopicCard
              topic={topic}
              onDiscuss={onDiscuss}
              onCustomClick={onCustomClick}
              categoryName={category.category_name}
            />
          </View>
        ))}
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
  plusButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    shadowColor: 'rgba(84,86,255,0.26)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    elevation: 8,
  },
  plusGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArrowDisabled: {
    opacity: 0.3,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 4,
  },
  cardWrapper: {
    width: 128,
    height: 146,
    flexShrink: 0,
  },
});
