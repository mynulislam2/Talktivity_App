/**
 * QuizCongratulations Component (React Native)
 * 
 * Congratulations screen after quiz completion.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface QuizCongratulationsProps {
  quizType: 'speaking' | 'listening';
  score: number;
  totalQuestions: number;
  error?: string | null;
  onTryAgain: () => void;
  onNext: () => void;
}

export function QuizCongratulations({
  quizType,
  score,
  totalQuestions,
  error,
  onTryAgain,
  onNext,
}: QuizCongratulationsProps) {
  const quizTypeMessage =
    quizType === 'listening'
      ? "You've completed the listening quiz!"
      : "You've completed the quiz!";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>🎉 Congratulations!</Text>
          <Text style={styles.message}>{quizTypeMessage}</Text>
          <Text style={styles.scoreText}>
            Your Score: <Text style={styles.scoreValue}>{score}</Text> /{' '}
            <Text style={styles.scoreValue}>{totalQuestions}</Text>
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={onTryAgain}>
              <Text style={styles.buttonText}>🔁 Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    padding: 16,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#10b981',
    textAlign: 'center',
  },
  message: {
    fontSize: 20,
    color: '#d1d5db',
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  scoreValue: {
    color: '#7B70FF',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    color: '#fca5a5',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#5A4BC0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
