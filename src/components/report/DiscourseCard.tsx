/**
 * DiscourseCard Component (React Native)
 *
 * Displays discourse analysis. Matches talktivity_frontend StatCard design.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '@/components/report/ProgressBar';
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  value: { fontSize: 24, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: 2 },
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
      <View style={ss.inner}>
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
              <Text style={[ss.desc, { color: '#9ca3af' }]}>
                Improvement target not available
              </Text>
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

        <TouchableOpacity onPress={handleAction} activeOpacity={0.9}>
          <LinearGradient
            colors={['#16a34a', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={ss.gradientBtn}
          >
            <Text style={ss.btnText}>Complete Report</Text>
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
