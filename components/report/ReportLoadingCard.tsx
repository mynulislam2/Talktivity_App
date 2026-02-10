/**
 * ReportLoadingCard Component (React Native)
 * 
 * Loading state with progress animation.
 * Matches Next.js implementation.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ReportLoadingCardProps {
  loadingMessage?: string;
  onContinue?: () => void;
}

export function ReportLoadingCard({ loadingMessage, onContinue }: ReportLoadingCardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { name: "Evaluating grammar accuracy", icon: "📝", color: "#a855f7" },
    { name: "Assessing vocabulary range", icon: "📚", color: "#10b981" },
    { name: "Measuring fluency metrics", icon: "⚡", color: "#eab308" },
    { name: "Analyzing discourse patterns", icon: "🧠", color: "#6366f1" },
    { name: "Generating personalized insights", icon: "✨", color: "#ec4899" }
  ];

  useEffect(() => {
    const totalDuration = 10000; // 10 seconds
    const stepDuration = totalDuration / steps.length;
    const progressInterval = 50;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + (100 / (totalDuration / progressInterval));
      });
    }, progressInterval);

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => {
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
  }, []);

  useEffect(() => {
    if (progress >= 100 && onContinue) {
      const timer = setTimeout(() => {
        onContinue();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress, onContinue]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
            </View>
          </View>
          <Text style={styles.title}>Generating Your Report</Text>
          <Text style={styles.subtitle}>
            {loadingMessage || "Our AI is analyzing your conversation with advanced language processing"}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${progress}%` }
              ]}
            />
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepItem,
                index <= currentStep && styles.stepItemActive
              ]}
            >
              <View style={[
                styles.stepIcon,
                { backgroundColor: index <= currentStep ? step.color : 'rgba(55, 65, 81, 0.5)' }
              ]}>
                <Text style={styles.stepIconText}>{step.icon}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepName,
                  index <= currentStep && styles.stepNameActive
                ]}>
                  {step.name}
                </Text>
                {index <= currentStep && (
                  <View style={styles.stepStatus}>
                    <View style={styles.stepStatusDot} />
                    <Text style={styles.stepStatusText}>Processing...</Text>
                  </View>
                )}
              </View>
              {index < currentStep && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
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
    backgroundColor: '#0A0923',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B70FF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(156, 163, 175, 1)',
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
    fontSize: 14,
    color: 'rgba(156, 163, 175, 1)',
  },
  progressValue: {
    fontSize: 14,
    color: 'rgba(156, 163, 175, 1)',
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
    backgroundColor: 'rgba(31, 41, 55, 0.2)',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconText: {
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(107, 114, 128, 1)',
  },
  stepNameActive: {
    color: '#fff',
  },
  stepStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  stepStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  stepStatusText: {
    fontSize: 12,
    color: '#10b981',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
