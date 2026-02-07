/**
 * useAuth Hook
 * 
 * Provides authentication state and lifecycle flags using Redux as the single source of truth.
 * Replaces the Context API-based useAuth hook for consistency with the architecture.
 * 
 * This hook maintains the same API as the previous Context-based implementation,
 * allowing components to migrate without logic changes.
 */

import { useAppSelector } from '@/store/hooks';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
} from '@/store/slices/authSlice';
import {
  selectHasOnboarding,
  selectHasConversationExperience,
  selectHasSubscription,
} from '@/store/slices/lifecycleSlice';

export const useAuth = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const hasOnboarding = useAppSelector(selectHasOnboarding);
  const hasConversationExperience = useAppSelector(selectHasConversationExperience);
  const hasSubscription = useAppSelector(selectHasSubscription);

  return {
    user,
    isAuthenticated,
    loading,
    hasOnboarding,
    hasConversationExperience,
    hasSubscription,
  };
};
