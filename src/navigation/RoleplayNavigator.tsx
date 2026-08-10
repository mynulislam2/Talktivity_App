import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TopicsScreen from '../screens/learning/TopicsScreen';
import RoleplaySessionScreen from '../screens/learning/RoleplayScreen';
import { RoleplayStackParamList } from './types';

const Stack = createNativeStackNavigator<RoleplayStackParamList>();

const RoleplayNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="RoleplayList" component={TopicsScreen as any} />
      <Stack.Screen
        name="RoleplaySession"
        component={RoleplaySessionScreen as any}
      />
    </Stack.Navigator>
  );
};

export default RoleplayNavigator;
