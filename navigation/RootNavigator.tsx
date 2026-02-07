/**
 * Root Navigator
 * 
 * Main navigation entry point that determines whether to show:
 * - AuthNavigator (user not logged in)
 * - MainNavigator (user logged in)
 * 
 * Automatically restores user session from AsyncStorage on app startup
 */

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootState } from '../store';
import { useAutoLogin } from '../Hooks/useAutoLogin';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isLoading, isCheckingAuth } = useAutoLogin();

  // Show loading screen while checking authentication status
  if (isLoading || isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated user - show main app
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // Unauthenticated user - show auth flow
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
