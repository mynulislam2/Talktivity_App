import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import ScreenBackground from '@/components/common/ScreenBackground';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { vocabularyService } from '@/services/vocabulary';
import {
  useVocabularySpeech,
  calculateSentenceSimilarity,
} from '@/hooks/useVocabularySpeech';
import type {
  VocabularyWordItem,
  VocabularyTopicDetailData,
} from '@/types/vocabulary';

export default function VocabularyLearnScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug = route.params?.slug;
  const initialTitle = route.params?.topicTitle;
  const initialIndex = Number(route.params?.initialIndex || 0);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VocabularyTopicDetailData | null>(null);
  const [words, setWords] = useState<VocabularyWordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isCompleted, setIsCompleted] = useState(false);

  // Guided sentence speaking practice state
  const [spokenText, setSpokenText] = useState('');
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [practiceRecorded, setPracticeRecorded] = useState(false);

  const {
    isSpeaking,
    isListening,
    transcript,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
  } = useVocabularySpeech({
    onTranscriptChange: (text) => {
      setSpokenText(text);
    },
    onListeningEnd: () => {
      // Evaluation is handled when listening ends
    },
  });

  const fetchDetail = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const res = await vocabularyService.getTopicDetail(slug);
    if (res.success && res.data) {
      setData(res.data);
      const fetchedWords = res.data.words || [];
      setWords(fetchedWords);
      if (initialIndex >= 0 && initialIndex < fetchedWords.length) {
        setCurrentIndex(initialIndex);
      }
    }
    setLoading(false);
  }, [slug, initialIndex]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const currentWord = words[currentIndex];
  const targetSentence =
    currentWord?.guided_sentence ||
    currentWord?.example_sentence ||
    `I use the word ${currentWord?.word || ''} in my daily English conversation.`;

  // Reset speech state when switching words
  useEffect(() => {
    setSpokenText('');
    setAccuracyScore(null);
    setPracticeRecorded(false);
    stopSpeaking();
  }, [currentIndex, stopSpeaking]);

  // Compute accuracy whenever transcript changes and listening stops
  useEffect(() => {
    if (!isListening && spokenText.trim().length > 0 && currentWord) {
      const score = calculateSentenceSimilarity(targetSentence, spokenText);
      setAccuracyScore(score);

      // Auto-record practice if score >= 40% and not already recorded
      if (score >= 40 && !practiceRecorded) {
        setPracticeRecorded(true);
        vocabularyService.recordPractice(currentWord.id).catch(() => {});
        // Update local word status
        setWords((prev) =>
          prev.map((w) => (w.id === currentWord.id ? { ...w, is_practiced: true } : w))
        );
      }
    }
  }, [isListening, spokenText, targetSentence, currentWord, practiceRecorded]);

  const handleToggleSave = async () => {
    if (!currentWord) return;
    const nextSaved = !currentWord.is_saved;
    setWords((prev) =>
      prev.map((w) => (w.id === currentWord.id ? { ...w, is_saved: nextSaved } : w))
    );
    await vocabularyService.toggleSaveWord(currentWord.id);
  };

  const handleMicToggle = async () => {
    if (isListening) {
      stopListening();
    } else {
      setSpokenText('');
      setAccuracyScore(null);
      await startListening();
    }
  };

  const handleNextWord = () => {
    if (isListening) stopListening();
    if (isSpeaking) stopSpeaking();

    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevWord = () => {
    if (isListening) stopListening();
    if (isSpeaking) stopSpeaking();

    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const totalWords = words.length;
  const progressPercent = totalWords > 0
    ? Math.round(((currentIndex + 1) / totalWords) * 100)
    : 0;

  if (loading) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2949ff" />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  // Topic Completion Celebration View
  if (isCompleted) {
    const practicedCount = words.filter((w) => w.is_practiced).length;
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
          <View style={styles.completedContainer}>
            <LinearGradient
              colors={['rgba(106,75,255,0.25)', 'rgba(40,32,110,0.05)']}
              style={styles.completedCard}
            >
              <View style={styles.trophyCircle}>
                <Text style={styles.trophyEmoji}>🎉</Text>
              </View>

              <Text style={styles.completedTitle}>Topic Completed!</Text>
              <Text style={styles.completedDesc}>
                You have practiced words in {data?.topic.title || initialTitle}. Keep up the great momentum!
              </Text>

              <View style={styles.completedStatsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxValue}>{totalWords}</Text>
                  <Text style={styles.statBoxLabel}>Total Words</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statBoxValue}>
                    {Math.max(practicedCount, totalWords)}
                  </Text>
                  <Text style={styles.statBoxLabel}>Practiced</Text>
                </View>
              </View>

              <View style={styles.completedActions}>
                <FigmaPrimaryButton
                  onPress={() => {
                    setIsCompleted(false);
                    setCurrentIndex(0);
                  }}
                  style={styles.reviewButton}
                >
                  <Text style={styles.reviewButtonText}>Review Topic Again</Text>
                </FigmaPrimaryButton>

                <TouchableOpacity
                  style={styles.backTopicsButton}
                  onPress={() => navigation.navigate('VocabularyHomeScreen')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backTopicsText}>Back to Vocabulary Coach</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
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
              {data?.topic.title || initialTitle || 'Learn Words'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Word {currentIndex + 1} of {totalWords}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleToggleSave}
            activeOpacity={0.75}
          >
            <Feather
              name="bookmark"
              size={20}
              color={currentWord?.is_saved ? '#6a4bff' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['#0e55ff', '#6a4bff', '#c55dfe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Word Card */}
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
            style={styles.wordCard}
          >
            <View style={styles.wordHeaderRow}>
              <View>
                <Text style={styles.wordText}>{currentWord?.word}</Text>
                {currentWord?.ipa && (
                  <Text style={styles.ipaText}>/{currentWord.ipa}/</Text>
                )}
              </View>
              {currentWord?.cefr_level && (
                <View style={styles.cefrBadge}>
                  <Text style={styles.cefrBadgeText}>
                    {currentWord.cefr_level}
                  </Text>
                </View>
              )}
            </View>

            {/* Bangla Meaning */}
            <View style={styles.meaningBox}>
              <Text style={styles.meaningText}>{currentWord?.bangla_meaning}</Text>
            </View>

            {/* Definition */}
            <View style={styles.definitionBox}>
              <Text style={styles.definitionLabel}>DEFINITION</Text>
              <Text style={styles.definitionText}>{currentWord?.definition}</Text>
            </View>

            {/* Pronunciation Listen Audio Controls */}
            <View style={styles.audioControlsRow}>
              <TouchableOpacity
                style={styles.audioButton}
                activeOpacity={0.75}
                onPress={() => speak(currentWord?.word || '')}
              >
                <Feather name="volume-2" size={17} color="#fff" />
                <Text style={styles.audioButtonText}>Listen (Normal)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.audioButton, styles.slowAudioButton]}
                activeOpacity={0.75}
                onPress={() => speak(currentWord?.word || '', { slow: true })}
              >
                <MaterialCommunityIcons name="turtle" size={18} color="#b0c7ff" />
                <Text style={[styles.audioButtonText, { color: '#b0c7ff' }]}>
                  Slow
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Guided Speaking Practice Card */}
          <LinearGradient
            colors={['rgba(106,75,255,0.18)', 'rgba(40,32,110,0.02)']}
            style={styles.practiceCard}
          >
            <View style={styles.practiceHeaderRow}>
              <View style={styles.practiceBadge}>
                <MaterialCommunityIcons name="microphone" size={14} color="#6a4bff" />
                <Text style={styles.practiceBadgeText}>SPEAKING PRACTICE</Text>
              </View>
              {(currentWord?.is_practiced || practiceRecorded) ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="check-circle" size={13} color="#4ade80" />
                  <Text style={{ color: '#4ade80', fontSize: 12, fontFamily: 'Poppins-Medium' }}>
                    Pronounced
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.listenSentenceButton}
                  activeOpacity={0.75}
                  onPress={() => speak(targetSentence)}
                >
                  <Feather name="volume-2" size={15} color="#b0c7ff" />
                  <Text style={styles.listenSentenceText}>Listen sentence</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.practiceInstruction}>
              Read this sentence aloud using the word:
            </Text>

            <View style={styles.sentenceBubble}>
              <Text style={styles.sentenceText}>"{targetSentence}"</Text>
            </View>

            {/* Mic Action Section */}
            <View style={styles.micActionContainer}>
              <TouchableOpacity
                style={[styles.micCircle, isListening && styles.micCircleListening]}
                activeOpacity={0.8}
                onPress={handleMicToggle}
              >
                <Feather
                  name={isListening ? 'square' : 'mic'}
                  size={26}
                  color="#fff"
                />
              </TouchableOpacity>
              <Text style={styles.micCaption}>
                {isListening
                  ? 'Listening... Tap to stop'
                  : 'Tap to speak'}
              </Text>
            </View>

            {/* Transcript */}
            {(spokenText.length > 0 || isListening) && (
              <View style={styles.feedbackSection}>
                <Text style={styles.transcriptLabel}>You said:</Text>
                <Text style={styles.transcriptText}>
                  {spokenText || '...'}
                </Text>
              </View>
            )}
          </LinearGradient>
        </ScrollView>

        {/* Bottom Navigation Buttons */}
        <View style={styles.bottomBar}>
          <FigmaPrimaryButton
            onPress={handleNextWord}
            style={styles.navNextButtonFull}
          >
            <Text style={styles.navNextText}>
              {currentIndex + 1 === totalWords ? 'Finish Topic' : 'Next Word'}
            </Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </FigmaPrimaryButton>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    maxWidth: '65%',
  },
  headerTitle: {
    fontSize: 17,
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
  saveButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  wordCard: {
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#3d3e50',
  },
  wordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  wordText: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  ipaText: {
    fontSize: 14,
    color: '#b0c7ff',
    fontFamily: 'Poppins',
    marginTop: 2,
  },
  cefrBadge: {
    backgroundColor: 'rgba(106,75,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cefrBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#d283ff',
  },
  meaningBox: {
    marginTop: 12,
  },
  meaningText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#d283ff',
    fontFamily: 'Poppins-SemiBold',
  },
  definitionBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
  },
  definitionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.8,
  },
  definitionText: {
    fontSize: 13.5,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  audioControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  audioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(106,75,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(106,75,255,0.5)',
  },
  slowAudioButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  audioButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  practiceCard: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(106,75,255,0.3)',
  },
  practiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  practiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(106,75,255,0.2)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  practiceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b0c7ff',
    letterSpacing: 0.6,
  },
  listenSentenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listenSentenceText: {
    fontSize: 11.5,
    color: '#b0c7ff',
    fontFamily: 'Poppins-Medium',
  },
  practiceInstruction: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Poppins',
    marginTop: 10,
  },
  sentenceBubble: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  sentenceText: {
    fontSize: 14.5,
    lineHeight: 21,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    fontStyle: 'italic',
  },
  micActionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  micCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6a4bff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6a4bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  micCircleListening: {
    backgroundColor: '#ff3d6a',
    shadowColor: '#ff3d6a',
  },
  micCaption: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
  },
  feedbackSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  transcriptText: {
    fontSize: 13.5,
    fontFamily: 'Poppins',
    color: '#fff',
    fontStyle: 'italic',
  },
  scoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  scoreBannerGood: {
    backgroundColor: 'rgba(35,255,122,0.18)',
    borderColor: '#23ff7a',
    borderWidth: 1,
  },
  scoreBannerMid: {
    backgroundColor: 'rgba(255,187,51,0.18)',
    borderColor: '#ffbb33',
    borderWidth: 1,
  },
  scoreBannerLow: {
    backgroundColor: 'rgba(255,61,106,0.18)',
    borderColor: '#ff3d6a',
    borderWidth: 1,
  },
  scoreBannerText: {
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#09090f',
  },
  navNextButtonFull: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navNextText: {
    fontSize: 14.5,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  completedCard: {
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(106,75,255,0.4)',
  },
  trophyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  trophyEmoji: {
    fontSize: 32,
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  completedDesc: {
    fontSize: 13.5,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  completedStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statBoxValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  statBoxLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Poppins',
    marginTop: 2,
  },
  completedActions: {
    width: '100%',
    marginTop: 24,
    gap: 10,
  },
  reviewButton: {
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  backTopicsButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTopicsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Poppins-Medium',
  },
});
