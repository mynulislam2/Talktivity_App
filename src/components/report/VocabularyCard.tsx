/**
 * VocabularyCard Component (React Native)
 *
 * Displays vocabulary analysis. Matches talktivity_frontend StatCard design.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { StatCard } from '@/components/report/StatCard';
import { tokens } from '@/theme/tokens';
import type { VocabularyReport } from '@/types/report';
import type { ReportMode } from '@/lib/report/reportMode';

export interface VocabularyCardProps {
  vocabulary?: VocabularyReport;
  onContinue: () => void;
  hideSectionHeader?: boolean;
  mode?: ReportMode;
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function VocabularyCard({
  vocabulary,
  onContinue,
  hideSectionHeader = false,
  mode = 'ielts',
}: VocabularyCardProps) {
  const isIelts = mode === 'ielts';
  const band = finite(vocabulary?.band) ?? finite(vocabulary?.vocabularyBand);
  const targetBand =
    band != null ? Math.min(9.0, Number((band + 0.5).toFixed(1))) : null;
  const strengths = vocabulary?.strengths ?? [];
  const areasForImprovement = vocabulary?.improvements ?? [];
  const score = finite(vocabulary?.vocabularyScore);
  const improvementTarget = vocabulary?.improvementTarget;
  const sentenceUpgrades = vocabulary?.sentenceUpgrades ?? [];

  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      {hideSectionHeader ? null : (
        <View style={ss.header}>
          <View style={[ss.iconBox, { backgroundColor: 'rgba(249,115,22,0.2)' }]}>
            <Ionicons name="layers" size={24} color="#fb923c" />
          </View>
          <View>
            <Text style={ss.title}>
              {isIelts ? 'Lexical Resource' : 'Vocabulary Analysis'}
            </Text>
            {isIelts ? (
              <Text style={ss.subtitle}>
                {band != null ? `Band ${band}` : 'Band not available'}
              </Text>
            ) : vocabulary?.vocabularyLevel ? (
              <Text style={ss.subtitle}>Level {vocabulary.vocabularyLevel}</Text>
            ) : null}
          </View>
        </View>
      )}

      <View style={ss.statSpace}>
        {/* 1. Score / band headline and coaching notes */}
        <StatCard
          title={isIelts ? 'Lexical Resource' : 'Vocabulary Score'}
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
              You're {improvementTarget.percentToNextLevel}% away from{' '}
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

        {/* 2. Useful Sentence Upgrades */}
        {sentenceUpgrades.length > 0 ? (
          <StatCard title="Useful Sentence Upgrades">
            <Text style={ss.desc}>
              {isIelts
                ? 'Elevate simple expressions to more descriptive, Band 7.0+ vocabulary:'
                : 'Elevate simple expressions to more descriptive vocabulary:'}
            </Text>
            {sentenceUpgrades.map((item, idx) => (
              <View key={idx} style={ss.sentenceCard}>
                <Text style={ss.sentenceLabelOriginal}>Before</Text>
                <Text style={ss.sentenceTextOriginal}>"{item.original}"</Text>
                <View style={ss.sentenceDivider} />
                <Text style={ss.sentenceLabelUpgraded}>
                  {isIelts ? 'Upgraded (Band 7.0+)' : 'Upgraded'}
                </Text>
                <Text style={ss.sentenceTextUpgraded}>"{item.improved || (item as any).upgraded}"</Text>
              </View>
            ))}
          </StatCard>
        ) : null}
      </View>

      <ReportCTAButton
        label={
          isIelts ? 'Continue to Grammar & Accuracy' : 'Continue to Discourse'
        }
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
  sentenceCard: {
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    marginTop: 8,
    gap: 4,
  },
  sentenceLabelOriginal: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.text.secondary,
  },
  sentenceTextOriginal: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  sentenceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 6,
  },
  sentenceLabelUpgraded: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.accent.rim,
  },
  sentenceTextUpgraded: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    color: '#fff',
  },
});
