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
import Feather from '@expo/vector-icons/Feather';

import ScreenBackground from '@/components/common/ScreenBackground';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { vocabularyService } from '@/services/vocabulary';
import { useVocabularySpeech } from '@/hooks/useVocabularySpeech';
import type { VocabularyWordItem } from '@/types/vocabulary';

export default function VocabularySavedScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<VocabularyWordItem[]>([]);
  const { speak } = useVocabularySpeech();

  const fetchSavedWords = useCallback(async () => {
    setLoading(true);
    const res = await vocabularyService.getSavedWords();
    if (res.success && res.data) {
      setWords(res.data.words || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSavedWords();
  }, [fetchSavedWords]);

  const handleRemoveSaved = async (word: VocabularyWordItem) => {
    // Optimistic removal
    setWords((prev) => prev.filter((w) => w.id !== word.id));
    const res = await vocabularyService.toggleSaveWord(word.id);
    if (!res.success) {
      // Revert if error
      setWords((prev) => [word, ...prev]);
    }
  };

  const handleSpeak = (text: string) => {
    speak(text);
  };

  const handleOpenTopic = (word: VocabularyWordItem) => {
    if (word.topic_slug) {
      navigation.navigate('VocabularyTopicScreen', {
        slug: word.topic_slug,
        topicTitle: word.topic_title,
      });
    }
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
            <Text style={styles.headerTitle}>Saved Words</Text>
            <Text style={styles.headerSubtitle}>{words.length} saved</Text>
          </View>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2949ff" />
          </View>
        ) : words.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="bookmark" size={32} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.emptyTitle}>No saved words yet</Text>
            <Text style={styles.emptyDesc}>
              Tap the bookmark icon on any word in a topic to save it for quick review.
            </Text>
            <FigmaPrimaryButton
              onPress={() => navigation.navigate('VocabularyHomeScreen')}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Explore Vocabulary</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </FigmaPrimaryButton>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.wordsList}>
              {words.map((word) => (
                <View key={word.id} style={styles.wordCard}>
                  <View style={styles.wordMain}>
                    <View style={styles.wordTopRow}>
                      <Text style={styles.wordName}>{word.word}</Text>
                      {word.ipa && <Text style={styles.wordIpa}>/{word.ipa}/</Text>}
                    </View>

                    <Text style={styles.wordMeaning}>{word.bangla_meaning}</Text>
                    <Text style={styles.wordDef}>{word.definition}</Text>

                    {word.topic_title && (
                      <TouchableOpacity
                        style={styles.topicBadge}
                        activeOpacity={0.75}
                        onPress={() => handleOpenTopic(word)}
                      >
                        <Feather name="folder" size={11} color="#b0c7ff" />
                        <Text style={styles.topicBadgeText}>{word.topic_title}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.actionsColumn}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      activeOpacity={0.7}
                      onPress={() => handleSpeak(word.word)}
                    >
                      <Feather name="volume-2" size={18} color="#b0c7ff" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      activeOpacity={0.7}
                      onPress={() => handleRemoveSaved(word)}
                    >
                      <Feather name="bookmark" size={18} color="#6a4bff" />
                    </TouchableOpacity>
                  </View>
                </View>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  emptyDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontFamily: 'Poppins',
    lineHeight: 18,
  },
  emptyButton: {
    marginTop: 12,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  wordsList: {
    gap: 12,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 8,
    padding: 14,
  },
  wordMain: {
    flex: 1,
    paddingRight: 10,
  },
  wordTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  wordMeaning: {
    fontSize: 13.5,
    color: '#d283ff',
    fontFamily: 'Poppins-Medium',
    marginTop: 4,
  },
  wordDef: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Poppins',
    marginTop: 4,
    lineHeight: 17,
  },
  topicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(106,75,255,0.18)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 8,
  },
  topicBadgeText: {
    fontSize: 11,
    color: '#b0c7ff',
    fontFamily: 'Poppins-Medium',
  },
  actionsColumn: {
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
