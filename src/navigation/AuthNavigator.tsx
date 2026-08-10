/**
 * Auth Navigator
 *
 * Navigation for authentication flow:
 * - Login screen
 * - Password recovery
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeOnboardingScreen from '../screens/auth/WelcomeOnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="WelcomeOnboarding"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="WelcomeOnboarding"
        component={WelcomeOnboardingScreen}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
