/**
 * MainNavigatorWrapper Component
 * 
 * Wraps MainNavigator with global route protection.
 * Handles lifecycle-based redirects for authenticated users.
 */

import React from 'react';
import MainNavigator from './MainNavigator';
import { useGlobalRouteGuard } from '@/hooks/navigation/useGlobalRouteGuard';

export default function MainNavigatorWrapper() {
  // Apply global route protection
  useGlobalRouteGuard();

  return <MainNavigator />;
}
