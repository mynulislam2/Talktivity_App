/**
 * ListeningControls Component (React Native)
 *
 * Controls for listening quiz with audio playback.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
            color="#fff"
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
    borderRadius: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
    padding: 20,
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
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5A4BC0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonDisabled: {
    backgroundColor: '#6b7280',
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
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5A4BC0',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
    minWidth: 40,
    textAlign: 'right',
  },
});
