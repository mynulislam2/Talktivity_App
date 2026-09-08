/**
 * ActionPlanCard Component (React Native)
 *
 * Dedicated final page: "Your Path to Band 7.0 (Key Focus)".
 * Summarizes the key focus areas for the next session to close the band gap.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatCard } from '@/components/report/StatCard';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { tokens } from '@/theme/tokens';
import type { TodayReport } from '@/types/report';

export interface ActionPlanCardProps {
  report?: TodayReport | null;
  onFinish: () => void;
  hideSectionHeader?: boolean;
}

export function ActionPlanCard({
  report,
  onFinish,
  hideSectionHeader = false,
}: ActionPlanCardProps) {
  const currentBand = report?.overall_band ?? 6.0;
  const targetBand = report?.target_band ?? Math.min(9.0, Number((currentBand + 0.5).toFixed(1)));
  const bandGap = report?.band_gap !== undefined ? `${report.band_gap} band to go` : `${(targetBand - currentBand).toFixed(1)} band to go`;
  const priorities = (report?.action_plan_priorities && report.action_plan_priorities.length > 0)
    ? report.action_plan_priorities
    : [
        "Practice speaking in sustained chunks to minimize hesitation pauses",
        "Upgrade everyday verbs to Band 7+ collocations and idioms",
        "Use more complex sentences with subordinating conjunctions"
      ];

  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      {hideSectionHeader ? null : (
        <View style={ss.header}>
          <View style={[ss.iconBox, { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
            <Ionicons name="flag" size={24} color="#818cf8" />
          </View>
          <View>
            <Text style={ss.title}>Action Plan</Text>
            <Text style={ss.subtitle}>Next Steps</Text>
          </View>
        </View>
      )}

      <View style={ss.statSpace}>
        {/* 1. Next Milestone Banner */}
        <StatCard title="Next Milestone" value={`Band ${targetBand}`}>
          <Text style={[ss.desc, { color: tokens.color.accent.rim, fontWeight: '500' }]}>
            Current: Band {currentBand} ({bandGap})
          </Text>
          <Text style={[ss.desc, { marginTop: 6 }]}>
            Target your key focus areas in tomorrow's speaking session to close the band gap.
          </Text>
        </StatCard>

        {/* 2. Key Focus Priorities for Next Practice */}
        <StatCard title={`Path to Next Milestone: Band ${targetBand} (Key Focus)`}>
          <Text style={ss.desc}>Based on today's session, focus your next practice on:</Text>
          <View style={{ marginTop: 8, gap: 10 }}>
            {priorities.map((item, idx) => (
              <View key={idx} style={ss.priorityItem}>
                <View style={ss.priorityNumBox}>
                  <Text style={ss.priorityNum}>{idx + 1}</Text>
                </View>
                <Text style={ss.priorityText}>{item}</Text>
              </View>
            ))}
          </View>
        </StatCard>
      </View>

      <ReportCTAButton label="Back to Today's Plan" onPress={onFinish} />
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
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: tokens.radius.sm,
    padding: 12,
  },
  priorityNumBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  priorityNum: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: tokens.color.accent.rim,
  },
  priorityText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins',
    color: tokens.color.text.primary,
    lineHeight: 19,
  },
});
