/**
 * useHomeViewMode Hook
 * 
 * Manages the home page view mode state with localStorage persistence.
 * Follows the same pattern as other hooks in the codebase.
 */

import { useState, useEffect, useCallback } from 'react';
import type { HomeViewMode } from '@/types/home';
import { DEFAULT_VIEW_MODE } from '@/types/home';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'home_view_mode';

/**
 * Hook to manage home page view mode with persistence
 * @returns { viewMode, setViewMode } - Current view mode and setter function
 */
export function useHomeViewMode() {
  const [viewMode, setViewModeState] = useState<HomeViewMode>(DEFAULT_VIEW_MODE);

  // Load persisted view mode on mount
  useEffect(() => {
    const loadMode = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'today' || stored === 'timeline') {
          setViewModeState(stored as HomeViewMode);
        }
      } catch (error) {
        // Ignore storage errors
      }
    };
    loadMode();
  }, []);

  // Setter that persists to AsyncStorage
  const setViewMode = useCallback(async (mode: HomeViewMode) => {
    setViewModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      // Ignore storage errors
    }
  }, []);

  return { viewMode, setViewMode };
}
