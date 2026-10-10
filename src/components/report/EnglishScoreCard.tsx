import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnglishRadarChart } from '@/components/report/EnglishRadarChart';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { tokens } from '@/theme/tokens';
import type { OverallScores } from '@/types/report';
import type { RadarDataPoint } from '@/lib/report/calculations';
import type { ReportMode } from '@/lib/report/reportMode';
import { formatBandLabel } from '@/lib/report/bandLabel';

const SCORE_BREAKDOWN_ORDER = [
  { key: 'fluency' as const, label: 'Fluency & Coherence' },
  { key: 'vocabulary' as const, label: 'Lexical Resource' },
  { key: 'grammar' as const, label: 'Grammar & Accuracy' },
  { key: 'pronunciation' as const, label: 'Pronunciation' },
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
  displayLabel,
}: {
  label: string;
  value: number;
  /** Already-formatted text (e.g. "Band 5.5 (B2)", "Measuring…"); falls back to a percentage. */
  displayLabel?: string | null;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View style={sb.container}>
      <Text style={sb.label}>{label}</Text>
      <View style={sb.row}>
        <Text style={sb.bandText}>
          {displayLabel != null ? displayLabel : `${clamped}%`}
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

function toBandNumber(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function clampToPercent(band: number): number {
  return Math.max(0, Math.min(100, (band / 9) * 100));
}

type BreakdownKey = 'fluency' | 'vocabulary' | 'grammar' | 'discourse' | 'pronunciation';

/** General mode keeps the legacy 0-100 score bars; IELTS mode shows real bands only. */
function criterionDisplay(
  key: BreakdownKey,
  overallScores: OverallScores | null | undefined,
  isIelts: boolean
): { value: number; displayLabel: string | null } {
  if (!isIelts) {
    const value =
      key === 'fluency'
        ? overallScores?.fluency
        : key === 'vocabulary'
          ? overallScores?.vocabulary
          : key === 'grammar'
            ? overallScores?.grammar
            : overallScores?.discourse;
    return { value: value ?? 0, displayLabel: null };
  }
  if (key === 'pronunciation') {
    const pronunciation = overallScores?.criteria?.pronunciation;
    const measured = pronunciation?.status === 'measured';
    const displayLabel = measured
      ? formatBandLabel(pronunciation?.band ?? null, pronunciation?.cefr) ?? 'Band not available'
      : pronunciation?.status === 'pending'
        ? 'Measuring from your recording…'
        : 'Not measured';
    const value = measured && pronunciation?.band != null ? clampToPercent(pronunciation.band) : 0;
    return { value, displayLabel };
  }
  const criterion =
    key === 'fluency'
      ? overallScores?.criteria?.fluency
      : key === 'vocabulary'
        ? overallScores?.criteria?.vocabulary
        : key === 'grammar'
          ? overallScores?.criteria?.grammar
          : undefined;
  const value = criterion?.band != null ? clampToPercent(criterion.band) : 0;
  return { value, displayLabel: formatBandLabel(criterion?.band ?? null, criterion?.cefr) };
}

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
  const overallBandLabel = formatBandLabel(
    toBandNumber(overallScores?.overall_band),
    overallScores?.overall_cefr
  );

  const pronunciationForChart = overallScores?.criteria?.pronunciation;
  const pronunciationChartValue =
    pronunciationForChart?.status === 'measured' && pronunciationForChart.band != null
      ? clampToPercent(pronunciationForChart.band)
      : 50; // not measured: keep the pentagon shape sane instead of a fabricated value

  const pentagonValues: [number, number, number, number, number] | null =
    overallScores
      ? [
          overallScores.overall,
          overallScores.fluency,
          overallScores.vocabulary,
          overallScores.grammar,
          isIelts ? pronunciationChartValue : overallScores.discourse,
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
            overallScores?.insufficient_speech ? (
              <Text style={s.heroUnavailable}>Speak a bit more to get a band</Text>
            ) : overallBandLabel != null ? (
              <>
                <Text style={s.heroLevel}>{overallBandLabel}</Text>
                {overallScores?.low_confidence || overallScores?.short_sample_capped ? (
                  <Text style={s.heroNote}>Based on a short sample</Text>
                ) : null}
              </>
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
              const { value, displayLabel } = criterionDisplay(key, overallScores, isIelts);
              return (
                <View key={key} style={s.skillBarWrap}>
                  <SkillBar label={label} value={value} displayLabel={displayLabel} />
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
  heroNote: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Poppins',
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
