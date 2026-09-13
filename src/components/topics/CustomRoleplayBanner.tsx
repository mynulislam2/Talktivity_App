import React, { useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TopicCard } from './TopicCard';
import type { Topic } from '@/types/topics';

export interface CustomRoleplayBannerProps {
  roleplays: Topic[];
  onDiscuss: (topic: Topic, categoryName: string) => void;
  onCreateClick: () => void;
}

export const CustomRoleplayBanner: React.FC<CustomRoleplayBannerProps> = ({
  roleplays,
  onDiscuss,
  onCreateClick,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [scrolledFromStart, setScrolledFromStart] = useState(false);

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

  const hasRoleplays = roleplays.length > 0;

  return (
    <View style={styles.outerContainer}>
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={['rgba(41, 73, 255, 0.16)', 'rgba(181, 92, 255, 0.16)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Header content */}
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithIcon}>
              <Text style={styles.emoji}>🎭</Text>
              <Text style={styles.title}>Custom AI Roleplay</Text>
            </View>
            <Text style={styles.subtitle}>
              Practice any real-world scenario with your AI partner.
            </Text>
          </View>

          <View style={styles.actionRow}>
            {roleplays.length >= 4 && (
              <View style={styles.arrowsRow}>
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
                    size={16}
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
                    size={16}
                    color={
                      scrolledToEnd
                        ? 'rgba(255,255,255,0.3)'
                        : 'rgba(255,255,255,0.8)'
                    }
                  />
                </Pressable>
              </View>
            )}

            <Pressable onPress={onCreateClick} style={styles.createButtonWrapper}>
              <LinearGradient
                colors={['#2949ff', '#b55cff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.createButtonText}>Create Roleplay</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Roleplays horizontal carousel */}
        {hasRoleplays && (
          <View style={styles.carouselContainer}>
            <Text style={styles.sectionLabel}>
              Your Saved Scenarios ({roleplays.length})
            </Text>

            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.scrollContent}
            >
              {roleplays.map((topic) => (
                <View key={topic.id || topic.title} style={styles.cardWrapper}>
                  <TopicCard
                    topic={topic}
                    onDiscuss={onDiscuss}
                    onCustomClick={onCreateClick}
                    categoryName="Role Play Scenarios"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardContainer: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 35, 0.4)',
  },
  headerRow: {
    flexDirection: 'column',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scrollArrow: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArrowDisabled: {
    opacity: 0.3,
  },
  createButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#5456ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  carouselContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionLabel: {
    color: 'rgba(181, 92, 255, 0.85)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 2,
  },
  cardWrapper: {
    width: 124,
    height: 148,
  },
});
