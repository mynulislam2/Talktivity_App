import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import ScreenBackground from '@/components/common/ScreenBackground';
import { vocabularyService } from '@/services/vocabulary';
import type {
  VocabularyHomeData,
  VocabularyTopic,
  VocabularyWordItem,
} from '@/types/vocabulary';

export default function VocabularyHomeScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<VocabularyHomeData | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    topics: VocabularyTopic[];
    words: VocabularyWordItem[];
  } | null>(null);
  const searchTimeoutRef = useRef<any>(null);

  const fetchHome = useCallback(async () => {
    setLoading(true);
    const res = await vocabularyService.getHome();
    if (res.success && res.data) {
      setHomeData(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  // Debounced search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim()) {
      setIsSearching(false);
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const res = await vocabularyService.search(text.trim());
      if (res.success && res.data) {
        setSearchResults(res.data);
      }
      setIsSearching(false);
    }, 280);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearching(false);
  };

  const handleOpenTopic = (topic: VocabularyTopic) => {
    navigation.navigate('VocabularyTopicScreen', {
      slug: topic.slug,
      topicTitle: topic.title,
    });
  };

  const dailyGoal = homeData?.daily_goal || { target: 10, practiced_today: 0 };
  const goalPercent = Math.min(
    100,
    Math.round((dailyGoal.practiced_today / (dailyGoal.target || 10)) * 100)
  );

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vocabulary Coach</Text>
          <TouchableOpacity
            style={styles.savedButton}
            onPress={() => navigation.navigate('VocabularySavedScreen')}
            activeOpacity={0.75}
          >
            <Feather name="bookmark" size={19} color="#fff" />
            {Number(homeData?.saved_words_count || 0) > 0 && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeText}>
                  {homeData?.saved_words_count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#8c8c8c" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search words, idioms, or topics..."
              placeholderTextColor="#8c8c8c"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color="#6a4bff" style={styles.searchAction} />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity onPress={handleClearSearch} style={styles.searchAction}>
                <Feather name="x" size={17} color="#c6c6c6" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2949ff" />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Search Results Display if Query present */}
            {searchQuery.trim().length > 0 ? (
              <View style={styles.searchResultsSection}>
                <Text style={styles.sectionTitle}>Search Results</Text>
                {searchResults &&
                (searchResults.topics.length > 0 || searchResults.words.length > 0) ? (
                  <>
                    {/* Matching Topics */}
                    {searchResults.topics.length > 0 && (
                      <View style={styles.searchGroup}>
                        <Text style={styles.searchGroupHeading}>Topics</Text>
                        {searchResults.topics.map((t) => (
                          <TouchableOpacity
                            key={t.id}
                            style={styles.searchResultItem}
                            activeOpacity={0.75}
                            onPress={() => handleOpenTopic(t)}
                          >
                            <Text style={styles.searchResultIcon}>{t.icon || '📚'}</Text>
                            <View style={styles.searchResultInfo}>
                              <Text style={styles.searchResultTitle}>{t.title}</Text>
                              <Text style={styles.searchResultMeta}>
                                {t.category} • {t.total_words} words
                              </Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#8c8c8c" />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Matching Words */}
                    {searchResults.words.length > 0 && (
                      <View style={styles.searchGroup}>
                        <Text style={styles.searchGroupHeading}>Words</Text>
                        {searchResults.words.map((w) => (
                          <TouchableOpacity
                            key={w.id}
                            style={styles.searchResultItem}
                            activeOpacity={0.75}
                            onPress={() => {
                              if (w.topic_slug) {
                                navigation.navigate('VocabularyTopicScreen', {
                                  slug: w.topic_slug,
                                  topicTitle: w.topic_title,
                                });
                              }
                            }}
                          >
                            <View style={styles.wordDot} />
                            <View style={styles.searchResultInfo}>
                              <View style={styles.wordTitleRow}>
                                <Text style={styles.searchResultTitle}>{w.word}</Text>
                                {w.ipa && <Text style={styles.searchResultIpa}>/{w.ipa}/</Text>}
                              </View>
                              <Text style={styles.searchResultDef} numberOfLines={1}>
                                {w.bangla_meaning} • {w.definition}
                              </Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#8c8c8c" />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                ) : !isSearching ? (
                  <View style={styles.emptySearchResult}>
                    <Text style={styles.emptySearchText}>
                      No words or topics found matching "{searchQuery}"
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <>
                {/* Daily Goal Streak Card */}
                <LinearGradient
                  colors={['rgba(210,131,255,0.20)', 'rgba(40,32,110,0.02)']}
                  style={styles.goalCard}
                >
                  <View style={styles.goalTopRow}>
                    <View style={styles.goalBadge}>
                      <MaterialCommunityIcons name="fire" size={16} color="#ff8b3d" />
                      <Text style={styles.goalBadgeText}>DAILY GOAL</Text>
                    </View>
                    <Text style={styles.goalScoreText}>
                      {dailyGoal.practiced_today} / {dailyGoal.target} words
                    </Text>
                  </View>

                  <Text style={styles.goalTitle}>
                    {dailyGoal.practiced_today >= dailyGoal.target
                      ? 'Goal Complete! Amazing work 🔥'
                      : 'Build your active vocabulary'}
                  </Text>
                  <Text style={styles.goalSubtitle}>
                    Practice speaking guided sentences daily to remember words naturally.
                  </Text>

                  {/* Progress Bar */}
                  <View style={styles.progressBarTrack}>
                    <LinearGradient
                      colors={['#0e55ff', '#6a4bff', '#c55dfe']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${goalPercent}%` }]}
                    />
                  </View>
                </LinearGradient>

                {/* All 50 Topics Banner CTA */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('VocabularyAllTopicsScreen')}
                  style={styles.allTopicsBannerWrapper}
                >
                  <LinearGradient
                    colors={['rgba(14,85,255,0.18)', 'rgba(106,75,255,0.06)']}
                    style={styles.allTopicsBanner}
                  >
                    <View style={styles.allTopicsBannerContent}>
                      <View style={styles.allTopicsBadge}>
                        <Text style={styles.allTopicsBadgeText}>COMPLETE LIBRARY</Text>
                      </View>
                      <Text style={styles.allTopicsBannerTitle}>Browse All 50 Topics</Text>
                      <Text style={styles.allTopicsBannerDesc}>
                        7 broad categories • Over 1,140 practical words for fluent speech & IELTS
                      </Text>
                    </View>
                    <View style={styles.allTopicsBannerArrow}>
                      <Feather name="arrow-right" size={20} color="#fff" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Featured Topics Section */}
                <View style={styles.featuredSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Featured Topics</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('VocabularyAllTopicsScreen')}
                    >
                      <Text style={styles.seeAllText}>See all 50</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.gridContainer}>
                    {homeData?.featured_topics && homeData.featured_topics.length > 0
                      ? homeData.featured_topics.map((topic) => (
                          <TouchableOpacity
                            key={topic.id}
                            style={styles.topicCard}
                            activeOpacity={0.75}
                            onPress={() => handleOpenTopic(topic)}
                          >
                            <View style={styles.topicCardTop}>
                              <Text style={styles.topicIcon}>{topic.icon || '💬'}</Text>
                              <View style={styles.topicCategoryBadge}>
                                <Text
                                  style={styles.topicCategoryBadgeText}
                                  numberOfLines={1}
                                >
                                  {topic.category}
                                </Text>
                              </View>
                            </View>

                            <Text style={styles.topicTitle} numberOfLines={2}>
                              {topic.title}
                            </Text>

                            <View style={styles.topicMetaRow}>
                              <Text style={styles.topicWordCount}>
                                {topic.total_words} words
                              </Text>
                              {topic.practiced_words > 0 && (
                                <View style={styles.practicedChip}>
                                  <Feather name="check" size={11} color="#23ff7a" />
                                  <Text style={styles.practicedChipText}>
                                    {topic.practiced_words}/{topic.total_words}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        ))
                      : null}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    letterSpacing: -0.3,
  },
  savedButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  savedBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#6a4bff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  savedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins',
    paddingVertical: 0,
  },
  searchAction: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 20,
  },
  goalCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(210,131,255,0.25)',
  },
  goalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,139,61,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  goalBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ff8b3d',
    letterSpacing: 0.6,
  },
  goalScoreText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  goalSubtitle: {
    fontSize: 12.5,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    lineHeight: 18,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 4,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  allTopicsBannerWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  allTopicsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106,75,255,0.3)',
  },
  allTopicsBannerContent: {
    flex: 1,
    paddingRight: 12,
  },
  allTopicsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(110,86,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  allTopicsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b0c7ff',
    letterSpacing: 0.8,
  },
  allTopicsBannerTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  allTopicsBannerDesc: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    lineHeight: 16,
  },
  allTopicsBannerArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredSection: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6a4bff',
    fontFamily: 'Poppins-Medium',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  topicCard: {
    width: '48.5%',
    minHeight: 112,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    justifyContent: 'space-between',
  },
  topicCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicIcon: {
    fontSize: 22,
  },
  topicCategoryBadge: {
    maxWidth: '65%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  topicCategoryBadgeText: {
    fontSize: 9.5,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  topicTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    marginTop: 6,
    lineHeight: 19,
  },
  topicMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  topicWordCount: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Poppins',
  },
  practicedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  practicedChipText: {
    fontSize: 11,
    color: '#23ff7a',
    fontWeight: '600',
  },
  searchResultsSection: {
    gap: 16,
  },
  searchGroup: {
    gap: 8,
  },
  searchGroupHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  searchResultIcon: {
    fontSize: 20,
  },
  wordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6a4bff',
  },
  searchResultInfo: {
    flex: 1,
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  searchResultIpa: {
    fontSize: 12,
    color: '#b0c7ff',
    fontFamily: 'Poppins',
  },
  searchResultMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Poppins',
    marginTop: 2,
  },
  searchResultDef: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Poppins',
    marginTop: 2,
  },
  emptySearchResult: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});
