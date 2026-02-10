/**
 * Auth Navigator
 * 
 * Navigation for authentication flow:
 * - Login screen
 * - Signup screen
 * - Password recovery
 * - Onboarding
 */

import React, { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import {
  selectLifecycleData,
  selectLifecycleLoading,
  loadLifecycle,
} from '@/store/slices/lifecycleSlice';
import { getRedirectPath } from '@/lib/routing/getRedirectPath';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import WelcomeOnboardingScreen from '../screens/auth/WelcomeOnboardingScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import AuthCallScreen from '../screens/auth/AuthCallScreen';
import ReportScreen from '../screens/learning/ReportScreen';
import SubscriptionScreen from '../screens/profile/SubscriptionScreen';
import FreeTrialScreen from '../screens/auth/FreeTrialScreen';
import FreeTrialSuccessScreen from '../screens/auth/FreeTrialSuccessScreen';
import CheckoutScreen from '../screens/profile/CheckoutScreen';
import PaymentSuccessScreen from '../screens/profile/PaymentSuccessScreen';
import PaymentFailureScreen from '../screens/profile/PaymentFailureScreen';
import PaymentCancelScreen from '../screens/profile/PaymentCancelScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const lifecycle = useAppSelector(selectLifecycleData);
  const lifecycleLoading = useAppSelector(selectLifecycleLoading);
  const hasNavigatedRef = useRef<string | null>(null);

  // Route guard for Auth stack - handles navigation within Auth stack based on lifecycle
  useEffect(() => {
    // Only run for authenticated users
    if (!isAuthenticated) return;
    
    // Don't do anything if lifecycle is still loading
    if (lifecycleLoading) return;
    
    // Don't redirect if lifecycle is not loaded yet
    if (!lifecycle) {
      dispatch(loadLifecycle());
      return;
    }

    // Calculate redirectPath using shared utility
    const redirectPath = getRedirectPath(lifecycle);
    
    // Don't redirect if redirectPath is null
    if (!redirectPath) return;

    // Don't navigate if we've already navigated to this path
    if (hasNavigatedRef.current === redirectPath) {
      return;
    }

    // Get current navigation state
    const state = navigation.getState();
    if (!state) return;

    const currentRoute = state.routes[state.index];
    const currentScreen = currentRoute?.name;
    
    console.log('[AuthNavigator] Route guard check:', {
      redirectPath,
      currentScreen,
      hasNavigated: hasNavigatedRef.current,
    });

    // Map redirect path to Auth stack screen
    let targetScreen: keyof AuthStackParamList | null = null;
    let targetParams: any = undefined;

    if (redirectPath === '/onboarding') {
      targetScreen = 'Onboarding';
    } else if (redirectPath === '/call?CallStart=true') {
      targetScreen = 'CallScreen';
      targetParams = { CallStart: true };
    } else if (redirectPath === '/call') {
      targetScreen = 'CallScreen';
    } else if (redirectPath === '/upgrade') {
      targetScreen = 'SubscriptionScreen';
    }

    // If we have a target screen and we're not already on it, navigate
    // Always redirect from Login/Signup screens
    // Also redirect from onboarding flow screens if they should move to next step
    const shouldRedirect = 
      currentScreen === 'Login' || 
      currentScreen === 'Signup' ||
      (targetScreen && currentScreen !== targetScreen && 
       (currentScreen === 'Onboarding' || currentScreen === 'CallScreen' || currentScreen === 'ReportScreen'));

    if (targetScreen && shouldRedirect) {
      console.log('[AuthNavigator] Navigating to:', targetScreen, 'from:', currentScreen, 'redirectPath:', redirectPath);
      // Mark that we're navigating to prevent duplicate navigations
      hasNavigatedRef.current = redirectPath;
      
      // Use reset instead of navigate to ensure we're on the right screen
      // This prevents issues where navigate might not work if we're deep in the stack
      setTimeout(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: targetScreen!,
                params: targetParams,
              },
            ],
          } as any)
        );
        console.log('[AuthNavigator] Navigation dispatched to:', targetScreen);
      }, 100);
    } else if (targetScreen && currentScreen === targetScreen) {
      // Already on target screen, just mark as navigated
      hasNavigatedRef.current = redirectPath;
      console.log('[AuthNavigator] Already on target screen:', targetScreen);
    } else if (targetScreen && currentScreen !== targetScreen) {
      // If we should be on a different screen but shouldn't redirect (e.g., user is on SubscriptionScreen but should be on CallScreen)
      // This shouldn't happen often, but log it for debugging
      console.log('[AuthNavigator] Should navigate to', targetScreen, 'but conditions not met. Current:', currentScreen);
    }
  }, [isAuthenticated, lifecycle, lifecycleLoading, navigation, dispatch]);

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
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
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
        name="CallScreen" 
        component={AuthCallScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="ReportScreen" 
        component={ReportScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="SubscriptionScreen" 
        component={SubscriptionScreen}
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
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="PaymentSuccess" 
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="PaymentFailure" 
        component={PaymentFailureScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="PaymentCancel" 
        component={PaymentCancelScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="Privacy" 
        component={PrivacyScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen 
        name="Terms" 
        component={TermsScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
