/**
 * ProgressScreenTabs Component (React Native)
 *
 * Three-tab navigation: Profile / Achievements / Leaderboard
 * Matches talktivity_frontend/components/profile/ProgressScreenTabs.tsx, except
 * the tabs are equal-width (flex: 1) instead of min-w-[132px] + horizontal
 * scroll — at 390px the web's three min-width tabs need 420px and always
 * clip/scroll (see docs/design/web-page-specs.md "Fixed-width leaks"); that's
 * a bug we deliberately don't port.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { tokens } from '@/theme/tokens';

type ProgressTab = 'profile' | 'achievements' | 'leaderboard';

interface ProgressScreenTabsProps {
  activeTab: ProgressTab;
}

const TAB_CONFIG: { key: ProgressTab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'leaderboard', label: 'Leaderboard' },
];

export function ProgressScreenTabs({ activeTab }: ProgressScreenTabsProps) {
  const navigation = useNavigation<any>();

  const handleTabPress = (tab: ProgressTab) => {
    if (tab === 'profile') {
      navigation.navigate('ProfileStack', { screen: 'ProfileScreen' });
    } else if (tab === 'achievements') {
      navigation.navigate('LearningStack', { screen: 'ProgressScreen' });
    } else if (tab === 'leaderboard') {
      navigation.navigate('ProfileStack', { screen: 'LeaderboardScreen' });
    }
  };

  return (
    <View style={styles.tabsRow}>
      {TAB_CONFIG.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabWrapper}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            {isActive ? (
              <LinearGradient
                colors={[tokens.color.accent.primary, '#b55cff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabActiveGradient}
              >
                <Text
                  style={[
                    styles.tabText,
                    tab.key === 'profile' && styles.tabTextSmall,
                    styles.tabTextActive,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {tab.label}
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.tab}>
                <Text
                  style={[
                    styles.tabText,
                    tab.key === 'profile' && styles.tabTextSmall,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {tab.label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tabWrapper: {
    flex: 1,
    borderRadius: tokens.radius.sm,
    overflow: 'hidden',
  },
  tab: {
    height: tokens.control.height,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    paddingHorizontal: 8,
  },
  tabActiveGradient: {
    height: tokens.control.height,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: tokens.radius.sm,
    paddingHorizontal: 8,
    shadowColor: 'rgba(84,86,255,0.26)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    elevation: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: tokens.color.text.primary,
    textAlign: 'center',
  },
  tabTextSmall: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
  },
  tabTextActive: {
    color: tokens.color.text.primary,
  },
});
