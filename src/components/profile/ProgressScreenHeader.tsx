/**
 * ProgressScreenHeader Component (React Native)
 *
 * Header with title and gear icon for settings navigation.
 * Matches talktivity_frontend/components/profile/ProgressScreenHeader.tsx
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProgressScreenHeaderProps {
  onSettingsClick: () => void;
  isSettingsOpen?: boolean;
}

export function ProgressScreenHeader({
  onSettingsClick,
  isSettingsOpen = false,
}: ProgressScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Progress</Text>
      <TouchableOpacity
        onPress={onSettingsClick}
        style={[styles.gearButton, isSettingsOpen && styles.gearButtonActive]}
        activeOpacity={0.7}
      >
        <Ionicons
          name="settings-outline"
          size={22}
          color={isSettingsOpen ? '#d7dbff' : '#fff'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 29,
    letterSpacing: 0.12,
    color: '#fff',
  },
  gearButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gearButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'transparent',
  },
});
