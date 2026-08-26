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
import { useResponsive } from '@/theme/responsive';

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
  // Three equal tabs on a 320pt screen give each label ~76pt, which is
  // narrower than "Achievements" at 14pt — it rendered as "Achieve...".
  // `adjustsFontSizeToFit` covers this on iOS/Android but is a no-op under
  // react-native-web, so the size has to come down explicitly too.
  const { narrow } = useResponsive();

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
    <View style={[styles.tabsRow, narrow && styles.tabsRowNarrow]}>
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
                style={[styles.tabActiveGradient, narrow && styles.tabPaddingNarrow]}
              >
                <Text
                  style={[
                    styles.tabText,
                    narrow && styles.tabTextNarrow,
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
              <View style={[styles.tab, narrow && styles.tabPaddingNarrow]}>
                <Text
                  style={[
                    styles.tabText,
                    narrow && styles.tabTextNarrow,
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
  // "Achievements" is 12 characters and the row has to hold three tabs. At a
  // 320pt width the default gap and padding leave it ~76pt, which is exactly
  // its own width — so it rendered as "Achieve...". Six points back from the
  // gaps and eight from the padding is enough for the whole word.
  tabsRowNarrow: {
    gap: 6,
  },
  tabPaddingNarrow: {
    paddingHorizontal: 4,
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
  tabTextNarrow: {
    fontSize: 11.5,
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
