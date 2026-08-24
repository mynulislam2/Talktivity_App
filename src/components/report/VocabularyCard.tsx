/**
 * VocabularyCard Component (React Native)
 *
 * Displays vocabulary analysis. Matches talktivity_frontend StatCard design.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/report/ProgressBar';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { tokens } from '@/theme/tokens';
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
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: tokens.color.text.primary },
  value: { fontSize: 24, fontWeight: '700', fontFamily: 'Poppins-Bold', color: tokens.color.text.primary, marginTop: 2 },
  body: { marginTop: 8, gap: 4 },
});

export function VocabularyCard({
  vocabulary,
  onContinue,
  hideSectionHeader = false,
}: VocabularyCardProps) {
  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
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
            <Text style={ss.desc}>Improvement target not available</Text>
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
                    <Text style={[ss.desc, { fontWeight: '600', fontFamily: 'Poppins-SemiBold' }]}>
                      Instead of "{basicWord}":
                    </Text>
                    {suggestions.map((suggestion: any, idx: number) => (
                      <View key={idx} style={ss.suggestionDetail}>
                        <Text style={{ fontSize: 13, fontWeight: '500', fontFamily: 'Poppins-Medium', color: suggestion.color || tokens.color.accent.rim }}>
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
                    <Text style={{ fontWeight: '600', fontFamily: 'Poppins-SemiBold' }}>{word}:</Text>{' '}
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

      <ReportCTAButton label="Continue to Discourse" onPress={onContinue} />
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: tokens.color.bg.screen },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBox: { padding: 8, borderRadius: tokens.radius.md },
  title: { fontSize: 20, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: tokens.color.text.primary },
  subtitle: { fontSize: 14, fontFamily: 'Poppins', color: tokens.color.text.secondary },
  statSpace: { gap: 16 },
  desc: { fontSize: 14, fontFamily: 'Poppins', color: tokens.color.text.secondary, lineHeight: 20 },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  levelLabel: { fontSize: 14, fontFamily: 'Poppins', color: tokens.color.text.secondary },
  levelValue: { fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold', color: tokens.color.text.primary },
  suggestionGroup: { marginBottom: 12 },
  suggestionDetail: { marginLeft: 8, marginBottom: 4 },
  wordTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  wordTag: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  wordTagText: { fontSize: 13, color: tokens.color.accent.rim, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
});
