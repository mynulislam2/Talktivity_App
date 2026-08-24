/**
 * DiscourseCard Component (React Native)
 *
 * Displays discourse analysis. Matches talktivity_frontend StatCard design.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/report/ProgressBar';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { tokens } from '@/theme/tokens';
import type { DiscourseReport } from '@/types/report';

export interface DiscourseCardProps {
  discourse: DiscourseReport;
  onFinish: () => void;
  onContinue?: () => void;
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
  body: { marginTop: 8 },
});

export function DiscourseCard({
  discourse,
  onFinish,
  onContinue,
  hideSectionHeader = false,
}: DiscourseCardProps) {
  const handleAction = onFinish || onContinue;

  return (
    <ScrollView style={ss.wrapper} contentContainerStyle={ss.container}>
      {hideSectionHeader ? null : (
        <View style={ss.header}>
          <View style={[ss.iconBox, { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
            <Ionicons name="link" size={24} color="#818cf8" />
          </View>
          <View>
            <Text style={ss.title}>Discourse Analysis</Text>
            <Text style={ss.subtitle}>Level {discourse.discourseLevel}</Text>
          </View>
        </View>
      )}

      <View style={ss.statSpace}>
        <StatCard title="Discourse Score" value={`${discourse.discourseScore}%`}>
          {discourse.improvementTarget ? (
            <Text style={ss.desc}>
              You're {discourse.improvementTarget.percentToNextLevel}% away from{' '}
              {discourse.improvementTarget.nextLevel}
            </Text>
          ) : (
            <Text style={ss.desc}>Improvement target not available</Text>
          )}
        </StatCard>

        {discourse.cohesion && (
          <StatCard title="Cohesion" value={`${discourse.cohesion.score || 0}%`}>
            {discourse.cohesion.feedback ? (
              <Text style={ss.desc}>{discourse.cohesion.feedback}</Text>
            ) : null}
            {typeof discourse.cohesion.score === 'number' && (
              <ProgressBar value={discourse.cohesion.score} color="#818cf8" />
            )}
          </StatCard>
        )}

        {discourse.coherence && (
          <StatCard title="Coherence" value={`${discourse.coherence.score || 0}%`}>
            {discourse.coherence.feedback ? (
              <Text style={ss.desc}>{discourse.coherence.feedback}</Text>
            ) : null}
            {typeof discourse.coherence.score === 'number' && (
              <ProgressBar value={discourse.coherence.score} color="#818cf8" />
            )}
          </StatCard>
        )}

        {(discourse as any).organization && (
          <StatCard
            title="Organization"
            value={`${(discourse as any).organization.score}`}
          >
            <Text style={ss.desc}>
              {(discourse as any).organization.feedback}
            </Text>
          </StatCard>
        )}

        {(discourse as any).feedback &&
          Array.isArray((discourse as any).feedback) &&
          (discourse as any).feedback.length > 0 && (
            <StatCard title="Feedback">
              {(discourse as any).feedback.map((item: any, idx: any) => (
                <Text key={idx} style={[ss.desc, { marginBottom: 4 }]}>
                  • {item}
                </Text>
              ))}
            </StatCard>
          )}
      </View>

      <ReportCTAButton label="Complete Report" onPress={handleAction} />
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
});
