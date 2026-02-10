/**
 * Listening Quiz Screen
 * 
 * Listening comprehension quiz - matches Next.js /listening-quiz page
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { progressService } from '@/service/ProgressService';
import { useListeningQuizNative } from '@/hooks/quiz/useListeningQuizNative';
import { useAppDispatch } from '@/store/hooks';
import { setLastListeningQuiz } from '@/store/slices/quizSlice';
import {
  AnswerFeedback,
  OptionsList,
  ProgressHeader,
  QuestionCard,
  QuizLoadingCard,
  QuizShell,
  QuizCongratulations,
} from '@/components/quiz';
import { ListeningControls } from '@/components/quiz/ListeningControls';

export default function ListeningQuizScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [completedUI, setCompletedUI] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const {
    loading,
    loadingMessage,
    quizError,
    steps,
    currentTopic,
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
    isPlaying,
    togglePlay,
    audioProgress,
    listeningCount,
    maxListens,
  } = useListeningQuizNative();

  const percentScore = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((score / totalQuestions) * 100);
  }, [score, totalQuestions]);

  // Persist completion
  useEffect(() => {
    if (!completed || completedUI) return;
    let cancelled = false;
    const run = async () => {
      try {
        const progressResp = await progressService.updateDailyProgress({
          listening_quiz_completed: true,
          listening_quiz_score: percentScore,
        });
        if (!progressResp.success) {
          // Progress update failed, but continue
        }

        dispatch(
          setLastListeningQuiz({
            type: 'listening',
            score: percentScore,
            total: totalQuestions,
            completedAt: new Date().toISOString(),
          })
        );

        if (!cancelled) setCompletedUI(true);
      } catch (e: any) {
        if (!cancelled) setCompletionError(e?.message || 'Failed to save listening quiz completion.');
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [completed, completedUI, percentScore, totalQuestions, dispatch]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <QuizLoadingCard
            title="Creating Your Listening Quiz"
            subtitle={loadingMessage || 'Our AI is analyzing the conversation to create comprehension questions'}
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
            <Text style={styles.errorCardTitle}>Failed to generate listening quiz</Text>
            <Text style={styles.errorCardText}>{quizError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
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

  // Show congratulations page when quiz is completed
  if (completedUI) {
    return (
      <QuizCongratulations
        quizType="listening"
        score={score}
        totalQuestions={totalQuestions}
        error={completionError}
        onTryAgain={() => {
          setCompletedUI(false);
          reset();
        }}
        onNext={() => {
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

  return (
    <SafeAreaView style={styles.container}>
      <QuizShell
        fullScreen={false}
        header={
          <ProgressHeader
            type="listening"
            current={currentIndex + 1}
            total={totalQuestions}
            score={score}
          />
        }
        footer={
          <View style={styles.footer}>
            <AnswerFeedback show={isAnswered} correct={isCorrect} />
            <View style={styles.buttonRow}>
              {!isAnswered ? (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    selectedOptionIds.length === 0 && styles.submitButtonDisabled,
                  ]}
                  disabled={selectedOptionIds.length === 0}
                  onPress={submitAnswer}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => {
                    if (currentIndex + 1 >= totalQuestions) {
                      goNext();
                    } else {
                      goNext();
                    }
                  }}
                >
                  <Text style={styles.nextButtonText}>
                    {currentIndex + 1 >= totalQuestions ? 'Finish' : 'Next'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
      >
        {currentTopic?.title ? (
          <View style={styles.topicCard}>
            <Text style={styles.topicLabel}>Today's topic</Text>
            <Text style={styles.topicTitle}>{String(currentTopic.title)}</Text>
          </View>
        ) : null}
        <QuestionCard question={currentQuestion} />
        <ListeningControls
          isPlaying={isPlaying}
          audioProgress={audioProgress}
          listeningCount={listeningCount}
          maxListens={maxListens}
          onTogglePlay={togglePlay}
        />
        <OptionsList
          options={currentQuestion.options}
          selectedIds={selectedOptionIds}
          correctIds={currentQuestion.correctOptionIds}
          disabled={isAnswered}
          showCorrectness={isAnswered}
          onSelect={selectOption}
        />
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
  errorText: {
    fontSize: 16,
    color: '#d1d5db',
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
  topicCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.2)',
  },
  topicLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
