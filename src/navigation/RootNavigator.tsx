import React from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootState } from '../store';
import { useAutoLogin } from '../hooks/useAutoLogin';
import AuthNavigator from './AuthNavigator';
import MainNavigatorWrapper from './MainNavigatorWrapper';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isLoading, isCheckingAuth } = useAutoLogin();

  if (isLoading || isCheckingAuth) {
    return null;
  }

  return (
    <Stack.Navigator
      key={isAuthenticated ? 'auth' : 'guest'}
      screenOptions={{ headerShown: false }}
      initialRouteName={isAuthenticated ? 'Main' : 'Auth'}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigatorWrapper} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
