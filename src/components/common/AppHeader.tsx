/**
 * AppHeader Component (Universal)
 *
 * Flexible header for Home, Community, Profile, Practice, Topics, etc.
 * Handles title, subtitle, avatar, streak, back button, and right actions.
 */

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useNavigation,
  useNavigationState,
  CommonActions,
} from '@react-navigation/native';
import { useHeaderProfile, useHeaderStreak } from '@/hooks/header';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
  showAvatar?: boolean;
  showStreak?: boolean;
}

// Root screens for each stack - back button navigates to these
const ROOT_SCREENS: Record<string, string> = {
  Home: 'HomeScreen',
  LearningStack: 'TopicsScreen',
  ProfileStack: 'ProfileScreen',
  SocialStack: 'CommunityScreen',
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightComponent,
  showAvatar = true,
  showStreak = true,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useHeaderProfile();
  const { streak, loading } = useHeaderStreak();

  // Get the active tab and stack navigator state
  const navigationState = useNavigationState((state) => {
    const mainRoute = state.routes.find((r) => r.name === 'Main');
    const mainState: any = (mainRoute as any)?.state;
    if (mainState?.routes) {
      const activeTab = mainState.routes[mainState.index];
      return {
        activeTabName: activeTab?.name,
        stackState: activeTab?.state,
      };
    }
    return null;
  });

  const handleBackPress = () => {
    try {
      // Navigate to the previous screen in the stack (not the root screen)
      if (navigationState?.activeTabName && navigationState?.stackState) {
        const stackIndex = navigationState.stackState.index;
        const stackRoutes = navigationState.stackState.routes;

        // Check if we can go back (not on the first screen)
        if (stackIndex > 0 && stackRoutes.length > 1) {
          // Get the previous screen name
          const previousScreen = stackRoutes[stackIndex - 1]?.name;

          if (previousScreen) {
            // Navigate to the previous screen in the stack
            // Format: Main -> TabName -> PreviousScreen
            (navigation as any).navigate('Main', {
              screen: navigationState.activeTabName,
              params: {
                screen: previousScreen,
              },
            });
            return;
          }
        }
      }

      // Fallback: try standard goBack
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      console.warn('[AppHeader] Error navigating back:', error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, spacing.xs) },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </TouchableOpacity>
          )}
          {!showBack && showAvatar && (
            <View style={styles.avatarContainer}>
              {user?.profile_picture ? (
                <Image
                  source={{ uri: user.profile_picture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={16} color={colors.white} />
                </View>
              )}
            </View>
          )}
          {!showBack && (
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {title || user?.full_name || 'User'}
              </Text>
              {!!subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>
        {showStreak && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>
              {loading ? '...' : `${streak} Days`}
            </Text>
          </View>
        )}
        {rightComponent && (
          <View style={styles.rightSection}>{rightComponent}</View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
  },
  content: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    minWidth: 0,
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  subtitle: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 1,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  streakEmoji: {
    fontSize: 13,
    marginRight: spacing.xs,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.white,
  },
  rightSection: {
    marginLeft: spacing.md,
  },
});
