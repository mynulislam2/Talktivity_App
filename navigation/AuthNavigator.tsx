/**
 * Auth Navigator
 * 
 * Navigation for authentication flow:
 * - Login screen
 * - Signup screen
 * - Password recovery
 * - Onboarding
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import FreeTrialScreen from '../screens/auth/FreeTrialScreen';
import FreeTrialSuccessScreen from '../screens/auth/FreeTrialSuccessScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{ 
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ 
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="FreeTrial" 
        component={FreeTrialScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="FreeTrialSuccess" 
        component={FreeTrialSuccessScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
