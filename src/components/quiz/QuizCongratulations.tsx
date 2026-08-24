/**
 * QuizCongratulations Component (React Native)
 *
 * Congratulations screen after quiz completion. Token-based treatment
 * matching the Listening Quiz completion screen (party-popper artwork,
 * percentage score, primary CTA), with a secondary "Try Again" action.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { tokens } from '@/theme/tokens';
import { AppBackground } from '../common/AppBackground';

const PARTY_POPPER = require('../../../assets/figma/listening/party-popper.png');

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
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <AppBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={styles.content} entering={FadeIn.duration(600)}>
            <Image source={PARTY_POPPER} style={styles.popper} resizeMode="contain" />
            <Text style={styles.title}>Congratulations!</Text>
            <Animated.Text
              style={styles.message}
              entering={FadeInUp.delay(400).duration(500)}
            >
              {quizTypeMessage}
            </Animated.Text>
            <Animated.View
              style={styles.scoreWrap}
              entering={FadeInUp.delay(600).duration(500)}
            >
              <Text style={styles.scoreText}>{percentage}%</Text>
              <Text style={styles.scoreLabel}>
                {score}/{totalQuestions}
              </Text>
            </Animated.View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Animated.View
              style={styles.buttons}
              entering={FadeInUp.delay(800).duration(500)}
            >
              <TouchableOpacity style={styles.secondaryButton} onPress={onTryAgain}>
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>
              <FigmaPrimaryButton onPress={onNext} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Next</Text>
                <Ionicons name="chevron-forward" size={18} color={tokens.color.text.primary} />
              </FigmaPrimaryButton>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  popper: { width: 150, height: 150 },
  title: {
    marginTop: 16,
    fontSize: 36,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 36,
    letterSpacing: -0.72,
    color: tokens.color.text.primary,
    textAlign: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: tokens.color.text.primary,
    textAlign: 'center',
  },
  scoreWrap: { alignItems: 'center', marginTop: 48 },
  scoreText: {
    fontSize: 40,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 48,
    letterSpacing: -0.8,
    color: tokens.color.text.primary,
  },
  scoreLabel: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 20,
    color: tokens.color.text.secondary,
  },
  errorText: {
    marginTop: 24,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: tokens.color.state.errorText,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    height: 45,
    borderRadius: tokens.radius.sm,
  },
  primaryButtonText: {
    color: tokens.color.text.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  secondaryButton: {
    flex: 1,
    height: 45,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: tokens.color.text.primary,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});
