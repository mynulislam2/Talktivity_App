/**
 * Main Navigator
 * 
 * Bottom tab navigation for authenticated users - matches Next.js BottomTabs exactly:
 * - Home (Dashboard)
 * - Role Play (Topics/Practice via LearningNavigator stack)
 * - Community (Social features)
 * - Profile (User settings)
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/home/HomeScreen';
import LearningNavigator from './LearningNavigator';
import SocialNavigator from './SocialNavigator';
import ProfileNavigator from './ProfileNavigator';

import { MainStackParamList } from './types';

const Tab = createBottomTabNavigator<MainStackParamList>();

/**
 * Tab bar icon component
 */
const TabBarIcon = ({ 
  name, 
  color, 
  size = 24 
}: { 
  name: keyof typeof Ionicons.glyphMap; 
  color: string; 
  size?: number;
}) => (
  <Ionicons name={name} size={size} color={color} />
);

const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#6A5AE0', // Brand purple - matches Next.js
        tabBarInactiveTintColor: '#9ca3af', // gray-400 - matches Next.js
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
      })}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} size={24} />
          ),
          headerShown: false, // Hide header - Header component is inside HomeScreen
        }}
      />

      {/* Role Play Tab (Stack Navigator) - matches Next.js "Role Play" tab */}
      <Tab.Screen
        name="LearningStack"
        component={LearningNavigator}
        options={{
          title: 'Role Play',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="mic" color={color} size={24} />
          ),
          headerShown: false,
        }}
      />

      {/* Community Tab (Stack Navigator) */}
      <Tab.Screen
        name="SocialStack"
        component={SocialNavigator}
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="people" color={color} size={24} />
          ),
          headerShown: false,
        }}
      />

      {/* Profile Tab (Stack Navigator) */}
      <Tab.Screen
        name="ProfileStack"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="person" color={color} size={24} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.3)',
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
    backgroundColor: '#1a1b3c',
    // Removed rounded corners for cleaner UX
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  header: {
    backgroundColor: '#0a0923',
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MainNavigator;
