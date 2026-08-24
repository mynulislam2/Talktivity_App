/**
 * FluencyCard Component (React Native)
 *
 * Displays fluency analysis. Matches talktivity_frontend StatCard design.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/report/ProgressBar';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { tokens } from '@/theme/tokens';
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
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.text.primary,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: tokens.color.text.primary,
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
            <Text style={ss.desc}>Improvement target not available</Text>
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

      <ReportCTAButton label="Continue to Grammar" onPress={onContinue} />
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: tokens.color.bg.screen },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBox: { padding: 8, borderRadius: tokens.radius.md },
  title: { fontSize: 20, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: tokens.color.text.primary },
  subtitle: { fontSize: 14, fontFamily: 'Poppins', color: tokens.color.text.secondary },
  statSpace: { gap: 16 },
  desc: { fontSize: 14, fontFamily: 'Poppins', color: tokens.color.text.secondary, lineHeight: 20 },
  emoji: { fontSize: 20, fontFamily: 'Poppins', marginBottom: 4 },
});
