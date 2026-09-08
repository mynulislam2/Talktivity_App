/**
 * PronunciationCard Component (React Native)
 *
 * Page 5 of the Talktivity IELTS Speaking Report.
 * Displays Pronunciation Band, sound clarity, sentence stress/intonation, and key priorities.
 * Concludes the report with a clean "Back to Today's Plan" button.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { StatCard } from '@/components/report/StatCard';
import { tokens } from '@/theme/tokens';
import type { PronunciationReport } from '@/types/report';

export interface PronunciationCardProps {
  pronunciation?: PronunciationReport;
  onContinue: () => void;
  hideSectionHeader?: boolean;
}

export function PronunciationCard({
  pronunciation,
  onContinue,
  hideSectionHeader = false,
}: PronunciationCardProps) {
  const band = pronunciation?.band || pronunciation?.pronunciationBand || 6.0;
  const numBand = Number(band) || 6.0;
  const targetBand = Math.min(9.0, Number((numBand + 0.5).toFixed(1)));
  const strengths = (pronunciation?.strengths && pronunciation.strengths.length > 0)
    ? pronunciation.strengths
    : [
        'Clear word boundaries and natural speech rhythm',
        'Vowel sounds are mostly distinct and understandable',
      ];
  const areasForImprovement = (pronunciation?.improvements && pronunciation.improvements.length > 0)
    ? pronunciation.improvements
    : [
        'Watch syllable stress on multi-syllable academic words',
        'Focus on clear final consonant articulation',
      ];
  const struggledWords = pronunciation?.struggledWords ?? [];

  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      {hideSectionHeader ? null : (
        <View style={ss.header}>
          <View style={[ss.iconBox, { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
            <Ionicons name="mic" size={24} color="#818cf8" />
          </View>
          <View>
            <Text style={ss.title}>Pronunciation</Text>
            <Text style={ss.subtitle}>Band {band}</Text>
          </View>
        </View>
      )}

      <View style={ss.statSpace}>
        {/* 1. Official IELTS Band & Goal */}
        <StatCard title="Pronunciation" value={`Band ${band}`}>
          <Text style={[ss.desc, { color: tokens.color.accent.rim, fontWeight: '500' }]}>
            Next Milestone: Band {targetBand} (0.5 band to go)
          </Text>
          <View style={{ marginTop: 8, gap: 8 }}>
            {strengths.map((s, i) => (
              <View key={`s-${i}`} style={ss.bulletRow}>
                <Ionicons name="checkmark-circle" size={16} color="#34d399" style={{ marginTop: 2 }} />
                <Text style={ss.bulletText}>{s}</Text>
              </View>
            ))}
            {areasForImprovement.map((imp, i) => (
              <View key={`imp-${i}`} style={ss.bulletRow}>
                <Ionicons name="alert-circle" size={16} color="#fb923c" style={{ marginTop: 2 }} />
                <Text style={ss.bulletText}>{imp}</Text>
              </View>
            ))}
          </View>
        </StatCard>

        {/* 2. Struggled Words with Phonetic Respelling & Syllable Stress */}
        {struggledWords && struggledWords.length > 0 ? (
          <StatCard title="Pronunciation Focus">
            <Text style={ss.desc}>Words to articulate more clearly, with syllable stress:</Text>
            {struggledWords.map((item: any, idx: number) => (
              <View key={idx} style={ss.wordCard}>
                <View style={ss.wordHeader}>
                  <Text style={ss.wordName}>"{item.word}"</Text>
                  <View style={ss.phoneticBadge}>
                    <Text style={ss.phoneticText}>{item.phonetic}</Text>
                  </View>
                </View>
                <Text style={ss.wordTip}>💡 {item.tip}</Text>
              </View>
            ))}
          </StatCard>
        ) : null}
      </View>

      <ReportCTAButton label="Continue to Action Plan" onPress={onContinue} />
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: 'transparent' },
  container: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBox: { padding: 8, borderRadius: tokens.radius.sm },
  title: { fontSize: 20, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: tokens.color.text.primary },
  subtitle: { fontSize: 14, fontFamily: 'Poppins', color: tokens.color.text.secondary },
  statSpace: { gap: 16 },
  desc: { fontSize: 14, fontFamily: 'Poppins', color: tokens.color.text.secondary, lineHeight: 20 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins',
    color: tokens.color.text.primary,
    lineHeight: 19,
  },
  wordCard: {
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    marginTop: 8,
    gap: 6,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.text.primary,
  },
  phoneticBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tokens.radius.xs,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  phoneticText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.accent.rim,
    letterSpacing: 0.5,
  },
  wordTip: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    lineHeight: 17,
  },
});
