import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';

import ScreenBackground from '@/components/common/ScreenBackground';
import { vocabularyService } from '@/services/vocabulary';
import type {
  VocabularyCategoryGroup,
  VocabularyTopic,
} from '@/types/vocabulary';

export default function VocabularyAllTopicsScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<VocabularyCategoryGroup[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    const res = await vocabularyService.getAllTopics();
    if (res.success && res.data) {
      setCategories(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const categoryNames = useMemo(() => {
    return ['All', ...categories.map((c) => c.name)];
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (selectedCategory === 'All') {
      return categories;
    }
    return categories.filter((c) => c.name === selectedCategory);
  }, [categories, selectedCategory]);

  const totalTopicsCount = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.topics?.length || 0), 0);
  }, [categories]);

  const handleOpenTopic = (topic: VocabularyTopic) => {
    navigation.navigate('VocabularyTopicScreen', {
      slug: topic.slug,
      topicTitle: topic.title,
    });
  };

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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>All Topics</Text>
            <Text style={styles.headerSubtitle}>
              {totalTopicsCount || 50} topics across 7 categories
            </Text>
          </View>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Category Pills Bar */}
        <View style={styles.pillsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContent}
          >
            {categoryNames.map((name) => {
              const isSelected = selectedCategory === name;
              return (
                <TouchableOpacity
                  key={name}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => setSelectedCategory(name)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[styles.pillText, isSelected && styles.pillTextActive]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
          >
            {filteredCategories.map((category) => (
              <View key={category.name} style={styles.categorySection}>
                <View style={styles.categoryHeaderRow}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  <Text style={styles.categoryCount}>
                    {category.topics?.length || 0} topics
                  </Text>
                </View>

                <View style={styles.topicsGrid}>
                  {category.topics?.map((topic) => (
                    <TouchableOpacity
                      key={topic.id}
                      style={styles.topicCard}
                      activeOpacity={0.75}
                      onPress={() => handleOpenTopic(topic)}
                    >
                      <View style={styles.topicCardHeader}>
                        <Text style={styles.topicIcon}>{topic.icon || '💬'}</Text>
                        {topic.practiced_words > 0 && (
                          <View style={styles.practicedBadge}>
                            <Feather name="check" size={11} color="#23ff7a" />
                            <Text style={styles.practicedBadgeText}>
                              {topic.practiced_words}/{topic.total_words}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.topicTitle} numberOfLines={2}>
                        {topic.title}
                      </Text>

                      <View style={styles.topicFooter}>
                        <Text style={styles.topicWordCount}>
                          {topic.total_words} words
                        </Text>
                        <Feather
                          name="chevron-right"
                          size={16}
                          color="rgba(255,255,255,0.4)"
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11.5,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.6)',
  },
  headerRightPlaceholder: {
    width: 38,
  },
  pillsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  pillsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: '#3d3e50',
  },
  pillActive: {
    backgroundColor: '#6a4bff',
    borderColor: '#6a4bff',
  },
  pillText: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Poppins-Medium',
  },
  pillTextActive: {
    color: '#fff',
    fontWeight: '600',
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
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  categorySection: {
    gap: 12,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  categoryCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Poppins',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  topicCard: {
    width: '48.5%',
    minHeight: 108,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 13,
    justifyContent: 'space-between',
  },
  topicCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicIcon: {
    fontSize: 22,
  },
  practicedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(35,255,122,0.12)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  practicedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#23ff7a',
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    lineHeight: 18,
    marginTop: 6,
  },
  topicFooter: {
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
});
