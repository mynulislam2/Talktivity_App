/**
 * Social Navigator
 * 
 * Stack navigation for social features:
 * - Chat (direct messaging)
 * - Community (community discovery and management)
 * - Leaderboard (rankings)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '../screens/social/ChatScreen';
import CommunityScreen from '../screens/social/CommunityScreen';
import LeaderboardScreen from '../screens/social/LeaderboardScreen';

import { SocialStackParamList } from './types';

const Stack = createNativeStackNavigator<SocialStackParamList>();

const SocialNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
      />
      <Stack.Screen
        name="CommunityScreen"
        component={CommunityScreen}
      />
      <Stack.Screen
        name="LeaderboardScreen"
        component={LeaderboardScreen}
      />
    </Stack.Navigator>
  );
};

export default SocialNavigator;
