/**
 * ProgressPageShell Component (React Native)
 *
 * Shell wrapper for Progress/Profile pages with tabs and header.
 * Matches talktivity_frontend/components/profile/ProgressPageShell.tsx
 */

import React, { type ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/theme/responsive';
import { ProgressScreenTabs } from './ProgressScreenTabs';

type ProgressTab = 'profile' | 'achievements' | 'leaderboard';

interface ProgressPageShellProps {
  activeTab: ProgressTab;
  header: ReactNode;
  children: ReactNode;
}

export function ProgressPageShell({
  activeTab,
  header,
  children,
}: ProgressPageShellProps) {
  const insets = useSafeAreaInsets();
  const { narrow } = useResponsive();
  return (
    <ScrollView
      style={styles.shell}
      contentContainerStyle={[
        styles.shellContent,
        narrow && styles.shellContentNarrow,
        { paddingTop: 8 + insets.top },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {header}
      <ProgressScreenTabs activeTab={activeTab} />
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  shellContent: {
    paddingHorizontal: 20,
    paddingBottom: 96,
    minHeight: '100%',
  },
  // The two-up stat cards inside are the tightest thing on this page; giving
  // the gutter back 12pt is what keeps their labels off a mid-word break.
  shellContentNarrow: {
    paddingHorizontal: 14,
  },
});
