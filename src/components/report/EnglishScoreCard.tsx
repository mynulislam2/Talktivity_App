import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnglishRadarChart } from '@/components/report/EnglishRadarChart';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { scoreToIeltsBand } from '@/lib/report/cefrProficiency';
import { tokens } from '@/theme/tokens';
import type { OverallScores } from '@/types/report';
import type { RadarDataPoint } from '@/lib/report/calculations';
import type { ReportMode } from '@/lib/report/reportMode';

const SCORE_BREAKDOWN_ORDER = [
  { key: 'fluency' as const, label: 'Fluency & Coherence' },
  { key: 'vocabulary' as const, label: 'Lexical Resource' },
  { key: 'grammar' as const, label: 'Grammar & Accuracy' },
  { key: 'discourse' as const, label: 'Pronunciation' },
];

const GENERAL_SCORE_BREAKDOWN_ORDER = [
  { key: 'discourse' as const, label: 'Discourse' },
  { key: 'vocabulary' as const, label: 'Vocabulary' },
  { key: 'grammar' as const, label: 'Grammar' },
  { key: 'fluency' as const, label: 'Fluency' },
];

export interface EnglishScoreCardProps {
  overallScores?: OverallScores | null;
  radarData?: RadarDataPoint[];
  onContinue: () => void;
  showIcons?: boolean;
  hideHeroTitle?: boolean;
  mode?: ReportMode;
}

function SkillBar({
  label,
  value,
  band,
}: {
  label: string;
  value: number;
  band?: string | null;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View style={sb.container}>
      <Text style={sb.label}>{label}</Text>
      <View style={sb.row}>
        <Text style={sb.bandText}>
          {band != null ? `Band ${band}` : `${clamped}%`}
        </Text>
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
  mode = 'ielts',
}: EnglishScoreCardProps) {
  const isIelts = mode === 'ielts';
  const overallScore = overallScores?.overall;
  const hasOverallScore =
    typeof overallScore === 'number' && Number.isFinite(overallScore);
  const overallBand = hasOverallScore
    ? scoreToIeltsBand(overallScore as number)
    : null;

  const pentagonValues: [number, number, number, number, number] | null =
    overallScores
      ? [
          overallScores.overall,
          overallScores.fluency,
          overallScores.vocabulary,
          overallScores.grammar,
          overallScores.discourse,
        ]
      : null;

  const breakdownOrder = isIelts
    ? SCORE_BREAKDOWN_ORDER
    : GENERAL_SCORE_BREAKDOWN_ORDER;

  return (
    <ScrollView style={s.wrapper} contentContainerStyle={s.container}>
      {hideHeroTitle ? null : (
        <View style={s.hero}>
          <Text style={s.heroTitle}>
            {isIelts ? 'Your Overall Band Score' : 'Your English Score'}
          </Text>
          {isIelts ? (
            overallBand != null ? (
              <Text style={s.heroLevel}>Band {overallBand}</Text>
            ) : (
              <Text style={s.heroUnavailable}>Band not available</Text>
            )
          ) : (
            <>
              {overallScores?.level ? (
                <Text style={s.heroLevel}>{overallScores.level}</Text>
              ) : null}
              {hasOverallScore ? (
                <Text style={s.heroScore}>{overallScore} out of 100</Text>
              ) : (
                <Text style={s.heroUnavailable}>Score not available</Text>
              )}
            </>
          )}
        </View>
      )}

      {pentagonValues ? (
        <View style={{ marginTop: 8, alignItems: 'center' }}>
          <EnglishRadarChart
            values={pentagonValues}
            metrics={
              isIelts
                ? ['Overall', 'Fluency', 'Lexical', 'Grammar', 'Pronunciation']
                : ['Overall', 'Fluency', 'Vocabulary', 'Grammar', 'Discourse']
            }
          />
        </View>
      ) : null}

      <View style={s.skillsCard}>
        <Text style={s.skillsTitle}>
          {isIelts ? 'IELTS Criteria Breakdown' : 'Score Breakdown'}
        </Text>
        {overallScores ? (
          <View style={s.grid}>
            {breakdownOrder.map(({ key, label }) => {
              const val = overallScores[key];
              return (
                <View key={key} style={s.skillBarWrap}>
                  <SkillBar
                    label={label}
                    value={val}
                    band={isIelts ? scoreToIeltsBand(val) : null}
                  />
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={s.unavailable}>Score breakdown not available</Text>
        )}
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
  heroScore: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: tokens.color.text.secondary,
  },
  heroUnavailable: {
    marginTop: 2,
    fontSize: 16,
    fontFamily: 'Poppins',
    lineHeight: 24,
    color: tokens.color.text.secondary,
  },
  unavailable: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
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
