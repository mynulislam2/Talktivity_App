/**
 * ProfileActivityCard Component (React Native)
 *
 * Learning time and lessons complete stats — matches frontend exactly.
 * Uses custom SVG icons for stat decoration and an SVG wave path.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useResponsive } from '@/theme/responsive';
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

  const { narrow, s } = useResponsive();
  // The stat row is label + icon on one line. On a 360pt phone that leaves the
  // label ~64pt, which is narrower than the word "Learning" — so RN broke the
  // word itself. Shrink the decoration and the card's own padding instead.
  const statIconSize = narrow ? 30 : 44;

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

      <View style={[styles.grid, narrow && styles.gridNarrow]}>
        {/* Learning Time */}
        <View style={[styles.statCard, narrow && styles.statCardNarrow]}>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
            {learningLabel}
          </Text>
          <View style={styles.statFooter}>
            <Text style={[styles.statLabel, narrow && styles.statLabelNarrow]}>
              Learning Time
            </Text>
            <Ionicons
              name="time-outline"
              size={statIconSize}
              color="#a78bfa"
              style={styles.statIcon}
            />
          </View>
        </View>

        {/* Lessons Complete */}
        <View style={[styles.statCard, narrow && styles.statCardNarrow]}>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
            {lessonsLabel}
          </Text>
          <View style={styles.statFooter}>
            <Text style={[styles.statLabel, narrow && styles.statLabelNarrow]}>
              Lessons complete
            </Text>
            <Ionicons
              name="checkmark-done-outline"
              size={statIconSize}
              color="#a78bfa"
              style={styles.statIcon}
            />
          </View>
        </View>
      </View>

      <Text style={styles.note}>{note}</Text>

      {/* SVG wave path matching frontend */}
      <View style={[styles.waveContainer, { height: s(70) }]}>
        <Svg viewBox="0 0 272 70" width="100%" height="100%" fill="none">
          <Path
            d="M16 48C58 48 66 28 96 28C126 28 128 54 160 54C191 54 206 18 255 18"
            stroke="#9D7AFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="5 5"
          />
        </Svg>
        <View style={styles.waveIconLeft}>
          <PhoneBubbleIcon size={s(26)} />
        </View>
        <View style={styles.waveIconCenter}>
          <WaveBubbleIcon size={s(52)} />
        </View>
        <View style={styles.waveIconRight}>
          <MicBubbleIcon size={s(34)} />
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
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.12,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    lineHeight: 22,
    color: '#fff',
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  gridNarrow: {
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  statCardNarrow: {
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.14,
    color: '#fff',
  },
  statFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 8,
  },
  statLabel: {
    // `flex: 1` + `minWidth: 0` so the label takes whatever the icon leaves
    // instead of the former hardcoded `maxWidth: 88`, which was wider than the
    // space actually available on a 360pt screen and forced a mid-word break.
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: '#c6c6c6',
  },
  statLabelNarrow: {
    fontSize: 13,
    lineHeight: 18,
  },
  statIcon: {
    flexShrink: 0,
  },
  note: {
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: '#fff',
    marginBottom: 24,
  },
  waveContainer: {
    position: 'relative',
    // Was a fixed 272pt box, so on a narrower card the SVG kept its width and
    // the absolutely-placed bubbles drifted off the dashed path. Percentages
    // keep the bubbles on the curve at every width.
    width: '100%',
    alignSelf: 'stretch',
  },
  waveIconLeft: {
    position: 'absolute',
    left: 0,
    top: '50%',
  },
  waveIconCenter: {
    position: 'absolute',
    left: '33%',
    top: '10%',
  },
  waveIconRight: {
    position: 'absolute',
    right: '1.5%',
    top: '3%',
  },
});
