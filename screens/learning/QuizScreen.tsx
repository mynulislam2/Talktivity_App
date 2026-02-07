/**
 * Quiz Screen - Assessment quiz after learning sessions
 * 
 * Features:
 * - AI-Generated multiple choice questions
 * - Timer for timed quizzes
 * - Instant feedback on answers
 * - Score calculation
 * - Results screen with detailed feedback
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  ProgressBarAndroid,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { generateQuizQuestions, selectQuizQuestions, selectQuizLoading, selectQuizError } from '@/store/slices/quizSlice';
import type { QuizQuestion } from '@/types/quiz';

interface QuizScreenProps {
  navigation: any;
  route: any;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const topic = route.params?.topic || 'General';
  const difficulty = route.params?.difficulty || 'Intermediate';

  // Redux selectors
  const quizQuestions = useAppSelector(selectQuizQuestions);
  const loading = useAppSelector(selectQuizLoading);
  const error = useAppSelector(selectQuizError);

  const [quizState, setQuizState] = useState<'loading' | 'quiz' | 'results'>('loading');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for quiz

  // Load quiz questions from API
  useEffect(() => {
    dispatch(generateQuizQuestions());
  }, [dispatch]);

  // Handle quiz state change when questions load
  useEffect(() => {
    if (quizQuestions && quizQuestions.length > 0 && !loading) {
      setQuizState('quiz');
    }
  }, [quizQuestions, loading]);

  // Show error alert if quiz generation fails
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        {
          text: 'Go Back',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  }, [error, navigation]);

  useEffect(() => {
    // Timer countdown
    if (quizState === 'quiz' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizState === 'quiz') {
      // Time's up - submit quiz
      handleSubmitQuiz();
    }
  }, [timeLeft, quizState]);

  if (loading || !quizQuestions || quizQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading Quiz</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Generating personalized quiz...</Text>
        </View>
      </View>
    );
  }

  const currentQuizQuestion = quizQuestions[currentQuestion];

  const handleAnswer = (optionId: string) => {
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer(optionId);

    // Check if correct (option id matches one of the correct option ids)
    if (currentQuizQuestion.correctOptionIds.includes(optionId)) {
      setScore(score + 1);
    }

    setShowExplanation(true);
    setAnswers([...answers, optionId]);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    setQuizState('results');
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setShowExplanation(false);
    setSelectedAnswer(null);
    setTimeLeft(180);
    setQuizState('quiz');
  };

  const percentage = Math.round((score / (quizQuestions?.length || 1)) * 100);
  const passed = percentage >= 70;

  if (quizState === 'results') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <View style={[styles.scoreCircle, passed && styles.scoreCirclePass]}>
            <Ionicons
              name={passed ? 'checkmark' : 'close'}
              size={60}
              color={passed ? '#10b981' : colors.error || '#ef4444'}
            />
          </View>
          <Text style={styles.resultTitle}>
            {passed ? 'Great Job! 🎉' : 'Need More Practice'}
          </Text>
          <Text style={styles.scoreText}>{percentage}%</Text>
          <Text style={styles.scoreSubtext}>
            You answered {score} out of {quizQuestions?.length || 0} questions correctly
          </Text>
        </View>

        {/* Performance Card */}
        <View style={styles.performanceCard}>
          <View style={styles.performanceItem}>
            <Ionicons name="trophy" size={24} color={colors.primary} />
            <View style={styles.performanceText}>
              <Text style={styles.performanceLabel}>Score</Text>
              <Text style={styles.performanceValue}>{percentage}%</Text>
            </View>
          </View>

          <View style={styles.performanceItem}>
            <Ionicons name="time" size={24} color={colors.primary} />
            <View style={styles.performanceText}>
              <Text style={styles.performanceLabel}>Time Taken</Text>
              <Text style={styles.performanceValue}>{180 - timeLeft}s</Text>
            </View>
          </View>

          <View style={styles.performanceItem}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            <View style={styles.performanceText}>
              <Text style={styles.performanceLabel}>Correct Answers</Text>
              <Text style={styles.performanceValue}>{score}/{questions.length}</Text>
            </View>
          </View>
        </View>

        {/* Feedback */}
        <View style={[styles.feedbackCard, passed ? styles.feedbackPass : styles.feedbackFail]}>
          <Text style={styles.feedbackTitle}>
            {passed ? 'Excellent Progress!' : 'Keep Practicing!'}
          </Text>
          <Text style={styles.feedbackText}>
            {passed
              ? 'You have demonstrated a strong understanding of this topic. Move on to the next lesson!'
              : 'Review the material and try again to improve your score.'}
          </Text>
        </View>

        {/* Answer Review */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>Answer Review</Text>
          {questions.map((q, idx) => {
            const isCorrect = answers[idx] === q.correctAnswer;
            return (
              <View key={q.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewQuestion}>Question {idx + 1}</Text>
                  <Ionicons
                    name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={isCorrect ? '#10b981' : colors.error || '#ef4444'}
                  />
                </View>
                <Text style={styles.reviewQuestionText}>{q.question}</Text>
                <Text style={styles.reviewYourAnswer}>
                  Your answer: {q.options[answers[idx]]}
                </Text>
                {!isCorrect && (
                  <Text style={styles.reviewCorrectAnswer}>
                    Correct answer: {q.options[q.correctAnswer]}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={handleRetakeQuiz}
        >
          <Ionicons name="reload" size={18} color="#fff" />
          <Text style={styles.retakeButtonText}>Retake Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.continueButtonText}>Continue Learning</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Quiz Display
  const question = questions[currentQuestion];
  const progress = (currentQuestion + 1) / questions.length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <View style={styles.container}>
      {/* Header with Timer and Progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.timerContainer}>
          <Ionicons name="time" size={18} color={colors.error || '#ef4444'} />
          <Text style={styles.timerText}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </Text>
        </View>

        <Text style={styles.progress}>
          {currentQuestion + 1}/{quizQuestions?.length || 0}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        {Platform.OS === 'android' ? (
          <ProgressBarAndroid
            styleAttr="Horizontal"
            indeterminate={false}
            progress={progress}
            color={colors.primary}
            style={styles.progressBar}
          />
        ) : (
          <View style={[styles.progressBarIos, { width: `${progress * 100}%` }]} />
        )}
      </View>

      {/* Question Content */}
      <ScrollView
        style={styles.quizContent}
        contentContainerStyle={styles.quizContentInner}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionContainer}>
          <View style={styles.questionBadge}>
            <Text style={styles.questionBadgeText}>Question {currentQuestion + 1}</Text>
          </View>

          <Text style={styles.questionText}>{question.question}</Text>

          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = question.correctOptionIds.includes(option.id);
              let borderColor = '#e0e0e0';
              let backgroundColor = '#fff';

              if (isSelected) {
                if (isCorrect) {
                  borderColor = '#10b981';
                  backgroundColor = '#d1fae5';
                } else {
                  borderColor = colors.error || '#ef4444';
                  backgroundColor = '#fee2e2';
                }
              }

              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    {
                      borderColor,
                      backgroundColor,
                    },
                  ]}
                  onPress={() => handleAnswer(option.id)}
                  disabled={selectedAnswer !== null}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.optionCircle,
                        isSelected && {
                          borderColor: isCorrect ? '#10b981' : colors.error,
                          backgroundColor: isCorrect ? '#10b981' : colors.error,
                        },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons
                          name={isCorrect ? 'checkmark' : 'close'}
                          size={16}
                          color="#fff"
                        />
                      )}
                    </View>
                    <Text style={styles.optionText}>{option.text}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation */}
          {showExplanation && (
            <View style={styles.explanationContainer}>
              <View style={styles.explanationHeader}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Next Button */}
      {selectedAnswer !== null && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#f9f9f9',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error || '#ef4444',
  },
  progress: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
  },
  progressBarIos: {
    height: 4,
    backgroundColor: colors.primary,
  },
  quizContent: {
    flex: 1,
  },
  quizContentInner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  questionContainer: {
    gap: spacing.lg,
  },
  questionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  questionBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  option: {
    borderWidth: 2,
    borderRadius: 12,
    padding: spacing.lg,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  explanationContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  explanationText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    lineHeight: 18,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Results Screen Styles
  resultsHeader: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCirclePass: {
    backgroundColor: '#d1fae5',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  scoreSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  performanceCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  performanceText: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  performanceValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '700',
  },
  feedbackCard: {
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  feedbackPass: {
    backgroundColor: '#d1fae5',
  },
  feedbackFail: {
    backgroundColor: '#fee2e2',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  feedbackText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  reviewSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  reviewItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewQuestion: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  reviewQuestionText: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '600',
    lineHeight: 18,
  },
  reviewYourAnswer: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  reviewCorrectAnswer: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  reviewExplanation: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  continueButton: {
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default QuizScreen;
