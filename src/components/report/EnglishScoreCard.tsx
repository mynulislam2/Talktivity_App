import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';
import { EnglishRadarChart } from '@/components/report/EnglishRadarChart';
import type { OverallScores } from '@/types/report';
import type { RadarDataPoint } from '@/lib/report/calculations';

const SCORE_BREAKDOWN_ORDER = [
  { key: 'discourse' as const, label: 'Discourse' },
  { key: 'vocabulary' as const, label: 'Vocabulary' },
  { key: 'grammar' as const, label: 'Grammar' },
  { key: 'fluency' as const, label: 'Fluency' },
];

export interface EnglishScoreCardProps {
  overallScores: OverallScores;
  radarData: RadarDataPoint[];
  onContinue: () => void;
  showIcons?: boolean;
  hideHeroTitle?: boolean;
}

function SkillBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View style={sb.container}>
      <Text style={sb.label}>{label}</Text>
      <View style={sb.row}>
        <Text style={sb.value}>{clamped}%</Text>
        <View style={sb.track}>
          <LinearGradient
            colors={['#c084fc', '#8b5cf6', '#6366f1']}
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
  container: { gap: 8 },
  label: { fontSize: 13, fontWeight: '500', fontFamily: 'Poppins-Medium', lineHeight: 17, color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  value: {
    width: 36,
    fontSize: 12,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.9)',
    fontVariant: ['tabular-nums'] as any,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
});

export function EnglishScoreCard({
  overallScores,
  onContinue,
  hideHeroTitle = false,
}: EnglishScoreCardProps) {
  const pentagonValues: [number, number, number, number, number] = [
    overallScores.discourse,
    overallScores.fluency,
    overallScores.grammar,
    overallScores.vocabulary,
    overallScores.overall,
  ];

  return (
    <View style={s.container}>
      {hideHeroTitle ? null : (
        <View style={s.hero}>
          <Text style={s.heroTitle}>Your English Score</Text>
          <Text style={s.heroLevel}>{overallScores.level}</Text>
          <Text style={s.heroScore}>{overallScores.overall} out of 100</Text>
        </View>
      )}

      {hideHeroTitle ? (
        <Text style={s.heroScoreAlt}>{overallScores.overall} out of 100</Text>
      ) : null}

      <View style={{ marginTop: 8, alignItems: 'center' }}>
        <EnglishRadarChart values={pentagonValues} />
      </View>

      <View style={s.grid}>
        {SCORE_BREAKDOWN_ORDER.map(({ key, label }) => (
          <View key={key} style={s.skillBarWrap}>
            <SkillBar label={label} value={overallScores[key]} />
          </View>
        ))}
      </View>

      <View style={s.infoBox}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color="#8ca7ff"
          style={{ marginTop: 2 }}
        />
        <Text style={s.infoText}>
          This is a deep analysis of your recent conversation. Use the detailed
          report to focus your practice.
        </Text>
      </View>

      <TouchableOpacity onPress={onContinue} activeOpacity={0.9} style={{ width: '100%', marginTop: 24 }}>
        <LinearGradient
          colors={['#2563eb', '#9333ea']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.gradientBtn}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold' }}>
            Explore My Deep Dive Report
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  hero: { alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '600', fontFamily: 'Poppins-SemiBold', lineHeight: 28, color: '#fff' },
  heroLevel: {
    marginTop: 8,
    fontSize: 32,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    lineHeight: 32,
    color: '#3b7fff',
  },
  heroScore: { marginTop: 4, fontSize: 13, lineHeight: 18, color: '#c6c6c6' },
  heroScoreAlt: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: '#c6c6c6',
  },
  grid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
    columnGap: 16,
  },
  skillBarWrap: { width: '47%' },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(61,62,80,1)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17, color: '#c6c6c6' },
  gradientBtn: {
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
