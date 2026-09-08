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

export interface FluencyCardProps {
  fluency?: FluencyReport;
  onContinue: () => void;
  hideSectionHeader?: boolean;
}

export function FluencyCard({
  fluency,
  onContinue,
  hideSectionHeader = false,
}: FluencyCardProps) {
  const band = fluency?.band ?? fluency?.fluencyBand ?? 6.0;
  const numBand = Number(band) || 6.0;
  const targetBand = Math.min(9.0, Number((numBand + 0.5).toFixed(1)));
  const strengths = (fluency?.strengths && fluency.strengths.length > 0)
    ? fluency.strengths
    : ['Maintained consistent rhythm with intelligible pacing'];
  const areasForImprovement = (fluency?.improvements && fluency.improvements.length > 0)
    ? fluency.improvements
    : ['Minimize pauses when connecting compound clauses'];
  const wpm = fluency?.wordsPerMinute?.value ?? 110;
  const wpmEmoji = fluency?.wordsPerMinute?.emoji ?? '👍';
  const fillerCount = fluency?.fillerWords?.percentage ?? 2;
  const hesitationRate = fluency?.hesitationsAndCorrections?.rate ?? 3;
  const topFillersMap = fluency?.fillerWords?.topFillers;
  const topFillersList = topFillersMap
    ? Object.entries(topFillersMap).map(([word, count]) => ({ word, count }))
    : [];
  const fillerTip = fluency?.fillerWords?.feedback || 'Replace filler words with brief silent pauses for greater clarity.';

  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      {hideSectionHeader ? null : (
        <View style={ss.header}>
          <View style={[ss.iconBox, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
            <Ionicons name="chatbubbles" size={24} color="#60a5fa" />
          </View>
          <View>
            <Text style={ss.title}>Fluency & Coherence</Text>
            <Text style={ss.subtitle}>Band {band}</Text>
          </View>
        </View>
      )}

      <View style={ss.statSpace}>
        {/* 1. Official IELTS Band & Goal */}
        <StatCard title="Fluency & Coherence" value={`Band ${band}`}>
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

        {/* 2. Talktivity AI Telemetry: Pauses, Fillers & Pace */}
        <StatCard title="Speaking Patterns & Telemetry">
          <View style={ss.telemetryGrid}>
            <View style={ss.telemetryBox}>
              <Text style={ss.telemetryLabel}>Hesitations</Text>
              <Text style={ss.telemetryValue}>{hesitationRate}</Text>
              <Text style={ss.telemetrySub}>rate / min</Text>
            </View>
            <View style={ss.telemetryBox}>
              <Text style={ss.telemetryLabel}>Filler Words</Text>
              <Text style={ss.telemetryValue}>{fillerCount}%</Text>
              <Text style={ss.telemetrySub}>of speech</Text>
            </View>
            <View style={ss.telemetryBox}>
              <Text style={ss.telemetryLabel}>Speaking Pace</Text>
              <Text style={ss.telemetryValue}>{wpm} {wpmEmoji}</Text>
              <Text style={ss.telemetrySub}>words / min</Text>
            </View>
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

          <View style={ss.tipBox}>
            <Ionicons name="bulb-outline" size={16} color={tokens.color.accent.rim} style={{ marginTop: 2 }} />
            <Text style={ss.tipText}>{fillerTip}</Text>
          </View>
        </StatCard>
      </View>

      <ReportCTAButton label="Continue to Lexical Resource" onPress={onContinue} />
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
