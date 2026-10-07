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
import type {
  GrammarQuizQuestion,
  GrammarQuizResult,
  GrammarTopic,
  QuizReviewItem,
} from '@/types/grammar';

export default function GrammarQuizScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const slug = route.params?.slug;

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<GrammarTopic | null>(null);
  const [questions, setQuestions] = useState<GrammarQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});
  const [submissionResult, setSubmissionResult] = useState<GrammarQuizResult | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchQuiz = async () => {
      if (!slug) return;
      setLoading(true);
      const res = await grammarService.getQuiz(slug);
      if (!cancelled) {
        if (res.success && res.data) {
          setTopic(res.data.topic);
          setQuestions(res.data.questions);
        } else {
          setError(res.error || 'No quiz questions available for this topic.');
        }
        setLoading(false);
      }
    };
    fetchQuiz();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleBack = useCallback(() => {
    if (isCompleted) {
      navigation.navigate('GrammarHubScreen');
      return;
    }
    navigation.goBack();
  }, [isCompleted, navigation]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isAnswered = Boolean(checkedQuestions[currentIndex]);
  const currentSelectedOptionId = selectedAnswers[currentIndex];

  const handleSelectOption = (optionId: number) => {
    if (isAnswered) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionId,
    }));
  };

  const handleCheckAnswer = async () => {
    if (!currentSelectedOptionId) return;

    setCheckedQuestions((prev) => ({
      ...prev,
      [currentIndex]: true,
    }));

    if (currentIndex + 1 >= totalQuestions) {
      const answersPayload = Object.entries({
        ...selectedAnswers,
        [currentIndex]: currentSelectedOptionId,
      }).map(([idx, optId]) => ({
        questionId: questions[Number(idx)].id,
        selectedOptionId: optId,
      }));

      const res = await grammarService.submitQuiz(slug, answersPayload);
      if (res.success && res.data) {
        setSubmissionResult(res.data);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCheckedQuestions({});
    setSubmissionResult(null);
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  const currentReview: QuizReviewItem | undefined = submissionResult?.reviewItems?.find(
    (item) => item.questionId === currentQuestion?.id
  );

  // Completion / Results View
  if (isCompleted && submissionResult) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Practice Results</Text>
            <View style={styles.headerRightPlaceholder} />
          </View>

          <View style={styles.resultsCenterContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scorePercentText}>
                {submissionResult.percentScore}%
              </Text>
            </View>

            <Text style={styles.resultsHeading}>
              {submissionResult.passed ? 'Practice Complete!' : 'Good Effort!'}
            </Text>

            <Text style={styles.resultsSubtitle}>
              You scored {submissionResult.score} out of {submissionResult.totalQuestions} questions correctly.
            </Text>
          </View>

          <View style={styles.resultsButtonContainer}>
            <FigmaPrimaryButton
              onPress={() => navigation.navigate('GrammarHubScreen')}
              style={styles.primaryActionButton}
            >
              <Text style={styles.primaryActionButtonText}>Return to Grammar Hub</Text>
            </FigmaPrimaryButton>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleRetry}
              style={styles.retryButton}
            >
              <Feather name="rotate-ccw" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.retryButtonText}>Retry Practice</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Top Header */}
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
              Check your understanding
            </Text>
            <Text style={styles.headerSubtitle}>
              Question {currentIndex + 1} of {totalQuestions || 1}
            </Text>
          </View>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2949ff" />
          </View>
        ) : error || !currentQuestion ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>
                {error || 'No quiz questions available.'}
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
              {/* Main Question Card */}
              <View style={styles.questionCard}>
                <Text style={styles.questionPrompt}>
                  {currentQuestion.question_text}
                </Text>

                {/* Radio Options */}
                <View style={styles.optionsList}>
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentSelectedOptionId === option.id;

                    return (
                      <TouchableOpacity
                        key={option.id}
                        activeOpacity={0.75}
                        disabled={isAnswered}
                        onPress={() => handleSelectOption(option.id)}
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionItemSelected,
                        ]}
                      >
                        {/* Radio icon */}
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleSelected,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInnerDot} />}
                        </View>

                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {option.option_text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Check Answer Button inside card */}
                {!isAnswered && (
                  <View style={styles.checkAnswerWrapper}>
                    <FigmaPrimaryButton
                      disabled={!currentSelectedOptionId}
                      onPress={handleCheckAnswer}
                      style={[
                        styles.checkAnswerButton,
                        !currentSelectedOptionId && styles.buttonDisabled,
                      ]}
                    >
                      <Text style={styles.primaryActionButtonText}>Check Answer</Text>
                    </FigmaPrimaryButton>
                  </View>
                )}
              </View>

              {/* Feedback Container when Answered */}
              {isAnswered && (
                <View style={styles.feedbackCard}>
                  <Text
                    style={[
                      styles.feedbackStatus,
                      currentReview?.isCorrect || !currentReview
                        ? styles.feedbackCorrect
                        : styles.feedbackIncorrect,
                    ]}
                  >
                    {currentReview?.isCorrect || !currentReview
                      ? '— Correct'
                      : '— Incorrect'}
                  </Text>
                  <Text style={styles.feedbackExplanation}>
                    {currentReview?.explanation || currentQuestion.explanation}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Bottom Action for Next/Finish */}
            {isAnswered && (
              <View style={styles.bottomBar}>
                <FigmaPrimaryButton
                  onPress={handleNext}
                  style={styles.primaryActionButton}
                >
                  <Text style={styles.primaryActionButtonText}>
                    {currentIndex + 1 >= totalQuestions
                      ? 'Finish Practice'
                      : 'Next Question'}
                  </Text>
                </FigmaPrimaryButton>
              </View>
            )}
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
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  errorButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  questionCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 18,
    gap: 16,
  },
  questionPrompt: {
    fontSize: 15.5,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    lineHeight: 22,
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    gap: 12,
  },
  optionItemSelected: {
    borderColor: '#5d68ff',
    backgroundColor: 'rgba(93,104,255,0.14)',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#5a5c78',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#2949ff',
    backgroundColor: '#2949ff',
  },
  radioInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Poppins',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#fff',
    fontFamily: 'Poppins-Medium',
  },
  checkAnswerWrapper: {
    paddingTop: 4,
  },
  checkAnswerButton: {
    width: '100%',
    height: 46,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  feedbackCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    gap: 6,
  },
  feedbackStatus: {
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
  },
  feedbackCorrect: {
    color: '#4ade80',
  },
  feedbackIncorrect: {
    color: '#f87171',
  },
  feedbackExplanation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Poppins',
    lineHeight: 19,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  primaryActionButton: {
    width: '100%',
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins-Medium',
  },
  resultsCenterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scoreCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercentText: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  resultsHeading: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textAlign: 'center',
  },
  resultsSubtitle: {
    marginTop: 8,
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Poppins',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 19,
  },
  resultsButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.85)',
  },
});
