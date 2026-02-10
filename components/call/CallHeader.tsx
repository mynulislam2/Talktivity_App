/**
 * CallHeader Component (React Native)
 * 
 * Reusable header with status indicator and logout button.
 * Matches Next.js implementation: status badge left (dark), logout button right (gradient blue-purple).
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface CallHeaderProps {
  stateText: string;
  stateColor: string;
  onLogout: () => void;
}

export function CallHeader({
  stateText,
  stateColor,
  onLogout,
}: CallHeaderProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  /**
   * Map Tailwind/web color classes to React Native color values.
   * Used for the pulsing status dot.
   */
  const getStatusDotColor = (colorClass: string): string => {
    // Exact Tailwind color mappings
    if (colorClass.includes('emerald')) return '#10b981'; // emerald-400
    if (colorClass.includes('amber')) return '#f59e0b';   // amber-400
    return '#9ca3af'; // gray-400 (default)
  };

  // Responsive font sizing
  const fontSize = width < 480 ? 12 : 13;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
      {/* Status Badge (left) - dark background with status dot + text */}
      <View style={[styles.statusBadge, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        {/* Animated status dot */}
        <View 
          style={[
            styles.statusDot, 
            { backgroundColor: getStatusDotColor(stateColor) }
          ]} 
        />
        <Text style={[styles.statusText, { fontSize }]}>
          {stateText}
        </Text>
      </View>

      {/* Logout Button (right) - gradient blue-to-purple */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: '#6A5AE0' }]}
        activeOpacity={0.9}
        onPress={onLogout}
      >
        <Text style={[styles.logoutText, { fontSize }]}>
          log out
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
