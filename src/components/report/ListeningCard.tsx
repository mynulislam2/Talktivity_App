/**
 * ListeningCard Component (React Native)
 *
 * Displays IELTS Listening Performance:
 * - Listening Score / Accuracy
 * - Estimated IELTS Listening Band
 * - Key Problems & Weaknesses Identified
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { StatCard } from '@/components/report/StatCard';
import { tokens } from '@/theme/tokens';
import { formatBandLabel } from '@/lib/report/bandLabel';
import type { ListeningReport } from '@/types/report';

export interface ListeningCardProps {
  listening?: ListeningReport;
  onContinue: () => void;
  hideSectionHeader?: boolean;
}

export function ListeningCard({
  listening,
  onContinue,
  hideSectionHeader = false,
}: ListeningCardProps) {
  const rawBand = listening?.band ?? listening?.estimated_band;
  const numBand = rawBand !== undefined && rawBand !== null ? Number(rawBand) : null;
  const hasBand = numBand !== null && Number.isFinite(numBand) && numBand > 0;
  const bandLabel = hasBand ? formatBandLabel(numBand, listening?.band_cefr) : null;
  const nextMilestone = hasBand ? Math.min(9.0, Number((numBand + 0.5).toFixed(1))) : null;

  const score = listening?.score ?? 0;
  const total = listening?.total ?? (score > 10 ? 40 : 10);
  const percentage = listening?.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0);
  const weaknesses = listening?.weaknesses ?? listening?.problems ?? [];

  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      {!hideSectionHeader && (
        <View style={ss.header}>
          <View style={[ss.iconBox, { backgroundColor: 'rgba(168,85,247,0.2)' }]}>
            <Ionicons name="headset" size={24} color="#c084fc" />
          </View>
          <View>
            <Text style={ss.title}>Listening Performance</Text>
            {bandLabel ? <Text style={ss.subtitle}>{bandLabel}</Text> : null}
          </View>
        </View>
      )}

      <View style={ss.statSpace}>
        {/* 1. Score & Estimated Band */}
        <StatCard
          title="Listening Band & Score"
          value={bandLabel ?? (hasBand ? `Band ${numBand}` : 'Band —')}
        >
          <View style={ss.row}>
            <Text style={ss.label}>Raw Performance:</Text>
            <Text style={ss.value}>
              {score} / {total} questions ({percentage}%)
            </Text>
          </View>
          {hasBand && nextMilestone !== null && (
            <Text style={[ss.desc, { color: tokens.color.accent.rim, marginTop: 8, fontWeight: '500' }]}>
              Next Milestone: {formatBandLabel(nextMilestone) ?? `Band ${nextMilestone}`} (+0.5 band target)
            </Text>
          )}
        </StatCard>

        {/* 2. Problems & Weaknesses Identified */}
        <StatCard title="Identified Listening Weaknesses">
          {weaknesses.length > 0 ? (
            <View style={{ gap: 8 }}>
              <Text style={ss.desc}>
                Key comprehension problem areas observed during your test:
              </Text>
              {weaknesses.map((weakness, i) => (
                <View key={i} style={ss.bulletRow}>
                  <Ionicons name="alert-circle" size={16} color="#fb923c" style={{ marginTop: 2 }} />
                  <Text style={ss.bulletText}>{weakness}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={ss.bulletRow}>
              <Ionicons name="checkmark-circle" size={16} color="#34d399" style={{ marginTop: 2 }} />
              <Text style={[ss.bulletText, { color: '#34d399' }]}>
                No major weaknesses identified. Great accuracy!
              </Text>
            </View>
          )}
        </StatCard>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  label: { fontSize: 14, fontFamily: 'Poppins', color: tokens.color.text.secondary },
  value: { fontSize: 14, fontFamily: 'Poppins-SemiBold', fontWeight: '600', color: tokens.color.text.primary },
  desc: { fontSize: 13, fontFamily: 'Poppins', color: tokens.color.text.secondary, lineHeight: 18 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins',
    color: tokens.color.text.primary,
    lineHeight: 19,
  },
});
