import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '@/theme/tokens';

export interface ReportLoadingCardProps {
  loadingMessage?: string;
  onContinue?: () => void;
  headline?: string;
  totalDurationMs?: number;
}

const DEFAULT_TASKS = [
  {
    icon: 'chatbubbles-outline' as const,
    label: 'Fetching your latest conversation',
  },
  {
    icon: 'document-text-outline' as const,
    label: 'Identifying grammar mistakes',
  },
  { icon: 'book-outline' as const, label: 'Spotting vocabulary improvements' },
  { icon: 'create-outline' as const, label: 'Finding sentence improvements' },
  { icon: 'layers-outline' as const, label: 'Building your review cards' },
];

export function ReportLoadingCard({
  loadingMessage,
  headline = 'Preparing Your Report',
  totalDurationMs = 40000,
}: ReportLoadingCardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const resolvedTasks = useMemo(() => DEFAULT_TASKS, []);

  useEffect(() => {
    const totalDuration = Math.max(1000, totalDurationMs);
    const count = resolvedTasks.length;
    const stepDuration = totalDuration / count;
    const tick = 50;
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 100 / (totalDuration / tick);
      });
    }, tick);
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= count - 1) {
          clearInterval(stepTimer);
          return count - 1;
        }
        return prev + 1;
      });
    }, stepDuration);
    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [totalDurationMs, resolvedTasks.length]);

  const percent = Math.round(progress);

  return (
    <View style={s.container}>
      <View style={s.progressRow}>
        <Text style={s.progressLabel}>Progress</Text>
        <Text style={s.progressValue}>{percent}%</Text>
      </View>
      <View style={s.track}>
        <LinearGradient
          colors={['#2a14ff', '#6a4bff', '#c55dfe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[s.fill, { width: `${percent}%` } as any]}
        />
      </View>
      <Text style={s.eyebrow}>ANALYSIS</Text>
      <Text style={s.headline}>{headline}</Text>
      {loadingMessage ? (
        <Text style={s.loadingMsg}>{loadingMessage}</Text>
      ) : null}
      <View style={s.taskList}>
        {resolvedTasks.map((task, idx) => {
          const done = idx < currentStep;
          const active = idx === currentStep;
          return (
            <View key={idx} style={[s.taskItem, active && s.taskItemActive]}>
              <View style={s.taskIconWrap}>
                <Ionicons name={task.icon} size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    s.taskLabel,
                    done || active ? s.taskLabelActive : s.taskLabelInactive,
                  ]}
                >
                  {task.label}
                </Text>
                {active ? (
                  <Text style={s.taskProcessing}>Processing...</Text>
                ) : null}
              </View>
              {done ? (
                <View style={s.taskCheck}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 353,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: { fontSize: 12, lineHeight: 17, color: tokens.color.text.secondary },
  progressValue: { fontSize: 12, lineHeight: 17, color: tokens.color.text.primary },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  eyebrow: {
    marginTop: 32,
    fontSize: 12,
    letterSpacing: 2.88,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.42)',
  },
  headline: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    lineHeight: 28,
    textAlign: 'center',
    color: tokens.color.text.primary,
  },
  loadingMsg: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: tokens.color.text.secondary,
  },
  taskList: { marginTop: 32, gap: 12 },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  taskItemActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  taskIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(79,93,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskLabel: { fontSize: 14, fontWeight: '500', fontFamily: 'Poppins-Medium', lineHeight: 19 },
  taskLabelActive: { color: tokens.color.text.primary },
  taskLabelInactive: { color: 'rgba(255,255,255,0.7)' },
  taskProcessing: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#5cff4d',
  },
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1e8a37',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
