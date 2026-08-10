/**
 * VocabularyCard Component (React Native)
 *
 * Displays vocabulary analysis. Matches talktivity_frontend StatCard design.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/report/ProgressBar';
import type { VocabularyReport } from '@/types/report';

export interface VocabularyCardProps {
  vocabulary: VocabularyReport;
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
  title: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  value: { fontSize: 24, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  body: { marginTop: 8, gap: 4 },
});

export function VocabularyCard({
  vocabulary,
  onContinue,
  hideSectionHeader = false,
}: VocabularyCardProps) {
  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      <View style={ss.inner}>
        {hideSectionHeader ? null : (
          <View style={ss.header}>
            <View style={[ss.iconBox, { backgroundColor: 'rgba(249,115,22,0.2)' }]}>
              <Ionicons name="layers" size={24} color="#fb923c" />
            </View>
            <View>
              <Text style={ss.title}>Vocabulary Analysis</Text>
              <Text style={ss.subtitle}>Level {vocabulary.vocabularyLevel}</Text>
            </View>
          </View>
        )}

        <View style={ss.statSpace}>
          <StatCard title="Vocabulary Score" value={`${vocabulary.vocabularyScore}%`}>
            {vocabulary.improvementTarget ? (
              <Text style={ss.desc}>
                You're {vocabulary.improvementTarget.percentToNextLevel}% away from{' '}
                {vocabulary.improvementTarget.nextLevel}
              </Text>
            ) : (
              <Text style={[ss.desc, { color: '#9ca3af' }]}>
                Improvement target not available
              </Text>
            )}
          </StatCard>

          {vocabulary.lexicalDiversity && (
            <StatCard
              title="Word Usage"
              value={`${vocabulary.activeVocabulary || 0} words`}
            >
              <Text style={ss.desc}>{vocabulary.uniqueWords || 0} unique words</Text>
              {typeof vocabulary.lexicalDiversity.score === 'number' && (
                <Text style={ss.desc}>Diversity: {vocabulary.lexicalDiversity.score}</Text>
              )}
              {vocabulary.lexicalDiversity.feedback ? (
                <Text style={ss.desc}>{vocabulary.lexicalDiversity.feedback}</Text>
              ) : null}
            </StatCard>
          )}

          {vocabulary.levelBreakdown &&
            typeof vocabulary.levelBreakdown === 'object' &&
            Object.keys(vocabulary.levelBreakdown).length > 0 && (
              <StatCard title="Vocabulary Level Breakdown">
                {Object.entries(vocabulary.levelBreakdown).map(([level, count]) =>
                  count ? (
                    <View key={level} style={ss.levelRow}>
                      <Text style={ss.levelLabel}>{level}</Text>
                      <Text style={ss.levelValue}>{count} words</Text>
                    </View>
                  ) : null
                )}
              </StatCard>
            )}

          {vocabulary.wordSuggestions &&
            typeof vocabulary.wordSuggestions === 'object' &&
            Object.keys(vocabulary.wordSuggestions).length > 0 && (
              <StatCard title="Word Suggestions">
                {Object.entries(vocabulary.wordSuggestions).map(([basicWord, suggestions]) =>
                  Array.isArray(suggestions) && suggestions.length > 0 ? (
                    <View key={basicWord} style={ss.suggestionGroup}>
                      <Text style={[ss.desc, { fontWeight: '600' }]}>
                        Instead of "{basicWord}":
                      </Text>
                      {suggestions.map((suggestion: any, idx: number) => (
                        <View key={idx} style={ss.suggestionDetail}>
                          <Text style={{ fontSize: 13, fontWeight: '500', color: suggestion.color || '#60a5fa' }}>
                            {suggestion.word}
                          </Text>
                          <Text style={ss.desc}>
                            ({suggestion.level}) {suggestion.definition}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null
                )}
              </StatCard>
            )}

          {vocabulary.exampleSentences &&
            typeof vocabulary.exampleSentences === 'object' &&
            Object.keys(vocabulary.exampleSentences).length > 0 && (
              <StatCard title="Example Sentences">
                {Object.entries(vocabulary.exampleSentences).map(([word, sentence]) =>
                  sentence ? (
                    <Text key={word} style={ss.desc}>
                      <Text style={{ fontWeight: '600' }}>{word}:</Text>{' '}
                      {String(sentence)}
                    </Text>
                  ) : null
                )}
              </StatCard>
            )}

          {vocabulary.idiomaticLanguage && (
            <StatCard title="Idiomatic Language">
              {typeof vocabulary.idiomaticLanguage.usedCorrectly === 'number' && (
                <Text style={ss.desc}>
                  Used correctly: {vocabulary.idiomaticLanguage.usedCorrectly}
                </Text>
              )}
              {typeof vocabulary.idiomaticLanguage.missedOpportunities === 'number' && (
                <Text style={ss.desc}>
                  Missed opportunities: {vocabulary.idiomaticLanguage.missedOpportunities}
                </Text>
              )}
              {vocabulary.idiomaticLanguage.feedback ? (
                <Text style={ss.desc}>{vocabulary.idiomaticLanguage.feedback}</Text>
              ) : null}
            </StatCard>
          )}

          {vocabulary.newWords && vocabulary.newWords.length > 0 && (
            <StatCard title="New Words">
              <View style={ss.wordTags}>
                {vocabulary.newWords.slice(0, 10).map((word: any, idx: any) => (
                  <View key={idx} style={ss.wordTag}>
                    <Text style={ss.wordTagText}>{word}</Text>
                  </View>
                ))}
              </View>
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
            <Text style={ss.btnText}>Continue to Discourse</Text>
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
  title: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#9ca3af' },
  statSpace: { gap: 16 },
  desc: { fontSize: 14, color: '#d1d5db', lineHeight: 20 },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  levelLabel: { fontSize: 14, color: '#cbd5e1' },
  levelValue: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  suggestionGroup: { marginBottom: 12 },
  suggestionDetail: { marginLeft: 8, marginBottom: 4 },
  wordTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  wordTag: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  wordTagText: { fontSize: 13, color: '#60a5fa', fontWeight: '600' },
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
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
