/**
 * FluencyCard Component (React Native)
 *
 * Displays fluency analysis. Matches talktivity_frontend StatCard design.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/report/ProgressBar';
import type { FluencyReport } from '@/types/report';

export interface FluencyCardProps {
  fluency: FluencyReport;
  onContinue: () => void;
  hideSectionHeader?: boolean;
}

function StatCard({
  title,
  value,
  children,
}: {
  title: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.title}>{title}</Text>
      {value ? <Text style={statStyles.value}>{value}</Text> : null}
      <View style={statStyles.body}>{children}</View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  body: {
    marginTop: 8,
  },
});

export function FluencyCard({
  fluency,
  onContinue,
  hideSectionHeader = false,
}: FluencyCardProps) {
  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      <View style={ss.inner}>
        {hideSectionHeader ? null : (
          <View style={ss.header}>
            <View style={[ss.iconBox, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
              <Ionicons name="chatbubbles" size={24} color="#60a5fa" />
            </View>
            <View>
              <Text style={ss.title}>Fluency Analysis</Text>
              <Text style={ss.subtitle}>Level {fluency.fluencyLevel}</Text>
            </View>
          </View>
        )}

        <View style={ss.statSpace}>
          <StatCard title="Fluency Score" value={`${fluency.fluencyScore}%`}>
            {fluency.improvementTarget ? (
              <Text style={ss.desc}>
                You are {fluency.improvementTarget.percentToNextLevel}% away from{' '}
                {fluency.improvementTarget.nextLevel}
              </Text>
            ) : (
              <Text style={[ss.desc, { color: '#9ca3af' }]}>
                Improvement target not available
              </Text>
            )}
          </StatCard>

          {fluency.wordsPerMinute && (
            <StatCard
              title="Speaking Pace"
              value={`${fluency.wordsPerMinute.value || 0} WPM`}
            >
              {fluency.wordsPerMinute.emoji ? (
                <Text style={ss.emoji}>{fluency.wordsPerMinute.emoji}</Text>
              ) : null}
              {fluency.wordsPerMinute.feedback ? (
                <Text style={ss.desc}>{fluency.wordsPerMinute.feedback}</Text>
              ) : null}
              {typeof fluency.wordsPerMinute.speedBarPercent === 'number' && (
                <ProgressBar value={fluency.wordsPerMinute.speedBarPercent} color="#10b981" />
              )}
            </StatCard>
          )}

          {fluency.fillerWords && (
            <StatCard title="Filler Words" value={`${fluency.fillerWords.percentage || 0}%`}>
              {fluency.fillerWords.feedback ? (
                <Text style={ss.desc}>{fluency.fillerWords.feedback}</Text>
              ) : null}
            </StatCard>
          )}

          {fluency.hesitationsAndCorrections && (
            <StatCard
              title="Hesitations"
              value={`${fluency.hesitationsAndCorrections.rate || 0}/min`}
            >
              {fluency.hesitationsAndCorrections.feedback ? (
                <Text style={ss.desc}>{fluency.hesitationsAndCorrections.feedback}</Text>
              ) : null}
            </StatCard>
          )}
        </View>

        <TouchableOpacity onPress={onContinue} activeOpacity={0.9}>
          <LinearGradient
            colors={['#2563eb', '#9333ea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={ss.gradientBtn}
          >
            <Text style={ss.btnText}>Continue to Grammar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#09090f' },
  container: { flexGrow: 1, alignItems: 'center', padding: 16 },
  inner: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 8,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBox: { padding: 8, borderRadius: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#9ca3af' },
  statSpace: { gap: 16 },
  desc: { fontSize: 14, color: '#d1d5db', lineHeight: 20 },
  emoji: { fontSize: 20, marginBottom: 4 },
  gradientBtn: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
