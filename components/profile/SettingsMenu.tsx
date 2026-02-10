/**
 * SettingsMenu Component (React Native)
 * 
 * Settings menu with navigation items and logout.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import { selectProfile } from '@/store/slices/profileSlice';
import { formatLocalDate } from '@/utils/timezoneUtils';
import { performGlobalLogout } from '@/utils/logoutClient';
import type { ProfileData } from '@/types/profile';
import { spacing } from '@/styles/spacing';

export interface SettingsMenuProps {
  profile?: ProfileData | null;
}

export function SettingsMenu({ profile: profileProp }: SettingsMenuProps) {
  const profileFromRedux = useAppSelector(selectProfile);
  const profile = profileProp ?? profileFromRedux;
  const navigation = useNavigation();

  const formatDate = (dateString: string) => {
    return formatLocalDate(dateString);
  };

  const navigateToUpgrade = () => {
    (navigation as any).navigate('ProfileStack', {
      screen: 'SubscriptionScreen',
    });
  };

  const navigateToLeaderboard = () => {
    (navigation as any).navigate('SocialStack', {
      screen: 'LeaderboardScreen',
    });
  };

  const navigateToProgress = () => {
    (navigation as any).navigate('LearningStack', {
      screen: 'ProgressScreen',
    });
  };

  const navigateToPrivacy = () => {
    (navigation as any).navigate('ProfileStack', {
      screen: 'Privacy',
    });
  };

  const navigateToTerms = () => {
    (navigation as any).navigate('ProfileStack', {
      screen: 'Terms',
    });
  };

  const navigateToRefund = () => {
    // Refund policy navigation - implement if needed
  };

  const handleLogout = async () => {
    await performGlobalLogout((path: string) => {
      // Navigation handled by logout utility
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemYellow]}
          onPress={navigateToUpgrade}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="diamond" size={20} color="#fbbf24" />
            <Text style={styles.menuItemText}>Upgrade Subscription</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemBlue]}
          onPress={navigateToLeaderboard}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="trophy" size={20} color="#fbbf24" />
            <Text style={styles.menuItemText}>Leaderboard</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemBlue]}
          onPress={navigateToProgress}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="bar-chart" size={20} color="#7B70FF" />
            <Text style={styles.menuItemText}>View Progress</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemGreen]}
          onPress={navigateToPrivacy}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="shield" size={20} color="#10b981" />
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemBlue]}
          onPress={navigateToTerms}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="document-text" size={20} color="#7B70FF" />
            <Text style={styles.menuItemText}>Terms and Conditions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
        </TouchableOpacity>

        <View style={[styles.menuItem, styles.menuItemPurple, styles.menuItemNoPress]}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="calendar" size={20} color="#a855f7" />
            <Text style={styles.menuItemText}>Member Since</Text>
          </View>
          <Text style={styles.menuItemValue}>
            {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemRed, styles.logoutButton]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out" size={20} color="#ef4444" />
          <Text style={[styles.menuItemText, styles.logoutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  menuContainer: {
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  menuItemYellow: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  menuItemBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  menuItemGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  menuItemPurple: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  menuItemRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  menuItemNoPress: {
    // No press effect for read-only items
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  menuItemValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  logoutButton: {
    marginTop: spacing.xl,
  },
  logoutText: {
    color: '#ef4444',
  },
});
