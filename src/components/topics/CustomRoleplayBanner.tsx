import React, { useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TopicCard } from './TopicCard';
import type { Topic } from '@/types/topics';

export interface CustomRoleplayBannerProps {
  roleplays: Topic[];
  onDiscuss: (topic: Topic, categoryName: string) => void;
  onCreateClick: () => void;
}

const alinaAvatar = require('../../../assets/avatar_intro.svg');

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
        {/* Background gradient exactly matching Today's Plan card on homescreen */}
        <LinearGradient
          colors={['rgba(210,131,255,0.23)', 'rgba(40,32,110,0.01)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Main Banner Row: Left CTA + Right Avatar */}
        <View style={styles.heroRow}>
          {/* Left Column: Title, Subtitle, CTA */}
          <View style={styles.leftColumn}>
            {/* Title */}
            <Text style={styles.title}>
              Custom <Text style={styles.titleGradient}>AI Roleplay</Text>
            </Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Practice any real-world scenario you imagine with your AI partner.
            </Text>

            {/* CTA Button (Strict radius <= 8px) */}
            <Pressable
              onPress={onCreateClick}
              style={({ pressed }) => [
                styles.createButtonWrapper,
                pressed && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={['#2949ff', '#8752fe', '#b55cff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add" size={15} color="#fff" />
                <Text style={styles.createButtonText}>Create Roleplay</Text>
                <Ionicons name="arrow-forward" size={13} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>

          {/* Right Column: Coach Avatar from Today's Plan reference (zoomed) */}
          <View style={styles.avatarColumn}>
            <ExpoImage
              source={alinaAvatar}
              style={styles.avatarImage}
              contentFit="contain"
              pointerEvents="none"
            />
          </View>
        </View>

        {/* Roleplays horizontal carousel */}
        {hasRoleplays && (
          <View style={styles.carouselContainer}>
            <View style={styles.carouselHeader}>
              <Text style={styles.sectionLabel}>
                Your Saved Scenarios ({roleplays.length})
              </Text>

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
                      size={15}
                      color={
                        scrolledFromStart
                          ? 'rgba(255,255,255,0.85)'
                          : 'rgba(255,255,255,0.25)'
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
                      size={15}
                      color={
                        scrolledToEnd
                          ? 'rgba(255,255,255,0.25)'
                          : 'rgba(255,255,255,0.85)'
                      }
                    />
                  </Pressable>
                </View>
              )}
            </View>

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
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  cardContainer: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 148,
  },
  leftColumn: {
    flex: 1,
    paddingRight: 8,
    maxWidth: '62%',
    zIndex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 24,
    letterSpacing: 0.12,
    marginBottom: 4,
  },
  titleGradient: {
    color: '#d283ff',
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13.5,
    fontFamily: 'Poppins',
    lineHeight: 18.5,
    marginBottom: 14,
  },
  createButtonWrapper: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#2949ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  avatarColumn: {
    position: 'absolute',
    bottom: -18,
    right: -10,
    width: 145,
    height: 170,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  avatarImage: {
    width: 145,
    height: 170,
    transform: [{ scale: 1.15 }],
  },
  carouselContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  carouselHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    color: 'rgba(181, 92, 255, 0.85)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  arrowsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scrollArrow: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArrowDisabled: {
    opacity: 0.25,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 2,
  },
  cardWrapper: {
    width: 114,
    height: 140,
  },
});
