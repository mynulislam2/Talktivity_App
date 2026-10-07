import React, { useEffect, useState, useCallback } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';

import ScreenBackground from '@/components/common/ScreenBackground';
import { grammarService } from '@/services/grammar';
import type { GrammarHubData, GrammarTopic } from '@/types/grammar';

export default function GrammarHubScreen() {
  const navigation = useNavigation<any>();
  const [hubData, setHubData] = useState<GrammarHubData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHub = useCallback(async () => {
    setLoading(true);
    const res = await grammarService.getHub();
    if (res.success && res.data) {
      setHubData(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHub();
  }, [fetchHub]);

  const handleSelectTopic = (topic: GrammarTopic) => {
    navigation.navigate('GrammarLessonScreen', {
      slug: topic.slug,
      topicTitle: topic.title,
    });
  };

  const recommended = hubData?.recommendedTopic || hubData?.allTopics?.[0];

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
          <Text style={styles.headerTitle}>Grammar</Text>
          <View style={styles.headerRightPlaceholder} />
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
            {/* Recommended Hero Card */}
            {recommended && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleSelectTopic(recommended)}
                style={styles.recommendedCardWrapper}
              >
                <LinearGradient
                  colors={['rgba(210,131,255,0.23)', 'rgba(40,32,110,0.01)']}
                  style={styles.recommendedGradient}
                >
                  <Text style={styles.recommendedTag}>RECOMMENDED FOR YOU</Text>
                  <Text style={styles.recommendedTitle}>{recommended.title}</Text>
                  <Text style={styles.recommendedSummary} numberOfLines={3}>
                    {recommended.summary ||
                      'Master essential grammar structures for fluent, accurate IELTS speaking.'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Categories and Topics Grid */}
            {hubData?.categories && hubData.categories.length > 0 ? (
              hubData.categories.map((category) => {
                const categoryTopics = category.topics || [];
                if (categoryTopics.length === 0) return null;

                return (
                  <View key={category.id} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{category.name}</Text>
                    {category.description && (
                      <Text style={styles.categoryDesc}>{category.description}</Text>
                    )}

                    <View style={styles.gridContainer}>
                      {categoryTopics.map((topic) => (
                        <TouchableOpacity
                          key={topic.id}
                          style={styles.topicCard}
                          activeOpacity={0.75}
                          onPress={() => handleSelectTopic(topic)}
                        >
                          <Text style={styles.topicTitle} numberOfLines={2}>
                            {topic.title}
                          </Text>
                          <View style={styles.topicMetaRow}>
                            <Text style={styles.bandText}>
                              Band {topic.ielts_target_band || 6.5}
                            </Text>
                            <View style={styles.levelBadge}>
                              <Text style={styles.levelBadgeText}>
                                {topic.difficulty_level || 'B1'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })
            ) : null}
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
    width: 36,
    height: 36,
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
  headerRightPlaceholder: {
    width: 36,
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
    gap: 24,
  },
  recommendedCardWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  recommendedGradient: {
    padding: 18,
    borderRadius: 10,
  },
  recommendedTag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#d283ff',
    textTransform: 'uppercase',
  },
  recommendedTitle: {
    marginTop: 6,
    fontSize: 21,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  recommendedSummary: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Poppins',
  },
  categorySection: {
    gap: 12,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  categoryDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Poppins',
    marginTop: -6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  topicCard: {
    width: '48.5%',
    minHeight: 84,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    justifyContent: 'space-between',
  },
  topicTitle: {
    fontSize: 14.5,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    lineHeight: 19,
  },
  topicMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  bandText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Poppins',
  },
  levelBadge: {
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
});
