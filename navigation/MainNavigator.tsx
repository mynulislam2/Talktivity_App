/**
 * Main Navigator
 * 
 * Bottom tab navigation for authenticated users:
 * - Home (Dashboard)
 * - Learning (via LearningNavigator stack)
 * - Social (Community, Chat, Leaderboard)
 * - Profile (User settings)
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: styles.tabBar,
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
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />

      {/* Learning Tab (Stack Navigator) */}
      <Tab.Screen
        name="LearningStack"
        component={LearningNavigator}
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="book" color={color} />
          ),
          headerShown: false,
        }}
      />

      {/* Social Tab (Stack Navigator) */}
      <Tab.Screen
        name="SocialStack"
        component={SocialNavigator}
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="people" color={color} />
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
            <TabBarIcon name="person" color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    height: 60,
    backgroundColor: '#fff',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});

export default MainNavigator;
