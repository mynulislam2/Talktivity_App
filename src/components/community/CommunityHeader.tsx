/**
 * CommunityHeader Component (React Native)
 *
 * Matches frontend: centered title with safe area padding.
 * No back button — community is a main tab.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface CommunityHeaderProps {
  title?: string;
}

export function CommunityHeader({ title = 'Community' }: CommunityHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.02,
    color: '#fff',
    textAlign: 'center',
  },
});
