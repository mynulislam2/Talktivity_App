/**
 * ListeningControls Component (React Native)
 *
 * Controls for listening quiz with audio playback.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/theme/tokens';

export interface ListeningControlsProps {
  isPlaying: boolean;
  audioProgress: number;
  listeningCount: number;
  maxListens: number;
  onTogglePlay: () => void;
}

export function ListeningControls({
  isPlaying,
  audioProgress,
  listeningCount,
  maxListens,
  onTogglePlay,
}: ListeningControlsProps) {
  const canPlay = listeningCount < maxListens || isPlaying;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Listen to the Audio</Text>
          <Text style={styles.subtitle}>
            {listeningCount < maxListens
              ? `You have ${maxListens - listeningCount} listen${
                  maxListens - listeningCount === 1 ? '' : 's'
                } remaining`
              : 'No listens remaining'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.playButton, !canPlay && styles.playButtonDisabled]}
          onPress={onTogglePlay}
          disabled={!canPlay}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={tokens.color.text.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${audioProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(audioProgress)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: tokens.color.text.primary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    marginTop: 2,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.color.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonDisabled: {
    backgroundColor: tokens.color.text.placeholder,
    opacity: 0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.color.accent.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: tokens.color.text.secondary,
    minWidth: 40,
    textAlign: 'right',
  },
});
