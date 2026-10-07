import React, { useState, useEffect, useCallback } from 'react';
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
import Feather from '@expo/vector-icons/Feather';

import ScreenBackground from '@/components/common/ScreenBackground';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { grammarService } from '@/services/grammar';
import type { GrammarLesson, GrammarTopic } from '@/types/grammar';

export default function GrammarLessonScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug = route.params?.slug;
  const initialTitle = route.params?.topicTitle;

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<GrammarTopic | null>(null);
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchLessons = async () => {
      if (!slug) return;
      setLoading(true);
      const res = await grammarService.getLessons(slug);
      if (!cancelled) {
        if (res.success && res.data) {
          setTopic(res.data.topic);
          setLessons(res.data.lessons);
        } else {
          setError(res.error || 'Failed to load topic lessons');
        }
        setLoading(false);
      }
    };
    fetchLessons();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return;
    }
    navigation.goBack();
  }, [currentIndex, navigation]);

  const handleContinue = () => {
    if (currentIndex + 1 < lessons.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      grammarService.completeLessons(slug).catch(() => {});
      navigation.navigate('GrammarQuizScreen', {
        slug,
        topicTitle: topic?.title || initialTitle,
      });
    }
  };

  const currentLesson = lessons[currentIndex];
  const totalSteps = lessons.length;

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {topic?.title || initialTitle || 'Grammar Lesson'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Lesson {currentIndex + 1} of {totalSteps || 1}
            </Text>
          </View>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2949ff" />
          </View>
        ) : error || !currentLesson ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>
                {error || 'No lessons found for this topic.'}
              </Text>
              <TouchableOpacity
                style={styles.errorButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.errorButtonText}>Back to Hub</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.contentWrapper}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Main Lesson Card */}
              <View style={styles.lessonCard}>
                {/* Explanation text */}
                <Text style={styles.explanationText}>
                  {currentLesson.explanation}
                </Text>

                {/* Example sentence with highlighted grammar text */}
                {currentLesson.examples && currentLesson.examples.length > 0 && (
                  <View style={styles.examplesContainer}>
                    {currentLesson.examples.map((ex, idx) => {
                      let textParts: React.ReactNode = (
                        <Text style={styles.exampleSentence}>{ex.sentence}</Text>
                      );

                      if (ex.highlight && ex.sentence.includes(ex.highlight)) {
                        const parts = ex.sentence.split(ex.highlight);
                        textParts = (
                          <Text style={styles.exampleSentence}>
                            {parts[0]}
                            <Text style={styles.highlightText}>{ex.highlight}</Text>
                            {parts.slice(1).join(ex.highlight)}
                          </Text>
                        );
                      }

                      return (
                        <View key={idx} style={styles.exampleItem}>
                          {textParts}
                          {ex.note && (
                            <Text style={styles.exampleNote}>{ex.note}</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Pill badge Formula */}
                {currentLesson.formula && (
                  <View style={styles.formulaWrapper}>
                    <View style={styles.formulaPill}>
                      <Text style={styles.formulaText}>{currentLesson.formula}</Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Bottom Continue Button */}
            <View style={styles.bottomBar}>
              <FigmaPrimaryButton onPress={handleContinue} style={styles.continueButton}>
                <Text style={styles.continueButtonText}>
                  {currentIndex + 1 < totalSteps
                    ? 'Continue to Next Lesson'
                    : 'Continue to Practice'}
                </Text>
              </FigmaPrimaryButton>
            </View>
          </View>
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
    height: 52,
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
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Poppins',
    marginTop: 1,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    backgroundColor: 'rgba(69,10,10,0.3)',
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    color: '#fca5a5',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  errorButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  errorButtonText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Poppins-Medium',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  lessonCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 18,
    gap: 16,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.92)',
    fontFamily: 'Poppins',
  },
  examplesContainer: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: 14,
  },
  exampleItem: {
    gap: 4,
  },
  exampleSentence: {
    fontSize: 14.5,
    lineHeight: 21,
    color: '#fff',
    fontFamily: 'Poppins',
  },
  highlightText: {
    color: '#4ade80',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  exampleNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    fontFamily: 'Poppins',
  },
  formulaWrapper: {
    paddingTop: 4,
    alignItems: 'flex-start',
  },
  formulaPill: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#234232',
    backgroundColor: '#14261c',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  formulaText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4ade80',
    fontFamily: 'Poppins-Medium',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  continueButton: {
    width: '100%',
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins-Medium',
  },
});
