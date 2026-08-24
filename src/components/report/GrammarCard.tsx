/**
 * GrammarCard Component (React Native)
 *
 * Displays grammar analysis. Matches talktivity_frontend StatCard design.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/report/ProgressBar';
import type { GrammarReport } from '@/types/report';

export interface GrammarCardProps {
  grammar: GrammarReport;
  onContinue: () => void;
  hideSectionHeader?: boolean;
}

function StatCard({
  title,
  value,
  children,
}: {
  title: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.title}>{title}</Text>
      {value ? <Text style={statStyles.value}>{value}</Text> : null}
      <View style={statStyles.body}>{children}</View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#ffffff' },
  value: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  body: { marginTop: 8 },
});

export function GrammarCard({
  grammar,
  onContinue,
  hideSectionHeader = false,
}: GrammarCardProps) {
  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      <View style={ss.inner}>
        {hideSectionHeader ? null : (
          <View style={ss.header}>
            <View style={[ss.iconBox, { backgroundColor: 'rgba(168,85,247,0.2)' }]}>
              <Ionicons name="book" size={24} color="#a855f7" />
            </View>
            <View>
              <Text style={ss.title}>Grammar Analysis</Text>
              <Text style={ss.subtitle}>Level {grammar.grammarLevel}</Text>
            </View>
          </View>
        )}

        <View style={ss.statSpace}>
          <StatCard title="Grammar Score" value={`${grammar.grammarScore}%`}>
            {grammar.improvementTarget ? (
              <Text style={ss.desc}>
                You're {grammar.improvementTarget.percentToNextLevel}% away from{' '}
                {grammar.improvementTarget.nextLevel}
              </Text>
            ) : (
              <Text style={[ss.desc, { color: '#9ca3af' }]}>
                Improvement target not available
              </Text>
            )}
          </StatCard>

          {grammar.growthPoints && grammar.growthPoints.length > 0 && (
            <StatCard title="Growth Areas">
              {grammar.growthPoints.map((point, idx) => (
                <Text key={idx} style={[ss.desc, { color: '#60a5fa' }]}>
                  • {point}
                </Text>
              ))}
            </StatCard>
          )}

          {grammar.sentenceComplexity && (
            <StatCard
              title="Sentence Complexity"
              value={`${grammar.sentenceComplexity.score || 0}%`}
            >
              {grammar.sentenceComplexity.feedback ? (
                <Text style={ss.desc}>{grammar.sentenceComplexity.feedback}</Text>
              ) : null}
              {typeof grammar.sentenceComplexity.score === 'number' && (
                <ProgressBar value={grammar.sentenceComplexity.score} color="#a855f7" />
              )}
            </StatCard>
          )}

          {grammar.grammarErrors &&
            typeof grammar.grammarErrors === 'object' &&
            Object.keys(grammar.grammarErrors).length > 0 && (
              <StatCard title="Common Errors">
                {Object.entries(grammar.grammarErrors).map(([category, errors]) =>
                  Array.isArray(errors) && errors.length > 0 ? (
                    <View key={category} style={ss.errorGroup}>
                      <Text style={ss.errorCategory}>{category}</Text>
                      {errors.map((error: any, idx: number) => (
                        <View key={idx} style={ss.errorDetail}>
                          <Text style={ss.desc}>{error.description}</Text>
                          {error.incorrectSentence ? (
                            <Text style={ss.errorIncorrect}>
                              "{error.incorrectSentence}"
                            </Text>
                          ) : null}
                          {error.correctedSentence ? (
                            <Text style={ss.errorCorrected}>
                              "{error.correctedSentence}"
                            </Text>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  ) : null
                )}
              </StatCard>
            )}
        </View>

        <TouchableOpacity onPress={onContinue} activeOpacity={0.9}>
          <LinearGradient
            colors={['#2563eb', '#9333ea']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={ss.gradientBtn}
          >
            <Text style={ss.btnText}>Continue to Vocabulary</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#09090f' },
  container: { flexGrow: 1, alignItems: 'center', padding: 16 },
  inner: { width: '100%', maxWidth: 400, paddingVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBox: { padding: 8, borderRadius: 8 },
  title: { fontSize: 20, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#9ca3af' },
  statSpace: { gap: 16 },
  desc: { fontSize: 14, color: '#d1d5db', lineHeight: 20 },
  errorGroup: { marginBottom: 12 },
  errorCategory: { fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: '#f87171', marginBottom: 4 },
  errorDetail: { marginLeft: 8, marginBottom: 6 },
  errorIncorrect: { fontSize: 13, color: '#fca5a5', fontStyle: 'italic', marginTop: 2 },
  errorCorrected: { fontSize: 13, color: '#86efac', fontStyle: 'italic', marginTop: 1 },
  gradientBtn: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
});
