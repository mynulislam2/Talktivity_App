/**
 * Profile Navigator
 *
 * Stack navigation for profile-related screens:
 * - ProfileScreen (main profile overview)
 * - EditProfileScreen (edit profile information)
 * - SettingsScreen (app settings)
 * - SubscriptionScreen (subscription management)
 * - SubscriptionPlans (select subscription plan)
 * - CheckoutScreen (payment checkout)
 * - PaymentSuccessScreen (successful payment confirmation)
 * - PaymentFailureScreen (payment failure handling)
 * - PaymentCancelScreen (payment cancellation)
 * - FreeTrial (free trial confirmation)
 * - FreeTrialSuccess (free trial success)
 * - Terms (terms of service)
 * - Privacy (privacy policy)
 * - Refund (refund policy)
 * - About (about page)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import SubscriptionScreen from '../screens/profile/SubscriptionScreen';
import SubscriptionPlans from '../screens/profile/SubscriptionPlans';
import CheckoutScreen from '../screens/profile/CheckoutScreen';
import PaymentSuccessScreen from '../screens/profile/PaymentSuccessScreen';
import PaymentFailureScreen from '../screens/profile/PaymentFailureScreen';
import PaymentCancelScreen from '../screens/profile/PaymentCancelScreen';
import FreeTrialScreen from '../screens/auth/FreeTrialScreen';
import FreeTrialSuccessScreen from '../screens/auth/FreeTrialSuccessScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import RefundScreen from '../screens/profile/RefundScreen';
import AboutScreen from '../screens/profile/AboutScreen';

import { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: '#F8F9FA' },
      }}
    >
      {/* Main Profile Screen */}
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Edit Profile Screen */}
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Settings Screen */}
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Subscription Screen */}
      <Stack.Screen
        name="SubscriptionScreen"
        component={SubscriptionScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Subscription Plans Screen */}
      <Stack.Screen
        name="SubscriptionPlans"
        component={SubscriptionPlans}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Checkout Screen */}
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Payment Success Screen */}
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
          gestureEnabled: false,
        }}
      />

      {/* Payment Failure Screen */}
      <Stack.Screen
        name="PaymentFailure"
        component={PaymentFailureScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Payment Cancel Screen */}
      <Stack.Screen
        name="PaymentCancel"
        component={PaymentCancelScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Free Trial Screen */}
      <Stack.Screen
        name="FreeTrial"
        component={FreeTrialScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Free Trial Success Screen */}
      <Stack.Screen
        name="FreeTrialSuccess"
        component={FreeTrialSuccessScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Terms Screen */}
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Privacy Screen */}
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* Refund Screen */}
      <Stack.Screen
        name="Refund"
        component={RefundScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />

      {/* About Screen */}
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
