/**
 * FluencyCard Component (React Native)
 *
 * Displays fluency analysis. Matches talktivity_frontend StatCard design.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { StatCard } from '@/components/report/StatCard';
import { tokens } from '@/theme/tokens';
import type { FluencyReport } from '@/types/report';
import type { ReportMode } from '@/lib/report/reportMode';

export interface FluencyCardProps {
  fluency?: FluencyReport;
  onContinue: () => void;
  hideSectionHeader?: boolean;
  mode?: ReportMode;
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function FluencyCard({
  fluency,
  onContinue,
  hideSectionHeader = false,
  mode = 'ielts',
}: FluencyCardProps) {
  const isIelts = mode === 'ielts';
  const band = finite(fluency?.band) ?? finite(fluency?.fluencyBand);
  const targetBand =
    band != null ? Math.min(9.0, Number((band + 0.5).toFixed(1))) : null;
  const strengths = fluency?.strengths ?? [];
  const areasForImprovement = fluency?.improvements ?? [];
  const score = finite(fluency?.fluencyScore);
  const improvementTarget = fluency?.improvementTarget;
  const wpm = finite(fluency?.wordsPerMinute?.value);
  const wpmEmoji = fluency?.wordsPerMinute?.emoji;
  const fillerCount = finite(fluency?.fillerWords?.percentage);
  const hesitationRate = finite(fluency?.hesitationsAndCorrections?.rate);
  const hasTelemetry =
    wpm != null || fillerCount != null || hesitationRate != null;
  const topFillersMap = fluency?.fillerWords?.topFillers;
  const topFillersList = topFillersMap
    ? Object.entries(topFillersMap).map(([word, count]) => ({ word, count }))
    : [];
  const fillerTip = fluency?.fillerWords?.feedback;

  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      {hideSectionHeader ? null : (
        <View style={ss.header}>
          <View style={[ss.iconBox, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
            <Ionicons name="chatbubbles" size={24} color="#60a5fa" />
          </View>
          <View>
            <Text style={ss.title}>
              {isIelts ? 'Fluency & Coherence' : 'Fluency Analysis'}
            </Text>
            {isIelts ? (
              <Text style={ss.subtitle}>
                {band != null ? `Band ${band}` : 'Band not available'}
              </Text>
            ) : fluency?.fluencyLevel ? (
              <Text style={ss.subtitle}>Level {fluency.fluencyLevel}</Text>
            ) : null}
          </View>
        </View>
      )}

      <View style={ss.statSpace}>
        {/* 1. Score / band headline and coaching notes */}
        <StatCard
          title={isIelts ? 'Fluency & Coherence' : 'Fluency Score'}
          value={
            isIelts
              ? band != null
                ? `Band ${band}`
                : undefined
              : score != null
                ? `${score}%`
                : undefined
          }
        >
          {isIelts ? (
            targetBand != null ? (
              <Text style={[ss.desc, { color: tokens.color.accent.rim, fontWeight: '500' }]}>
                Next Milestone: Band {targetBand} (0.5 band to go)
              </Text>
            ) : (
              <Text style={ss.desc}>Band not available</Text>
            )
          ) : improvementTarget ? (
            <Text style={ss.desc}>
              You are {improvementTarget.percentToNextLevel}% away from{' '}
              {improvementTarget.nextLevel}
            </Text>
          ) : (
            <Text style={ss.desc}>Improvement target not available</Text>
          )}
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

        {/* 2. Talktivity AI Telemetry: Pauses, Fillers & Pace */}
        {hasTelemetry ? (
          <StatCard title="Speaking Patterns & Telemetry">
            <View style={ss.telemetryGrid}>
              {hesitationRate != null ? (
                <View style={ss.telemetryBox}>
                  <Text style={ss.telemetryLabel}>Hesitations</Text>
                  <Text style={ss.telemetryValue}>{hesitationRate}</Text>
                  <Text style={ss.telemetrySub}>rate / min</Text>
                </View>
              ) : null}
              {fillerCount != null ? (
                <View style={ss.telemetryBox}>
                  <Text style={ss.telemetryLabel}>Filler Words</Text>
                  <Text style={ss.telemetryValue}>{fillerCount}%</Text>
                  <Text style={ss.telemetrySub}>of speech</Text>
                </View>
              ) : null}
              {wpm != null ? (
                <View style={ss.telemetryBox}>
                  <Text style={ss.telemetryLabel}>Speaking Pace</Text>
                  <Text style={ss.telemetryValue}>
                    {wpm}
                    {wpmEmoji ? ` ${wpmEmoji}` : ''}
                  </Text>
                  <Text style={ss.telemetrySub}>words / min</Text>
                </View>
              ) : null}
            </View>

            {/* Top Fillers Breakdown */}
            {topFillersList && topFillersList.length > 0 ? (
              <View style={ss.fillerBreakdown}>
                <Text style={ss.subLabel}>Top Fillers Detected:</Text>
                <View style={ss.fillerChipRow}>
                  {topFillersList.map((item, idx) => (
                    <View key={idx} style={ss.fillerChip}>
                      <Text style={ss.fillerChipWord}>"{item.word}"</Text>
                      <Text style={ss.fillerChipCount}>{item.count}x</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {fillerTip ? (
              <View style={ss.tipBox}>
                <Ionicons name="bulb-outline" size={16} color={tokens.color.accent.rim} style={{ marginTop: 2 }} />
                <Text style={ss.tipText}>{fillerTip}</Text>
              </View>
            ) : null}
          </StatCard>
        ) : null}
      </View>

      <ReportCTAButton
        label={isIelts ? 'Continue to Lexical Resource' : 'Continue to Grammar'}
        onPress={onContinue}
      />
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
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  telemetryBox: {
    flex: 1,
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 10,
    alignItems: 'center',
  },
  telemetryLabel: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    textAlign: 'center',
  },
  telemetryValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    marginVertical: 2,
  },
  telemetrySub: {
    fontSize: 10,
    fontFamily: 'Poppins',
    color: tokens.color.text.placeholder,
    textAlign: 'center',
  },
  tipBox: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 10,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    lineHeight: 17,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: tokens.color.text.secondary,
  },
  fillerBreakdown: {
    marginTop: 10,
    gap: 6,
  },
  fillerChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fillerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  fillerChipWord: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#fdfdfd',
  },
  fillerChipCount: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: tokens.color.accent.rim,
  },
});
