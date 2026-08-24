/**
 * PronunciationControls Component (React Native)
 *
 * Controls for pronunciation questions with microphone.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PronunciationControlsProps {
  listening: boolean;
  userSpeech: string;
  onStart: () => void;
  onStop: () => void;
  error?: string;
}

export function PronunciationControls({
  listening,
  userSpeech,
  onStart,
  onStop,
  error,
}: PronunciationControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Pronunciation</Text>
          <Text style={styles.subtitle}>Tap the mic and speak your answer</Text>
        </View>
        <TouchableOpacity
          style={[styles.micButton, listening && styles.micButtonActive]}
          onPress={listening ? onStop : onStart}
        >
          <Ionicons
            name={listening ? 'mic-off' : 'mic'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.speechContainer}>
        <Text style={styles.speechLabel}>Detected speech</Text>
        <Text style={styles.speechText}>
          {userSpeech || <Text style={styles.speechPlaceholder}>…</Text>}
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5A4BC0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
  },
  speechContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
  },
  speechLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  speechText: {
    fontSize: 14,
    color: '#fff',
    minHeight: 20,
  },
  speechPlaceholder: {
    color: '#6b7280',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#fca5a5',
  },
});
