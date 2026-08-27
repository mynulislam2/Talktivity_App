/**
 * Main Navigator
 *
 * Bottom tab navigation for authenticated users — matches frontend bottom tabs exactly:
 * - Home
 * - Role Play (Topics)
 * - Community
 * - Profile
 * Uses custom SVG icons matching MobileNavIcons.tsx
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeNavigator from './HomeNavigator';
import LearningNavigator from './LearningNavigator';
import RoleplayNavigator from './RoleplayNavigator';
import SocialNavigator from './SocialNavigator';
import ProfileNavigator from './ProfileNavigator';

import {
  HomeTabIcon,
  DiscoverTabIcon,
  CommunityTabIcon,
  ProfileTabIcon,
} from '@/components/navigation/BottomTabIcons';

import { MainStackParamList } from './types';
import { useResponsive } from '@/theme/responsive';

const Tab = createBottomTabNavigator<MainStackParamList>();

const TAB_ICON_SIZE = 22.61;

const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { short } = useResponsive();
  // A 76pt bar plus its safe-area padding is a tenth of a 915pt Pixel but a
  // seventh of a 640pt phone, where every screen is already short on room.
  const barHeight = (short ? 62 : 76) + 17; // Added 5px

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: Math.max(insets.bottom, short ? 8 : 12) + 11, // Added 5px
          height: barHeight,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#5462ff',
        tabBarInactiveTintColor: '#ffffff',
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              {focused && <View style={styles.activeGlow} />}
              <HomeTabIcon
                active={focused}
                size={TAB_ICON_SIZE}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="RoleplayStack"
        component={RoleplayNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              {focused && <View style={styles.activeGlow} />}
              <DiscoverTabIcon size={TAB_ICON_SIZE} color={color} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="LearningStack"
        component={LearningNavigator}
        options={{
          tabBarButton: () => null,
        }}
      />

      <Tab.Screen
        name="SocialStack"
        component={SocialNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              {focused && <View style={styles.activeGlow} />}
              <CommunityTabIcon size={22} color={color} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ProfileStack"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              {focused && <View style={styles.activeGlow} />}
              <ProfileTabIcon size={TAB_ICON_SIZE} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#09090f',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    height: 76,
    paddingHorizontal: 20,
    paddingTop: 9.421,
  },
  iconContainer: {
    width: 41.453,
    height: 41.453,
    borderRadius: 31.09,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainerActive: {
    // Active state handled by glow
  },
  activeGlow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 100,
    backgroundColor: 'rgba(84,98,255,0.13)',
  },
});

export default MainNavigator;
