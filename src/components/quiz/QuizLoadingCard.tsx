/**
 * QuizLoadingCard Component (React Native)
 *
 * Loading state for quiz generation with animated steps.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

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
            <View style={styles.spinnerOuter}>
              <View style={styles.spinnerInner}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            </View>
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
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
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
    backgroundColor: '#0a0923',
  },
  card: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
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
    backgroundColor: '#6A5AE0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
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
    backgroundColor: '#10b981',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: '#7B70FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
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
    color: '#9ca3af',
  },
  progressPercent: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6A5AE0',
    borderRadius: 6,
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.2)',
  },
  stepItemActive: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconText: {
    fontSize: 18,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  stepTextActive: {
    color: '#fff',
  },
});
