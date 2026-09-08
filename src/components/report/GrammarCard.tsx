/**
 * GrammarCard Component (React Native)
 *
 * Displays grammar analysis. Matches talktivity_frontend StatCard design.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { StatCard } from '@/components/report/StatCard';
import { tokens } from '@/theme/tokens';
import type { GrammarReport } from '@/types/report';

export interface GrammarCardProps {
  grammar?: GrammarReport;
  onContinue: () => void;
  hideSectionHeader?: boolean;
}

export function GrammarCard({
  grammar,
  onContinue,
  hideSectionHeader = false,
}: GrammarCardProps) {
  const band = grammar?.band ?? grammar?.grammarBand ?? 6.0;
  const numBand = Number(band) || 6.0;
  const targetBand = Math.min(9.0, Number((numBand + 0.5).toFixed(1)));
  const strengths = (grammar?.strengths && grammar.strengths.length > 0)
    ? grammar.strengths
    : ['Basic sentence structure is consistently accurate'];
  const areasForImprovement = (grammar?.improvements && grammar.improvements.length > 0)
    ? grammar.improvements
    : ['Use more complex and compound sentences with subordinating conjunctions'];

  const complexRatio = grammar?.sentenceComplexity?.complexSentenceRatio ?? 40;
  const simpleRatio = Math.max(0, 100 - complexRatio);

  const errorsList: Array<{ category: string; incorrect: string; corrected: string; rule: string }> = [];
  if (grammar?.grammarErrors) {
    Object.entries(grammar.grammarErrors).forEach(([category, errors]) => {
      if (Array.isArray(errors)) {
        errors.forEach((err) => {
          errorsList.push({
            category,
            incorrect: err.incorrectSentence,
            corrected: err.correctedSentence,
            rule: err.description,
          });
        });
      }
    });
  }

  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      {hideSectionHeader ? null : (
        <View style={ss.header}>
          <View style={[ss.iconBox, { backgroundColor: 'rgba(168,85,247,0.2)' }]}>
            <Ionicons name="layers" size={24} color="#a855f7" />
          </View>
          <View>
            <Text style={ss.title}>Grammar & Accuracy</Text>
            <Text style={ss.subtitle}>Band {band}</Text>
          </View>
        </View>
      )}

      <View style={ss.statSpace}>
        {/* 1. Official IELTS Band & Goal */}
        <StatCard title="Grammatical Range & Accuracy" value={`Band ${band}`}>
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

        {/* 2. Exact Grammar Errors (❌ vs ✅) */}
        {errorsList.length > 0 ? (
          <StatCard title="Key Grammar Corrections">
            <Text style={ss.desc}>Specific sentence patterns to improve for Band 7.0:</Text>
            {errorsList.map((item, idx) => (
              <View key={idx} style={ss.errorBox}>
                <View style={ss.categoryBadge}>
                  <Text style={ss.categoryBadgeText}>{item.category}</Text>
                </View>
                <View style={ss.errorRow}>
                  <Text style={ss.errorIconBad}>❌</Text>
                  <Text style={ss.errorTextBad}>"{item.incorrect}"</Text>
                </View>
                <View style={ss.errorRow}>
                  <Text style={ss.errorIconGood}>✅</Text>
                  <Text style={ss.errorTextGood}>"{item.corrected}"</Text>
                </View>
                <Text style={ss.errorRuleText}>Rule: {item.rule}</Text>
              </View>
            ))}
          </StatCard>
        ) : null}

        {/* 3. Complex vs Simple Sentence Ratio */}
        <StatCard title="Sentence Structure Complexity">
          <View style={ss.structureBox}>
            {/* Dual metric tiles */}
            <View style={ss.metricGrid}>
              <View style={ss.metricTile}>
                <View style={ss.metricHeader}>
                  <View style={[ss.metricDot, { backgroundColor: tokens.color.accent.rim }]} />
                  <Text style={ss.metricLabel}>Complex</Text>
                </View>
                <Text style={[ss.metricVal, { color: tokens.color.accent.rim }]}>
                  {complexRatio}%
                </Text>
              </View>

              <View style={ss.metricTile}>
                <View style={ss.metricHeader}>
                  <View style={[ss.metricDot, { backgroundColor: '#94a3b8' }]} />
                  <Text style={ss.metricLabel}>Simple</Text>
                </View>
                <Text style={[ss.metricVal, { color: '#ffffff' }]}>
                  {simpleRatio}%
                </Text>
              </View>
            </View>

            {/* Segmented Dual Bar */}
            <View style={ss.segmentedBar}>
              <View
                style={[
                  ss.segmentedBarFill,
                  {
                    width: `${complexRatio}%`,
                    backgroundColor: '#3b82f6',
                  },
                ]}
              />
              <View
                style={[
                  ss.segmentedBarFill,
                  {
                    width: `${simpleRatio}%`,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                ]}
              />
            </View>
            <View style={ss.structureTipBox}>
              <View style={ss.tipIconWrap}>
                <Ionicons name="bulb" size={13} color={tokens.color.accent.rim} />
              </View>
              <Text style={ss.structureTipText}>
                {grammar?.sentenceComplexity?.feedback || 'Practice using more relative clauses and conditionals to increase your complex sentence ratio.'}
              </Text>
            </View>
          </View>
        </StatCard>
      </View>

      <ReportCTAButton label="Continue to Pronunciation" onPress={onContinue} />
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
  errorBox: {
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    marginTop: 8,
    gap: 6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  errorIconBad: {
    fontSize: 13,
  },
  errorTextBad: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins',
    color: '#ff8b8b',
    fontStyle: 'italic',
  },
  errorIconGood: {
    fontSize: 13,
  },
  errorTextGood: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    color: '#34d399',
  },
  errorRuleText: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    marginTop: 2,
    paddingLeft: 22,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tokens.radius.xs,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.accent.rim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  structureBox: {
    marginTop: 6,
    gap: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: tokens.radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  segmentedBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segmentedBarFill: {
    height: '100%',
  },
  structureTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: tokens.radius.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
  },
  tipIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(40,121,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  structureTipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    lineHeight: 18,
  },
});
