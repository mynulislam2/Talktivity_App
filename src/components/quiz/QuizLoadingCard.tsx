/**
 * QuizLoadingCard Component (React Native)
 *
 * Loading state for quiz generation with animated steps.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '@/theme/tokens';

export interface QuizLoadingStep {
  name: string;
  icon: string;
  color: string;
}

export interface QuizLoadingCardProps {
  title: string;
  subtitle: string;
  steps: QuizLoadingStep[];
  durationMs?: number;
}

export function QuizLoadingCard({
  title,
  subtitle,
  steps,
  durationMs = 10000,
}: QuizLoadingCardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = durationMs / Math.max(1, steps.length);
    const progressInterval = 50;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 100 / (durationMs / progressInterval);
      });
    }, progressInterval);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepTimer);
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [durationMs, steps.length]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.spinnerContainer}>
            <LinearGradient
              colors={[tokens.color.accent.gradientStart, tokens.color.accent.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.spinnerOuter}
            >
              <View style={styles.spinnerInner}>
                <ActivityIndicator size="small" color={tokens.color.text.primary} />
              </View>
            </LinearGradient>
            <View style={styles.indicatorDot} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[tokens.color.accent.gradientStart, '#6a4bff', tokens.color.accent.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
        </View>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepItem,
                index <= currentStep && styles.stepItemActive,
              ]}
            >
              <View
                style={[
                  styles.stepIcon,
                  index <= currentStep && { backgroundColor: step.color },
                ]}
              >
                <Text style={styles.stepIconText}>{step.icon}</Text>
              </View>
              <Text
                style={[
                  styles.stepText,
                  index <= currentStep && styles.stepTextActive,
                ]}
              >
                {step.name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  spinnerContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  spinnerOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(9,9,15,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorDot: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.color.state.success,
  },
  title: {
    fontSize: 22,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: tokens.color.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400', fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '400', fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '400', fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepsContainer: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.color.border.hairline,
    backgroundColor: tokens.color.surface.subtle,
  },
  stepItemActive: {
    backgroundColor: tokens.color.surface.raised,
    borderColor: tokens.color.border.card,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconText: {
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: tokens.color.text.placeholder,
  },
  stepTextActive: {
    color: tokens.color.text.primary,
  },
});
