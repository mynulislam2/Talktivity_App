/**
 * Listening Quiz Screen - Listening comprehension assessment
 * 
 * Features:
 * - Audio playback of listening material
 * - Play, pause, replay controls
 * - Multiple passes to listen (limited)
 * - Questions about listening content
 * - Scoring and feedback
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { generateListeningQuizQuestions, selectListeningQuizQuestions, selectQuizLoading, selectQuizError } from '@/store/slices/quizSlice';
import type { QuizQuestion } from '@/types/quiz';

interface ListeningQuizScreenProps {
  navigation: any;
  route: any;
}

const ListeningQuizScreen: React.FC<ListeningQuizScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const topic = route.params?.topic || 'General';
  const difficulty = route.params?.difficulty || 'Intermediate';
  const conversation = route.params?.conversation || '';

  // Redux selectors
  const listeningQuestions = useAppSelector(selectListeningQuizQuestions);
  const loading = useAppSelector(selectQuizLoading);
  const error = useAppSelector(selectQuizError);

  const [quizState, setQuizState] = useState<'listening' | 'questions' | 'results'>('listening');
  const [isPlaying, setIsPlaying] = useState(false);
  const [listeningCount, setListeningCount] = useState(0);
  const [maxListens, setMaxListens] = useState(3);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioLength] = useState(45); // 45 seconds audio

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Load listening quiz from API
  useEffect(() => {
    if (conversation) {
      dispatch(generateListeningQuizQuestions(conversation));
    } else {
      Alert.alert('Error', 'No conversation available for listening quiz', [
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    }
  }, [dispatch, conversation, navigation]);

  // Handle quiz state change when questions load
  useEffect(() => {
    if (listeningQuestions && listeningQuestions.length > 0 && !loading) {
      // Stay in listening state to play audio first
    }
  }, [listeningQuestions, loading]);

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

    return () => clearTimeout(timer);
  }, []);

  const handlePlayAudio = () => {
    if (listeningCount >= maxListens && !isPlaying) {
      Alert.alert('Limit Reached', 'You have used all your listening attempts.');
      return;
    }

    if (!isPlaying) {
      setIsPlaying(true);
      setListeningCount(listeningCount + 1);

      // Simulate audio playback
      const interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 900);

      return () => clearInterval(interval);
    } else {
      setIsPlaying(false);
      setAudioProgress(0);
    }
  };

  const handleAnswer = (optionId: string) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionId);

    // Check if correct
    if (listeningQuestions && listeningQuestions[currentQuestion].correctOptionIds.includes(optionId)) {
      setScore(score + 1);
    }

    setShowExplanation(true);
    setAnswers([...answers, optionId]);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (listeningQuestions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizState('results');
    }
  };

  const handleRetake = () => {
    setQuizState('listening');
    setIsPlaying(false);
    setListeningCount(0);
    setAudioProgress(0);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const percentage = Math.round((score / (listeningQuestions?.length || 1)) * 100);
  const passed = percentage >= 70;

  if (loading || !listeningQuestions || listeningQuestions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparing listening quiz...</Text>
      </View>
    );
  }

  // Listening Phase
  if (quizState === 'listening') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listening Quiz</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <View style={styles.instructionsText}>
            <Text style={styles.instructionsTitle}>How This Works</Text>
            <Text style={styles.instructionContent}>
              • Listen to the audio carefully
              • You can listen {maxListens} times
              • Answer questions after listening
              • Try to understand the main ideas
            </Text>
          </View>
        </View>

        {/* Audio Player */}
        <View style={styles.audioCard}>
          <Text style={styles.audioTitle}>Listen to the conversation</Text>

          {/* Waveform Animation */}
          <View style={styles.waveformContainer}>
            {[...Array(5)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  isPlaying && styles.waveBarActive,
                  {
                    height: isPlaying ? 20 + Math.sin(i) * 20 : 10,
                  },
                ]}
              />
            ))}
          </View>

          {/* Play Button */}
          <TouchableOpacity
            style={[styles.playButton, listeningCount >= maxListens && !isPlaying && styles.playButtonDisabled]}
            onPress={handlePlayAudio}
            disabled={listeningCount >= maxListens && !isPlaying}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: `${audioProgress}%` }]} />
          </View>

          <Text style={styles.timeText}>
            {Math.floor(audioProgress / 2)}/{audioLength}s
          </Text>

          {/* Listen Count */}
          <View style={styles.listenCountContainer}>
            <Text style={styles.listenCountLabel}>Listens Used:</Text>
            <View style={styles.listenCountCircles}>
              {[...Array(maxListens)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.listenCircle,
                    i < listeningCount && styles.listenCircleUsed,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Start Quiz Button */}
          <TouchableOpacity
            style={[styles.startButton, listeningCount === 0 && styles.startButtonDisabled]}
            onPress={() => setQuizState('questions')}
            disabled={listeningCount === 0}
          >
            <Text style={styles.startButtonText}>Start Questions</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpCard}>
          <Ionicons name="help-circle" size={20} color={colors.primary} />
          <Text style={styles.helpText}>
            Listen carefully to understand the context and details. You'll need to answer questions based on what you hear.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Questions Phase
  if (quizState === 'questions') {
    if (!listeningQuestions || listeningQuestions.length === 0) {
      return (
        <View style={styles.container}>
          <Text>No questions available</Text>
        </View>
      );
    }

    const question = listeningQuestions[currentQuestion];

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.progress}>
            {currentQuestion + 1}/{listeningQuestions.length}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <View style={styles.questionBadge}>
            <Text style={styles.questionBadgeText}>Question {currentQuestion + 1}</Text>
          </View>

          <Text style={styles.questionText}>{question.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect = question.correctOptionIds.includes(option.id);
              let borderColor = '#e0e0e0';
              let backgroundColor = '#fff';

              if (isSelected) {
                borderColor = isCorrect ? '#10b981' : colors.error || '#ef4444';
                backgroundColor = isCorrect ? '#d1fae5' : '#fee2e2';
              }

              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.option,
                    { borderColor, backgroundColor },
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
          {showExplanation && question.explanation && (
            <View style={styles.explanationContainer}>
              <View style={styles.explanationHeader}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}
        </View>

        {/* Next Button */}
        {selectedAnswer !== null && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion === (listeningQuestions?.length || 1) - 1 ? 'Finish Quiz' : 'Next Question'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  // Results Phase
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
          {passed ? 'Excellent Listening! 🎉' : 'Keep Practicing'}
        </Text>
        <Text style={styles.scoreText}>{percentage}%</Text>
        <Text style={styles.scoreSubtext}>
          You answered {score} out of {listeningQuestions?.length || 0} questions correctly
        </Text>
      </View>

      {/* Feedback */}
      <View style={[styles.feedbackCard, passed ? styles.feedbackPass : styles.feedbackFail]}>
        <Text style={styles.feedbackTitle}>
          {passed ? 'Great Listening Skills!' : 'Review the Material'}
        </Text>
        <Text style={styles.feedbackText}>
          {passed
            ? 'Your listening comprehension is excellent. Continue practicing to improve further.'
            : 'Focus on listening for key words and main ideas. Try again to improve your score.'}
        </Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.retakeButton}
        onPress={handleRetake}
      >
        <Ionicons name="reload" size={18} color="#fff" />
        <Text style={styles.retakeButtonText}>Retake Quiz</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.continueButtonText}>Back to Learning</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  progress: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  instructionsCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.lg,
  },
  instructionsText: {
    flex: 1,
    gap: spacing.sm,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  instructionContent: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    lineHeight: 18,
  },
  audioCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    width: '100%',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 60,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  waveBarActive: {
    backgroundColor: colors.primary,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  timeText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  listenCountContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  listenCountLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  listenCountCircles: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listenCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  listenCircleUsed: {
    backgroundColor: colors.primary,
  },
  startButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  helpCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    lineHeight: 18,
  },
  // Questions Phase Styles
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
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Results Styles
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
  feedbackCard: {
    borderRadius: 12,
    padding: spacing.lg,
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
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
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
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default ListeningQuizScreen;
