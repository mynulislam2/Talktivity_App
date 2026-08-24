/**
 * ProgressScreenTabs Component (React Native)
 *
 * Three-tab navigation: Profile / Achievements / Leaderboard
 * Matches talktivity_frontend/components/profile/ProgressScreenTabs.tsx
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
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
                  colors={['#2C5BFF', '#A45DFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tabActiveGradient}
                >
                  <Text
                    style={[
                      styles.tabText,
                      tab.key === 'profile' && styles.tabTextSmall,
                      styles.tabTextActive,
                    ]}
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
                  >
                    {tab.label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 24,
    marginHorizontal: -4,
    flexGrow: 0,
    height: 50,
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 12,
    minWidth: '100%',
  },
  tabWrapper: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  tab: {
    height: 42,
    minWidth: 132,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 16,
  },
  tabActiveGradient: {
    height: 42,
    minWidth: 132,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 16,
    shadowColor: 'rgba(84,86,255,0.26)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    elevation: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  tabTextSmall: {
    fontSize: 14,
    fontWeight: '400', fontFamily: 'Poppins',
  },
  tabTextActive: {
    color: '#fff',
  },
});
