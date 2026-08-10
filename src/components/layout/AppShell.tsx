/**
 * AppShell Layout
 *
 * Wraps the main tab navigator with the shared Header so it stays
 * persistent across Home, Learning (Topics + Practice), Community, and Profile.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationState } from '@react-navigation/native';

import { AppHeader } from '@/components/common/AppHeader';
import { colors } from '@/styles/colors';

interface AppShellProps {
  children: React.ReactNode;
}

// Root screens for each stack - back button should NOT appear on these
const ROOT_SCREENS = {
  Home: 'HomeScreen',
  LearningStack: 'TopicsScreen',
  ProfileStack: 'ProfileScreen',
  SocialStack: 'CommunityScreen',
};

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  // Determine the active bottom tab and current screen
  const { activeTab, currentScreen } = useNavigationState((state) => {
    // Find the Main route (bottom tabs) if present
    const mainRoute = state.routes.find((r) => r.name === 'Main');
    const mainState: any =
      (mainRoute as any)?.state || (state.routes[state.index] as any)?.state;

    if (!mainState || !mainState.routes) {
      return { activeTab: null, currentScreen: null };
    }

    const tabState = mainState as any;
    const tabRoute = tabState?.routes?.[tabState.index];
    const activeTabName = tabRoute?.name; // 'Home' | 'LearningStack' | 'SocialStack' | 'ProfileStack'

    // Get the current screen within the active tab's stack navigator
    // All tabs are stack navigators, so we need to traverse into their state
    let currentScreenName: string | null = null;

    if (tabRoute?.state) {
      const stackState = tabRoute.state;
      if (
        stackState.index !== undefined &&
        stackState.routes &&
        stackState.routes.length > 0
      ) {
        const currentRoute = stackState.routes[stackState.index];
        currentScreenName = currentRoute?.name || null;
      }
    }

    return {
      activeTab: activeTabName,
      currentScreen: currentScreenName,
    };
  });

  const isCommunityTab = activeTab === 'SocialStack';
  // Check if current screen is a report screen (they have their own headers)
  const isReportScreen = currentScreen === 'ReportScreen';
  const isQuizScreen =
    currentScreen === 'QuizScreen' || currentScreen === 'ListeningQuizScreen';
  const isTodaysReportScreen = currentScreen === 'TodaysReportScreen';

  // Determine if we should show back button (nested screen, not root)
  const shouldShowBack = React.useMemo(() => {
    if (!activeTab || !currentScreen) return false;

    // Map tab name to root screen name
    const rootScreen = ROOT_SCREENS[activeTab as keyof typeof ROOT_SCREENS];
    if (!rootScreen) return false;

    // Show back button if current screen is not the root screen
    return currentScreen !== rootScreen;
  }, [activeTab, currentScreen]);

  if (isCommunityTab || isReportScreen) {
    // Community tab or Report screens: no shared AppHeader, only safe area + content.
    // Note: Community tab doesn't use bottom edge because tab bar handles its own safe area
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    );
  }

  // Quiz screens and TodaysReportScreen: no safe area top edge (AppHeader handles it), no shared AppHeader
  if (isQuizScreen || isTodaysReportScreen) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    );
  }

  // Other tabs: show shared AppHeader with back button if nested.
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <AppHeader showBack={shouldShowBack} />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
