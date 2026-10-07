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
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';

import ScreenBackground from '@/components/common/ScreenBackground';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { vocabularyService } from '@/services/vocabulary';
import { useVocabularySpeech } from '@/hooks/useVocabularySpeech';
import type {
  VocabularyTopicDetailData,
  VocabularyWordItem,
} from '@/types/vocabulary';

export default function VocabularyTopicScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug = route.params?.slug;
  const initialTitle = route.params?.topicTitle;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VocabularyTopicDetailData | null>(null);
  const [words, setWords] = useState<VocabularyWordItem[]>([]);
  const { speak } = useVocabularySpeech();

  const fetchDetail = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const res = await vocabularyService.getTopicDetail(slug);
    if (res.success && res.data) {
      setData(res.data);
      setWords(res.data.words || []);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const topic = data?.topic;
  const totalWords = words.length;
  const practicedWords = useMemo(
    () => words.filter((w) => w.is_practiced).length,
    [words]
  );
  const progressPercent = totalWords > 0
    ? Math.round((practicedWords / totalWords) * 100)
    : 0;

  // Find first unpracticed word index, or 0
  const firstUnpracticedIndex = useMemo(() => {
    const idx = words.findIndex((w) => !w.is_practiced);
    return idx >= 0 ? idx : 0;
  }, [words]);

  const handleStartLearning = (startIndex: number = firstUnpracticedIndex) => {
    navigation.navigate('VocabularyLearnScreen', {
      slug,
      topicTitle: topic?.title || initialTitle,
      initialIndex: startIndex,
    });
  };

  const handleToggleSave = async (word: VocabularyWordItem) => {
    const updated = !word.is_saved;
    // Optimistic update
    setWords((prev) =>
      prev.map((w) => (w.id === word.id ? { ...w, is_saved: updated } : w))
    );
    const res = await vocabularyService.toggleSaveWord(word.id);
    if (!res.success) {
      // Revert if failed
      setWords((prev) =>
        prev.map((w) => (w.id === word.id ? { ...w, is_saved: !updated } : w))
      );
    }
  };

  const handleSpeak = (text: string) => {
    speak(text);
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
            <Text style={styles.headerTitle} numberOfLines={1}>
              {topic?.title || initialTitle || 'Topic Words'}
            </Text>
            {topic?.category && (
              <Text style={styles.headerSubtitle}>{topic.category}</Text>
            )}
          </View>
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
            {/* Topic Stats & Action Card */}
            <LinearGradient
              colors={['rgba(106,75,255,0.22)', 'rgba(40,32,110,0.02)']}
              style={styles.heroCard}
            >
              <View style={styles.heroTopRow}>
                <Text style={styles.heroIcon}>{topic?.icon || '📖'}</Text>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {practicedWords}/{totalWords} PRACTICED
                  </Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>{topic?.title}</Text>
              <Text style={styles.heroDesc}>
                {topic?.description ||
                  `Master ${totalWords} high-yield vocabulary words in this topic with guided sentence practice.`}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressBarTrack}>
                <LinearGradient
                  colors={['#0e55ff', '#6a4bff', '#c55dfe']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                />
              </View>

              <View style={styles.ctaRow}>
                <FigmaPrimaryButton
                  onPress={() => handleStartLearning(firstUnpracticedIndex)}
                  style={styles.startButton}
                >
                  <Text style={styles.startButtonText}>
                    {practicedWords === 0
                      ? 'Start Learning'
                      : practicedWords >= totalWords
                      ? 'Review Words'
                      : 'Continue Learning'}
                  </Text>
                  <Feather name="arrow-right" size={16} color="#fff" />
                </FigmaPrimaryButton>
              </View>
            </LinearGradient>

            {/* Words List Header */}
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>Words in this topic</Text>
              <Text style={styles.listSubtitle}>{totalWords} words</Text>
            </View>

            {/* Words List */}
            <View style={styles.wordsList}>
              {words.map((word, index) => (
                <TouchableOpacity
                  key={word.id}
                  style={styles.wordCard}
                  activeOpacity={0.8}
                  onPress={() => handleStartLearning(index)}
                >
                  <View style={styles.wordLeft}>
                    <View style={styles.indexCircle}>
                      <Text style={styles.indexText}>{index + 1}</Text>
                    </View>
                    <View style={styles.wordInfo}>
                      <View style={styles.wordTop}>
                        <Text style={styles.wordName}>{word.word}</Text>
                        {word.ipa && <Text style={styles.wordIpa}>/{word.ipa}/</Text>}
                        {word.is_practiced && (
                          <View style={styles.practicedTag}>
                            <Feather name="check" size={10} color="#23ff7a" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.wordMeaning} numberOfLines={1}>
                        {word.bangla_meaning}
                      </Text>
                      <Text style={styles.wordDef} numberOfLines={2}>
                        {word.definition}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.wordActions}>
                    <TouchableOpacity
                      style={styles.actionIconButton}
                      activeOpacity={0.7}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSpeak(word.word);
                      }}
                    >
                      <Feather name="volume-2" size={18} color="#b0c7ff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIconButton}
                      activeOpacity={0.7}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleSave(word);
                      }}
                    >
                      <Feather
                        name="bookmark"
                        size={18}
                        color={word.is_saved ? '#6a4bff' : '#8c8c8c'}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
    maxWidth: '70%',
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
  heroCard: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(106,75,255,0.3)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroIcon: {
    fontSize: 28,
  },
  heroBadge: {
    backgroundColor: 'rgba(106,75,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#b0c7ff',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginTop: 4,
  },
  heroDesc: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    lineHeight: 18,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ctaRow: {
    marginTop: 16,
  },
  startButton: {
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  listSubtitle: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Poppins',
  },
  wordsList: {
    gap: 10,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 12,
    padding: 14,
  },
  wordLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  indexCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  indexText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  wordInfo: {
    flex: 1,
  },
  wordTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  wordName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  wordIpa: {
    fontSize: 12,
    color: '#b0c7ff',
    fontFamily: 'Poppins',
  },
  practicedTag: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(35,255,122,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordMeaning: {
    fontSize: 13,
    color: '#d283ff',
    fontFamily: 'Poppins-Medium',
    marginTop: 2,
  },
  wordDef: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Poppins',
    marginTop: 2,
    lineHeight: 16,
  },
  wordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 10,
  },
  actionIconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
