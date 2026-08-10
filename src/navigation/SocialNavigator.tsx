/**
 * Social Navigator
 *
 * Stack navigation for social features:
 * - Community (community discovery and management)
 * - Chat (direct messaging)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '../screens/social/ChatScreen';
import CommunityScreen from '../screens/social/CommunityScreen';
import DMChatScreen from '../screens/social/DMChatScreen';
import GroupChatScreen from '../screens/social/GroupChatScreen';

import { SocialStackParamList } from './types';

const Stack = createNativeStackNavigator<SocialStackParamList>();

const SocialNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="CommunityScreen"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CommunityScreen" component={CommunityScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="DMChatScreen" component={DMChatScreen} />
      <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} />
    </Stack.Navigator>
  );
};

export default SocialNavigator;
