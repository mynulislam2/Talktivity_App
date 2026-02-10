/**
 * useProfile Hook
 * 
 * Manages user profile functionality:
 * - Loading profile data
 * - Updating profile information
 * - Avatar upload
 * - Profile validation
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@/store';
import { profileService } from '@/service/ProfileService';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatar?: string;
  bio?: string;
  preferredLevel: 'beginner' | 'intermediate' | 'advanced';
  phoneNumber?: string;
  country?: string;
  joinDate: string;
  totalStudyTime: number;
  currentStreak: number;
  totalPoints: number;
}

export interface UseProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export const useProfile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.profile);

  const [state, setState] = useState<UseProfileState>({
    profile: null,
    isLoading: true,
    isSaving: false,
    error: null,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // TODO: Call profileService.getProfile() when backend is ready
      const mockProfile: UserProfile = {
        id: currentUser?.id || '1',
        email: currentUser?.email || 'user@example.com',
        fullName: currentUser?.fullName || 'John Doe',
        username: currentUser?.username || 'johndoe',
        avatar: undefined,
        bio: 'English learner and language enthusiast',
        preferredLevel: 'intermediate',
        phoneNumber: '+1234567890',
        country: 'United States',
        joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        totalStudyTime: 450,
        currentStreak: 12,
        totalPoints: 2150,
      };

      setState((prev) => ({
        ...prev,
        profile: mockProfile,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load profile',
        isLoading: false,
      }));
    }
  }, [currentUser]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      setState((prev) => ({ ...prev, isSaving: true, error: null }));
      try {
        // TODO: Call profileService.updateProfile(updates) when backend is ready
        setState((prev) => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, ...updates } : null,
          isSaving: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to update profile',
          isSaving: false,
        }));
      }
    },
    []
  );

  const updateAvatar = useCallback(async (imageUri: string) => {
    setState((prev) => ({ ...prev, isSaving: true, error: null }));
    try {
      // TODO: Call profileService.uploadAvatar(imageUri) when backend is ready
      setState((prev) => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, avatar: imageUri } : null,
        isSaving: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update avatar',
        isSaving: false,
      }));
    }
  }, []);

  return {
    ...state,
    loadProfile,
    updateProfile,
    updateAvatar,
  };
};
