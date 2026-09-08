import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnglishRadarChart } from '@/components/report/EnglishRadarChart';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { tokens } from '@/theme/tokens';
import type { OverallScores } from '@/types/report';
import type { RadarDataPoint } from '@/lib/report/calculations';

const SCORE_BREAKDOWN_ORDER = [
  { key: 'fluency' as const, label: 'Fluency & Coherence' },
  { key: 'vocabulary' as const, label: 'Lexical Resource' },
  { key: 'grammar' as const, label: 'Grammar & Accuracy' },
  { key: 'discourse' as const, label: 'Pronunciation' },
];

export interface EnglishScoreCardProps {
  overallScores?: OverallScores | null;
  radarData?: RadarDataPoint[];
  onContinue: () => void;
  showIcons?: boolean;
  hideHeroTitle?: boolean;
}

function SkillBar({ label, value, band }: { label: string; value: number; band?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View style={sb.container}>
      <Text style={sb.label}>{label}</Text>
      <View style={sb.row}>
        <Text style={sb.bandText}>{band ? `Band ${band}` : `${clamped}%`}</Text>
        <View style={sb.track}>
          <LinearGradient
            colors={['#2563eb', '#3b82f6', '#60a5fa']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[sb.fill, { width: `${clamped}%` as any }]}
          />
        </View>
      </View>
    </View>
  );
}

const sb = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', fontFamily: 'Poppins-Medium', lineHeight: 17, color: tokens.color.text.primary },
  bandText: { width: 56, fontSize: 12, fontWeight: '500', fontFamily: 'Poppins-Medium', color: 'rgba(255,255,255,0.9)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 9999 },
});

export function EnglishScoreCard({
  overallScores,
  onContinue,
  hideHeroTitle = false,
}: EnglishScoreCardProps) {
  const overallBand = overallScores?.overall
    ? (Math.round((overallScores.overall / 10) * 2) / 2).toFixed(1)
    : '6.5';

  const pentagonValues: [number, number, number, number, number] = [
    overallScores?.overall ?? 65,
    overallScores?.fluency ?? 60,
    overallScores?.vocabulary ?? 65,
    overallScores?.grammar ?? 60,
    overallScores?.discourse ?? 65,
  ];

  return (
    <ScrollView style={s.wrapper} contentContainerStyle={s.container}>
      {hideHeroTitle ? null : (
        <View style={s.hero}>
          <Text style={s.heroTitle}>Your Overall Band Score</Text>
          <Text style={s.heroLevel}>Band {overallBand}</Text>
        </View>
      )}

      <View style={{ marginTop: 8, alignItems: 'center' }}>
        <EnglishRadarChart
          values={pentagonValues}
          metrics={['Overall', 'Fluency', 'Lexical', 'Grammar', 'Pronunciation']}
        />
      </View>

      <View style={s.skillsCard}>
        <Text style={s.skillsTitle}>IELTS Criteria Breakdown</Text>
        <View style={s.grid}>
          {SCORE_BREAKDOWN_ORDER.map(({ key, label }) => {
            const val = overallScores ? overallScores[key] : 65;
            const b = (Math.round((val / 10) * 2) / 2).toFixed(1);
            return (
              <View key={key} style={s.skillBarWrap}>
                <SkillBar
                  label={label}
                  value={val}
                  band={b}
                />
              </View>
            );
          })}
        </View>
      </View>

      <ReportCTAButton label="Explore My Deep Dive Report" onPress={onContinue} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: 'transparent' },
  container: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  hero: { alignItems: 'center', marginBottom: 4 },
  heroTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    lineHeight: 24,
    color: tokens.color.text.secondary,
  },
  heroLevel: {
    marginTop: 2,
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    lineHeight: 40,
    color: '#ffffff',
  },
  skillsCard: {
    marginTop: 16,
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 16,
  },
  skillsTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.text.primary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    columnGap: 14,
  },
  skillBarWrap: { width: '47%' },
});
