/**
 * EnglishScoreCard Component (React Native)
 * 
 * Displays overall English proficiency summary with radar chart.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OverallScores } from '@/types/report';
import type { RadarDataPoint } from '@/lib/report/calculations';

export interface EnglishScoreCardProps {
  overallScores: OverallScores;
  radarData: RadarDataPoint[];
  onContinue: () => void;
  showIcons?: boolean;
}

export function EnglishScoreCard({ 
  overallScores, 
  radarData, 
  onContinue,
  showIcons = false,
}: EnglishScoreCardProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Your English Score</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.level}>{overallScores.level}</Text>
          <Text style={styles.scoreText}>{overallScores.overall} out of 100</Text>
        </View>

        {/* Radar chart placeholder - would use a chart library in production */}
        <View style={styles.chartContainer}>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>Radar Chart</Text>
            <Text style={styles.chartSubtext}>Visual representation of scores</Text>
          </View>
        </View>

        {/* Score breakdown */}
        <View style={styles.breakdown}>
          {radarData.map((item) => (
            <View key={item.subject} style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>{item.subject}</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownValue}>{item.A}%</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.A}%`, backgroundColor: '#8B5CF6' }
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#9ca3af" />
          <Text style={styles.infoText}>
            This is a deep analysis of your recent conversation. Use the detailed report to focus your practice.
          </Text>
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>Explore My Deep Dive Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#050110',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  level: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#7B70FF',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 14,
    color: 'rgba(156, 163, 175, 1)',
  },
  chartContainer: {
    height: 200,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
  },
  chartText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  chartSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  breakdown: {
    gap: 16,
    marginBottom: 24,
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 12,
    color: 'rgba(203, 213, 225, 1)',
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    minWidth: 50,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(156, 163, 175, 1)',
    lineHeight: 16,
  },
  continueButton: {
    backgroundColor: '#6A5AE0',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
