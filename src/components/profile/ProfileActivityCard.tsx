/**
 * ProfileActivityCard Component (React Native)
 *
 * Learning time and lessons complete stats — matches frontend exactly.
 * Uses custom SVG icons for stat decoration and an SVG wave path.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import type { ProgressStats } from '@/types/profile';
import {
  PhoneBubbleIcon,
  WaveBubbleIcon,
  MicBubbleIcon,
} from './ProfileVisualIcons';

interface ProfileActivityCardProps {
  progressStats: ProgressStats | null;
}

function formatMinutes(seconds: number): string {
  if (seconds <= 0) return '0m';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return `${hours}h${rem > 0 ? ` ${rem}m` : ''}`;
}

export function ProfileActivityCard({
  progressStats,
}: ProfileActivityCardProps) {
  const totalPracticeTime = Math.max(
    0,
    Number(progressStats?.courseProgress?.progress?.total_practice_time || 0)
  );
  const completedDays = Math.max(
    0,
    Number(
      progressStats?.courseProgress?.progress?.complete_days ??
        progressStats?.courseProgress?.progress?.total_days ??
        0
    )
  );

  const learningLabel = formatMinutes(totalPracticeTime);
  const lessonsLabel = String(completedDays);
  const note =
    totalPracticeTime > 0
      ? 'You are building momentum. Keep practicing to sharpen your live CEFR profile.'
      : "You haven't practiced in the last few days. Start practicing now to check your progress.";

  return (
    <View style={styles.card}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>All Time</Text>
      </View>

      <View style={styles.grid}>
        {/* Learning Time */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{learningLabel}</Text>
          <View style={styles.statFooter}>
            <Text style={styles.statLabel}>Learning Time</Text>
            <Ionicons name="time-outline" size={44} color="#a78bfa" />
          </View>
        </View>

        {/* Lessons Complete */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{lessonsLabel}</Text>
          <View style={styles.statFooter}>
            <Text style={styles.statLabel}>Lessons complete</Text>
            <Ionicons name="checkmark-done-outline" size={44} color="#a78bfa" />
          </View>
        </View>
      </View>

      <Text style={styles.note}>{note}</Text>

      {/* SVG wave path matching frontend */}
      <View style={styles.waveContainer}>
        <Svg viewBox="0 0 272 70" width={272} height={70} fill="none">
          <Path
            d="M16 48C58 48 66 28 96 28C126 28 128 54 160 54C191 54 206 18 255 18"
            stroke="#9D7AFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="5 5"
          />
        </Svg>
        <View style={styles.waveIconLeft}>
          <PhoneBubbleIcon size={26} />
        </View>
        <View style={styles.waveIconCenter}>
          <WaveBubbleIcon size={52} />
        </View>
        <View style={styles.waveIconRight}>
          <MicBubbleIcon size={34} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    letterSpacing: 0.12,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#fff',
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    letterSpacing: 0.14,
    color: '#fff',
  },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: '#c6c6c6',
    maxWidth: 88,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
    marginBottom: 24,
  },
  waveContainer: {
    position: 'relative',
    width: 272,
    height: 70,
    maxWidth: '100%',
  },
  waveIconLeft: {
    position: 'absolute',
    left: 0,
    top: 35,
  },
  waveIconCenter: {
    position: 'absolute',
    left: 90,
    top: 7,
  },
  waveIconRight: {
    position: 'absolute',
    right: 4,
    top: 2,
  },
});
