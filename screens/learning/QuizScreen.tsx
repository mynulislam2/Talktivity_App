/**
 * Quiz Screen
 * 
 * Pronunciation quiz - matches Next.js /quiz page
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { progressService } from '@/service/ProgressService';
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
        if (!cancelled) setCompletionError(e?.message || 'Failed to save quiz completion.');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [completed, completedUI, percentScore, totalQuestions, dispatch]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Speech Recognition Not Supported</Text>
          <Text style={styles.errorText}>
            Your device doesn't support speech recognition. Please use a device with speech recognition capabilities.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Microphone Access Required</Text>
          <Text style={styles.errorText}>
            Please allow microphone access to use the pronunciation feature.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <QuizLoadingCard
            title="Creating Your Quiz"
            subtitle={loadingMessage || 'Our AI is analyzing your conversation to create personalized questions'}
            steps={steps}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (quizError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.errorCard}>
            <Text style={styles.errorCardTitle}>Failed to generate quiz</Text>
            <Text style={styles.errorCardText}>{quizError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                // Retry by resetting
                reset();
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No questions available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isPronunciation = String(currentQuestion.meta?.type || '').toLowerCase() === 'pronunciation';

  return (
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
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (isPronunciation
                      ? !userSpeech || userSpeech.trim().length === 0
                      : selectedOptionIds.length === 0) && styles.submitButtonDisabled,
                  ]}
                  disabled={
                    isPronunciation
                      ? !userSpeech || userSpeech.trim().length === 0
                      : selectedOptionIds.length === 0
                  }
                  onPress={submitAnswer}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.nextButton} onPress={goNext}>
                  <Text style={styles.nextButtonText}>
                    {currentIndex + 1 >= totalQuestions ? 'Finish' : 'Next'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
      >
        <QuestionCard question={currentQuestion} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0923',
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
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    maxWidth: 350,
    padding: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
    alignItems: 'center',
  },
  errorCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  errorCardText: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#5A4BC0',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#5A4BC0',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#5A4BC0',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
