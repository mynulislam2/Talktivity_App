/**
 * Quiz Screen
 *
 * Pronunciation quiz - matches Next.js /quiz page
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { progressService } from '@/services/progress';
import { usePronunciationQuizNative } from '@/hooks/quiz/usePronunciationQuizNative';
import { useAppDispatch } from '@/store/hooks';
import { setLastQuiz } from '@/store/slices/quizSlice';
import {
  AnswerFeedback,
  OptionsList,
  ProgressHeader,
  PronunciationControls,
  QuestionCard,
  QuizLoadingCard,
  QuizShell,
  QuizCongratulations,
} from '@/components/quiz';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { tokens } from '@/theme/tokens';
import { AppBackground } from '../../components/common/AppBackground';

export default function QuizScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [completedUI, setCompletedUI] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const {
    loading,
    loadingMessage,
    quizError,
    steps,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    listening,
    userSpeech,
    startListening,
    stopListening,
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedOptionIds,
    score,
    isAnswered,
    isCorrect,
    completed,
    selectOption,
    submitAnswer,
    goNext,
    reset,
  } = usePronunciationQuizNative();

  const percentScore = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((score / totalQuestions) * 100);
  }, [score, totalQuestions]);

  // Persist quiz completion when finished
  useEffect(() => {
    if (!completed || completedUI) return;
    let cancelled = false;

    const run = async () => {
      try {
        const progressResp = await progressService.updateDailyProgress({
          speaking_quiz_completed: true,
          speaking_quiz_score: percentScore,
        });
        if (!progressResp.success) {
          // Progress update failed, but continue
        }

        await AsyncStorage.setItem('isQuizComplete', 'true');
        dispatch(
          setLastQuiz({
            type: 'speaking',
            score: percentScore,
            total: totalQuestions,
            completedAt: new Date().toISOString(),
          })
        );
        if (!cancelled) setCompletedUI(true);
      } catch (e: any) {
        if (!cancelled)
          setCompletionError(e?.message || 'Failed to save quiz completion.');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [completed, completedUI, percentScore, totalQuestions, dispatch]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContent}>
            <Text style={styles.plainErrorTitle}>
              Speech Recognition Not Supported
            </Text>
            <Text style={styles.plainErrorText}>
              Your device doesn't support speech recognition. Please use a
              device with speech recognition capabilities.
            </Text>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContent}>
            <Text style={styles.plainErrorTitle}>Microphone Access Required</Text>
            <Text style={styles.plainErrorText}>
              Please allow microphone access to use the pronunciation feature.
            </Text>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (loading) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <QuizLoadingCard
              title="Creating Your Quiz"
              subtitle={
                loadingMessage ||
                'Our AI is analyzing your conversation to create personalized questions'
              }
              steps={steps}
            />
          </ScrollView>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (quizError) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContent}>
            <View style={styles.errorCard}>
              <Text style={styles.errorCardTitle}>Failed to generate quiz</Text>
              <Text style={styles.errorCardText}>{quizError}</Text>
              <FigmaPrimaryButton
                onPress={() => {
                  // Retry by resetting
                  reset();
                }}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </FigmaPrimaryButton>
            </View>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (completedUI) {
    return (
      <QuizCongratulations
        quizType="speaking"
        score={score}
        totalQuestions={totalQuestions}
        error={completionError}
        onTryAgain={() => {
          setCompletedUI(false);
          reset();
        }}
        onNext={() => {
          AsyncStorage.setItem('isQuizComplete', 'true');
          navigation.dispatch(
            CommonActions.navigate({
              name: 'MainTabs',
              params: {
                screen: 'Home',
              },
            })
          );
        }}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContent}>
            <Text style={styles.plainErrorText}>No questions available.</Text>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  const isPronunciation =
    String(currentQuestion.meta?.type || '').toLowerCase() === 'pronunciation';

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <QuizShell
          fullScreen={false}
          header={
            <ProgressHeader
              type="speaking"
              current={currentIndex + 1}
              total={totalQuestions}
              score={score}
            />
          }
          footer={
            <View style={styles.footer}>
              {isPronunciation && (
                <PronunciationControls
                  listening={listening}
                  userSpeech={userSpeech}
                  onStart={startListening}
                  onStop={stopListening}
                />
              )}
              <AnswerFeedback show={isAnswered} correct={isCorrect} />
              <View style={styles.buttonRow}>
                {!isAnswered ? (
                  <FigmaPrimaryButton
                    onPress={submitAnswer}
                    disabled={
                      isPronunciation
                        ? !userSpeech || userSpeech.trim().length === 0
                        : selectedOptionIds.length === 0
                    }
                    style={styles.ctaButton}
                  >
                    <Text style={styles.ctaButtonText}>Submit</Text>
                  </FigmaPrimaryButton>
                ) : (
                  <FigmaPrimaryButton onPress={goNext} style={styles.ctaButton}>
                    <Text style={styles.ctaButtonText}>
                      {currentIndex + 1 >= totalQuestions ? 'Finish' : 'Next'}
                    </Text>
                  </FigmaPrimaryButton>
                )}
              </View>
            </View>
          }
        >
          <QuestionCard question={currentQuestion} isAnswered={isAnswered} />
          {!isPronunciation && (
            <OptionsList
              options={currentQuestion.options}
              selectedIds={selectedOptionIds}
              correctIds={currentQuestion.correctOptionIds}
              disabled={isAnswered}
              showCorrectness={isAnswered}
              onSelect={selectOption}
            />
          )}
        </QuizShell>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  plainErrorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: tokens.color.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  plainErrorText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    maxWidth: 350,
    padding: 24,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.surface.card,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    alignItems: 'center',
  },
  errorCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    color: tokens.color.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorCardText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    height: 45,
    borderRadius: tokens.radius.sm,
    minWidth: 160,
  },
  retryButtonText: {
    color: tokens.color.text.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  footer: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaButton: {
    flex: 1,
    height: 45,
    borderRadius: tokens.radius.sm,
  },
  ctaButtonText: {
    color: tokens.color.text.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});
