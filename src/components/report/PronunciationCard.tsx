/**
 * PronunciationCard Component (React Native)
 *
 * IELTS-only page: the general report has no pronunciation section, so this
 * card is rendered from the IELTS report flow only.
 * Displays Pronunciation Band, sound clarity, sentence stress/intonation, and key priorities.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { StatCard } from '@/components/report/StatCard';
import { tokens } from '@/theme/tokens';
import { formatBandLabel } from '@/lib/report/bandLabel';
import type { PronunciationReport, PronunciationStatus } from '@/types/report';

export interface PronunciationCardProps {
  pronunciation?: PronunciationReport;
  /** From the report's pronunciation_status; defaults to "not_measured". */
  status?: PronunciationStatus;
  onContinue: () => void;
  hideSectionHeader?: boolean;
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function PronunciationCard({
  pronunciation,
  status = 'not_measured',
  onContinue,
  hideSectionHeader = false,
}: PronunciationCardProps) {
  const measured = status === 'measured';
  const band = measured
    ? finite(pronunciation?.band) ?? finite(pronunciation?.pronunciationBand)
    : null;
  const bandLabel = band != null ? formatBandLabel(band, pronunciation?.cefr) : null;
  const statusText =
    bandLabel ?? (status === 'pending' ? 'Measuring from your recording…' : 'Not measured');
  const targetBand =
    band != null ? Math.min(9.0, Number((band + 0.5).toFixed(1))) : null;
  const strengths = measured ? pronunciation?.strengths ?? [] : [];
  const areasForImprovement = measured ? pronunciation?.improvements ?? [] : [];
  const struggledWords = measured ? pronunciation?.struggledWords ?? [] : [];

  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      {hideSectionHeader ? null : (
        <View style={ss.header}>
          <View style={[ss.iconBox, { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
            <Ionicons name="mic" size={24} color="#818cf8" />
          </View>
          <View>
            <Text style={ss.title}>Pronunciation</Text>
            <Text style={ss.subtitle}>{statusText}</Text>
          </View>
        </View>
      )}

      <View style={ss.statSpace}>
        {/* 1. Official IELTS Band & Goal */}
        <StatCard title="Pronunciation" value={bandLabel ?? undefined}>
          {bandLabel == null ? (
            <Text style={ss.desc}>{statusText}</Text>
          ) : targetBand != null ? (
            <Text style={[ss.desc, { color: tokens.color.accent.rim, fontWeight: '500' }]}>
              Next Milestone: {formatBandLabel(targetBand) ?? `Band ${targetBand}`} (0.5 band to go)
            </Text>
          ) : null}
          {strengths.length > 0 || areasForImprovement.length > 0 ? (
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
          ) : null}
        </StatCard>

        {/* 2. Struggled Words with Phonetic Respelling & Syllable Stress */}
        {struggledWords && struggledWords.length > 0 ? (
          <StatCard title="Pronunciation Focus">
            <Text style={ss.desc}>Words to articulate more clearly, with syllable stress:</Text>
            {struggledWords.map((item: any, idx: number) => (
              <View key={idx} style={ss.wordCard}>
                <View style={ss.wordHeader}>
                  <Text style={ss.wordName}>"{item.word}"</Text>
                  {item.phonetic ? (
                    <View style={ss.phoneticBadge}>
                      <Text style={ss.phoneticText}>{item.phonetic}</Text>
                    </View>
                  ) : null}
                </View>
                {item.tip ? <Text style={ss.wordTip}>💡 {item.tip}</Text> : null}
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
